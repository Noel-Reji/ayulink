import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  Sparkles, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Stethoscope 
} from 'lucide-react';
import { api } from '../../services/api';
import type { Medicine, Pharmacy, Prescription } from '../../types';

interface DoctorResolutionModalProps {
  prescription: Prescription;
  onClose: () => void;
  onResolved: () => void;
}

export const DoctorResolutionModal: React.FC<DoctorResolutionModalProps> = ({
  prescription,
  onClose,
  onResolved
}) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  
  const [actionType, setActionType] = useState<'substitute' | 'reroute' | 'modify'>('substitute');
  const [substituteMedId, setSubstituteMedId] = useState<string>('');
  const [newDose, setNewDose] = useState<string>('1 tablet');
  const [newFrequency, setNewFrequency] = useState<string>('Twice daily');
  const [newDuration, setNewDuration] = useState<string>('5 days');
  const [reroutePharmId, setReroutePharmId] = useState<string>('');
  const [resolutionNotes, setResolutionNotes] = useState<string>(
    'Clinician resolution: Substituted with Augmentin 625mg (Amoxicillin + Clavulanate) due to local pharmacy stock constraint.'
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadOptions() {
      try {
        const [medData, pharmData] = await Promise.all([
          api.searchMedicines(),
          api.getPharmacies()
        ]);
        setMedicines(medData);
        setPharmacies(pharmData);

        // Pre-select Augmentin 625mg as recommended clinician substitute for Amoxicillin
        const aug = medData.find((m: any) => m.name.includes('Augmentin 625'));
        if (aug) setSubstituteMedId(aug.id);

        const altPharm = pharmData.find((p: any) => p.name.includes('GreenCare'));
        if (altPharm) setReroutePharmId(altPharm.id);
      } catch (err) {
        console.error("Error loading resolution options:", err);
      }
    }
    loadOptions();
  }, []);

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload: any = {
        resolution_action: actionType,
        resolution_notes: resolutionNotes,
      };

      if (actionType === 'substitute') {
        payload.updated_medicine_id = substituteMedId;
        payload.updated_dose = newDose;
        payload.updated_frequency = newFrequency;
        payload.updated_duration = newDuration;
      } else if (actionType === 'reroute') {
        payload.new_pharmacy_id = reroutePharmId;
      }

      await api.doctorResolvePrescription(prescription.id, payload);
      onResolved();
    } catch (err: any) {
      setError(err.message || 'Failed to submit clinical resolution');
    } finally {
      setLoading(false);
    }
  };

  const primaryItem = prescription.items[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Clinician Exception Resolution
              </h3>
              <p className="text-xs text-slate-400">
                Patient: <span className="text-slate-200 font-semibold">{prescription.patient_name}</span> | Fulfillment Partner: <span className="text-slate-200">{prescription.pharmacy_name}</span>
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

        {/* Modal Body */}
        <form onSubmit={handleResolve} className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Out of stock alert banner */}
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-slate-200 space-y-1">
              <span className="font-bold text-rose-300">Medication Unavailable at Selected Pharmacy:</span>
              <p className="text-slate-300">
                {prescription.pharmacy_name} reported that <span className="font-semibold text-rose-200">{primaryItem?.medicine?.name || 'Prescribed item'}</span> is currently out of stock.
              </p>
              <p className="text-teal-300/90 italic text-[11px] pt-1">
                * As per clinical protocol, the treating physician decides the appropriate substitution or rerouting.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/20 text-rose-300 text-xs border border-rose-500/40">
              {error}
            </div>
          )}

          {/* Clinician Resolution Decision Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Select Clinical Decision
            </label>
            <div className="grid grid-cols-2 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => {
                  setActionType('substitute');
                  setResolutionNotes('Clinician resolution: Substituted with Augmentin 625mg (Amoxicillin + Clavulanate) due to local pharmacy stock constraint.');
                }}
                className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  actionType === 'substitute'
                    ? 'bg-teal-500/20 border-teal-500/50 text-teal-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                  Prescribe Alternative Drug
                </div>
                <div className="text-[11px] text-slate-400">
                  Select a therapeutically equivalent or second-line antibiotic.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionType('reroute');
                  setResolutionNotes('Clinician resolution: Rerouted prescription to GreenCare Pharmacy which has verified stock availability.');
                }}
                className={`p-3 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                  actionType === 'reroute'
                    ? 'bg-teal-500/20 border-teal-500/50 text-teal-200'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-teal-400" />
                  Reroute to Partner Pharmacy
                </div>
                <div className="text-[11px] text-slate-400">
                  Transfer original order to an alternate participating pharmacy.
                </div>
              </button>
            </div>
          </div>

          {/* Alternative Medicine Inputs if substituting */}
          {actionType === 'substitute' && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300">Replacement Medication</span>
                <span className="text-[10px] text-teal-400 bg-teal-950/80 px-2 py-0.5 rounded border border-teal-500/30">
                  Physician Confirmed
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-400 mb-1">
                  Select Equivalent / Alternative Drug
                </label>
                <select
                  value={substituteMedId}
                  onChange={(e) => setSubstituteMedId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                  required
                >
                  <option value="">-- Choose Alternative --</option>
                  {medicines.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.generic_name}) - {m.strength}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Dose</label>
                  <input
                    type="text"
                    value={newDose}
                    onChange={(e) => setNewDose(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Frequency</label>
                  <input
                    type="text"
                    value={newFrequency}
                    onChange={(e) => setNewFrequency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Duration</label>
                  <input
                    type="text"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reroute to Pharmacy Inputs */}
          {actionType === 'reroute' && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Select Destination Pharmacy
              </label>
              <select
                value={reroutePharmId}
                onChange={(e) => setReroutePharmId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                required
              >
                {pharmacies.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.address})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Resolution Notes */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Physician Resolution Notes & Instructions
            </label>
            <textarea
              rows={2}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
              required
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {loading ? 'Transmitting Resolution...' : 'Confirm & Transmit Resolution'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
