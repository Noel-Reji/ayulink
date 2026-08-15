import React, { useState } from 'react';
import { 
  Activity, 
  Stethoscope, 
  Store, 
  User as UserIcon, 
  RotateCcw, 
  LogOut, 
  TrendingUp, 
  Search, 
  CheckCircle2
} from 'lucide-react';
import type { User, UserRole } from '../../types';
import { NotificationCenter } from './NotificationCenter';
import { api } from '../../services/api';

interface NavbarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onSelectPrescription?: (id: string) => void;
  onResetSuccess?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onSelectPrescription,
  onResetSuccess
}) => {
  const [resetting, setResetting] = useState(false);
  const [resetSuccessToast, setResetSuccessToast] = useState(false);

  const handleResetDemo = async () => {
    try {
      setResetting(true);
      await api.resetDemoData();
      setResetSuccessToast(true);
      if (onResetSuccess) onResetSuccess();
      setTimeout(() => setResetSuccessToast(false), 3000);
    } catch (err) {
      console.error("Failed to reset demo state:", err);
    } finally {
      setResetting(false);
    }
  };

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'doctor':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Stethoscope className="w-3.5 h-3.5" /> Doctor Portal
          </span>
        );
      case 'pharmacy':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Store className="w-3.5 h-3.5" /> Pharmacy Portal
          </span>
        );
      case 'patient':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            <UserIcon className="w-3.5 h-3.5" /> Patient Portal
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-400 text-white shadow-lg shadow-teal-500/20">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-white font-sans">
                  Ayu<span className="text-teal-400">Link</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-teal-300 rounded border border-teal-500/30">
                  Network
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Structured Prescription & Pharmacy Coordination
              </p>
            </div>
          </div>

          {/* Navigation Items according to User Role */}
          {user && (
            <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
              {user.role === 'doctor' && (
                <>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'dashboard'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Clinical Dashboard
                  </button>
                  <button
                    onClick={() => setActiveTab('prescribe')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'prescribe'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Create Prescription
                  </button>
                  <button
                    onClick={() => setActiveTab('patients')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'patients'
                        ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Patient History & AI
                  </button>
                </>
              )}

              {user.role === 'pharmacy' && (
                <>
                  <button
                    onClick={() => setActiveTab('inbox')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'inbox'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Prescription Inbox
                  </button>
                  <button
                    onClick={() => setActiveTab('inventory')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'inventory'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Live Inventory
                  </button>
                  <button
                    onClick={() => setActiveTab('demand')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'demand'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Demand Intelligence
                  </button>
                </>
              )}

              {user.role === 'patient' && (
                <>
                  <button
                    onClick={() => setActiveTab('prescriptions')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      activeTab === 'prescriptions'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    My Prescriptions
                  </button>
                  <button
                    onClick={() => setActiveTab('search')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeTab === 'search'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Search className="w-3.5 h-3.5" />
                    Search Medicine Availability
                  </button>
                </>
              )}
            </nav>
          )}

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  {getRoleBadge(user.role)}
                  <span className="text-xs font-medium text-slate-300">{user.name}</span>
                </div>

                {/* Live Notifications Feed */}
                <NotificationCenter userId={user.id} onSelectPrescription={onSelectPrescription} />

                {/* Reset Demo Data Button */}
                <button
                  onClick={handleResetDemo}
                  disabled={resetting}
                  title="Reset Demo Scenario (Sets Amoxicillin out-of-stock at CarePlus)"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-amber-300 transition-colors cursor-pointer"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
                  <span className="hidden lg:inline">Reset Demo</span>
                </button>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  title="Switch Role / Logout"
                  className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 hover:border-rose-500/40 border border-slate-700 text-slate-300 hover:text-rose-300 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            ) : (
              <span className="text-xs text-slate-400 font-medium">Demo Ready</span>
            )}
          </div>
        </div>
      </div>

      {/* Reset confirmation toast */}
      {resetSuccessToast && (
        <div className="absolute top-18 right-6 z-50 flex items-center gap-2 bg-teal-900 border border-teal-400 text-teal-100 text-xs px-4 py-2.5 rounded-xl shadow-2xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-300" />
          <span>Demo database restored to initial scenario state!</span>
        </div>
      )}
    </header>
  );
};
