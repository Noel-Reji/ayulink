import { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { DisclaimerBanner } from './components/common/DisclaimerBanner';
import { LoginPage } from './pages/LoginPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { PharmacyDashboardPage } from './pages/PharmacyDashboardPage';
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import type { User, RoleProfile } from './types';

export function App() {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('ayulink_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [, setToken] = useState<string | null>(() => {
    return localStorage.getItem('ayulink_token');
  });

  const [roleProfile, setRoleProfile] = useState<any | null>(() => {
    const saved = localStorage.getItem('ayulink_role_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);

  // Set default tab on role change
  useEffect(() => {
    if (user?.role === 'doctor') setActiveTab('dashboard');
    else if (user?.role === 'pharmacy') setActiveTab('inbox');
    else if (user?.role === 'patient') setActiveTab('prescriptions');
  }, [user?.role]);

  const handleLoginSuccess = (newUser: User, newToken: string, newProfile: RoleProfile) => {
    setUser(newUser);
    setToken(newToken);
    setRoleProfile(newProfile);
    localStorage.setItem('ayulink_user', JSON.stringify(newUser));
    localStorage.setItem('ayulink_token', newToken);
    localStorage.setItem('ayulink_role_profile', JSON.stringify(newProfile));
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setRoleProfile(null);
    localStorage.removeItem('ayulink_user');
    localStorage.removeItem('ayulink_token');
    localStorage.removeItem('ayulink_role_profile');
  };

  const handleSelectPrescription = (prescriptionId: string) => {
    setSelectedPrescriptionId(prescriptionId);
    if (user?.role === 'doctor') {
      setActiveTab('dashboard');
    } else if (user?.role === 'pharmacy') {
      setActiveTab('inbox');
    } else if (user?.role === 'patient') {
      setActiveTab('prescriptions');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Clinical Disclaimer */}
      <DisclaimerBanner />

      {/* Main Header Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        onSelectPrescription={handleSelectPrescription}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!user ? (
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        ) : user.role === 'doctor' ? (
          <DoctorDashboardPage
            doctorProfile={roleProfile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedPrescriptionId={selectedPrescriptionId}
          />
        ) : user.role === 'pharmacy' ? (
          <PharmacyDashboardPage
            pharmacyProfile={roleProfile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedPrescriptionId={selectedPrescriptionId}
          />
        ) : (
          <PatientDashboardPage
            patientProfile={roleProfile}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            AyuLink Healthcare Prototype — Connecting Doctors, Pharmacies & Patients.
          </span>
          <span className="text-teal-400/90 font-medium">
            AI assists. Clinicians decide.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
