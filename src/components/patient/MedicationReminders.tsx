import React, { useState, useEffect } from 'react';
import { Pill, Calendar, Clock, Check, Bell, Volume2, ShieldCheck, Sparkles } from 'lucide-react';
import { speakMessage } from '../../services/audio';
import { translations } from '../../translations';
import { gamification } from '../../services/gamification';
import type { MedicationReminder, Appointment } from '../../types';

interface MedicationRemindersProps {
  patientId: string;
  language: string;
  onMedicationUpdated?: (pointsEarned: number) => void;
}

const DEFAULT_MEDICATIONS: MedicationReminder[] = [
  {
    id: 'med_1',
    patient_id: 'usr_pat_1',
    medication_name: 'Iron & Folic Acid (IFA)',
    dosage: '1 tablet with water after meal',
    timing: 'Morning (08:00 AM)',
    icon: 'iron',
    taken_today: false,
  },
  {
    id: 'med_2',
    patient_id: 'usr_pat_1',
    medication_name: 'Calcium Carbonate',
    dosage: '500 mg (take 2 hours apart from Iron)',
    timing: 'Afternoon (02:00 PM)',
    icon: 'calcium',
    taken_today: true,
  },
  {
    id: 'med_3',
    patient_id: 'usr_pat_1',
    medication_name: 'Methyldopa (BP Medication)',
    dosage: '250 mg — as prescribed by clinician',
    timing: 'Evening (08:00 PM)',
    icon: 'pressure',
    taken_today: false,
  },
];

const DEFAULT_APPOINTMENT: Appointment = {
  id: 'apt_1',
  patient_id: 'usr_pat_1',
  title: 'Antenatal Care (ANC) Follow-up Visit',
  date: 'Thursday, October 8, 2026 at 09:30 AM',
  location: 'Matuga Rural Health Sub-District Post',
  provider_name: 'Dr. Neema Mwangi / Nurse Zuwena',
  is_urgent: false,
};

export const MedicationReminders: React.FC<MedicationRemindersProps> = ({
  patientId,
  language,
  onMedicationUpdated,
}) => {
  const t = translations[language] || translations.en;
  const storageKey = `afiyamama_meds_${patientId}`;

  const [meds, setMeds] = useState<MedicationReminder[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : DEFAULT_MEDICATIONS;
    } catch {
      return DEFAULT_MEDICATIONS;
    }
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setMeds(JSON.parse(saved));
    } catch {
      // fallback
    }
  }, [patientId]);

  const toggleMed = (id: string) => {
    let newlyChecked = false;
    const updated = meds.map((m) => {
      if (m.id === id) {
        if (!m.taken_today) newlyChecked = true;
        return { ...m, taken_today: !m.taken_today };
      }
      return m;
    });
    setMeds(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    if (newlyChecked) {
      const { pointsEarned } = gamification.recordMedicationTaken(patientId);
      if (onMedicationUpdated) {
        onMedicationUpdated(pointsEarned);
      }
    }
  };

  const handleSpeakMed = (med: MedicationReminder) => {
    speakMessage(`${med.medication_name}. ${med.dosage}. ${med.timing}.`, language);
  };

  return (
    <div className="space-y-4">
      {/* Daily Medication List */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Pill className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.medications}</h3>
              <p className="text-xs text-slate-500">Essential prenatal supplements & prescriptions</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
            {meds.filter((m) => m.taken_today).length}/{meds.length} Taken
          </span>
        </div>

        <div className="space-y-2.5">
          {meds.map((med) => (
            <div
              key={med.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                med.taken_today
                  ? 'bg-slate-50/70 border-slate-200 text-slate-500'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-900 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleMed(med.id)}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                    med.taken_today
                      ? 'bg-emerald-600 text-white'
                      : 'border-2 border-slate-300 hover:border-rose-500'
                  }`}
                  aria-label={med.taken_today ? 'Mark as not taken' : 'Mark as taken'}
                >
                  {med.taken_today && <Check className="w-4 h-4 stroke-[3]" />}
                </button>

                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${med.taken_today ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                      {med.medication_name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                      {med.timing}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{med.dosage}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleSpeakMed(med)}
                className="text-slate-400 hover:text-slate-600 p-1"
                title="Hear reminder audio"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Next Appointment Card */}
      <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/60 rounded-2xl p-5 border border-indigo-100 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t.appointments}</h3>
              <p className="text-xs text-indigo-700 font-medium">District Maternal Health Program</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-indigo-700 bg-white border border-indigo-200 px-2 py-0.5 rounded-full">
            In 5 Days
          </span>
        </div>

        <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-xl border border-indigo-100/80 space-y-1.5">
          <p className="text-xs font-bold text-slate-900">{DEFAULT_APPOINTMENT.title}</p>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{DEFAULT_APPOINTMENT.date}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>{DEFAULT_APPOINTMENT.location} • {DEFAULT_APPOINTMENT.provider_name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
