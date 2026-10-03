import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { evaluateVitals } from './src/utils/clinicalRules';
import type { User, Pregnancy, VitalLog, Alert, PatientDashboardItem } from './src/types';

const app = express();
app.use(express.json());

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-Memory Database store representing the 4 tables
interface Database {
  users: User[];
  pregnancies: Pregnancy[];
  vital_logs: VitalLog[];
  alerts: Alert[];
}

const db: Database = {
  users: [
    {
      id: 'usr_pat_1',
      name: 'Amina Hassan',
      role: 'patient',
      phone: '+254 712 345 678',
      village: 'Matuga Village, Kwale',
      region: 'Coast Province, Kenya',
      language: 'sw', // Swahili
      avatarUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=250&q=80',
    },
    {
      id: 'usr_pat_2',
      name: 'Priya Sharma',
      role: 'patient',
      phone: '+91 98765 43210',
      village: 'Rampur Gram, Alwar',
      region: 'Rajasthan, India',
      language: 'hi', // Hindi
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
    },
    {
      id: 'usr_pat_3',
      name: 'Fatoumata Diallo',
      role: 'patient',
      phone: '+223 65 43 21 00',
      village: 'Kayes Ouest',
      region: 'Kayes Region, Mali',
      language: 'fr', // French
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
    },
    {
      id: 'usr_pat_4',
      name: 'Maria Elena Santos',
      role: 'patient',
      phone: '+502 5432 1098',
      village: 'San Juan Comalapa',
      region: 'Chimaltenango, Guatemala',
      language: 'es', // Spanish
      avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=250&q=80',
    },
    {
      id: 'usr_pat_5',
      name: 'Grace Akello',
      role: 'patient',
      phone: '+256 772 123 456',
      village: 'Awach Sub-county',
      region: 'Gulu District, Uganda',
      language: 'en',
      avatarUrl: 'https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=250&q=80',
    },
    {
      id: 'usr_doc_1',
      name: 'Dr. Neema Mwangi, MD',
      role: 'clinician',
      phone: '+254 700 987 654',
      village: 'District Referral Hospital',
      region: 'Coast Province, Kenya',
      language: 'en',
      email: 'dr.mwangi@coasthealth.go.ke',
      licenseNumber: 'KMPDC-39182',
      hospital: 'Coast Provincial Referral Hospital',
      department: 'Maternal-Fetal Medicine & High-Risk Obstetrics',
      title: 'Lead Consultant Obstetrician',
      badgeNumber: 'MD-88421',
      avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=250&q=80',
    },
    {
      id: 'usr_doc_2',
      name: 'Dr. Rajesh Patel, MS (OB/GYN)',
      role: 'clinician',
      phone: '+91 98111 22334',
      village: 'District Maternal Care Center',
      region: 'Rajasthan, India',
      language: 'hi',
      email: 'dr.patel@maternalcare.gov.in',
      licenseNumber: 'MCI-481920',
      hospital: 'Alwar District Mother & Child Hospital',
      department: 'Obstetrics & High-Risk Triage',
      title: 'District Maternal Health Director',
      badgeNumber: 'MD-7291',
      avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&q=80',
    },
    {
      id: 'usr_chw_1',
      name: 'Zuwena Bakari (CHW Lead)',
      role: 'chw',
      phone: '+254 722 001 122',
      village: 'Matuga Health Post',
      region: 'Coast Province, Kenya',
      language: 'sw',
      email: 'zuwena.bakari@chw.kwale.org',
      licenseNumber: 'NCK-84920',
      hospital: 'Matuga Rural Health Sub-District Post',
      department: 'Community Midwifery & Primary Triage',
      title: 'Lead Community Health Midwife',
      badgeNumber: 'CHW-1044',
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=250&q=80',
    },
  ],

  pregnancies: [
    {
      id: 'preg_1',
      patient_id: 'usr_pat_1',
      gestational_age_weeks: 34,
      edd: '2026-11-15',
      gravida_para: 'G2 P1',
      risk_factors: ['history_of_hypertension', 'previous_preeclampsia'],
      assigned_clinician_id: 'usr_doc_1',
      assigned_chw_name: 'Zuwena Bakari',
      assigned_chw_phone: '+254 722 001 122',
      baseline_bp_systolic: 120,
      baseline_bp_diastolic: 80,
      baseline_weight_kg: 62.0,
    },
    {
      id: 'preg_2',
      patient_id: 'usr_pat_2',
      gestational_age_weeks: 31,
      edd: '2026-12-05',
      gravida_para: 'G1 P0',
      risk_factors: ['gestational_diabetes'],
      assigned_clinician_id: 'usr_doc_1',
      assigned_chw_name: 'Sunita Devi (ASHA)',
      assigned_chw_phone: '+91 98222 33445',
      baseline_bp_systolic: 114,
      baseline_bp_diastolic: 72,
      baseline_weight_kg: 56.5,
    },
    {
      id: 'preg_3',
      patient_id: 'usr_pat_3',
      gestational_age_weeks: 24,
      edd: '2027-01-20',
      gravida_para: 'G3 P2',
      risk_factors: [],
      assigned_clinician_id: 'usr_doc_1',
      assigned_chw_name: 'Mariam Coulibaly',
      assigned_chw_phone: '+223 76 11 22 33',
      baseline_bp_systolic: 110,
      baseline_bp_diastolic: 70,
      baseline_weight_kg: 58.0,
    },
    {
      id: 'preg_4',
      patient_id: 'usr_pat_4',
      gestational_age_weeks: 36,
      edd: '2026-10-30',
      gravida_para: 'G2 P1',
      risk_factors: ['twin_gestation', 'advanced_maternal_age'],
      assigned_clinician_id: 'usr_doc_1',
      assigned_chw_name: 'Lucia Morales (Comadrona)',
      assigned_chw_phone: '+502 4433 2211',
      baseline_bp_systolic: 118,
      baseline_bp_diastolic: 76,
      baseline_weight_kg: 65.0,
    },
    {
      id: 'preg_5',
      patient_id: 'usr_pat_5',
      gestational_age_weeks: 28,
      edd: '2026-12-25',
      gravida_para: 'G1 P0',
      risk_factors: [],
      assigned_clinician_id: 'usr_doc_1',
      assigned_chw_name: 'David Ocen (VHT)',
      assigned_chw_phone: '+256 782 998 877',
      baseline_bp_systolic: 108,
      baseline_bp_diastolic: 68,
      baseline_weight_kg: 53.0,
    },
  ],

  vital_logs: [
    // Amina Hassan: escalation over past days culminating in critical red
    {
      id: 'vl_1_1',
      patient_id: 'usr_pat_1',
      systolic_bp: 126,
      sub_diastolic_bp: 82,
      weight_kg: 65.2,
      swelling_level: 'none',
      headache_or_vision_change: false,
      epigastric_pain: false,
      fetal_movement: 'normal',
      risk_score: 18,
      logged_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      id: 'vl_1_2',
      patient_id: 'usr_pat_1',
      systolic_bp: 138,
      sub_diastolic_bp: 88,
      weight_kg: 66.0,
      swelling_level: 'mild',
      headache_or_vision_change: false,
      epigastric_pain: false,
      fetal_movement: 'normal',
      risk_score: 32,
      logged_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'vl_1_3',
      patient_id: 'usr_pat_1',
      systolic_bp: 152,
      sub_diastolic_bp: 98,
      weight_kg: 67.4,
      swelling_level: 'mild',
      headache_or_vision_change: true,
      epigastric_pain: false,
      fetal_movement: 'normal',
      risk_score: 65,
      logged_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'vl_1_4',
      patient_id: 'usr_pat_1',
      systolic_bp: 168,
      sub_diastolic_bp: 114,
      weight_kg: 68.8,
      swelling_level: 'severe',
      headache_or_vision_change: true,
      epigastric_pain: true,
      fetal_movement: 'decreased',
      risk_score: 95,
      logged_at: new Date(Date.now() - 3600000 * 3).toISOString(), // 3 hours ago
    },

    // Priya Sharma: Moderate hypertension (Yellow)
    {
      id: 'vl_2_1',
      patient_id: 'usr_pat_2',
      systolic_bp: 120,
      sub_diastolic_bp: 78,
      weight_kg: 59.1,
      swelling_level: 'none',
      headache_or_vision_change: false,
      fetal_movement: 'normal',
      risk_score: 12,
      logged_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
    {
      id: 'vl_2_2',
      patient_id: 'usr_pat_2',
      systolic_bp: 142,
      sub_diastolic_bp: 92,
      weight_kg: 60.0,
      swelling_level: 'mild',
      headache_or_vision_change: false,
      fetal_movement: 'normal',
      risk_score: 42,
      logged_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    },

    // Fatoumata Diallo: Green stable
    {
      id: 'vl_3_1',
      patient_id: 'usr_pat_3',
      systolic_bp: 114,
      sub_diastolic_bp: 72,
      weight_kg: 60.5,
      swelling_level: 'none',
      headache_or_vision_change: false,
      fetal_movement: 'normal',
      risk_score: 10,
      logged_at: new Date(Date.now() - 86400000).toISOString(),
    },

    // Maria Elena Santos: Yellow warning (sudden swelling and weight)
    {
      id: 'vl_4_1',
      patient_id: 'usr_pat_4',
      systolic_bp: 136,
      sub_diastolic_bp: 88,
      weight_kg: 69.8,
      swelling_level: 'severe',
      headache_or_vision_change: false,
      fetal_movement: 'normal',
      risk_score: 48,
      logged_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    },

    // Grace Akello: Green stable
    {
      id: 'vl_5_1',
      patient_id: 'usr_pat_5',
      systolic_bp: 110,
      sub_diastolic_bp: 70,
      weight_kg: 55.4,
      swelling_level: 'none',
      headache_or_vision_change: false,
      fetal_movement: 'normal',
      risk_score: 8,
      logged_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    },
  ],

  alerts: [
    {
      id: 'alt_1',
      patient_id: 'usr_pat_1',
      vital_log_id: 'vl_1_4',
      severity: 'red_critical',
      status: 'pending',
      triggered_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      danger_signs: [
        'Critical Blood Pressure (168/114 mmHg) — Severe Pre-eclampsia range',
        'Persistent frontal headache & visual disturbances',
        'Severe epigastric pain (HELLP risk)',
        'Severe generalized edema',
      ],
      action_taken: 'Emergency CHW SMS alert dispatched to Zuwena Bakari. Referral ambulance on standby.',
      sms_preview: '🚨 CRITICAL MATERNAL ALERT: Amina Hassan (Matuga Village) logged BP 168/114 + severe headache & epigastric pain. IMMEDIATE home visit & referral transport needed. Call CHW Zuwena: +254 722 001 122',
      patient_name: 'Amina Hassan',
      village: 'Matuga Village, Kwale',
      phone: '+254 712 345 678',
    },
    {
      id: 'alt_2',
      patient_id: 'usr_pat_2',
      vital_log_id: 'vl_2_2',
      severity: 'yellow_warning',
      status: 'acknowledged',
      triggered_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      danger_signs: [
        'Elevated Blood Pressure (142/92 mmHg) — Gestational Hypertension range',
        'Mild lower extremity swelling',
      ],
      action_taken: 'ASHA Worker Sunita scheduled for 24-hr checkup and urine protein dipstick test.',
      sms_preview: '⚠️ MATERNAL WATCH: Priya Sharma (Rampur) logged BP 142/92 mmHg. ASHA visit scheduled for urine protein dipstick check within 24h.',
      patient_name: 'Priya Sharma',
      village: 'Rampur Gram, Alwar',
      phone: '+91 98765 43210',
    },
  ],
};

// ==========================================
// 3. Core API Endpoints
// ==========================================

// POST /api/v1/auth/login — Authenticates patients and clinicians
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { role, user_id, email, license_number, password, hospital } = req.body;

  // 1. Direct professional lookup by email or license
  if (email || license_number) {
    const matchedStaff = db.users.find(
      (u) =>
        (email && u.email?.toLowerCase() === email.toLowerCase()) ||
        (license_number && u.licenseNumber?.toLowerCase() === license_number.toLowerCase())
    );

    if (matchedStaff) {
      const token = `jwt_med_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return res.json({
        success: true,
        token,
        user: matchedStaff,
        hospital: hospital || matchedStaff.hospital || 'District Referral Hospital',
        department: matchedStaff.department || 'Obstetrics & Maternal Care',
        permissions: {
          can_triage: true,
          can_prescribe: matchedStaff.role === 'clinician',
          can_dispatch_ambulance: true,
          can_resolve_alerts: true,
          hipaa_phi_authorized: true,
        },
      });
    }
  }

  // 2. Lookup by user_id
  if (user_id) {
    const user = db.users.find((u) => u.id === user_id);
    if (user) {
      const pregnancy = db.pregnancies.find((p) => p.patient_id === user.id);
      return res.json({
        success: true,
        token: `jwt_user_${user.id}_${Date.now()}`,
        user,
        pregnancy,
      });
    }
  }

  // 3. Fallback default user by role
  if (role === 'clinician') {
    const clinician = db.users.find((u) => u.role === 'clinician') || db.users[5];
    return res.json({
      success: true,
      token: `jwt_clinician_${Date.now()}`,
      user: clinician,
      hospital: clinician.hospital || 'Coast Provincial Referral Hospital',
      department: clinician.department || 'Maternal-Fetal Medicine',
      permissions: {
        can_triage: true,
        can_prescribe: true,
        can_dispatch_ambulance: true,
        can_resolve_alerts: true,
        hipaa_phi_authorized: true,
      },
    });
  }

  if (role === 'chw') {
    const chw = db.users.find((u) => u.role === 'chw') || db.users[7];
    return res.json({
      success: true,
      token: `jwt_chw_${Date.now()}`,
      user: chw,
      hospital: chw.hospital || 'Matuga Rural Health Sub-District Post',
      department: chw.department || 'Community Midwifery',
      permissions: {
        can_triage: true,
        can_prescribe: false,
        can_dispatch_ambulance: true,
        can_resolve_alerts: false,
        hipaa_phi_authorized: true,
      },
    });
  }

  // Default patient (Amina Hassan - High Risk showcase)
  const defaultPatient = db.users.find((u) => u.role === 'patient') || db.users[0];
  const pregnancy = db.pregnancies.find((p) => p.patient_id === defaultPatient.id);
  return res.json({
    success: true,
    token: `jwt_pat_${Date.now()}`,
    user: defaultPatient,
    pregnancy,
  });
});

// GET /api/v1/users — Get all sample profiles for easy role-switching
app.get('/api/v1/users', (_req: Request, res: Response) => {
  const patients = db.users.filter((u) => u.role === 'patient').map((u) => {
    const preg = db.pregnancies.find((p) => p.patient_id === u.id);
    const alerts = db.alerts.filter((a) => a.patient_id === u.id && a.status !== 'resolved');
    return {
      ...u,
      gestational_age_weeks: preg?.gestational_age_weeks,
      active_alert_count: alerts.length,
      highest_alert: alerts.some((a) => a.severity === 'red_critical') ? 'red' : alerts.length > 0 ? 'yellow' : 'green',
    };
  });

  const staff = db.users.filter((u) => u.role !== 'patient');
  res.json({ patients, staff });
});

// GET /api/v1/patients/:id — Single patient dossier
app.get('/api/v1/patients/:id', (req: Request, res: Response) => {
  const patient = db.users.find((u) => u.id === req.params.id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  const pregnancy = db.pregnancies.find((p) => p.patient_id === patient.id);
  const vitals = db.vital_logs
    .filter((v) => v.patient_id === patient.id)
    .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
  const alerts = db.alerts
    .filter((a) => a.patient_id === patient.id)
    .sort((a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime());

  res.json({
    patient,
    pregnancy,
    vital_history: vitals,
    alerts,
  });
});

// POST /api/v1/vitals — Patient app syncs logged daily vitals (triggers automated risk evaluation)
app.post('/api/v1/vitals', (req: Request, res: Response) => {
  try {
    const {
      patient_id,
      systolic_bp,
      sub_diastolic_bp,
      weight_kg,
      swelling_level,
      headache_or_vision_change,
      epigastric_pain = false,
      fetal_movement = 'normal',
      notes = '',
      logged_at = new Date().toISOString(),
      synced_offline = false,
    } = req.body;

    if (!patient_id || !systolic_bp || !sub_diastolic_bp) {
      return res.status(400).json({ error: 'Missing required vital parameters (patient_id, systolic_bp, sub_diastolic_bp)' });
    }

    const patient = db.users.find((u) => u.id === patient_id);
    const pregnancy = db.pregnancies.find((p) => p.patient_id === patient_id);

    // Get previous weight for trend check
    const previousVitals = db.vital_logs
      .filter((v) => v.patient_id === patient_id)
      .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime());
    const previous_weight_kg = previousVitals[0]?.weight_kg || pregnancy?.baseline_weight_kg;

    // Run Clinical Decision Support Engine
    const evalResult = evaluateVitals({
      systolic_bp: Number(systolic_bp),
      sub_diastolic_bp: Number(sub_diastolic_bp),
      weight_kg: Number(weight_kg),
      swelling_level,
      headache_or_vision_change: Boolean(headache_or_vision_change),
      epigastric_pain: Boolean(epigastric_pain),
      fetal_movement,
      gestational_age_weeks: pregnancy?.gestational_age_weeks || 28,
      risk_factors: pregnancy?.risk_factors || [],
      previous_weight_kg,
      baseline_bp_systolic: pregnancy?.baseline_bp_systolic || 115,
      baseline_bp_diastolic: pregnancy?.baseline_bp_diastolic || 75,
    });

    const newVitalLog: VitalLog = {
      id: `vl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      patient_id,
      systolic_bp: Number(systolic_bp),
      sub_diastolic_bp: Number(sub_diastolic_bp),
      weight_kg: Number(weight_kg),
      swelling_level,
      headache_or_vision_change: Boolean(headache_or_vision_change),
      epigastric_pain: Boolean(epigastric_pain),
      fetal_movement,
      risk_score: evalResult.risk_score,
      logged_at,
      synced_offline: Boolean(synced_offline),
      notes,
    };

    db.vital_logs.push(newVitalLog);

    let triggeredAlert: Alert | null = null;

    // If critical or warning thresholds are breached, generate automated alert
    if (evalResult.requires_immediate_alert && evalResult.severity) {
      const isRed = evalResult.severity === 'red_critical';
      const chwName = pregnancy?.assigned_chw_name || 'Local Health Worker';
      const patientName = patient?.name || 'Expectant Mother';
      const village = patient?.village || 'Local Community';

      const smsText = isRed
        ? `🚨 CRITICAL MATERNAL ALERT: ${patientName} (${village}) logged BP ${systolic_bp}/${sub_diastolic_bp} mmHg with urgent danger signs: ${evalResult.danger_signs.join(', ')}. Immediate CHW response required! Contact CHW: ${pregnancy?.assigned_chw_phone || ''}`
        : `⚠️ MATERNAL WATCH: ${patientName} (${village}) recorded elevated BP ${systolic_bp}/${sub_diastolic_bp} mmHg. Routine follow-up scheduled with ${chwName}.`;

      triggeredAlert = {
        id: `alt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        patient_id,
        vital_log_id: newVitalLog.id,
        severity: evalResult.severity,
        status: 'pending',
        triggered_at: logged_at,
        danger_signs: evalResult.danger_signs,
        action_taken: isRed
          ? `Urgent SMS notification dispatched to ${chwName} (${pregnancy?.assigned_chw_phone}). Primary healthcare clinic alerted.`
          : `Automated follow-up task added to ${chwName}'s 24-hour round.`,
        sms_preview: smsText,
        patient_name: patientName,
        village,
        phone: patient?.phone,
      };

      db.alerts.unshift(triggeredAlert);
    }

    return res.status(201).json({
      success: true,
      vital_log: newVitalLog,
      evaluation: evalResult,
      triggered_alert: triggeredAlert,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: 'Failed to process vitals log', details: message });
  }
});

