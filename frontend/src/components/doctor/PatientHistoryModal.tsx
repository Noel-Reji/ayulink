import React, { useState, useEffect } from 'react';
import { 
  History, 
  Sparkles, 
  Calendar, 
  Pill, 
  X, 
  Clock, 
  ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';
import type { Patient, Prescription } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface PatientHistoryModalProps {
  patient: Patient;
  onClose: () => void;
}

export const PatientHistoryModal: React.FC<PatientHistoryModalProps> = ({ patient, onClose }) => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [aiSummary, setAiSummary] = useState<any | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);

  useEffect(() => {
    async function loadPatientHistory() {
      try {
        setLoadingHistory(true);
        const data = await api.getPatientPrescriptions(patient.id);
        setPrescriptions(data);
      } catch (err) {
        console.error("Error loading patient prescriptions:", err);
      } finally {
        setLoadingHistory(false);
      }
    }
    loadPatientHistory();
  }, [patient.id]);

  const handleGenerateAiSummary = async () => {
    try {
      setGeneratingAi(true);
      const summaryData = await api.generateHistorySummary(patient.id);
      setAiSummary(summaryData);
    } catch (err) {
      console.error("Failed to generate AI history summary:", err);
    } finally {
      setGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-3xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Patient Longitudinal Record: {patient.name}
              </h3>
              <p className="text-xs text-slate-400">
                DOB: {patient.date_of_birth} | Verified AyuLink Patient ID: {patient.id.substring(0, 8)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* AI Summary Card Action */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-950/50 via-slate-900 to-emerald-950/50 border border-teal-500/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider">
                  Assistive AI Clinical Summary
                </h4>
              </div>
              <button
                onClick={handleGenerateAiSummary}
                disabled={generatingAi}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors disabled:opacity-50 cursor-pointer shadow-md shadow-teal-500/20"
              >
                <Sparkles className={`w-3.5 h-3.5 ${generatingAi ? 'animate-spin' : ''}`} />
                {generatingAi ? 'Synthesizing...' : aiSummary ? 'Regenerate Summary' : 'Generate AI Summary'}
              </button>
            </div>

            {aiSummary ? (
              <div className="space-y-3 pt-2 border-t border-teal-500/20 text-xs">
                <p className="text-slate-200 leading-relaxed">
                  {aiSummary.timeline_summary}
                </p>

                {aiSummary.key_medications && aiSummary.key_medications.length > 0 && (
                  <div>
                    <span className="text-[11px] font-semibold text-teal-300">Recorded Medications: </span>
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {aiSummary.key_medications.map((med: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px] border border-slate-700">
                          {med}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-[10px] text-teal-400/90 pt-1 italic">
                  <ShieldAlert className="w-3.5 h-3.5 text-teal-400" />
                  <span>{aiSummary.disclaimer}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Click <span className="text-teal-300 font-semibold">"Generate AI Summary"</span> to synthesize a concise, structured overview of all prior medication courses from the database.
              </p>
            )}
          </div>

          {/* Timeline of Recorded Prescriptions */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-400" />
              Prescription Timeline History ({prescriptions.length} Records)
            </h4>

            {loadingHistory ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                Loading clinical records...
              </div>
            ) : prescriptions.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs bg-slate-800/40 rounded-xl border border-slate-800">
                No past prescription records recorded for this patient.
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="relative group">
                    {/* Timeline Dot */}
                    <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-teal-500 border-4 border-slate-900" />

                    <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 hover:border-teal-500/40 transition-colors space-y-2">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="text-xs font-bold text-slate-200">
                            {new Date(rx.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                          <span className="text-xs text-slate-400">by {rx.doctor_name || 'Dr. Arun Menon'}</span>
                        </div>
                        <StatusBadge status={rx.status} />
                      </div>

                      {rx.notes && (
                        <p className="text-xs text-slate-300 italic bg-slate-900/60 px-3 py-1.5 rounded-lg">
                          "{rx.notes}"
                        </p>
                      )}

                      {/* Items list */}
                      <div className="space-y-1.5 pt-1">
                        {rx.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between text-xs bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-2">
                              <Pill className="w-3.5 h-3.5 text-teal-400" />
                              <span className="font-semibold text-slate-200">{item.medicine.name}</span>
                              <span className="text-slate-400">({item.dose} • {item.frequency})</span>
                            </div>
                            <span className="text-slate-400 text-[11px]">{item.duration}</span>
                          </div>
                        ))}
                      </div>

                      {rx.resolution_notes && (
                        <div className="text-[11px] text-purple-300 bg-purple-950/40 p-2 rounded-lg border border-purple-500/30">
                          <span className="font-semibold">Physician Resolution: </span> {rx.resolution_notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 flex justify-end bg-slate-900/90">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Close Timeline
          </button>
        </div>
      </div>
    </div>
  );
};
