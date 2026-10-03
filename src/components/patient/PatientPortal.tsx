import React, { useState, useEffect } from 'react';
import {
  Heart,
  Activity,
  PlusCircle,
  PhoneCall,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Volume2,
  ShieldAlert,
  Clock,
  ChevronRight,
  TrendingUp,
  MapPin,
  User,
  Sparkles,
  Flame,
  Star,
  Award
} from 'lucide-react';
import { VitalLoggingModal } from './VitalLoggingModal';
import { MedicationReminders } from './MedicationReminders';
import { MaternalGamification } from './MaternalGamification';
import { GamificationCelebrationModal } from './GamificationCelebrationModal';
import { speakMessage } from '../../services/audio';
import { translations } from '../../translations';
import { gamification } from '../../services/gamification';
import type { User as UserType, Pregnancy, VitalLog, Alert, GamificationProfile, MaternalBadge } from '../../types';

interface PatientPortalProps {
  patient: UserType;
  pregnancy?: Pregnancy;
  vitals: VitalLog[];
  alerts: Alert[];
  onLogVitals: (vitalData: any) => Promise<void>;
  isSubmitting: boolean;
  language: string;
  isOffline: boolean;
}

export const PatientPortal: React.FC<PatientPortalProps> = ({
  patient,
  pregnancy,
  vitals,
  alerts,
  onLogVitals,
  isSubmitting,
  language,
  isOffline,
}) => {
  const t = translations[language] || translations.en;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);

  // Gamification State
  const [gameProfile, setGameProfile] = useState<GamificationProfile>(() =>
    gamification.getProfile(patient.id, vitals)
  );
  const [celebrationData, setCelebrationData] = useState<{
    isOpen: boolean;
    streakCount: number;
    pointsEarned: number;
    unlockedBadges: MaternalBadge[];
  }>({
    isOpen: false,
    streakCount: 0,
    pointsEarned: 0,
    unlockedBadges: [],
  });

  // Re-sync gamification profile whenever patient or vitals change
  useEffect(() => {
    const updated = gamification.getProfile(patient.id, vitals);
    setGameProfile(updated);
  }, [patient.id, vitals]);

  const latestVital = vitals[vitals.length - 1];
  const activeAlert = alerts.find((a) => a.status !== 'resolved');

  // Compute status
  const isCritical = activeAlert?.severity === 'red_critical' || (latestVital && latestVital.risk_score >= 60);
  const isWarning = !isCritical && (activeAlert?.severity === 'yellow_warning' || (latestVital && latestVital.risk_score >= 30));

  const handleSOSClick = () => {
    setSosTriggered(true);
    speakMessage(
      language === 'sw'
        ? 'Msaada wa dharura umeanzishwa. Mhudumu wako Zuwena anapigiwa simu sasa.'
        : 'Emergency SOS triggered. Alert sent to your Community Health Worker. Call connecting now.',
      language
    );
  };

  const handleVitalSubmitted = async (vitalData: any) => {
    await onLogVitals(vitalData);
    setIsModalOpen(false);

    // Trigger Gamification Point & Streak Award
    const { profile: updatedProfile, pointsEarned, newlyUnlockedBadges } = gamification.recordVitalLog(
      patient.id,
      [...vitals, { ...vitalData, logged_at: new Date().toISOString() }]
    );
    setGameProfile(updatedProfile);

    // Open Celebration Modal
    setCelebrationData({
      isOpen: true,
      streakCount: updatedProfile.streak.currentStreak,
      pointsEarned,
      unlockedBadges: newlyUnlockedBadges,
    });
  };

  const handleMedicationAward = (pointsEarned: number) => {
    const updated = gamification.getProfile(patient.id);
    setGameProfile(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16">
      
      {/* 1. Maternal Profile Welcome Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden">
        {/* Soft background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 rounded-full bg-rose-100/60 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <img
              src={patient.avatarUrl || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=250&q=80'}
              alt={patient.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-200 shadow-xs"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 font-display">{patient.name}</h1>
                <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Week {pregnancy?.gestational_age_weeks || 32}
                </span>
                {/* Streak Badge in Header */}
                <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded-full text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{gameProfile.streak.currentStreak}d Streak</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{patient.village}</span>
                <span aria-hidden="true">·</span>
                <span>EDD: {pregnancy?.edd || 'Nov 2026'}</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-700 font-bold font-mono">{gameProfile.points} pts</span>
              </p>
            </div>
          </div>

          {/* Assigned CHW pill */}
          {pregnancy && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 text-xs flex items-center gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Community Health Worker</span>
                <span className="font-bold text-slate-800">{pregnancy.assigned_chw_name}</span>
              </div>
              <a
                href={`tel:${pregnancy.assigned_chw_phone}`}
                className="w-8 h-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center transition-colors shadow-xs"
                title="Call CHW"
              >
                <PhoneCall className="w-4 h-4" />
              </a>
            </div>
          )}
        </div>

        {/* Gestational Age Progress Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
            <span className="text-slate-600">Pregnancy Journey: 3rd Trimester</span>
            <span className="text-rose-600 font-bold font-mono">
              {pregnancy?.gestational_age_weeks || 32} / 40 Weeks
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-500"
              style={{ width: `${((pregnancy?.gestational_age_weeks || 32) / 40) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Gamification & Streak Dashboard (Hero Positive Reinforcement) */}
      <MaternalGamification
        profile={gameProfile}
        language={language}
      />

      {/* 3. Critical or Watch Emergency Warning Banner (if active) */}
      {isCritical ? (
        <div className="bg-red-50 border-2 border-red-500 rounded-3xl p-5 shadow-md animate-emergency space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-red-950 font-display">{t.riskCritical}</h3>
                <p className="text-xs text-red-800 mt-0.5">
                  High blood pressure and danger signs detected. Your assigned Community Health Worker{' '}
                  <span className="font-bold underline">{pregnancy?.assigned_chw_name}</span> has been alerted via urgent SMS.
                </p>
              </div>
            </div>
            <button
              onClick={() => speakMessage(t.riskCritical, language)}
              className="text-red-700 hover:text-red-900 p-1"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-white/90 p-3 rounded-xl border border-red-200 text-xs text-red-900 space-y-1">
            <span className="font-bold block">Immediate Advice:</span>
            <p>1. Lie down immediately on your left side in a quiet, darkened room.</p>
            <p>2. Keep your phone nearby. Stay calm while health workers arrive.</p>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <a
              href={`tel:${pregnancy?.assigned_chw_phone || '999'}`}
              className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Call CHW ({pregnancy?.assigned_chw_name}) Now</span>
            </a>
            <button
              onClick={handleSOSClick}
              className="py-2.5 px-4 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors"
            >
              Emergency Hotline
            </button>
          </div>
        </div>
      ) : isWarning ? (
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <h3 className="text-sm font-bold text-amber-950">{t.riskWarning}</h3>
            </div>
            <span className="text-xs font-semibold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
              Follow-up Scheduled
            </span>
          </div>
          <p className="text-xs text-amber-800">
            Slightly elevated blood pressure or swelling noted. Please drink clean water, rest with feet raised, and log your vitals again this evening.
          </p>
        </div>
      ) : null}

      {/* 4. Primary CTA: Log Vitals Card */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-600 to-pink-600 rounded-3xl p-6 text-white shadow-lg shadow-rose-200/50 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 relative z-10">
          <div className="space-y-1.5 max-w-md">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Health Routine (+35 pts)</span>
            </div>
            <h2 className="text-2xl font-bold font-display leading-tight">{t.logVitals}</h2>
            <p className="text-xs text-rose-100">
              Takes just 60 seconds. Maintain your daily streak to earn badges and keep baby safe.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto py-3.5 px-6 bg-white hover:bg-rose-50 text-rose-700 font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 text-sm shrink-0 active:scale-98"
          >
            <PlusCircle className="w-5 h-5 text-rose-600" />
            <span>{t.logVitals}</span>
          </button>
        </div>
      </div>

      {/* 5. Latest Vitals Grid (If logged) */}
      {latestVital && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* BP */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-slate-500 block font-medium">Blood Pressure</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className={`text-2xl font-bold font-mono ${latestVital.systolic_bp >= 140 ? 'text-red-600' : 'text-slate-900'}`}>
                {latestVital.systolic_bp}/{latestVital.sub_diastolic_bp}
              </span>
              <span className="text-[11px] text-slate-400">mmHg</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              {latestVital.systolic_bp >= 160 ? '⚠️ Critical' : latestVital.systolic_bp >= 140 ? '⚠️ High' : '✓ Normal'}
            </span>
          </div>

          {/* Weight */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-slate-500 block font-medium">Current Weight</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-bold font-mono text-slate-900">{latestVital.weight_kg}</span>
              <span className="text-[11px] text-slate-400">kg</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              +{((latestVital.weight_kg - (pregnancy?.baseline_weight_kg || 60))).toFixed(1)} kg gain
            </span>
          </div>

          {/* Swelling */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-slate-500 block font-medium">Swelling (Edema)</span>
            <div className="mt-1">
              <span className={`text-lg font-bold capitalize ${latestVital.swelling_level === 'severe' ? 'text-red-600' : latestVital.swelling_level === 'mild' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {latestVital.swelling_level}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              {latestVital.swelling_level === 'severe' ? 'Facial/Leg edema' : 'Normal range'}
            </span>
          </div>

          {/* Fetal movement */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
            <span className="text-xs text-slate-500 block font-medium">Baby Kicks</span>
            <div className="mt-1">
              <span className={`text-lg font-bold capitalize ${latestVital.fetal_movement === 'absent' ? 'text-red-600' : latestVital.fetal_movement === 'decreased' ? 'text-amber-600' : 'text-emerald-600'}`}>
                {latestVital.fetal_movement || 'Normal'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              {new Date(latestVital.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      )}

      {/* 6. Medication Reminders & Appointments */}
      <MedicationReminders
        patientId={patient.id}
        language={language}
        onMedicationUpdated={handleMedicationAward}
      />

      {/* 7. SOS Floating / Emergency Quick Strip */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold font-display">Experiencing Sudden Bleeding or Severe Pain?</h4>
            <p className="text-xs text-slate-400">Immediate 24/7 Community Emergency Transport Dispatch</p>
          </div>
        </div>
        <button
          onClick={handleSOSClick}
          className="w-full sm:w-auto px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs shrink-0"
        >
          {t.emergencySos}
        </button>
      </div>

      {/* SOS confirmation toast */}
      {sosTriggered && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-950 text-white p-4 rounded-2xl shadow-2xl border border-red-500 flex items-center gap-3 max-w-md animate-bounce">
          <ShieldAlert className="w-6 h-6 text-red-500 shrink-0" />
          <div>
            <span className="text-xs font-bold block text-red-400">Emergency Dispatch Sent!</span>
            <p className="text-xs text-slate-300">
              Community Health Worker {pregnancy?.assigned_chw_name} and Ambulance coordinator notified for {patient.village}.
            </p>
          </div>
        </div>
      )}

      {/* 8. Logging Modal */}
      <VitalLoggingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleVitalSubmitted}
        isSubmitting={isSubmitting}
        pregnancy={pregnancy}
        language={language}
        isOffline={isOffline}
      />

      {/* 9. Gamification Celebration Modal */}
      <GamificationCelebrationModal
        isOpen={celebrationData.isOpen}
        onClose={() => setCelebrationData((prev) => ({ ...prev, isOpen: false }))}
        streakCount={celebrationData.streakCount}
        pointsEarned={celebrationData.pointsEarned}
        unlockedBadges={celebrationData.unlockedBadges}
        language={language}
      />

    </div>
  );
};