// POST /api/v1/sync — Batch offline logs sync
app.post('/api/v1/sync', (req: Request, res: Response) => {
  const { logs } = req.body;
  if (!Array.isArray(logs) || logs.length === 0) {
    return res.json({ success: true, synced_count: 0, alerts_generated: [] });
  }

  const generatedAlerts: Alert[] = [];
  const processedLogs: VitalLog[] = [];

  for (const log of logs) {
    const patient = db.users.find((u) => u.id === log.patient_id);
    const pregnancy = db.pregnancies.find((p) => p.patient_id === log.patient_id);

    const evalResult = evaluateVitals({
      systolic_bp: Number(log.systolic_bp),
      sub_diastolic_bp: Number(log.sub_diastolic_bp),
      weight_kg: Number(log.weight_kg),
      swelling_level: log.swelling_level,
      headache_or_vision_change: Boolean(log.headache_or_vision_change),
      epigastric_pain: Boolean(log.epigastric_pain),
      fetal_movement: log.fetal_movement,
      gestational_age_weeks: pregnancy?.gestational_age_weeks || 28,
      risk_factors: pregnancy?.risk_factors || [],
      baseline_bp_systolic: pregnancy?.baseline_bp_systolic || 115,
      baseline_bp_diastolic: pregnancy?.baseline_bp_diastolic || 75,
    });

    const newLog: VitalLog = {
      id: log.id || `vl_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      patient_id: log.patient_id,
      systolic_bp: Number(log.systolic_bp),
      sub_diastolic_bp: Number(log.sub_diastolic_bp),
      weight_kg: Number(log.weight_kg),
      swelling_level: log.swelling_level,
      headache_or_vision_change: Boolean(log.headache_or_vision_change),
      epigastric_pain: Boolean(log.epigastric_pain),
      fetal_movement: log.fetal_movement,
      risk_score: evalResult.risk_score,
      logged_at: log.logged_at || new Date().toISOString(),
      synced_offline: true,
      notes: log.notes,
    };

    db.vital_logs.push(newLog);
    processedLogs.push(newLog);

    if (evalResult.requires_immediate_alert && evalResult.severity) {
      const alert: Alert = {
        id: `alt_sync_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        patient_id: log.patient_id,
        vital_log_id: newLog.id,
        severity: evalResult.severity,
        status: 'pending',
        triggered_at: newLog.logged_at,
        danger_signs: evalResult.danger_signs,
        action_taken: 'Synchronized from offline device queue. Immediate CHW triage alert queued.',
        sms_preview: `🚨 OFFLINE SYNC ALERT: ${patient?.name || 'Patient'} logged urgent vitals (${log.systolic_bp}/${log.sub_diastolic_bp} mmHg).`,
        patient_name: patient?.name,
        village: patient?.village,
        phone: patient?.phone,
      };
      db.alerts.unshift(alert);
      generatedAlerts.push(alert);
    }
  }

  return res.json({
    success: true,
    synced_count: processedLogs.length,
    alerts_generated: generatedAlerts,
  });
});

