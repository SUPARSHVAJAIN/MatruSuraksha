import React, { useState } from 'react';
import {
  Stethoscope,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  TrendingUp,
  MapPin,
  Calendar,
  Send,
  Eye,
  Sparkles,
  PhoneCall,
  RefreshCw,
  BellRing,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { PatientDossierModal } from './PatientDossierModal';
import { AlertDispatchModal } from './AlertDispatchModal';
import type { PatientDashboardItem, Alert } from '../../types';

interface ClinicianDashboardProps {
  patients: PatientDashboardItem[];
  metrics: {
    total: number;
    red_critical: number;
    yellow_warning: number;
    green_stable: number;
    pending_alerts: number;
  };
  activeAlerts: Alert[];
  onRefresh: () => void;
  isLoading: boolean;
  onSimulateCriticalLog: () => void;
}

export const ClinicianDashboard: React.FC<ClinicianDashboardProps> = ({
  patients,
  metrics,
  activeAlerts,
  onRefresh,
  isLoading,
  onSimulateCriticalLog,
}) => {
  const [filterRisk, setFilterRisk] = useState<'all' | 'red' | 'yellow' | 'green'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientItem, setSelectedPatientItem] = useState<PatientDashboardItem | null>(null);
  const [dispatchItem, setDispatchItem] = useState<PatientDashboardItem | null>(null);

  // Filter patients
  const filteredPatients = patients.filter((item) => {
    if (filterRisk !== 'all' && item.risk_level !== filterRisk) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        item.patient.name.toLowerCase().includes(q) ||
        item.patient.village.toLowerCase().includes(q) ||
        item.pregnancy.assigned_chw_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      
      {/* 1. Header & Live Triage Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-200">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 font-display">
                Maternal Triage & Clinical Decision Command
              </h1>
              <p className="text-xs text-slate-500">
                Remote district prenatal monitoring & automated risk prioritization
              </p>
            </div>
          </div>
        </div>

        {/* Quick Demo Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSimulateCriticalLog}
            className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-2xs"
            title="Simulate an expectant mother submitting high BP with danger signs"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Simulate Urgent Patient Log</span>
          </button>

          <button
            onClick={onRefresh}
            disabled={isLoading}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title="Refresh clinical data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Triage Metric Counters (Red / Yellow / Green / Pending) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Total */}
        <div
          onClick={() => setFilterRisk('all')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            filterRisk === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
          }`}
        >
          <span className="text-[11px] font-bold uppercase tracking-wider block opacity-70">Total Cohort</span>
          <span className="text-2xl font-bold font-mono block mt-1">{metrics.total}</span>
          <span className="text-[10px] opacity-70">Expectant mothers</span>
        </div>

        {/* Red Critical */}
        <div
          onClick={() => setFilterRisk('red')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            filterRisk === 'red'
              ? 'bg-red-600 text-white border-red-600 shadow-md ring-2 ring-red-400'
              : 'bg-red-50 hover:bg-red-100/80 border-red-200 text-red-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-90">🔴 Critical Red</span>
            <AlertOctagon className="w-4 h-4 text-red-600 animate-pulse" />
          </div>
          <span className="text-2xl font-bold font-mono block mt-1">{metrics.red_critical}</span>
          <span className="text-[10px] opacity-80 font-medium">Urgent intervention required</span>
        </div>

        {/* Yellow Warning */}
        <div
          onClick={() => setFilterRisk('yellow')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            filterRisk === 'yellow'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md ring-2 ring-amber-300'
              : 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-90">🟡 Moderate Watch</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-2xl font-bold font-mono block mt-1">{metrics.yellow_warning}</span>
          <span className="text-[10px] opacity-80 font-medium">24-hour surveillance</span>
        </div>

        {/* Green Stable */}
        <div
          onClick={() => setFilterRisk('green')}
          className={`cursor-pointer p-4 rounded-2xl border transition-all ${
            filterRisk === 'green'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-300'
              : 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-90">🟢 Stable Green</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-2xl font-bold font-mono block mt-1">{metrics.green_stable}</span>
          <span className="text-[10px] opacity-80 font-medium">Routine ANC tracking</span>
        </div>

        {/* Pending Alerts */}
        <div className="p-4 rounded-2xl border bg-slate-50 border-slate-200 text-slate-900 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider block text-slate-500">Alerts Queue</span>
            <BellRing className="w-4 h-4 text-rose-500" />
          </div>
          <span className="text-2xl font-bold font-mono block mt-1 text-rose-600">{metrics.pending_alerts}</span>
          <span className="text-[10px] text-slate-500 font-medium">Pending clinician triage</span>
        </div>
      </div>

      {/* 3. Urgent Danger Sign Broadcast Banner (If any active critical red) */}
      {metrics.red_critical > 0 && (
        <div className="bg-red-500 text-white rounded-3xl p-5 shadow-lg shadow-red-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-emergency">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider bg-white text-red-700 px-2 py-0.5 rounded-full">
                  TRIAGE PRIORITY 1
                </span>
                <span className="text-xs text-red-100">Imminent Pre-eclampsia Emergency</span>
              </div>
              <p className="text-sm font-bold font-display mt-0.5">
                {patients.find((p) => p.risk_level === 'red')?.patient.name} recorded critical BP spike (
                {patients.find((p) => p.risk_level === 'red')?.latest_vital?.systolic_bp}/
                {patients.find((p) => p.risk_level === 'red')?.latest_vital?.sub_diastolic_bp} mmHg) with headache & vision changes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full md:w-auto">
            <button
              onClick={() => {
                const redPatient = patients.find((p) => p.risk_level === 'red');
                if (redPatient) setDispatchItem(redPatient);
              }}
              className="flex-1 md:flex-initial py-2.5 px-4 bg-white hover:bg-red-50 text-red-700 font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Send className="w-4 h-4 text-red-600" />
              <span>Dispatch CHW SMS Now</span>
            </button>
            <button
              onClick={() => {
                const redPatient = patients.find((p) => p.risk_level === 'red');
                if (redPatient) setSelectedPatientItem(redPatient);
              }}
              className="py-2.5 px-4 bg-red-700 hover:bg-red-800 text-white font-bold text-xs rounded-xl transition-colors"
            >
              Review Dossier
            </button>
          </div>
        </div>
      )}

      {/* 4. Filter Bar & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200">
        
        {/* Risk Level Segmented Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-full sm:w-auto overflow-x-auto">
          {(['all', 'red', 'yellow', 'green'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterRisk(lvl)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all shrink-0 ${
                filterRisk === lvl
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {lvl === 'all' ? 'All Patients' : `${lvl === 'red' ? '🔴 Red Critical' : lvl === 'yellow' ? '🟡 Yellow Watch' : '🟢 Green Stable'}`}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patient, village, CHW..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* 5. Color-Coded Risk Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((item) => {
          const { patient, pregnancy, latest_vital, active_alerts, risk_level, trend_summary } = item;
          const isRed = risk_level === 'red';
          const isYellow = risk_level === 'yellow';

          return (
            <div
              key={patient.id}
              className={`bg-white rounded-3xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                isRed
                  ? 'border-red-400 ring-2 ring-red-400/30'
                  : isYellow
                  ? 'border-amber-300'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                
                {/* Card Header: Patient Identity & Risk Badge */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={patient.avatarUrl || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=250&q=80'}
                      alt={patient.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-2xs"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight font-display">
                        {patient.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{patient.village.split(',')[0]}</span>
                        <span aria-hidden="true">·</span>
                        <span>Wk {pregnancy.gestational_age_weeks}</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isRed
                        ? 'bg-red-100 text-red-800 border border-red-300'
                        : isYellow
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}
                  >
                    {isRed ? '🔴 Critical' : isYellow ? '🟡 Watch' : '🟢 Stable'}
                  </span>
                </div>

                {/* Vitals Summary Pill */}
                {latest_vital ? (
                  <div className={`p-3 rounded-2xl border mb-3 space-y-1.5 ${
                    isRed ? 'bg-red-50/70 border-red-200' : isYellow ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">Blood Pressure:</span>
                      <span className={`text-base font-bold font-mono ${latest_vital.systolic_bp >= 140 ? 'text-red-700' : 'text-slate-900'}`}>
                        {latest_vital.systolic_bp}/{latest_vital.sub_diastolic_bp} <span className="text-[10px] text-slate-400 font-sans">mmHg</span>
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-1 pt-1 text-[11px] border-t border-slate-200/60 text-slate-600">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Weight</span>
                        <span className="font-mono font-bold text-slate-800">{latest_vital.weight_kg} kg</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Swelling</span>
                        <span className="font-semibold capitalize text-slate-800">{latest_vital.swelling_level}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Baby Kicks</span>
                        <span className="font-semibold capitalize text-slate-800">{latest_vital.fetal_movement || 'Normal'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-50 text-center text-xs text-slate-400 mb-3">
                    No vitals logged yet today
                  </div>
                )}

                {/* Trajectory Note */}
                <p className="text-[11px] text-slate-500 leading-tight mb-2 italic">
                  "{trend_summary}"
                </p>

                {/* Assigned CHW */}
                <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 mb-3">
                  <span>CHW: <span className="font-medium text-slate-700">{pregnancy.assigned_chw_name}</span></span>
                  <span className="font-mono text-[10px]">{new Date(latest_vital?.logged_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>

              </div>

              {/* Card Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setSelectedPatientItem(item)}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Dossier & AI</span>
                </button>

                {isRed && (
                  <button
                    onClick={() => setDispatchItem(item)}
                    className="py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                    title="Dispatch Community Health Worker SMS"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Dispatch</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* Patient Dossier Modal */}
      <PatientDossierModal
        item={selectedPatientItem}
        isOpen={Boolean(selectedPatientItem)}
        onClose={() => setSelectedPatientItem(null)}
        onAlertUpdated={onRefresh}
        onOpenDispatch={(patientItem) => {
          setSelectedPatientItem(null);
          setDispatchItem(patientItem);
        }}
      />

      {/* Alert Dispatch Modal */}
      <AlertDispatchModal
        item={dispatchItem}
        isOpen={Boolean(dispatchItem)}
        onClose={() => setDispatchItem(null)}
        onDispatched={onRefresh}
      />

    </div>
  );
};
