import React, { useState } from 'react';
import {
  X,
  Volume2,
  Mic,
  Activity,
  Scale,
  Footprints,
  AlertOctagon,
  Baby,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  WifiOff,
  Sparkles
} from 'lucide-react';
import { speakMessage } from '../../services/audio';
import { translations } from '../../translations';
import { evaluateVitals } from '../../utils/clinicalRules';
import type { SwellingLevel, FetalMovement, Pregnancy } from '../../types';

interface VitalLoggingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (vitalData: {
    systolic_bp: number;
    sub_diastolic_bp: number;
    weight_kg: number;
    swelling_level: SwellingLevel;
    headache_or_vision_change: boolean;
    epigastric_pain: boolean;
    fetal_movement: FetalMovement;
    notes?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  pregnancy?: Pregnancy;
  language: string;
  isOffline: boolean;
}

export const VitalLoggingModal: React.FC<VitalLoggingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  pregnancy,
  language,
  isOffline,
}) => {
  const t = translations[language] || translations.en;

  // Form State
  const [systolic, setSystolic] = useState<number>(120);
  const [diastolic, setDiastolic] = useState<number>(80);
  const [weight, setWeight] = useState<number>(pregnancy?.baseline_weight_kg || 64.0);
  const [swelling, setSwelling] = useState<SwellingLevel>('none');
  const [headacheVision, setHeadacheVision] = useState<boolean>(false);
  const [epigastricPain, setEpigastricPain] = useState<boolean>(false);
  const [fetalMovement, setFetalMovement] = useState<FetalMovement>('normal');
  const [notes, setNotes] = useState<string>('');
  const [voiceListening, setVoiceListening] = useState<boolean>(false);
  const [submittedAlertInfo, setSubmittedAlertInfo] = useState<string | null>(null);

  if (!isOpen) return null;

  // Live evaluation of current values
  const previewEval = evaluateVitals({
    systolic_bp: systolic,
    sub_diastolic_bp: diastolic,
    weight_kg: weight,
    swelling_level: swelling,
    headache_or_vision_change: headacheVision,
    epigastric_pain: epigastricPain,
    fetal_movement: fetalMovement,
    gestational_age_weeks: pregnancy?.gestational_age_weeks || 28,
    risk_factors: pregnancy?.risk_factors || [],
  });

  const getBPStatus = () => {
    if (systolic >= 160 || diastolic >= 110) return { label: 'CRITICAL HIGH', color: 'text-red-700 bg-red-100 border-red-300' };
    if (systolic >= 140 || diastolic >= 90) return { label: 'ELEVATED (MONITOR)', color: 'text-amber-800 bg-amber-100 border-amber-300' };
    if (systolic >= 130 || diastolic >= 85) return { label: 'PRE-HYPERTENSION', color: 'text-amber-700 bg-amber-50 border-amber-200' };
    return { label: 'NORMAL & HEALTHY', color: 'text-emerald-700 bg-emerald-100 border-emerald-300' };
  };

  const bpStatus = getBPStatus();

  // Voice guidance prompt
  const handleListenGuide = (textToSpeak: string) => {
    speakMessage(textToSpeak, language);
  };

  // Simulate Voice-to-Vital Input
  const handleSimulateVoiceInput = (scenario: 'normal' | 'critical') => {
    setVoiceListening(true);
    setTimeout(() => {
      setVoiceListening(false);
      if (scenario === 'critical') {
        setSystolic(165);
        setDiastolic(112);
        setSwelling('severe');
        setHeadacheVision(true);
        setEpigastricPain(true);
        setFetalMovement('decreased');
        setNotes('Voice input: "Severe throbbing headache, blurred vision, swelling in feet and face"');
        speakMessage(
          language === 'sw'
            ? 'Shinikizo lako liko juu sana. Taarifa imerekodiwa na mhudumu atajulishwa.'
            : 'Blood pressure is high and warning signs detected. Help is being signaled.',
          language
        );
      } else {
        setSystolic(118);
        setDiastolic(76);
        setSwelling('none');
        setHeadacheVision(false);
        setEpigastricPain(false);
        setFetalMovement('normal');
        setNotes('Voice input: "Feeling good today, baby kicking normally"');
      }
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      systolic_bp: systolic,
      sub_diastolic_bp: diastolic,
      weight_kg: Number(weight),
      swelling_level: swelling,
      headache_or_vision_change: headacheVision,
      epigastric_pain: epigastricPain,
      fetal_movement: fetalMovement,
      notes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-display leading-tight">{t.logVitals}</h3>
              <p className="text-xs text-rose-100">
                {pregnancy ? `Week ${pregnancy.gestational_age_weeks} of Pregnancy` : 'Daily Health Check'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleListenGuide(`${t.logVitals}. ${t.bloodPressure}. ${t.swelling}. ${t.symptoms}.`)}
              className="p-1.5 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
              title={t.voiceGuide}
            >
              <Volume2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Offline notice ribbon */}
        {isOffline && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t.offlineNotice}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 space-y-6 flex-1 text-slate-800">
          
          {/* Quick Voice / Speech Simulation Bar */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Mic className={`w-4 h-4 ${voiceListening ? 'text-rose-600 animate-bounce' : 'text-slate-500'}`} />
              <span className="font-medium">{t.speakToLog} (Simulation):</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleSimulateVoiceInput('normal')}
                className="text-xs px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200 rounded-md transition-colors"
              >
                Normal Log
              </button>
              <button
                type="button"
                onClick={() => handleSimulateVoiceInput('critical')}
                className="text-xs px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 rounded-md transition-colors"
              >
                High BP Alert Log
              </button>
            </div>
          </div>

          {/* 1. Blood Pressure Section */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🩺</span>
                <label className="text-sm font-bold text-slate-900">{t.bloodPressure} (mmHg)</label>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-md font-bold border ${bpStatus.color}`}>
                {bpStatus.label}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Systolic */}
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1 font-medium">{t.systolic}</span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setSystolic((prev) => Math.max(80, prev - 5))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-base"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold font-mono text-slate-900">{systolic}</span>
                  <button
                    type="button"
                    onClick={() => setSystolic((prev) => Math.min(220, prev + 5))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-base"
                  >
                    +
                  </button>
                </div>
                <div className="flex gap-1 mt-2">
                  {[115, 130, 145, 160].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSystolic(v)}
                      className={`text-[11px] flex-1 py-1 rounded border font-mono font-medium ${
                        systolic === v
                          ? 'bg-rose-500 text-white border-rose-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Diastolic */}
              <div className="bg-white p-3 rounded-lg border border-slate-200">
                <span className="text-xs text-slate-500 block mb-1 font-medium">{t.diastolic}</span>
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setDiastolic((prev) => Math.max(50, prev - 5))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-base"
                  >
                    -
                  </button>
                  <span className="text-2xl font-bold font-mono text-slate-900">{diastolic}</span>
                  <button
                    type="button"
                    onClick={() => setDiastolic((prev) => Math.min(140, prev + 5))}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-base"
                  >
                    +
                  </button>
                </div>
                <div className="flex gap-1 mt-2">
                  {[75, 85, 95, 110].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setDiastolic(v)}
                      className={`text-[11px] flex-1 py-1 rounded border font-mono font-medium ${
                        diastolic === v
                          ? 'bg-rose-500 text-white border-rose-600'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 2. Weight Section */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚖️</span>
                <label className="text-sm font-bold text-slate-900">{t.weight} (kg)</label>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Baseline: {pregnancy?.baseline_weight_kg || 60} kg
              </span>
            </div>
            <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-200 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => setWeight((prev) => Math.max(40, Number((prev - 0.5).toFixed(1))))}
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
              >
                -
              </button>
              <span className="text-2xl font-bold font-mono text-slate-900">{weight} <span className="text-sm text-slate-500 font-normal">kg</span></span>
              <button
                type="button"
                onClick={() => setWeight((prev) => Math.min(120, Number((prev + 0.5).toFixed(1))))}
                className="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold flex items-center justify-center"
              >
                +
              </button>
            </div>
          </div>

          {/* 3. Swelling / Edema Visual Selector */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🦶</span>
                <label className="text-sm font-bold text-slate-900">{t.swelling}</label>
              </div>
              <button
                type="button"
                onClick={() => handleListenGuide(t.swelling)}
                className="text-slate-400 hover:text-slate-600"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setSwelling('none')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  swelling === 'none'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-2xl block mb-1">🦵</span>
                <span className="text-xs font-bold block">{t.swellingNone}</span>
                <span className="text-[10px] text-slate-500">Normal legs</span>
              </button>

              <button
                type="button"
                onClick={() => setSwelling('mild')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  swelling === 'mild'
                    ? 'bg-amber-50 border-amber-500 text-amber-800 shadow-xs ring-2 ring-amber-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-2xl block mb-1">🧦</span>
                <span className="text-xs font-bold block">{t.swellingMild}</span>
                <span className="text-[10px] text-slate-500">Tight socks/shoes</span>
              </button>

              <button
                type="button"
                onClick={() => setSwelling('severe')}
                className={`p-3 rounded-xl border text-center transition-all ${
                  swelling === 'severe'
                    ? 'bg-red-50 border-red-500 text-red-800 shadow-xs ring-2 ring-red-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="text-2xl block mb-1">⚠️</span>
                <span className="text-xs font-bold block">{t.swellingSevere}</span>
                <span className="text-[10px] text-slate-500">Face & puffy hands</span>
              </button>
            </div>
          </div>

          {/* 4. Danger Symptoms Checkboxes */}
          <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-600" />
                <label className="text-sm font-bold text-rose-950">{t.symptoms}</label>
              </div>
              <span className="text-[11px] font-semibold text-rose-700">Check if experienced</span>
            </div>

            <div className="space-y-2">
              <label className="flex items-start gap-3 p-2.5 bg-white rounded-lg border border-rose-100 hover:border-rose-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={headacheVision}
                  onChange={(e) => setHeadacheVision(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block leading-tight">
                    {t.headacheVision}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Frontal pounding headache not relieved by rest or dark room
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-2.5 bg-white rounded-lg border border-rose-100 hover:border-rose-300 cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={epigastricPain}
                  onChange={(e) => setEpigastricPain(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                />
                <div>
                  <span className="text-xs font-semibold text-slate-900 block leading-tight">
                    {t.epigastricPain}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Intense pain right below the ribs (upper right belly)
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* 5. Baby Movement */}
          <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Baby className="w-4 h-4 text-slate-700" />
                <label className="text-sm font-bold text-slate-900">{t.babyMovement}</label>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFetalMovement('normal')}
                className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition-all ${
                  fetalMovement === 'normal'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                {t.babyMovementNormal}
              </button>

              <button
                type="button"
                onClick={() => setFetalMovement('decreased')}
                className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition-all ${
                  fetalMovement === 'decreased'
                    ? 'bg-amber-50 border-amber-500 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                {t.babyMovementDecreased}
              </button>

              <button
                type="button"
                onClick={() => setFetalMovement('absent')}
                className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition-all ${
                  fetalMovement === 'absent'
                    ? 'bg-red-50 border-red-500 text-red-800'
                    : 'bg-white border-slate-200 text-slate-700'
                }`}
              >
                {t.babyMovementAbsent}
              </button>
            </div>
          </div>

          {/* Immediate Rule-Engine Risk Assessment Preview */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              previewEval.risk_level === 'red'
                ? 'bg-red-50 border-red-300 text-red-900 animate-pulse'
                : previewEval.risk_level === 'yellow'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {previewEval.risk_level === 'red' ? (
                <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />
              ) : previewEval.risk_level === 'yellow' ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              )}
              <div>
                <span className="text-xs font-bold block uppercase tracking-wider">
                  {previewEval.risk_level === 'red'
                    ? t.riskCritical
                    : previewEval.risk_level === 'yellow'
                    ? t.riskWarning
                    : t.riskStable}
                </span>
                <span className="text-[11px] opacity-80 block">
                  {previewEval.danger_signs.length > 0
                    ? previewEval.danger_signs[0]
                    : 'Vitals and baby movement within target safe parameters.'}
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs font-bold font-mono">Score</span>
              <span className="text-base font-bold font-mono block">{previewEval.risk_score}</span>
            </div>
          </div>

        </form>

        {/* Footer Actions */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
              previewEval.risk_level === 'red'
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
            } disabled:opacity-50`}
          >
            {isSubmitting ? (
              <span>{t.saving}</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{t.saveLog}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