// GET /api/v1/clinician/dashboard — Fetches real-time filtered patient lists sorted by risk level (red flags first)
app.get('/api/v1/clinician/dashboard', (req: Request, res: Response) => {
  const { filter_risk, search } = req.query;

  const dashboardItems: PatientDashboardItem[] = db.users
    .filter((u) => u.role === 'patient')
    .map((patient) => {
      const pregnancy = db.pregnancies.find((p) => p.patient_id === patient.id)!;
      const vitals = db.vital_logs
        .filter((v) => v.patient_id === patient.id)
        .sort((a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime());
      const latest_vital = vitals[vitals.length - 1];

      const patientAlerts = db.alerts.filter((a) => a.patient_id === patient.id && a.status !== 'resolved');

      // Compute current risk level
      let risk_level: 'green' | 'yellow' | 'red' = 'green';
      if (patientAlerts.some((a) => a.severity === 'red_critical') || (latest_vital && latest_vital.risk_score >= 60)) {
        risk_level = 'red';
      } else if (patientAlerts.some((a) => a.severity === 'yellow_warning') || (latest_vital && latest_vital.risk_score >= 30)) {
        risk_level = 'yellow';
      }

      // Trend summary text
      let trend_summary = 'Stable vital signs within safe prenatal range.';
      if (vitals.length >= 2) {
        const prev = vitals[vitals.length - 2];
        const bpDiff = latest_vital.systolic_bp - prev.systolic_bp;
        if (bpDiff >= 15) {
          trend_summary = `Systolic BP increased by +${bpDiff} mmHg over previous reading. Escalating trajectory.`;
        } else if (bpDiff <= -10) {
          trend_summary = `Systolic BP improving (-${Math.abs(bpDiff)} mmHg).`;
        }
      }

      return {
        patient,
        pregnancy,
        latest_vital,
        vital_history: vitals,
        active_alerts: patientAlerts,
        risk_level,
        trend_summary,
      };
    });

  // Sort: Red Critical first, then Yellow Warning, then Green Stable
  const riskRank = { red: 3, yellow: 2, green: 1 };
  let filtered = [...dashboardItems].sort((a, b) => {
    const diff = riskRank[b.risk_level] - riskRank[a.risk_level];
    if (diff !== 0) return diff;
    // Tie breaker: highest latest risk score
    return (b.latest_vital?.risk_score || 0) - (a.latest_vital?.risk_score || 0);
  });

  if (filter_risk && typeof filter_risk === 'string' && filter_risk !== 'all') {
    filtered = filtered.filter((item) => item.risk_level === filter_risk);
  }

  if (search && typeof search === 'string') {
    const s = search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.patient.name.toLowerCase().includes(s) ||
        item.patient.village.toLowerCase().includes(s) ||
        item.pregnancy.assigned_chw_name.toLowerCase().includes(s)
    );
  }

  // Triage count metrics
  const counts = {
    total: dashboardItems.length,
    red_critical: dashboardItems.filter((i) => i.risk_level === 'red').length,
    yellow_warning: dashboardItems.filter((i) => i.risk_level === 'yellow').length,
    green_stable: dashboardItems.filter((i) => i.risk_level === 'green').length,
    pending_alerts: db.alerts.filter((a) => a.status === 'pending').length,
  };

  res.json({
    patients: filtered,
    metrics: counts,
    active_alerts: db.alerts.filter((a) => a.status !== 'resolved'),
  });
});

