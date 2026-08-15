import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Store, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Pill, 
  Building2
} from 'lucide-react';
import { api } from '../../services/api';
import type { Medicine, PublicPharmacyAvailability } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

export const MedicineSearchBox: React.FC = () => {
  const [query, setQuery] = useState('');
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [selectedMed, setSelectedMed] = useState<Medicine | null>(null);
  const [availabilityResults, setAvailabilityResults] = useState<PublicPharmacyAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  // Initial load of popular search options
  useEffect(() => {
    async function loadMeds() {
      try {
        const data = await api.searchMedicines(query);
        setMedicines(data);
        // Default select Paracetamol 500 mg for Demo Story 2
        if (!selectedMed && data.length > 0) {
          const para = data.find((m: any) => m.name.includes('Paracetamol 500')) || data[0];
          setSelectedMed(para);
        }
      } catch (err) {
        console.error("Error loading medicines:", err);
      }
    }
    const timer = setTimeout(loadMeds, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Load availability whenever selected medicine changes
  useEffect(() => {
    if (!selectedMed) return;
    async function fetchAvailability() {
      try {
        setLoading(true);
        const results = await api.getMedicineAvailability(selectedMed!.id, 'Thrissur Metro Area');
        setAvailabilityResults(results);
      } catch (err) {
        console.error("Error loading availability:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAvailability();
  }, [selectedMed]);

  const getTimeAgoText = (dateStr: string) => {
    const diffMins = Math.round((new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60));
    if (diffMins < 1) return 'Just updated';
    if (diffMins < 60) return `Updated ${diffMins} min ago`;
    const diffHours = Math.round(diffMins / 60);
    return `Updated ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/80 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-400" />
              Find Medicine Availability in Nearby Pharmacies
            </h3>
            <p className="text-xs text-slate-400">
              Check real-time stock availability across participating network pharmacies around Thrissur.
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700 text-[11px] text-teal-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Participating Network</span>
          </div>
        </div>

        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search medicine by brand or generic name (e.g. Paracetamol, Amoxicillin, ORS)..."
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Quick Selection Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-slate-400 text-[11px]">Quick check:</span>
          {['Paracetamol 500 mg', 'Amoxicillin 500 mg', 'ORS (Oral Rehydration Salts)', 'Cetirizine 10 mg'].map((name) => {
            const med = medicines.find(m => m.name.includes(name.split(' ')[0]));
            return (
              <button
                key={name}
                type="button"
                onClick={() => {
                  if (med) setSelectedMed(med);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                  selectedMed?.name === name || selectedMed?.name.includes(name.split(' ')[0])
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40 font-semibold'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800'
                }`}
              >
                {name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Medicine Info Card */}
      {selectedMed && (
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{selectedMed.name}</h4>
              <p className="text-xs text-slate-400">
                Generic: <span className="text-slate-200">{selectedMed.generic_name}</span> | Strength: {selectedMed.strength} | Form: {selectedMed.dosage_form}
              </p>
            </div>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
            selectedMed.prescription_required
              ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
          }`}>
            {selectedMed.prescription_required ? 'Prescription Required' : 'Over-The-Counter (OTC)'}
          </span>
        </div>
      )}

      {/* Participating Pharmacies Results List (Demo Story 2) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-400" />
          Participating Pharmacies & Availability ({availabilityResults.length})
        </h4>

        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
            Checking participating pharmacy network availability...
          </div>
        ) : availabilityResults.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs bg-slate-900/60 rounded-2xl border border-slate-800">
            No participating pharmacies currently stock this item.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availabilityResults.map((result) => (
              <div
                key={result.pharmacy_id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800/90 hover:border-slate-700 transition-all shadow-lg space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                      <Store className="w-4 h-4 text-blue-400" />
                      {result.pharmacy_name}
                    </h5>
                    <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      {result.address}
                    </p>
                  </div>
                  <StatusBadge status={result.availability_status} />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                  <span className="flex items-center gap-1 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {getTimeAgoText(result.last_updated)}
                  </span>
                  <span className="text-[11px] text-teal-400 font-medium">
                    Thrissur Network
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Notice Card */}
      <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-teal-400 flex-shrink-0" />
        <span>
          AyuLink safeguards pharmacy privacy: Individual inventory counts and wholesale metrics remain strictly confidential.
        </span>
      </div>
    </div>
  );
};
