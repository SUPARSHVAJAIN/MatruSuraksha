import React from 'react';
import {
  Heart,
  Stethoscope,
  Radio,
  Wifi,
  WifiOff,
  RefreshCw,
  Globe,
  Bell,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Lock,
  LogOut,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import type { UserRole, User } from '../types';
import type { NetworkMode } from '../services/api';

interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  networkMode: NetworkMode;
  onNetworkModeChange: (mode: NetworkMode) => void;
  offlineCount: number;
  onSync: () => void;
  isSyncing: boolean;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  selectedPatient: User | null;
  allPatients: User[];
  onSelectPatient: (patient: User) => void;
  pendingAlertsCount: number;
  activeStaff: User | null;
  onOpenStaffLogin: () => void;
  onStaffLogout: () => void;
  onOpenChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  networkMode,
  onNetworkModeChange,
  offlineCount,
  onSync,
  isSyncing,
  selectedLanguage,
  onLanguageChange,
  selectedPatient,
  allPatients,
  onSelectPatient,
  pendingAlertsCount,
  activeStaff,
  onOpenStaffLogin,
  onStaffLogout,
  onOpenChat,
}) => {
  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Sanskrit Brand: MatruSuraksha (मातृसुरक्षा) */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-200">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-display">
                  MatruSuraksha (मातृसुरक्षा)
                </span>
                <span className="text-[9px] tracking-wider font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1 py-0.5 rounded">
                  RURAL TRIAGE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                मातृसुरक्षा • Sacred Maternal Health & Triage
              </p>
            </div>
          </div>

          {/* Role Switcher (Patient vs Clinician vs CHW) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
            <button
              onClick={() => onRoleChange('patient')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentRole === 'patient'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Expectant Mother Portal"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>Mother App</span>
            </button>

            <button
              onClick={() => onRoleChange('clinician')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all relative ${
                currentRole === 'clinician'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Clinician Triage Command Center"
            >
              <Stethoscope className="w-3.5 h-3.5 text-indigo-600" />
              <span>Clinician Triage</span>
              {pendingAlertsCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping absolute -top-0.5 -right-0.5" />
              )}
            </button>

            <button
              onClick={() => onRoleChange('chw')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                currentRole === 'chw'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Community Health Worker Phone View"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">CHW Mobile Handset</span>
              <span className="md:hidden">CHW</span>
            </button>
          </div>

          {/* Controls: Patient Switcher, Network Mode, Sync, Professional Login, Language */}
          <div className="flex items-center gap-2">
            
            {/* If in patient mode: Select which patient to simulate */}
            {currentRole === 'patient' && allPatients.length > 0 && (
              <div className="hidden lg:flex items-center gap-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-500">Patient:</span>
                <select
                  aria-label="Select Patient"
                  value={selectedPatient?.id || ''}
                  onChange={(e) => {
                    const pat = allPatients.find((p) => p.id === e.target.value);
                    if (pat) onSelectPatient(pat);
                  }}
                  className="bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs cursor-pointer"
                >
                  {allPatients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.village.split(',')[0]})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Network Condition Simulator Toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-xs">
              <button
                onClick={() => onNetworkModeChange('online')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors ${
                  networkMode === 'online'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Simulate 4G / WiFi Connected"
              >
                <Wifi className="w-3 h-3" />
                <span className="hidden sm:inline">Online</span>
              </button>

              <button
                onClick={() => onNetworkModeChange('spotty')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors ${
                  networkMode === 'spotty'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Simulate Spotty 2G Rural Edge"
              >
                <Radio className="w-3 h-3" />
                <span className="hidden sm:inline">2G</span>
              </button>

              <button
                onClick={() => onNetworkModeChange('offline')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md font-medium transition-colors ${
                  networkMode === 'offline'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Simulate Offline Remote Bush / No Signal"
              >
                <WifiOff className="w-3 h-3" />
                <span className="hidden sm:inline">Offline</span>
              </button>
            </div>

            {/* Offline Queue Sync button */}
            {offlineCount > 0 && (
              <button
                onClick={onSync}
                disabled={isSyncing || networkMode === 'offline'}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg shadow-xs transition-all ${
                  networkMode === 'offline'
                    ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                }`}
                title={networkMode === 'offline' ? 'Cannot sync while offline' : 'Sync pending logs to clinic server'}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Sync ({offlineCount})</span>
              </button>
            )}

            {/* Professional Sign-In or Active Doctor Session */}
            {activeStaff ? (
              <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-2.5 py-1 text-xs">
                <img
                  src={activeStaff.avatarUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=250&q=80'}
                  alt={activeStaff.name}
                  className="w-5 h-5 rounded-md object-cover border border-indigo-300"
                />
                <div className="hidden xl:block text-left">
                  <span className="font-bold text-indigo-950 block leading-tight text-[11px]">
                    {activeStaff.name}
                  </span>
                  <span className="text-[9px] text-indigo-600 font-mono block">
                    {activeStaff.licenseNumber || 'Verified Staff'}
                  </span>
                </div>
                <button
                  onClick={onOpenStaffLogin}
                  className="text-[10px] font-semibold text-indigo-700 hover:text-indigo-900 hover:underline"
                  title="Switch Clinician"
                >
                  Switch
                </button>
                <button
                  onClick={onStaffLogout}
                  className="text-slate-400 hover:text-red-600 p-0.5"
                  title="Sign out of professional session"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenStaffLogin}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                title="Professional Doctor & Midwife Sign In"
              >
                <Lock className="w-3 h-3 text-indigo-200" />
                <span className="hidden sm:inline">Staff Sign In</span>
                <span className="sm:hidden">Staff</span>
              </button>
            )}

            {/* MatruSuraksha AI Assistant Chat Button */}
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-98"
              title="Open MatruSuraksha AI Multi-Turn Chatbot"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin" style={{ animationDuration: '6s' }} />
              <span className="hidden md:inline">MatruSuraksha AI</span>
              <span className="md:hidden">AI</span>
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs">
              <Globe className="w-3.5 h-3.5 text-slate-400 mr-1" />
              <select
                aria-label="Select Language"
                value={selectedLanguage}
                onChange={(e) => onLanguageChange(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="en">English</option>
                <option value="sw">Kiswahili</option>
                <option value="hi">हिंदी</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