// PATCH /api/v1/alerts/:alert_id — Clinician acknowledges or resolves alert
app.patch('/api/v1/alerts/:alert_id', (req: Request, res: Response) => {
  const { alert_id } = req.params;
  const { status, action_taken, notes } = req.body;

  const alertIndex = db.alerts.findIndex((a) => a.id === alert_id);
  if (alertIndex === -1) {
    return res.status(404).json({ error: 'Alert not found' });
  }

  if (status) db.alerts[alertIndex].status = status;
  if (action_taken) db.alerts[alertIndex].action_taken = action_taken;
  if (notes) db.alerts[alertIndex].notes = notes;

  return res.json({
    success: true,
    alert: db.alerts[alertIndex],
  });
});

// POST /api/v1/chw/dispatch — Simulate sending SMS/Push to Community Health Worker
app.post('/api/v1/chw/dispatch', (req: Request, res: Response) => {
  const { alert_id, custom_instructions, chw_phone, patient_id } = req.body;

  const patient = db.users.find((u) => u.id === patient_id);
  const alert = db.alerts.find((a) => a.id === alert_id);

  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const dispatchRecord = {
    dispatch_id: `dsp_${Date.now()}`,
    status: 'dispatched',
    sent_at: timestamp,
    target_recipient: chw_phone || '+254 722 001 122',
    channel: 'SMS Gateway / Rural Cellular GSM',
    message: custom_instructions || `EMERGENCY: Immediate home visit required for ${patient?.name || 'patient'}. Danger signs confirmed. Bring BP cuff and transport kit.`,
  };

  if (alert) {
    alert.status = 'acknowledged';
    alert.action_taken = `CHW dispatched via SMS at ${timestamp}. Instructions: ${custom_instructions || 'Urgent home visit & referral evaluation.'}`;
  }

  res.json({
    success: true,
    dispatch: dispatchRecord,
    updated_alert: alert,
  });
});

