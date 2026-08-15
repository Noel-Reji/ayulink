import React, { useState } from 'react';
import { 
  Inbox, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  Pill, 
  Send, 
  User, 
  AlertTriangle
} from 'lucide-react';
import { api } from '../../services/api';
import type { Prescription } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface PrescriptionInboxProps {
  pharmacyId: string;
  prescriptions: Prescription[];
  onRefresh: () => void;
}

export const PrescriptionInbox: React.FC<PrescriptionInboxProps> = ({
  prescriptions,
  onRefresh
}) => {
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [unavailReason, setUnavailReason] = useState<string>(
    'Item currently out of stock in pharmacy inventory.'
  );
  const [processing, setProcessing] = useState(false);
  const [showUnavailDialog, setShowUnavailDialog] = useState(false);

  const handleNotifyUnavailable = async (rxId: string) => {
    try {
      setProcessing(true);
      await api.markPrescriptionUnavailable(rxId, unavailReason);
      setShowUnavailDialog(false);
      onRefresh();
      // Update locally selected
      if (selectedRx && selectedRx.id === rxId) {
        setSelectedRx({ ...selectedRx, status: 'unavailable' });
      }
    } catch (err) {
      console.error("Error marking unavailable:", err);
    } finally {
      setProcessing(false);
    }
  };

  const handleCompletePrescription = async (rxId: string) => {
    try {
      setProcessing(true);
      await api.completePrescription(rxId);
      onRefresh();
      if (selectedRx && selectedRx.id === rxId) {
        setSelectedRx({ ...selectedRx, status: 'completed' });
      }
    } catch (err) {
      console.error("Error completing prescription:", err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left List: Inbox Items */}
      <div className="lg:col-span-5 space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-emerald-400" />
            Digital Prescription Inbox ({prescriptions.length})
          </h3>
          <span className="text-[11px] text-slate-400">Live feed</span>
        </div>

        {prescriptions.length === 0 ? (
          <div className="p-8 text-center bg-slate-800/40 rounded-2xl border border-slate-800 text-xs text-slate-400">
            No active prescriptions in the inbox.
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {prescriptions.map((rx) => {
              const isSelected = selectedRx?.id === rx.id;
              const hasAmoxDemo = rx.items.some(i => i.medicine.name.includes('Amoxicillin 500'));
              return (
                <div
                  key={rx.id}
                  onClick={() => setSelectedRx(rx)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-emerald-400" />
                        {rx.patient_name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Prescribed by {rx.doctor_name}
                      </span>
                    </div>
                    <StatusBadge status={rx.status} />
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    {rx.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <Pill className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                        <span className="truncate">{item.medicine.name}</span>
                        <span className="text-slate-400 text-[11px]">({item.dose})</span>
                      </div>
                    ))}
                  </div>

                  {hasAmoxDemo && rx.status === 'received' && (
                    <div className="mt-2.5 px-2 py-1 rounded bg-rose-500/15 border border-rose-500/30 text-[10px] font-semibold text-rose-300 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      Inventory check: Amoxicillin 500mg is currently Out of Stock
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-800/80">
                    <span>{rx.items.length} item(s)</span>
                    <span>{new Date(rx.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Detail Pane */}
      <div className="lg:col-span-7">
        {selectedRx ? (
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-6 shadow-xl">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">{selectedRx.patient_name}</h3>
                  <StatusBadge status={selectedRx.status} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Prescription Ref: <span className="font-mono text-slate-300">{selectedRx.id.substring(0, 8)}</span> | Date: {new Date(selectedRx.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-teal-400">{selectedRx.doctor_name}</span>
                <p className="text-[11px] text-slate-400">{selectedRx.doctor_specialization || 'Physician'}</p>
              </div>
            </div>

            {/* Clinical Notes if present */}
            {selectedRx.notes && (
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/80 text-xs text-slate-300">
                <span className="font-semibold text-slate-200">Doctor's Clinical Notes: </span>
                <span>"{selectedRx.notes}"</span>
              </div>
            )}

            {/* Resolved notes if physician addressed out of stock */}
            {selectedRx.resolution_notes && (
              <div className="p-3.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Physician Resolution Received:
                </div>
                <p className="text-purple-200">{selectedRx.resolution_notes}</p>
              </div>
            )}

            {/* Prescribed Items Schedule */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Prescribed Medication Items
              </h4>
              <div className="space-y-2.5">
                {selectedRx.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Pill className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-bold text-white">{item.medicine.name}</span>
                        <span className="text-xs text-slate-400">({item.medicine.dosage_form})</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400">{item.dose}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-300 pt-1">
                      <div>
                        <span className="text-[11px] text-slate-400 block">Frequency:</span>
                        <span className="font-medium">{item.frequency}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">Duration:</span>
                        <span className="font-medium">{item.duration}</span>
                      </div>
                      <div className="sm:col-span-1 col-span-2">
                        <span className="text-[11px] text-slate-400 block">Generic / RxNorm:</span>
                        <span className="font-medium truncate">{item.medicine.generic_name}</span>
                      </div>
                    </div>

                    {item.instructions && (
                      <div className="text-[11px] text-slate-400 bg-slate-900 px-2.5 py-1 rounded">
                        <span className="text-slate-300 font-medium">Instructions:</span> {item.instructions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fulfillment Actions */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-end gap-3">
              {/* Primary Demo Action: Notify Doctor if unavailable */}
              {(selectedRx.status === 'received' || selectedRx.status === 'sent') && (
                <>
                  <button
                    onClick={() => setShowUnavailDialog(true)}
                    disabled={processing}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 transition-colors cursor-pointer"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    Notify Doctor (Unavailable)
                  </button>

                  <button
                    onClick={() => handleCompletePrescription(selectedRx.id)}
                    disabled={processing}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Dispense & Complete
                  </button>
                </>
              )}

              {selectedRx.status === 'resolved' && (
                <button
                  onClick={() => handleCompletePrescription(selectedRx.id)}
                  disabled={processing}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-purple-500 hover:bg-purple-400 text-slate-950 shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Dispense Resolved Medication
                </button>
              )}

              {selectedRx.status === 'unavailable' && (
                <div className="text-xs text-rose-300 flex items-center gap-2 py-2">
                  <Clock className="w-4 h-4 text-rose-400 animate-spin" />
                  <span>Physician has been alerted. Awaiting clinician review & substitution...</span>
                </div>
              )}

              {selectedRx.status === 'completed' && (
                <div className="text-xs text-teal-300 flex items-center gap-1.5 py-2">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>Prescription fulfilled and safely dispensed to patient.</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-12 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800 text-center">
            <Inbox className="w-12 h-12 text-slate-600 mb-3" />
            <h4 className="text-sm font-semibold text-slate-300">Select a Prescription</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Click any incoming digital prescription on the left to review medication details, check inventory availability, or notify the physician.
            </p>
          </div>
        )}
      </div>

      {/* Out of Stock Confirmation Dialog */}
      {showUnavailDialog && selectedRx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Trigger Physician Availability Alert</h3>
                <p className="text-xs text-slate-400">Patient: {selectedRx.patient_name}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              This will update the prescription status to <span className="text-rose-400 font-bold">"Unavailable"</span> and send an immediate high-priority notification to <span className="text-teal-300 font-semibold">{selectedRx.doctor_name}</span> to make a clinical decision.
            </p>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Pharmacy Reason / Note for Doctor
              </label>
              <textarea
                rows={2}
                value={unavailReason}
                onChange={(e) => setUnavailReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowUnavailDialog(false)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleNotifyUnavailable(selectedRx.id)}
                disabled={processing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                {processing ? 'Alerting Doctor...' : 'Send Alert to Doctor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
