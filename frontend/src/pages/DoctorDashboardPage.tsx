import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  AlertTriangle, 
  Users, 
  Sparkles, 
  Plus, 
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import type { DoctorProfile, Patient, Prescription, PrescriptionItem } from '../types';
import { PrescriptionBuilder } from '../components/doctor/PrescriptionBuilder';
import { PatientHistoryModal } from '../components/doctor/PatientHistoryModal';
import { DoctorResolutionModal } from '../components/doctor/DoctorResolutionModal';
import { StatusBadge } from '../components/common/StatusBadge';

interface DoctorDashboardPageProps {
  doctorProfile: DoctorProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPrescriptionId?: string | null;
}

export const DoctorDashboardPage: React.FC<DoctorDashboardPageProps> = ({
  doctorProfile,
  activeTab,
  setActiveTab,
  selectedPrescriptionId
}) => {
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Modals
  const [historyPatient, setHistoryPatient] = useState<Patient | null>(null);
  const [resolvingPrescription, setResolvingPrescription] = useState<Prescription | null>(null);

  const fetchDoctorData = async () => {
    try {
      const [dash, patList, rxList] = await Promise.all([
        api.getDoctorDashboard(doctorProfile.doctor_id),
        api.getPatients(),
        api.getPrescriptions({ doctor_id: doctorProfile.doctor_id })
      ]);
      setDashboardData(dash);
      setPatients(patList);
      setPrescriptions(rxList);

      // If prescription ID was targeted via notification click, open resolution if needed
      if (selectedPrescriptionId) {
        const targetRx = rxList.find((r: Prescription) => r.id === selectedPrescriptionId);
        if (targetRx && (targetRx.status === 'unavailable' || targetRx.status === 'doctor_review')) {
          setResolvingPrescription(targetRx);
        }
      }
    } catch (err) {
      console.error("Error fetching doctor data:", err);
    }
  };

  useEffect(() => {
    fetchDoctorData();
    const interval = setInterval(fetchDoctorData, 5000); // 5s live sync for demo loop
    return () => clearInterval(interval);
  }, [doctorProfile.doctor_id, selectedPrescriptionId]);

  const handlePrescriptionCreated = () => {
    fetchDoctorData();
    setActiveTab('dashboard');
  };

  const pendingUnavailList = prescriptions.filter(
    (p) => p.status === 'unavailable' || p.status === 'doctor_review'
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-teal-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-teal-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">
              Dr. {dashboardData?.doctor_name || 'Arun Menon'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
              {dashboardData?.specialization || doctorProfile.specialization || 'General Medicine'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            License: <span className="font-mono text-slate-300">{doctorProfile.license_number || 'MED-KL-2018-9482'}</span> | Thrissur District Medical Network
          </p>
        </div>

        <button
          onClick={() => setActiveTab('prescribe')}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Create New Prescription
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Prescriptions</span>
            <FileText className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white">{prescriptions.length}</div>
          <span className="text-[10px] text-teal-400 font-medium">Digital structured orders</span>
        </div>

        {/* High-priority Pending Responses card */}
        <div className={`p-4 rounded-2xl border space-y-1 ${
          pendingUnavailList.length > 0
            ? 'bg-rose-950/30 border-rose-500/50 pulse-glow'
            : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Pending Pharmacy Alerts</span>
            <AlertTriangle className={`w-4 h-4 ${pendingUnavailList.length > 0 ? 'text-rose-400' : 'text-slate-500'}`} />
          </div>
          <div className={`text-2xl font-black ${pendingUnavailList.length > 0 ? 'text-rose-300' : 'text-white'}`}>
            {pendingUnavailList.length}
          </div>
          <span className="text-[10px] text-rose-400 font-medium">
            {pendingUnavailList.length > 0 ? 'Action required (Out of Stock)' : 'Zero pending exceptions'}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Verified Patients</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white">{patients.length}</div>
          <span className="text-[10px] text-blue-400 font-medium">Longitudinal records</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Clinical AI Safety</span>
            <ShieldCheck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-300">Active</div>
          <span className="text-[10px] text-slate-400">RxNorm interaction guard</span>
        </div>
      </div>

      {/* HIGH PRIORITY: Pending Pharmacy Out-of-Stock Exception Banner (Primary Demo Story) */}
      {pendingUnavailList.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
              <h3 className="text-sm font-bold text-rose-200 uppercase tracking-wider">
                Action Required: Pharmacy Availability Alert ({pendingUnavailList.length})
              </h3>
            </div>
            <span className="text-[11px] font-semibold text-rose-400 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/30">
              Clinician Resolution Required
            </span>
          </div>

          <div className="space-y-2">
            {pendingUnavailList.map((rx) => (
              <div
                key={rx.id}
                className="p-4 rounded-xl bg-slate-900 border border-rose-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white text-sm">{rx.patient_name}</strong>
                    <span className="text-slate-400">| Assigned Pharmacy: <span className="text-slate-200">{rx.pharmacy_name}</span></span>
                  </div>
                  <p className="text-slate-300 mt-1">
                    Fulfillment partner reported medication unavailable. Medication schedule: <strong className="text-rose-300">{rx.items.map((i: PrescriptionItem) => i.medicine.name).join(', ')}</strong>
                  </p>
                </div>

                <button
                  onClick={() => setResolvingPrescription(rx)}
                  className="px-4 py-2 rounded-xl font-bold text-xs bg-rose-500 hover:bg-rose-400 text-white shadow-md shadow-rose-500/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Review & Resolve Exception
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Tab Views */}
      {activeTab === 'prescribe' ? (
        <PrescriptionBuilder
          doctorId={doctorProfile.doctor_id}
          onSuccess={handlePrescriptionCreated}
        />
      ) : activeTab === 'patients' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-400" />
              Patient Records & History Summarization
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patients.map((pat) => (
              <div
                key={pat.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-bold text-white">{pat.name}</h4>
                    <p className="text-xs text-slate-400">DOB: {pat.date_of_birth}</p>
                    <span className="text-[11px] text-teal-400/90 font-mono mt-1 block">
                      ID: {pat.id.substring(0, 8)}
                    </span>
                  </div>
                  <button
                    onClick={() => setHistoryPatient(pat)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    View Timeline & AI Summary
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Dashboard Home View: Prescriptions Table & Patients */
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-teal-400" />
                Recent Clinical Prescriptions ({prescriptions.length})
              </h3>
              <span className="text-[11px] text-slate-400">Live synchronization</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3.5">Patient</th>
                    <th className="px-4 py-3.5">Prescribed Medicines</th>
                    <th className="px-4 py-3.5">Assigned Pharmacy</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-4 py-3.5">Timestamp</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {prescriptions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No prescriptions issued yet. Click "Create New Prescription" to begin.
                      </td>
                    </tr>
                  ) : (
                    prescriptions.map((rx) => (
                      <tr key={rx.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-white">
                          {rx.patient_name}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="space-y-0.5">
                            {rx.items.map((i: PrescriptionItem) => (
                              <div key={i.id} className="text-slate-200">
                                • {i.medicine.name} <span className="text-slate-400 text-[11px]">({i.dose})</span>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-slate-300 font-medium">
                          {rx.pharmacy_name || 'Unassigned'}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={rx.status} />
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                          {new Date(rx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {(rx.status === 'unavailable' || rx.status === 'doctor_review') ? (
                            <button
                              onClick={() => setResolvingPrescription(rx)}
                              className="px-3 py-1 rounded-lg text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white transition-colors"
                            >
                              Resolve
                            </button>
                          ) : (
                            <span className="text-slate-500 text-[11px]">—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Patient History Modal */}
      {historyPatient && (
        <PatientHistoryModal
          patient={historyPatient}
          onClose={() => setHistoryPatient(null)}
        />
      )}

      {/* Doctor Exception Resolution Modal */}
      {resolvingPrescription && (
        <DoctorResolutionModal
          prescription={resolvingPrescription}
          onClose={() => setResolvingPrescription(null)}
          onResolved={() => {
            setResolvingPrescription(null);
            fetchDoctorData();
          }}
        />
      )}
    </div>
  );
};
