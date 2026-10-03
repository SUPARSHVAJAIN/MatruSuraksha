import { evaluateVitals } from '../utils/clinicalRules';
import type { VitalLog, Alert, PatientDashboardItem, User, Pregnancy } from '../types';

export type NetworkMode = 'online' | 'spotty' | 'offline';

const OFFLINE_QUEUE_KEY = 'afiyamama_offline_queue_v1';
const OFFLINE_MEDICATIONS_KEY = 'afiyamama_meds_v1';

export interface OfflineVitalPayload {
  patient_id: string;
  systolic_bp: number;
  sub_diastolic_bp: number;
  weight_kg: number;
  swelling_level: 'none' | 'mild' | 'severe';
  headache_or_vision_change: boolean;
  epigastric_pain?: boolean;
  fetal_movement?: 'normal' | 'decreased' | 'absent';
  notes?: string;
  logged_at: string;
  id: string;
}

export const api = {
  // Get queued offline logs count
  getOfflineQueue(): OfflineVitalPayload[] {
    try {
      const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  // Save log locally to offline queue
  saveToOfflineQueue(log: OfflineVitalPayload) {
    const queue = this.getOfflineQueue();
    queue.push(log);
    localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    return queue;
  },

  // Clear offline queue
  clearOfflineQueue() {
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  },

  // Submit vitals (respects simulated network mode)
  async submitVitals(payload: Omit<OfflineVitalPayload, 'id'>, networkMode: NetworkMode) {
    const id = `vl_off_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const fullPayload: OfflineVitalPayload = { ...payload, id };

    // If simulating offline or spotty network failure
    if (networkMode === 'offline') {
      this.saveToOfflineQueue(fullPayload);

      // Locally calculate evaluation so expectant mother gets immediate life-saving feedback even offline!
      const evalResult = evaluateVitals({
        systolic_bp: payload.systolic_bp,
        sub_diastolic_bp: payload.sub_diastolic_bp,
        weight_kg: payload.weight_kg,
        swelling_level: payload.swelling_level,
        headache_or_vision_change: payload.headache_or_vision_change,
        epigastric_pain: payload.epigastric_pain,
        fetal_movement: payload.fetal_movement,
      });

      return {
        offline: true,
        vital_log: {
          ...fullPayload,
          risk_score: evalResult.risk_score,
          synced_offline: true,
        },
        evaluation: evalResult,
        triggered_alert: evalResult.requires_immediate_alert
          ? {
              id: `alt_local_${Date.now()}`,
              patient_id: payload.patient_id,
              vital_log_id: id,
              severity: evalResult.severity!,
              status: 'pending' as const,
              triggered_at: payload.logged_at,
              danger_signs: evalResult.danger_signs,
              sms_preview: `🚨 QUEUED FOR SMS DISPATCH ON RECONNECT: ${evalResult.danger_signs.join(', ')}`,
            }
          : null,
      };
    }

    // Online submission
    const res = await fetch('/api/v1/vitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fullPayload),
    });

    if (!res.ok) {
      throw new Error(`Failed to submit vitals: ${res.statusText}`);
    }

    const data = await res.json();
    return { offline: false, ...data };
  },

  // Sync queued offline items to server
  async syncOfflineLogs() {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) return { synced_count: 0, alerts_generated: [] };

    const res = await fetch('/api/v1/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logs: queue }),
    });

    if (!res.ok) {
      throw new Error('Sync failed on server');
    }

    const result = await res.json();
    this.clearOfflineQueue();
    return result;
  },

  // Clinician dashboard fetch
  async getClinicianDashboard(filterRisk = 'all', search = ''): Promise<{
    patients: PatientDashboardItem[];
    metrics: {
      total: number;
      red_critical: number;
      yellow_warning: number;
      green_stable: number;
      pending_alerts: number;
    };
    active_alerts: Alert[];
  }> {
    const params = new URLSearchParams();
    if (filterRisk !== 'all') params.append('filter_risk', filterRisk);
    if (search) params.append('search', search);

    const res = await fetch(`/api/v1/clinician/dashboard?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to load clinician dashboard');
    return res.json();
  },

  // Get single patient
  async getPatient(id: string): Promise<{
    patient: User;
    pregnancy: Pregnancy;
    vital_history: VitalLog[];
    alerts: Alert[];
  }> {
    const res = await fetch(`/api/v1/patients/${id}`);
    if (!res.ok) throw new Error('Failed to fetch patient dossier');
    return res.json();
  },

  // Update alert status
  async updateAlert(alertId: string, updates: { status?: string; action_taken?: string; notes?: string }) {
    const res = await fetch(`/api/v1/alerts/${alertId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update alert');
    return res.json();
  },

  // Dispatch CHW
  async dispatchCHW(payload: { alert_id?: string; custom_instructions?: string; chw_phone?: string; patient_id?: string }) {
    const res = await fetch('/api/v1/chw/dispatch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to dispatch CHW');
    return res.json();
  },

  // Request Gemini AI Triage Summary
  async getAITriageSummary(patient_id: string, vital_log: Partial<VitalLog>, language = 'en') {
    const res = await fetch('/api/v1/ai/triage-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient_id, vital_log, language }),
    });
    if (!res.ok) throw new Error('Failed to get AI triage summary');
    return res.json();
  },

  // Multi-Turn Gemini Maternal & Clinical Chatbot
  async sendChatMessage(payload: {
    messages: Array<{ role: 'user' | 'model'; text: string }>;
    role_context?: 'patient_companion' | 'clinical_specialist';
    patient_id?: string;
    use_search?: boolean;
  }): Promise<{ success: boolean; reply: string; grounding_queries?: string[] }> {
    const res = await fetch('/api/v1/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Chat failed');
    return res.json();
  },

  // Professional Login
  async login(credentials: {
    email?: string;
    license_number?: string;
    password?: string;
    role?: string;
    user_id?: string;
    hospital?: string;
  }): Promise<{
    success: boolean;
    token: string;
    user: User;
    hospital?: string;
    department?: string;
    permissions?: any;
    pregnancy?: Pregnancy;
  }> {
    const res = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!res.ok) throw new Error('Authentication failed');
    const data = await res.json();
    if (data.success && data.user) {
      this.setAuthSession(data);
    }
    return data;
  },

  getAuthSession() {
    try {
      const saved = localStorage.getItem('afiyamama_auth_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  setAuthSession(sessionData: any) {
    try {
      localStorage.setItem('afiyamama_auth_session', JSON.stringify(sessionData));
    } catch (e) {
      console.warn('Could not store auth session', e);
    }
  },

  clearAuthSession() {
    localStorage.removeItem('afiyamama_auth_session');
  },

  // Get users for switcher
  async getUsers(): Promise<{
    patients: (User & { gestational_age_weeks?: number; active_alert_count: number; highest_alert: string })[];
    staff: User[];
  }> {
    const res = await fetch('/api/v1/users');
    if (!res.ok) throw new Error('Failed to fetch user profiles');
    return res.json();
  },
};