// POST /api/v1/ai/triage-summary — Intelligent Gemini Clinical Decision Support
app.post('/api/v1/ai/triage-summary', async (req: Request, res: Response) => {
  const { patient_id, vital_log, language = 'en' } = req.body;

  const patient = db.users.find((u) => u.id === patient_id) || db.users[0];
  const pregnancy = db.pregnancies.find((p) => p.patient_id === patient.id) || db.pregnancies[0];
  const history = db.vital_logs.filter((v) => v.patient_id === patient.id);

  const prompt = `
You are a senior maternal-fetal medicine clinical specialist advising rural primary healthcare teams and community health workers (CHWs) operating in remote, low-resource settings.

Analyze this expectant mother's case according to WHO and ACOG Pre-eclampsia Guidelines:
Patient Profile:
- Name: ${patient.name}
- Gestational Age: ${pregnancy.gestational_age_weeks} weeks
- Gravida/Para: ${pregnancy.gravida_para}
- Pre-existing Risk Factors: ${pregnancy.risk_factors.join(', ') || 'None reported'}
- Baseline BP: ${pregnancy.baseline_bp_systolic}/${pregnancy.baseline_bp_diastolic} mmHg

Current Vital Log:
- Systolic BP: ${vital_log.systolic_bp} mmHg
- Diastolic BP: ${vital_log.sub_diastolic_bp} mmHg
- Weight: ${vital_log.weight_kg} kg
- Swelling / Edema: ${vital_log.swelling_level}
- Severe Headache / Vision Changes: ${vital_log.headache_or_vision_change ? 'YES' : 'NO'}
- Epigastric / RUQ Pain: ${vital_log.epigastric_pain ? 'YES' : 'NO'}
- Fetal Movement: ${vital_log.fetal_movement || 'normal'}
- Risk Score: ${vital_log.risk_score}/100

Recent Readings Trajectory:
${history.map((h) => `- ${new Date(h.logged_at).toLocaleDateString()}: BP ${h.systolic_bp}/${h.sub_diastolic_bp} mmHg, Swelling: ${h.swelling_level}`).join('\n')}

Provide your response in structured JSON with:
1. "clinical_diagnosis": Concise assessment (e.g. Severe Pre-eclampsia with danger features vs. Gestational Hypertension vs. Normal pregnancy).
2. "severity_urgency": "EMERGENCY_IMMEDIATE_TRANSFER" | "URGENT_24HR_FOLLOWUP" | "ROUTINE_MONITORING".
3. "vital_trend_analysis": 2-3 sentences explaining the hemodynamic trajectory and MAP.
4. "key_danger_drivers": Array of strings pointing to the primary pathological triggers.
5. "immediate_clinician_actions": Array of concrete clinical actions (e.g., Magnesium Sulfate loading dose protocol, antihypertensive choice like Oral Nifedipine 10-20mg or IV Labetalol, urine protein testing, left lateral positioning).
6. "chw_bedside_checklist": Array of simple, actionable steps for a community health worker at the rural village bedside (e.g. test knee-jerk reflexes, minimize bright light/noise, hydrate carefully, arrange motorbike/ambulance transport).
7. "reassuring_patient_message": An empathetic, simple 2-sentence reassurance and instruction for the mother in ${language === 'sw' ? 'Swahili' : language === 'hi' ? 'Hindi' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : 'clear simple English'}.
`;

  try {
    if (process.env.GEMINI_API_KEY) {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json({ success: true, ai_analysis: parsed });
      }
    }
  } catch (error) {
    console.error('Gemini API call failed, falling back to rule-based clinical synthesis:', error);
  }

  // Clinical Rule-Based Fallback when offline or API key unavailable
  const isSevere = vital_log.systolic_bp >= 160 || vital_log.sub_diastolic_bp >= 110 || vital_log.headache_or_vision_change;
  const fallbackAnalysis = {
    clinical_diagnosis: isSevere
      ? 'Suspected Severe Pre-eclampsia with Imminent Eclampsia Features'
      : 'Gestational Hypertension requiring Active Surveillance',
    severity_urgency: isSevere ? 'EMERGENCY_IMMEDIATE_TRANSFER' : 'URGENT_24HR_FOLLOWUP',
    vital_trend_analysis: `Mean Arterial Pressure is ${Math.round((vital_log.systolic_bp + 2 * vital_log.sub_diastolic_bp) / 3)} mmHg. Patient displays significant elevation (+${vital_log.systolic_bp - pregnancy.baseline_bp_systolic} mmHg systolic) over initial baseline.`,
    key_danger_drivers: [
      vital_log.systolic_bp >= 160 ? 'Severe systolic hypertension >= 160 mmHg' : 'Elevated peripheral vascular resistance',
      vital_log.headache_or_vision_change ? 'Cerebral vasospasm / central nervous system irritability' : 'Peripheral edema fluid retention',
      vital_log.epigastric_pain ? 'Hepatic capsular stretch (HELLP syndrome danger)' : 'Gestational age > 30 weeks vulnerability',
    ],
    immediate_clinician_actions: isSevere
      ? [
          'Administer Loading Dose of Magnesium Sulfate (4g IV over 20 min + 10g IM) for seizure prophylaxis',
          'Initiate acute antihypertensive therapy: Oral Nifedipine 10mg or IV Labetalol 20mg if SBP >= 160 or DBP >= 110',
          'Position mother on left lateral side to optimize uteroplacental perfusion',
          'Perform urgent urine protein dipstick and prepare emergency district hospital transport',
        ]
      : [
          'Order urine protein dipstick to differentiate gestational hypertension from pre-eclampsia',
          'Schedule repeat blood pressure measurement in 4 hours',
          'Advise bed rest and left lateral recumbent positioning',
          'Educate family on danger warning signs: visual flashes, persistent headache, epigastric pain',
        ],
    chw_bedside_checklist: [
      'Position patient lying on her left side with pillows',
      'Keep the room calm, dim, and quiet to prevent sensory trigger seizures',
      'Check knee-jerk reflexes and document breathing rate',
      'Do not give excess fluids orally; contact the ambulance or community emergency transport driver',
    ],
    reassuring_patient_message:
      language === 'sw'
        ? 'Mama, pumzika upande wako wa kushoto kwa utulivu. Mhudumu wetu wa afya anakuja kukusaidia na kukupa dawa salama mara moja.'
        : language === 'hi'
        ? 'कृपया बाईं करवट लेकर आराम करें। स्वास्थ्य कार्यकर्ता तुरंत आपके घर पहुंचकर सहायता करेंगे।'
        : 'Please rest calmly on your left side. Your community healthcare team has received your vital signs and is dispatching immediate assistance to keep you and your baby safe.',
  };

  return res.json({ success: true, ai_analysis: fallbackAnalysis });
});

