import React, { useState } from 'react';
import {
  Radio,
  PhoneCall,
  MapPin,
  Clock,
  CheckCircle2,
  AlertOctagon,
  MessageSquare,
  Navigation,
  Shield,
  Stethoscope,
  Send,
  Sparkles
} from 'lucide-react';
import type { Alert, PatientDashboardItem } from '../../types';

interface CHWMobileViewProps {
  alerts: Alert[];
  patients: PatientDashboardItem[];
  onRefresh: () => void;
}

export const CHWMobileView: React.FC<CHWMobileViewProps> = ({
  alerts,
  patients,
  onRefresh,
}) => {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [reportNote, setReportNote] = useState('');
  const [reportSent, setReportSent] = useState(false);

  const toggleStep = (key: string) => {
    setCompletedSteps((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const criticalAlerts = alerts.filter((a) => a.severity === 'red_critical');
  const activeAlert = criticalAlerts[0] || alerts[0];
  const targetPatient = patients.find((p) => p.patient.id === activeAlert?.patient_id) || patients[0];

  const handleSendBedsideUpdate = () => {
    setReportSent(true);
    setTimeout(() => setReportSent(false), 2500);
  };

  return (
    <div className="max-w-md mx-auto space-y-5 pb-16">
      
      {/* Device Frame Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xl border-4 border-slate-800 space-y-4">
        
        {/* Handset Top Bar */}
        <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 font-mono">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-white font-bold">AfiyaMama CHW Net</span>
          </div>
          <span className="font-mono text-emerald-400">Rural Edge GSM 4G</span>
        </div>

        {/* CHW Profile */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] text-emerald-400 uppercase font-bold tracking-wider">
              Community Health Worker
            </span>
            <h2 className="text-base font-bold text-white font-display">Zuwena Bakari (CHW Lead)</h2>
            <p className="text-xs text-slate-400">Matuga Rural Sub-District Health Post</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold font-mono">
            CHW
          </div>
        </div>

        {/* Incoming SMS Alert Box */}
        {activeAlert && (
          <div className="bg-red-950/80 border-2 border-red-500 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="bg-red-600 text-white font-extrabold px-2 py-0.5 rounded text-[10px] tracking-wide uppercase">
                EMERGENCY SMS DISPATCH
              </span>
              <span className="text-red-300 font-mono text-[10px]">
                {new Date(activeAlert.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <p className="text-xs text-white font-mono leading-relaxed bg-black/40 p-2.5 rounded-xl border border-red-900/50">
              "{activeAlert.sms_preview || 'Critical blood pressure threshold breach. Immediate home visit required.'}"
            </p>

            <div className="flex items-center gap-2 pt-1">
              <a
                href={`tel:${activeAlert.phone || '+254712345678'}`}
                className="flex-1 py-2 px-3 bg-white hover:bg-slate-100 text-red-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-red-600" />
                <span>Call Mother</span>
              </a>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noreferrer"
                className="py-2 px-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Navigate</span>
              </a>
            </div>
          </div>
        )}

      </div>

      {/* Bedside Action Checklist for Rural Health Worker */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xs space-y-4 text-slate-800">
        <div>
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold font-display text-slate-900">
              Bedside Rural Triage Protocol
            </h3>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              WHO Recommended
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Target: <span className="font-semibold text-slate-800">{targetPatient?.patient.name}</span> ({targetPatient?.patient.village})
          </p>
        </div>

        <div className="space-y-2">
          {[
            {
              id: 'c1',
              title: 'Position mother in left lateral recumbent position',
              desc: 'Relieves inferior vena cava compression & maximizes fetal blood flow',
            },
            {
              id: 'c2',
              title: 'Re-measure blood pressure with calibrated manual cuff',
              desc: 'Confirm systolic and diastolic values after 5 minutes of quiet rest',
            },
            {
              id: 'c3',
              title: 'Test urine for Proteinuria with dipstick',
              desc: 'Record +1, +2, or +3 for district doctor',
            },
            {
              id: 'c4',
              title: 'Check deep tendon reflexes (patellar knee jerk)',
              desc: 'Hyperreflexia or clonus indicates impending seizure',
            },
            {
              id: 'c5',
              title: 'Prepare motorbike / community ambulance for referral',
              desc: 'Alert District Hospital maternity ward for incoming high-risk transport',
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => toggleStep(item.id)}
              className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                completedSteps[item.id]
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  completedSteps[item.id] ? 'bg-emerald-600 text-white' : 'border-2 border-slate-300'
                }`}
              >
                {completedSteps[item.id] && <CheckCircle2 className="w-3.5 h-3.5" />}
              </div>
              <div>
                <p className={`text-xs font-bold ${completedSteps[item.id] ? 'line-through opacity-80' : 'text-slate-900'}`}>
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Rapid Bedside Update to Clinician */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <label className="text-xs font-bold text-slate-900 block">
            Transmit Bedside Report to Dr. Neema:
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Arrived at bedside. BP verified 162/110. Patient resting on left side, dipstick ++ protein. Referral driver en route."
            value={reportNote}
            onChange={(e) => setReportNote(e.target.value)}
            className="w-full text-xs p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-emerald-500"
          />
          <button
            onClick={handleSendBedsideUpdate}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send Immediate Telemetry Report</span>
          </button>

          {reportSent && (
            <div className="p-2.5 bg-emerald-100 text-emerald-800 text-xs rounded-xl text-center font-bold">
              ✓ Telemetry report sent to District Hospital Clinician!
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
