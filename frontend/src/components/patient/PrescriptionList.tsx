import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Pill, 
  Sparkles, 
  AlertCircle, 
  Calendar 
} from 'lucide-react';
import { api } from '../../services/api';
import type { Prescription } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface PrescriptionListProps {
  patientId: string;
}

export const PrescriptionList: React.FC<PrescriptionListProps> = ({ patientId }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      const data = await api.getPatientPrescriptions(patientId);
      setPrescriptions(data);
    } catch (err) {
      console.error("Error fetching prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    const interval = setInterval(fetchPrescriptions, 5000);
    return () => clearInterval(interval);
  }, [patientId]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/80">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            Digital Prescriptions & Treatment History
          </h3>
          <p className="text-xs text-slate-400">
            Real-time status updates from your physician and designated pharmacy.
          </p>
        </div>
        <button
          onClick={fetchPrescriptions}
          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
        >
          Refresh Feed
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
          Loading your active prescription records...
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="py-12 text-center text-slate-400 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
          No active or historical prescriptions on record.
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Prescription Ref:</span>
                    <span className="font-mono text-xs text-teal-300 font-semibold">{rx.id.substring(0, 8)}</span>
                    <StatusBadge status={rx.status} />
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-3">
                    <span>Doctor: <strong className="text-slate-200">{rx.doctor_name}</strong></span>
                    <span>•</span>
                    <span>Pharmacy: <strong className="text-slate-200">{rx.pharmacy_name}</strong></span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(rx.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
              </div>

              {/* Status explanation banners */}
              {rx.status === 'unavailable' && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Pharmacy Stock Notification</span>
                    {rx.pharmacy_name} reported an out-of-stock item. Your physician ({rx.doctor_name}) has been notified to make an alternative clinical decision.
                  </div>
                </div>
              )}

              {rx.status === 'resolved' && rx.resolution_notes && (
                <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs text-purple-300 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Prescription Updated by Physician</span>
                    {rx.resolution_notes}
                  </div>
                </div>
              )}

              {/* Prescribed Items */}
              <div className="space-y-2">
                {rx.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-teal-500/15 text-teal-400">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{item.medicine.name}</div>
                        <div className="text-slate-400 text-[11px]">
                          {item.dose} • {item.frequency} • Duration: {item.duration}
                        </div>
                      </div>
                    </div>

                    {item.instructions && (
                      <div className="text-[11px] text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                        <span className="text-teal-300 font-medium">Instructions:</span> {item.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
