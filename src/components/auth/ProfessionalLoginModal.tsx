import React, { useState } from 'react';
import {
  X,
  Stethoscope,
  ShieldCheck,
  Lock,
  Hospital,
  KeyRound,
  Mail,
  UserCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  FileCheck2,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { api } from '../../services/api';
import type { User } from '../../types';

interface ProfessionalLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User, sessionData: any) => void;
}

const DEMO_STAFF = [
  {
    name: 'Dr. Neema Mwangi, MD',
    title: 'Lead Consultant Obstetrician',
    license: 'KMPDC-39182',
    hospital: 'Coast Provincial Referral Hospital',
    department: 'Maternal-Fetal Medicine & High-Risk Triage',
    role: 'clinician',
    email: 'dr.mwangi@coasthealth.go.ke',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=250&q=80',
    id: 'usr_doc_1',
  },
  {
    name: 'Dr. Rajesh Patel, MS (OB/GYN)',
    title: 'District Maternal Health Specialist',
    license: 'MCI-481920',
    hospital: 'Alwar District Mother & Child Hospital',
    department: 'Obstetrics & High-Risk Triage',
    role: 'clinician',
    email: 'dr.patel@maternalcare.gov.in',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&q=80',
    id: 'usr_doc_2',
  },
  {
    name: 'Nurse Zuwena Bakari',
    title: 'Lead Community Health Midwife',
    license: 'NCK-84920',
    hospital: 'Matuga Rural Health Sub-District Post',
    department: 'Community Midwifery & Primary Triage',
    role: 'chw',
    email: 'zuwena.bakari@chw.kwale.org',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=250&q=80',
    id: 'usr_chw_1',
  },
];

export const ProfessionalLoginModal: React.FC<ProfessionalLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [authMethod, setAuthMethod] = useState<'license' | 'email'>('license');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('••••••••');
  const [selectedHospital, setSelectedHospital] = useState('Coast Provincial Referral Hospital');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const payload: any = {
        hospital: selectedHospital,
        password,
      };

      if (authMethod === 'license') {
        payload.license_number = licenseNumber || 'KMPDC-39182';
      } else {
        payload.email = email || 'dr.mwangi@coasthealth.go.ke';
      }

      const res = await api.login(payload);
      if (res.success && res.user) {
        onLoginSuccess(res.user, res);
        onClose();
      } else {
        setErrorMsg('Invalid medical credentials or unverified license.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication error. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (staff: typeof DEMO_STAFF[0]) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await api.login({
        user_id: staff.id,
        role: staff.role,
        hospital: staff.hospital,
      });

      if (res.success && res.user) {
        onLoginSuccess(res.user, res);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
              <Stethoscope className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-display">Professional Clinical Sign In</h3>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                  PHI SECURE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Authorised Access for Doctors, Midwives & CHW Coordinators
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security & Compliance Banner */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>256-Bit Encrypted Medical Triage Session</span>
          </div>
          <span className="font-mono text-slate-400">ISO 27001 / HIPAA</span>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-6 space-y-5 flex-1 text-slate-800">
          
          {/* Quick Demo 1-Click Roster */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>1-Click Verified Clinician Profiles (Demo):</span>
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold">Instant Triage Access</span>
            </div>

            <div className="space-y-2">
              {DEMO_STAFF.map((staff) => (
                <button
                  key={staff.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(staff)}
                  disabled={isSubmitting}
                  className="w-full p-2.5 bg-slate-50 hover:bg-indigo-50/70 border border-slate-200 hover:border-indigo-300 rounded-2xl flex items-center justify-between text-left transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={staff.avatar}
                      alt={staff.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-900">
                          {staff.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">({staff.license})</span>
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-1">
                        {staff.title} • {staff.hospital.split(' ')[0]}
                      </p>
                    </div>
                  </div>

                  <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 flex items-center justify-center text-slate-400 transition-colors shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="grow border-t border-slate-200" />
            <span className="shrink mx-3 text-xs text-slate-400 font-medium uppercase">
              Or Sign In With Medical Credentials
            </span>
            <div className="grow border-t border-slate-200" />
          </div>

          {/* Custom Credentials Form */}
          <form onSubmit={handleCustomLogin} className="space-y-4">
            
            {/* Method Tabs */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setAuthMethod('license')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  authMethod === 'license'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Medical License ID
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  authMethod === 'email'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hospital Email
              </button>
            </div>

            {/* Input 1: License or Email */}
            {authMethod === 'license' ? (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Medical Council License / Reg Number:
                </label>
                <div className="relative">
                  <FileCheck2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. KMPDC-39182 or MCI-481920"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full text-xs font-mono pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Institutional Email:
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="dr.mwangi@coasthealth.go.ke"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 focus:bg-white"
                  />
                </div>
              </div>
            )}

            {/* Hospital Selector */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Primary Healthcare Facility / Hospital:
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <select
                  value={selectedHospital}
                  onChange={(e) => setSelectedHospital(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 focus:bg-white cursor-pointer"
                >
                  <option value="Coast Provincial Referral Hospital">
                    Coast Provincial Referral Hospital (Kwale / Mombasa)
                  </option>
                  <option value="Alwar District Mother & Child Hospital">
                    Alwar District Mother & Child Hospital (Rajasthan)
                  </option>
                  <option value="Matuga Rural Health Sub-District Post">
                    Matuga Rural Health Sub-District Post
                  </option>
                  <option value="Gulu District Hospital - Maternal Wing">
                    Gulu District Hospital - Maternal Wing (Uganda)
                  </option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">
                Hospital Portal Passcode:
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs font-mono pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-indigo-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Error banner if any */}
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Verifying Credentials...' : 'Authenticate & Open Triage Command'}</span>
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-400">
          AfiyaMama Clinical Telemetry System • Verified Healthcare Provider Session
        </div>

      </div>
    </div>
  );
};