// POST /api/v1/ai/chat — Multi-turn Gemini Chatbot with Search Grounding
app.post('/api/v1/ai/chat', async (req: Request, res: Response) => {
  const { messages, role_context = 'patient_companion', patient_id, use_search = true } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages array is required.' });
  }

  const patient = db.users.find((u) => u.id === patient_id);
  const pregnancy = db.pregnancies.find((p) => p.patient_id === patient_id);
  const latestVital = db.vital_logs
    .filter((v) => v.patient_id === patient_id)
    .sort((a, b) => new Date(b.logged_at).getTime() - new Date(a.logged_at).getTime())[0];

  let systemInstruction = '';

  if (role_context === 'clinical_specialist') {
    systemInstruction = `You are the "MatruSuraksha Clinical AI Consultant" (मातृसुरक्षा - Sacred Maternal Guardian). You assist licensed obstetricians, midwives, and rural primary care physicians.
You specialize in:
- High-risk pregnancy protocols: Pre-eclampsia, Eclampsia, HELLP syndrome, gestational hypertension, and obstetric hemorrhage.
- Evidence-based guidelines: WHO Maternal Health Recommendations, ACOG Practice Bulletins, and FIGO Clinical Guidelines.
- Rural & low-resource obstetrics management: Emergency Magnesium Sulfate dosing (loading 4g IV + 10g IM, maintenance 5g IM q4h or 1g/h IV), oral nifedipine (10-20mg), IV labetalol, fluid management in oligoanuria, and transfer logistics.
Current Patient Context (if available):
${patient ? `- Name: ${patient.name}, Gestational Age: ${pregnancy?.gestational_age_weeks} weeks, Gravida/Para: ${pregnancy?.gravida_para}` : ''}
${latestVital ? `- Latest Vitals: BP ${latestVital.systolic_bp}/${latestVital.sub_diastolic_bp} mmHg, Weight: ${latestVital.weight_kg}kg, Swelling: ${latestVital.swelling_level}, Headache/Vision: ${latestVital.headache_or_vision_change ? 'YES' : 'NO'}` : ''}

Always maintain crisp, authoritative clinical accuracy. State exact drug dosages, contraindications, and immediate stabilizing actions.`;
  } else {
    systemInstruction = `You are "MatruSuraksha Companion" (मातृसुरक्षा सहायक - Sacred Maternal Guardian Companion), a compassionate, reassuring prenatal maternal guide supporting expectant mothers in remote and underserved communities.
Your mission:
- Provide warm, comforting, easy-to-understand explanations about pregnancy symptoms, fetal growth, nutritious local foods, hydration, and safe rest.
- Proactively teach and reinforce danger signs: severe persistent headaches, blurred or flashing vision, upper right rib/stomach pain, rapid swelling of face/hands, and decreased baby kicks.
- If the mother reports severe symptoms (high BP, bad headache, vision changes, severe swelling), immediately and gently advise her to rest on her left side and connect her directly with her Community Health Worker or health facility.
- Answer in simple language, avoiding overly complex medical jargon. Support multiple languages (English, Swahili, Hindi, Spanish, French) matching the user.`;
  }

  try {
    if (process.env.GEMINI_API_KEY) {
      const contents = messages.map((m: { role: string; text: string }) => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          tools: use_search ? [{ googleSearch: {} }] : undefined,
        },
      });

      const replyText = response.text || 'I am here with you. Please let me know how you are feeling.';
      const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [];

      return res.json({
        success: true,
        reply: replyText,
        grounding_queries: searchQueries,
      });
    }
  } catch (error) {
    console.error('Gemini chat error, fallback to clinical rule-based reply:', error);
  }

  // Fallback response if offline or API key unavailable
  const lastUserMsg = messages[messages.length - 1]?.text?.toLowerCase() || '';
  let fallbackReply = 'Hello Mama! I am MatruSuraksha Companion (मातृसुरक्षा). I am here to help you understand your pregnancy, baby movements, and vital signs safely.';

  if (lastUserMsg.includes('headache') || lastUserMsg.includes('vision') || lastUserMsg.includes('swelling')) {
    fallbackReply = 'Mama, please listen carefully: Severe headaches, flashing lights in your eyes, or rapid swelling in your face and hands can be important danger signs for high blood pressure. Lie down on your left side in a calm, dim room right away, and press the "Call CHW" button on your app so your health worker can check on you immediately.';
  } else if (lastUserMsg.includes('bp') || lastUserMsg.includes('blood pressure') || lastUserMsg.includes('hypertension')) {
    fallbackReply = 'Normal blood pressure during pregnancy is usually below 120/80 mmHg. If your top number reaches 140 or higher, or your bottom number reaches 90 or higher, it needs close monitoring by your doctor or community midwife.';
  } else if (lastUserMsg.includes('food') || lastUserMsg.includes('diet') || lastUserMsg.includes('iron')) {
    fallbackReply = 'Eating dark green leafy vegetables, beans, lentils, and taking your daily Iron and Folic Acid (IFA) tablet with clean water helps prevent anemia and gives your baby strong energy!';
  }

  return res.json({
    success: true,
    reply: fallbackReply,
    grounding_queries: [],
  });
});

// ==========================================
// Vite Middleware & Server Initialization
// ==========================================

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
