import React, { useState } from 'react';
import { 
  Activity, 
  Stethoscope, 
  Store, 
  User, 
  ArrowRight, 
  Sparkles, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../services/api';

interface LoginPageProps {
  onLoginSuccess: (user: any, token: string, roleProfile: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (loginEmail: string, loginPass: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.login({ email: loginEmail, password: loginPass });
      onLoginSuccess(res.user, res.token, res.role_profile);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const demoRoles = [
    {
      role: 'doctor',
      name: 'Dr. Arun Menon',
      email: 'doctor@ayulink.demo',
      specialization: 'General Medicine',
      desc: 'Create structured prescriptions, review medication safety alerts, and resolve out-of-stock exceptions.',
      icon: Stethoscope,
      accentColor: 'from-teal-500/20 to-emerald-500/10 border-teal-500/40 text-teal-300',
      badge: 'Clinician Experience'
    },
    {
      role: 'pharmacy',
      name: 'CarePlus Pharmacy',
      email: 'pharmacy@ayulink.demo',
      specialization: 'Thrissur Central Branch',
      desc: 'Receive digital prescriptions, check inventory, notify physicians if unavailable, and analyze demand.',
      icon: Store,
      accentColor: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/40 text-emerald-300',
      badge: 'Pharmacy Experience'
    },
    {
      role: 'patient',
      name: 'Rahul Krishnan',
      email: 'patient@ayulink.demo',
      specialization: 'Thrissur Resident',
      desc: 'Search local pharmacy medicine availability without exposed stock counts and track prescription orders.',
      icon: User,
      accentColor: 'from-blue-500/20 to-teal-500/10 border-blue-500/40 text-blue-300',
      badge: 'Patient Experience'
    }
  ];

  return (
    <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full space-y-8">
        {/* Brand Hero */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/60 border border-teal-500/30 text-teal-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Digital Prescription Network & Assistive Intelligence</span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 text-slate-950 shadow-xl shadow-teal-500/25">
              <Activity className="w-7 h-7 stroke-[2.5]" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ayu<span className="text-teal-400">Link</span>
            </h1>
          </div>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto">
            Connecting doctors, pharmacies, and patients through one structured digital prescription network.
          </p>
        </div>

        {/* 1-Click Interactive Demo Accounts */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Select Demo Role to Experience:
            </h2>
            <span className="text-xs text-teal-400 font-medium">1-Click Instant Access</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoRoles.map((dr) => {
              const Icon = dr.icon;
              return (
                <button
                  key={dr.role}
                  type="button"
                  onClick={() => handleLogin(dr.email, 'demo123')}
                  disabled={loading}
                  className={`p-5 rounded-2xl bg-gradient-to-b ${dr.accentColor} bg-slate-900/90 border hover:scale-[1.02] transition-all text-left shadow-xl flex flex-col justify-between space-y-4 group cursor-pointer`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-950/80 border border-slate-800">
                        {dr.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                        {dr.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">{dr.specialization}</p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {dr.desc}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-teal-400 group-hover:translate-x-1 transition-transform">
                    <span>Enter {dr.name.split(' ')[0]} Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Custom Login Drawer */}
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 max-w-md mx-auto space-y-4 shadow-xl">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 text-center">
            Or Sign In with Demo Email
          </h3>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin(email, password);
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. doctor@ayulink.demo"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="demo123"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shadow-lg shadow-teal-500/20 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
