import React, { useState } from 'react';
import { X, Send, Phone, MessageSquare, CheckCircle2, AlertOctagon, User } from 'lucide-react';
import { api } from '../../services/api';
import type { PatientDashboardItem, Alert } from '../../types';

interface AlertDispatchModalProps {
  item: PatientDashboardItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDispatched: () => void;
}

export const AlertDispatchModal: React.FC<AlertDispatchModalProps> = ({
  item,
  isOpen,
  onClose,
  onDispatched,
}) => {
  const [instructions, setInstructions] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [successResult, setSuccessResult] = useState<any>(null);

  if (!isOpen || !item) return null;

  const { patient, pregnancy, latest_vital, active_alerts } = item;
  const pendingAlert = active_alerts[0];

  const defaultMessage = `🚨 URGENT CLINICAL DISPATCH: ${patient.name} (${patient.village}) logged BP ${latest_vital?.systolic_bp}/${latest_vital?.sub_diastolic_bp} mmHg. Symptoms: ${pendingAlert?.danger_signs.join(', ') || 'Severe pre-eclampsia risk'}. Immediate bedside evaluation and ambulance escort required.`;

  const handleDispatch = async () => {
    setIsSending(true);
    try {
      const res = await api.dispatchCHW({
        alert_id: pendingAlert?.id,
        patient_id: patient.id,
        chw_phone: pregnancy.assigned_chw_phone,
        custom_instructions: instructions || defaultMessage,
      });

      if (res.success) {
        setSuccessResult(res.dispatch);
        setTimeout(() => {
          onDispatched();
          onClose();
          setSuccessResult(null);
        }, 1800);
      }
    } catch (err) {
      console.error('Dispatch failed', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Send className="w-5 h-5 text-white" />
            <h3 className="text-base font-bold font-display">Dispatch Community Health Worker</h3>
          </div>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-slate-800">
          
          {/* Target Recipient Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Designated Primary Care Provider
            </span>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-900">{pregnancy.assigned_chw_name}</p>
                <p className="text-xs text-slate-500">Village Health Worker • {patient.village}</p>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{pregnancy.assigned_chw_phone}</span>
              </div>
            </div>
          </div>

          {/* Patient Danger Trigger */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-950 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-red-800">
              <AlertOctagon className="w-4 h-4 text-red-600" />
              <span>Critical Breach Details:</span>
            </div>
            <p>
              Patient <span className="font-bold">{patient.name}</span> (Week {pregnancy.gestational_age_weeks}) recorded{' '}
              <span className="font-bold underline">{latest_vital?.systolic_bp}/{latest_vital?.sub_diastolic_bp} mmHg</span>.
            </p>
            {pendingAlert?.danger_signs && (
              <p className="text-[11px] text-red-700 italic">
                Danger flags: {pendingAlert.danger_signs.join(', ')}
              </p>
            )}
          </div>

          {/* SMS / GSM Message Body */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-900 flex items-center justify-between">
              <span>Cellular SMS Dispatch Payload:</span>
              <span className="text-[10px] text-slate-400 font-normal">GSM 7-bit Rural Compatible</span>
            </label>
            <textarea
              rows={4}
              value={instructions || defaultMessage}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-rose-500 focus:bg-white resize-none"
            />
          </div>

          {/* Success Banner */}
          {successResult && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Dispatched Successfully via Cellular SMS!</span>
                <span className="text-[11px] opacity-80">
                  Transmitted to {successResult.target_recipient} at {successResult.sent_at}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleDispatch}
            disabled={isSending}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Transmitting SMS...' : 'Send SMS Dispatch Now'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
