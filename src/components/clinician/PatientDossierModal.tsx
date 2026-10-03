import React, { useState } from 'react';
import {
  X,
  Activity,
  AlertTriangle,
  TrendingUp,
  Brain,
  ShieldCheck,
  Send,
  PhoneCall,
  Clock,
  CheckCircle2,
  Calendar,
  AlertOctagon,
  FileText,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../../services/api';
import type { PatientDashboardItem, VitalLog, Alert } from '../../types';

interface PatientDossierModalProps {
  item: PatientDashboardItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAlertUpdated: () => void;
  onOpenDispatch: (patientItem: PatientDashboardItem) => void;
}

export const PatientDossierModal: React.FC<PatientDossierModalProps> = ({
  item,
  isOpen,
  onClose,
  onAlertUpdated,
  onOpenDispatch,
}) => {
  const [activeTab, setActiveTab] = useState<'trends' | 'ai_triage' | 'history'>('trends');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const { patient, pregnancy, vital_history, active_alerts, risk_level, latest_vital } = item;

  // Handle AI analysis request
  const handleRunAiAnalysis = async () => {
    if (!latest_vital) return;
    setAiLoading(true);
    try {
      const res = await api.getAITriageSummary(patient.id, latest_vital, patient.language);
      if (res.success) {
        setAiAnalysis(res.ai_analysis);
      }
    } catch (err) {
      console.error('Failed to run AI triage', err);
    } finally {
      setAiLoading(false);
    }
  };

  // Acknowledge or Resolve Alert
  const handleUpdateAlertStatus = async (alertId: string, status: 'acknowledged' | 'resolved') => {
    setResolvingAlertId(alertId);
    try {
      await api.updateAlert(alertId, {
        status,
        action_taken: status === 'resolved' ? 'Reviewed and stabilized by clinician' : 'Acknowledged by triage MD',
      });
      onAlertUpdated();
    } catch (err) {
      console.error('Failed to update alert', err);
    } finally {
      setResolvingAlertId(null);
    }
  };

  // Prepare trend data for SVG Chart
  const vitalsSorted = [...vital_history].sort(
    (a, b) => new Date(a.logged_at).getTime() - new Date(b.logged_at).getTime()
  );

  // Chart coordinates calculation (Systolic & Diastolic)
  const chartHeight = 160;
  const chartWidth = 520;
  const minBP = 60;
  const maxBP = 180;

  const getY = (val: number) => {
    const clamped = Math.max(minBP, Math.min(maxBP, val));
    return chartHeight - ((clamped - minBP) / (maxBP - minBP)) * (chartHeight - 30) - 15;
  };

  const getX = (index: number, total: number) => {
    if (total <= 1) return chartWidth / 2;
    return 30 + (index / (total - 1)) * (chartWidth - 60);
  };

  const systolicPoints = vitalsSorted.map((v, i) => `${getX(i, vitalsSorted.length)},${getY(v.systolic_bp)}`).join(' ');
  const diastolicPoints = vitalsSorted.map((v, i) => `${getX(i, vitalsSorted.length)},${getY(v.sub_diastolic_bp)}`).join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={patient.avatarUrl || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=250&q=80'}
              alt={patient.name}
              className="w-11 h-11 rounded-xl object-cover border border-slate-700"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display">{patient.name}</h3>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    risk_level === 'red'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : risk_level === 'yellow'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {risk_level === 'red' ? '🔴 Critical Triage' : risk_level === 'yellow' ? '🟡 Moderate Watch' : '🟢 Stable'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {patient.village} • Week {pregnancy.gestational_age_weeks} ({pregnancy.gravida_para}) • EDD {pregnancy.edd}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenDispatch(item)}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch CHW</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Clinical Dossier Quick Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400 font-medium">Assigned CHW:</span>{' '}
              <span className="font-bold text-slate-800">{pregnancy.assigned_chw_name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Baseline BP:</span>{' '}
              <span className="font-mono font-bold text-slate-800">
                {pregnancy.baseline_bp_systolic}/{pregnancy.baseline_bp_diastolic} mmHg
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-medium">Risk Factors:</span>{' '}
              <span className="font-semibold text-slate-800">
                {pregnancy.risk_factors.length > 0 ? pregnancy.risk_factors.join(', ') : 'None documented'}
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors ${
                activeTab === 'trends' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vitals Trend Chart
            </button>
            <button
              onClick={() => {
                setActiveTab('ai_triage');
                if (!aiAnalysis) handleRunAiAnalysis();
              }}
              className={`px-3 py-1 rounded-md font-semibold text-xs flex items-center gap-1 transition-colors ${
                activeTab === 'ai_triage' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>AI Clinical Decision Support</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 rounded-md font-semibold text-xs transition-colors ${
                activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vital Logs ({vital_history.length})
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6">
          
          {/* Active Alerts Strip */}
          {active_alerts.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Active Automated Warning Flags</h4>
              {active_alerts.map((alt) => (
                <div
                  key={alt.id}
                  className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                    alt.severity === 'red_critical'
                      ? 'bg-red-50/90 border-red-300 text-red-950'
                      : 'bg-amber-50/90 border-amber-300 text-amber-950'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <AlertOctagon className={`w-4 h-4 shrink-0 mt-0.5 ${alt.severity === 'red_critical' ? 'text-red-600' : 'text-amber-600'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">
                          {alt.severity === 'red_critical' ? 'URGENT DANGER SIGNS' : 'MODERATE RISK WARNING'}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(alt.triggered_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 mt-0.5">{alt.danger_signs.join(' • ')}</p>
                      {alt.action_taken && (
                        <p className="text-[11px] text-slate-500 mt-1 italic">Action: {alt.action_taken}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                    {alt.status === 'pending' && (
                      <button
                        onClick={() => handleUpdateAlertStatus(alt.id, 'acknowledged')}
                        disabled={resolvingAlertId === alt.id}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-md border border-slate-300 transition-colors shadow-2xs"
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateAlertStatus(alt.id, 'resolved')}
                      disabled={resolvingAlertId === alt.id}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition-colors shadow-2xs"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 1: Trend Charts */}
          {activeTab === 'trends' && (
            <div className="space-y-6">
              
              {/* BP Trajectory SVG Chart */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Hemodynamic Trajectory (BP Trend)</h4>
                    <p className="text-xs text-slate-500">WHO Pre-eclampsia cutoff reference lines (140 & 160 mmHg)</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 text-rose-600 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> Systolic
                    </span>
                    <span className="flex items-center gap-1 text-indigo-600 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" /> Diastolic
                    </span>
                  </div>
                </div>

                {/* SVG Visualizer */}
                <div className="w-full overflow-x-auto">
                  <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-44">
                    {/* Background grid */}
                    <line x1="30" y1={getY(160)} x2={chartWidth - 30} y2={getY(160)} stroke="#ef4444" strokeDasharray="4 4" strokeWidth="1.2" opacity="0.6" />
                    <text x="35" y={getY(160) - 4} fill="#ef4444" fontSize="9" fontWeight="bold">Critical Cutoff (160 mmHg)</text>

                    <line x1="30" y1={getY(140)} x2={chartWidth - 30} y2={getY(140)} stroke="#f59e0b" strokeDasharray="4 4" strokeWidth="1.2" opacity="0.6" />
                    <text x="35" y={getY(140) - 4} fill="#f59e0b" fontSize="9" fontWeight="bold">Hypertension Cutoff (140 mmHg)</text>

                    <line x1="30" y1={getY(90)} x2={chartWidth - 30} y2={getY(90)} stroke="#94a3b8" strokeDasharray="2 2" strokeWidth="1" opacity="0.5" />
                    <text x="35" y={getY(90) - 4} fill="#64748b" fontSize="8">Diastolic Warning (90 mmHg)</text>

                    {/* Polyline for Systolic */}
                    <polyline
                      fill="none"
                      stroke="#e11d48"
                      strokeWidth="2.5"
                      points={systolicPoints}
                    />

                    {/* Polyline for Diastolic */}
                    <polyline
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="2.5"
                      points={diastolicPoints}
                    />

                    {/* Data Points */}
                    {vitalsSorted.map((v, i) => {
                      const cx = getX(i, vitalsSorted.length);
                      const cySys = getY(v.systolic_bp);
                      const cyDia = getY(v.sub_diastolic_bp);
                      return (
                        <g key={v.id}>
                          <circle cx={cx} cy={cySys} r="4" fill="#e11d48" stroke="#fff" strokeWidth="1.5" />
                          <circle cx={cx} cy={cyDia} r="4" fill="#4f46e5" stroke="#fff" strokeWidth="1.5" />
                          <text x={cx} y={cySys - 7} fill="#1e293b" fontSize="9" fontWeight="bold" textAnchor="middle">
                            {v.systolic_bp}
                          </text>
                          <text x={cx} y={chartHeight - 2} fill="#64748b" fontSize="8" textAnchor="middle">
                            {new Date(v.logged_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Weight & Edema Evolution */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 mb-1">Maternal Weight Progression</h4>
                  <p className="text-xs text-slate-500 mb-3">
                    Baseline: {pregnancy.baseline_weight_kg} kg • Current: {latest_vital?.weight_kg} kg
                  </p>
                  <div className="space-y-1.5">
                    {vitalsSorted.slice(-3).map((v) => (
                      <div key={v.id} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-500">{new Date(v.logged_at).toLocaleDateString()}</span>
                        <span className="font-mono font-bold text-slate-900">{v.weight_kg} kg</span>
                        <span className="text-[10px] text-rose-600 font-semibold">
                          +{((v.weight_kg - pregnancy.baseline_weight_kg)).toFixed(1)} kg total
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <h4 className="text-xs font-bold text-slate-800 mb-1">Clinical Danger Manifestations</h4>
                  <p className="text-xs text-slate-500 mb-3">Symptom clustering over recent logs</p>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                      <span>Severe Headache / Scotoma:</span>
                      <span className={`font-bold ${latest_vital?.headache_or_vision_change ? 'text-red-600' : 'text-emerald-600'}`}>
                        {latest_vital?.headache_or_vision_change ? 'PRESENT (High Risk)' : 'Absent'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                      <span>Upper Epigastric / RUQ Pain:</span>
                      <span className={`font-bold ${latest_vital?.epigastric_pain ? 'text-red-600' : 'text-emerald-600'}`}>
                        {latest_vital?.epigastric_pain ? 'PRESENT (Hepatic Risk)' : 'Absent'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200">
                      <span>Edema / Swelling:</span>
                      <span className={`font-bold capitalize ${latest_vital?.swelling_level === 'severe' ? 'text-red-600' : 'text-slate-800'}`}>
                        {latest_vital?.swelling_level}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: Gemini AI Clinical Decision Support */}
          {activeTab === 'ai_triage' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-indigo-50/70 p-4 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-indigo-950 font-display">Gemini Clinical Decision Support Engine</h4>
                    <p className="text-xs text-indigo-700">Synthesizes WHO/ACOG obstetrics guidelines with patient telemetry</p>
                  </div>
                </div>
                <button
                  onClick={handleRunAiAnalysis}
                  disabled={aiLoading}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiLoading ? 'Synthesizing...' : 'Refresh AI Assessment'}</span>
                </button>
              </div>

              {aiLoading ? (
                <div className="p-8 text-center space-y-3">
                  <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">
                    Analyzing Mean Arterial Pressure trajectory and pre-eclampsia diagnostic criteria...
                  </p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-4">
                  
                  {/* Diagnosis & Urgency */}
                  <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Clinical Synthesis</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        aiAnalysis.severity_urgency?.includes('EMERGENCY')
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {aiAnalysis.severity_urgency || 'URGENT TRIAGE'}
                      </span>
                    </div>
                    <p className="text-base font-bold text-slate-900 font-display">
                      {aiAnalysis.clinical_diagnosis}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {aiAnalysis.vital_trend_analysis}
                    </p>
                  </div>

                  {/* Immediate Clinician Action Protocol */}
                  <div className="p-4 bg-red-50/70 rounded-2xl border border-red-200 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-red-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-red-600" />
                      <span>Immediate Clinician Action Protocol</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-red-950">
                      {aiAnalysis.immediate_clinician_actions?.map((act: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-bold text-red-600 shrink-0">•</span>
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Rural CHW Bedside Checklist */}
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-950 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Community Health Worker (CHW) Village Bedside Checklist</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-emerald-950">
                      {aiAnalysis.chw_bedside_checklist?.map((chk: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-bold text-emerald-600 shrink-0">✓</span>
                          <span>{chk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Reassuring Native Tongue Message */}
                  {aiAnalysis.reassuring_patient_message && (
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                        Localized Maternal Guidance ({patient.language.toUpperCase()})
                      </span>
                      <p className="text-xs text-slate-800 italic bg-white p-3 rounded-xl border border-slate-200">
                        "{aiAnalysis.reassuring_patient_message}"
                      </p>
                    </div>
                  )}

                </div>
              ) : null}

            </div>
          )}

          {/* TAB 3: History Table */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Historical Vital Sign Submissions</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Date & Time</th>
                      <th className="py-2.5 px-3">BP (mmHg)</th>
                      <th className="py-2.5 px-3">Weight</th>
                      <th className="py-2.5 px-3">Swelling</th>
                      <th className="py-2.5 px-3">Headache/Vision</th>
                      <th className="py-2.5 px-3">Fetal Kicks</th>
                      <th className="py-2.5 px-3">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    {vitalsSorted.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 text-slate-600">
                          {new Date(v.logged_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold">
                          <span className={v.systolic_bp >= 140 ? 'text-red-600' : 'text-slate-900'}>
                            {v.systolic_bp}/{v.sub_diastolic_bp}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono">{v.weight_kg} kg</td>
                        <td className="py-2.5 px-3 capitalize">{v.swelling_level}</td>
                        <td className="py-2.5 px-3">
                          {v.headache_or_vision_change ? (
                            <span className="text-red-600 font-bold">Yes</span>
                          ) : (
                            <span className="text-slate-400">No</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 capitalize">{v.fetal_movement || 'Normal'}</td>
                        <td className="py-2.5 px-3 font-mono font-bold">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[11px] ${
                              v.risk_score >= 60
                                ? 'bg-red-100 text-red-800'
                                : v.risk_score >= 30
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {v.risk_score}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            AfiyaMama Clinical Telemetry Protocol • ACOG & WHO Standards
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors"
          >
            Close Dossier
          </button>
        </div>

      </div>
    </div>
  );
};
