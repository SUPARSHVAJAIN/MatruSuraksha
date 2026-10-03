export type UserRole = 'patient' | 'clinician' | 'chw';

export type SwellingLevel = 'none' | 'mild' | 'severe';
export type FetalMovement = 'normal' | 'decreased' | 'absent';
export type AlertSeverity = 'yellow_warning' | 'red_critical';
export type AlertStatus = 'pending' | 'acknowledged' | 'resolved';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  village: string;
  region: string;
  language: string;
  avatarUrl?: string;
  email?: string;
  licenseNumber?: string;
  hospital?: string;
  department?: string;
  title?: string;
  badgeNumber?: string;
}

export interface Pregnancy {
  id: string;
  patient_id: string;
  gestational_age_weeks: number;
  edd: string; // Estimated due date
  gravida_para: string; // e.g. "G3 P2"
  risk_factors: string[]; // e.g. ['history_of_hypertension', 'gestational_diabetes']
  assigned_clinician_id: string;
  assigned_chw_name: string;
  assigned_chw_phone: string;
  baseline_bp_systolic: number;
  baseline_bp_diastolic: number;
  baseline_weight_kg: number;
}

export interface VitalLog {
  id: string;
  patient_id: string;
  systolic_bp: number;
  sub_diastolic_bp: number;
  weight_kg: number;
  swelling_level: SwellingLevel;
  headache_or_vision_change: boolean;
  epigastric_pain?: boolean;
  fetal_movement?: FetalMovement;
  risk_score: number; // 0 to 100
  logged_at: string;
  synced_offline?: boolean;
  notes?: string;
}

export interface Alert {
  id: string;
  patient_id: string;
  vital_log_id: string;
  severity: AlertSeverity;
  status: AlertStatus;
  triggered_at: string;
  danger_signs: string[];
  action_taken?: string;
  notes?: string;
  sms_preview?: string;
  patient_name?: string;
  village?: string;
  phone?: string;
}

export interface MedicationReminder {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  timing: string; // e.g., "Morning after meal", "Evening"
  icon: 'pill' | 'iron' | 'calcium' | 'pressure';
  taken_today: boolean;
}

export interface Appointment {
  id: string;
  patient_id: string;
  title: string;
  date: string;
  location: string;
  provider_name: string;
  is_urgent?: boolean;
}

export interface PatientDashboardItem {
  patient: User;
  pregnancy: Pregnancy;
  latest_vital?: VitalLog;
  vital_history: VitalLog[];
  active_alerts: Alert[];
  risk_level: 'green' | 'yellow' | 'red';
  trend_summary: string;
}

export interface MaternalBadge {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'streak' | 'vitals' | 'medicine' | 'guardian';
  unlockedAt?: string;
  pointsAwarded: number;
  requiredProgress: number;
  currentProgress: number;
}

export interface DayLogStatus {
  dayName: string; // "Mon", "Tue", etc.
  dateStr: string; // "YYYY-MM-DD"
  logged: boolean;
  isToday: boolean;
}

export interface MaternalStreak {
  currentStreak: number;
  longestStreak: number;
  lastLoggedDate?: string;
  weeklyHistory: DayLogStatus[];
}

export interface GamificationProfile {
  patient_id: string;
  points: number;
  streak: MaternalStreak;
  badges: MaternalBadge[];
  level: {
    levelNumber: number;
    title: string;
    minPoints: number;
    maxPoints: number;
  };
}
