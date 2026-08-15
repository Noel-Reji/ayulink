import React from 'react';
import type { PatientProfile } from '../types';
import { PrescriptionList } from '../components/patient/PrescriptionList';
import { MedicineSearchBox } from '../components/patient/MedicineSearchBox';

interface PatientDashboardPageProps {
  patientProfile: PatientProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const PatientDashboardPage: React.FC<PatientDashboardPageProps> = ({
  patientProfile,
  activeTab,
  setActiveTab
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Patient Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-blue-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">
              {patientProfile.name || 'Rahul Krishnan'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Patient Portal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            DOB: <span className="text-slate-300">{patientProfile.date_of_birth || '1994-05-18'}</span> | Verified AyuLink Account
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'prescriptions'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            My Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('search')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'search'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Search Availability
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'search' ? (
        <MedicineSearchBox />
      ) : (
        <PrescriptionList patientId={patientProfile.patient_id} />
      )}
    </div>
  );
};
