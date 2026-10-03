import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { PatientPortal } from './components/patient/PatientPortal';
import { ClinicianDashboard } from './components/clinician/ClinicianDashboard';
import { CHWMobileView } from './components/chw/CHWMobileView';
import { ProfessionalLoginModal } from './components/auth/ProfessionalLoginModal';
import { GarbhaRakshaChatModal } from './components/chat/GarbhaRakshaChatModal';
import { api, type NetworkMode } from './services/api';
import { speakMessage } from './services/audio';
import type { User, UserRole, Pregnancy, VitalLog, Alert, PatientDashboardItem } from './types';
import { ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';

export default function App() {
  // Navigation & Simulation State
  const [currentRole, setCurrentRole] = useState<UserRole>('patient');
  const [networkMode, setNetworkMode] = useState<NetworkMode>('online');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [offlineCount, setOfflineCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'alert' } | null>(null);

  // Gemini Chatbot State
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Professional Authentication State
  const [isStaffLoginOpen, setIsStaffLoginOpen] = useState<boolean>(false);
  const [activeStaff, setActiveStaff] = useState<User | null>(() => {
    const session = api.getAuthSession();
    return session?.user || null;
  });

  // Data State
  const [allPatients, setAllPatients] = useState<User[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<User | null>(null);
  const [selectedPregnancy, setSelectedPregnancy] = useState<Pregnancy | undefined>(undefined);
  const [patientVitals, setPatientVitals] = useState<VitalLog[]>([]);
  const [patientAlerts, setPatientAlerts] = useState<Alert[]>([]);

  // Clinician State
  const [dashboardPatients, setDashboardPatients] = useState<PatientDashboardItem[]>([]);
  const [clinicianMetrics, setClinicianMetrics] = useState({
    total: 0,
    red_critical: 0,
    yellow_warning: 0,
    green_stable: 0,
    pending_alerts: 0,
  });
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Show Toast Helper
  const showToast = (text: string, type: 'success' | 'alert' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 5000);
  };

  // Update offline queue count
  const refreshOfflineCount = useCallback(() => {
    const queue = api.getOfflineQueue();
    setOfflineCount(queue.length);
  }, []);

  // Fetch Clinician Dashboard data
  const loadClinicianData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getClinicianDashboard();
      setDashboardPatients(data.patients);
      setClinicianMetrics(data.metrics);
      setActiveAlerts(data.active_alerts);
    } catch (err) {
      console.error('Failed to load clinician dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load single patient details
  const loadPatientData = useCallback(async (patientId: string) => {
    try {
      const data = await api.getPatient(patientId);
      setSelectedPatient(data.patient);
      setSelectedPregnancy(data.pregnancy);
      setPatientVitals(data.vital_history);
      setPatientAlerts(data.alerts);
    } catch (err) {
      console.error('Failed to load patient dossier:', err);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    async function initialize() {
      try {
        const usersData = await api.getUsers();
        setAllPatients(usersData.patients);

        // Default to Amina Hassan (or first patient)
        const initialPatient = usersData.patients[0];
        if (initialPatient) {
          setSelectedPatient(initialPatient);
          await loadPatientData(initialPatient.id);
        }

        await loadClinicianData();
        refreshOfflineCount();
      } catch (err) {
        console.error('Initialization error:', err);
      }
    }
    initialize();
  }, [loadPatientData, loadClinicianData, refreshOfflineCount]);

  // When selected patient changes
  const handleSelectPatient = (patient: User) => {
    setSelectedPatient(patient);
    loadPatientData(patient.id);
  };

  // Submit vitals from Patient Portal
  const handleLogVitals = async (vitalData: any) => {
    if (!selectedPatient) return;

    try {
      const res = await api.submitVitals(
        {
          patient_id: selectedPatient.id,
          ...vitalData,
          logged_at: new Date().toISOString(),
        },
        networkMode
      );

      if (res.offline) {
        refreshOfflineCount();
        showToast('Logged offline! Stored safely on your phone.', 'alert');
        // Update local patient vitals for responsive feel
        setPatientVitals((prev) => [...prev, res.vital_log]);
      } else {
        showToast('Vitals synchronized with clinic successfully!', 'success');
        await loadPatientData(selectedPatient.id);
        await loadClinicianData();

        // If alert was triggered, alert clinician
        if (res.triggered_alert && res.triggered_alert.severity === 'red_critical') {
          showToast(
            `🚨 CRITICAL ALERT TRIGGERED: CHW SMS dispatched for ${selectedPatient.name}`,
            'alert'
          );
        }
      }
    } catch (err) {
      console.error('Error submitting vitals:', err);
      showToast('Failed to record vitals', 'alert');
    }
  };

  // Handle Offline Sync
  const handleSync = async () => {
    if (networkMode === 'offline') {
      showToast('Cannot sync while in offline mode. Switch to Online first.', 'alert');
      return;
    }

    setIsSyncing(true);
    try {
      const result = await api.syncOfflineLogs();
      refreshOfflineCount();
      await loadClinicianData();
      if (selectedPatient) await loadPatientData(selectedPatient.id);
      showToast(`Synchronized ${result.synced_count} pending vital logs to clinic!`, 'success');
    } catch (err) {
      console.error('Sync failed:', err);
      showToast('Failed to sync offline logs', 'alert');
    } finally {
      setIsSyncing(false);
    }
  };

  // Simulate High-Risk Patient Vitals (Demo button)
  const handleSimulateCriticalLog = async () => {
    const targetPatient = allPatients[0] || selectedPatient;
    if (!targetPatient) return;

    try {
      const res = await api.submitVitals(
        {
          patient_id: targetPatient.id,
          systolic_bp: 172,
          sub_diastolic_bp: 116,
          weight_kg: 69.5,
          swelling_level: 'severe',
          headache_or_vision_change: true,
          epigastric_pain: true,
          fetal_movement: 'decreased',
          notes: 'Sudden onset severe pounding headache, blurred flashing vision, and epigastric pain.',
          logged_at: new Date().toISOString(),
        },
        'online'
      );

      await loadClinicianData();
      if (selectedPatient?.id === targetPatient.id) {
        await loadPatientData(targetPatient.id);
      }

      showToast(`🚨 Critical Red Alert generated for ${targetPatient.name} (172/116 mmHg)!`, 'alert');
      speakMessage(`Urgent maternal danger sign detected for ${targetPatient.name}. Blood pressure 172 over 116.`, 'en');
    } catch (err) {
      console.error('Demo simulation error:', err);
    }
  };

  // Staff Login Success Handler
  const handleStaffLoginSuccess = (user: User, sessionData: any) => {
    setActiveStaff(user);
    if (user.role === 'clinician') {
      setCurrentRole('clinician');
    } else if (user.role === 'chw') {
      setCurrentRole('chw');
    }
    showToast(
      `✓ Authenticated: ${user.name} (${user.hospital?.split(' ')[0] || 'Hospital'})`,
      'success'
    );
    speakMessage(`Welcome ${user.name}. Clinical triage session authorized.`, 'en');
  };

  // Staff Logout Handler
  const handleStaffLogout = () => {
    api.clearAuthSession();
    setActiveStaff(null);
    showToast('Signed out of professional session', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white">
      
      {/* Top Navigation with Role Switcher & Network Simulator */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        networkMode={networkMode}
        onNetworkModeChange={setNetworkMode}
        offlineCount={offlineCount}
        onSync={handleSync}
        isSyncing={isSyncing}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        selectedPatient={selectedPatient}
        allPatients={allPatients}
        onSelectPatient={handleSelectPatient}
        pendingAlertsCount={clinicianMetrics.pending_alerts}
        activeStaff={activeStaff}
        onOpenStaffLogin={() => setIsStaffLoginOpen(true)}
        onStaffLogout={handleStaffLogout}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Role View 1: Expectant Mother Portal */}
        {currentRole === 'patient' && selectedPatient && (
          <PatientPortal
            patient={selectedPatient}
            pregnancy={selectedPregnancy}
            vitals={patientVitals}
            alerts={patientAlerts}
            onLogVitals={handleLogVitals}
            isSubmitting={false}
            language={selectedLanguage}
            isOffline={networkMode === 'offline'}
          />
        )}

        {/* Role View 2: Clinician Triage Command Center */}
        {currentRole === 'clinician' && (
          <ClinicianDashboard
            patients={dashboardPatients}
            metrics={clinicianMetrics}
            activeAlerts={activeAlerts}
            onRefresh={loadClinicianData}
            isLoading={isLoading}
            onSimulateCriticalLog={handleSimulateCriticalLog}
          />
        )}

        {/* Role View 3: Community Health Worker Mobile Handset */}
        {currentRole === 'chw' && (
          <CHWMobileView
            alerts={activeAlerts}
            patients={dashboardPatients}
            onRefresh={loadClinicianData}
          />
        )}

      </main>

      {/* Real-Time Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div
            className={`p-4 rounded-2xl shadow-2xl border flex items-center gap-3 ${
              toastMessage.type === 'alert'
                ? 'bg-slate-950 text-white border-red-500 shadow-red-950/40'
                : 'bg-slate-900 text-white border-emerald-500 shadow-slate-950/40'
            }`}
          >
            {toastMessage.type === 'alert' ? (
              <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="text-xs font-semibold leading-snug">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Subtle Footer with Sanskrit Motto */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 space-y-0.5">
        <p className="font-semibold text-slate-700">
          GarbhaRaksha (गर्भक्षा) • दिव्या मातृरक्षा • Sacred Maternal Health & Clinical Triage System
        </p>
        <p className="text-[11px] text-slate-400">
          Engineered for Last-Mile Rural Continuity • Offline-First Edge Telemetry & Clinical Decision Support
        </p>
      </footer>

      {/* Professional Healthcare Worker Login Modal */}
      <ProfessionalLoginModal
        isOpen={isStaffLoginOpen}
        onClose={() => setIsStaffLoginOpen(false)}
        onLoginSuccess={handleStaffLoginSuccess}
      />

      {/* GarbhaRaksha Gemini AI Multi-Turn Chatbot */}
      <GarbhaRakshaChatModal
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        currentPatient={selectedPatient}
        defaultRoleContext={currentRole === 'clinician' ? 'clinical_specialist' : 'patient_companion'}
        language={selectedLanguage}
      />

    </div>
  );
}
