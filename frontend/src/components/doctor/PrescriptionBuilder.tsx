import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Send, 
  ShieldAlert, 
  AlertTriangle, 
  Info, 
  Bookmark, 
  FileText,
  Pill
} from 'lucide-react';
import { api } from '../../services/api';
import type { Medicine, Patient, Pharmacy, SafetyAlert } from '../../types';

interface PrescriptionBuilderProps {
  doctorId: string;
  onSuccess: (prescriptionId: string) => void;
}

interface ItemRow {
  medicine_id: string;
  medicine_name: string;
  generic_name: string;
  strength: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export const PrescriptionBuilder: React.FC<PrescriptionBuilderProps> = ({ doctorId, onSuccess }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [medicinesList, setMedicinesList] = useState<Medicine[]>([]);

  // Form State
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedPharmacyId, setSelectedPharmacyId] = useState<string>('');
  const [clinicalNotes, setClinicalNotes] = useState<string>('Suspected bacterial upper respiratory infection. First-line therapy.');
  
  const [items, setItems] = useState<ItemRow[]>([
    {
      medicine_id: '',
      medicine_name: '',
      generic_name: '',
      strength: '',
      dose: '1 capsule',
      frequency: 'Twice daily',
      duration: '5 days',
      instructions: 'Take after food with water'
    }
  ]);

  // Safety Alerts
  const [safetyAlerts, setSafetyAlerts] = useState<SafetyAlert[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [patData, pharmData, medData, tplData] = await Promise.all([
          api.getPatients(),
          api.getPharmacies(),
          api.searchMedicines(),
          api.getDoctorTemplates(doctorId)
        ]);
        setPatients(patData);
        setPharmacies(pharmData);
        setMedicinesList(medData);
        setTemplates(tplData);

        // Pre-select Rahul and CarePlus for the default demo story
        const rahul = patData.find((p: any) => p.name.includes('Rahul'));
        if (rahul) setSelectedPatientId(rahul.id);

        const careplus = pharmData.find((p: any) => p.name.includes('CarePlus'));
        if (careplus) setSelectedPharmacyId(careplus.id);

        // Pre-select Amoxicillin 500mg as default row
        const amox = medData.find((m: any) => m.name.includes('Amoxicillin 500'));
        if (amox) {
          setItems([{
            medicine_id: amox.id,
            medicine_name: amox.name,
            generic_name: amox.generic_name,
            strength: amox.strength,
            dose: '1 capsule',
            frequency: 'Twice daily',
            duration: '5 days',
            instructions: 'Take after meals with water'
          }]);
        }
      } catch (err) {
        console.error("Error loading prescription builder data:", err);
      }
    }
    loadData();
  }, [doctorId]);

  // Run AI / Conservative Safety Check whenever items change
  useEffect(() => {
    async function runSafetyCheck() {
      const validItems = items.filter(i => i.medicine_id);
      if (validItems.length === 0 || !selectedPatientId) {
        setSafetyAlerts([]);
        return;
      }

      try {
        const checkRes = await api.checkPrescriptionSafety(
          selectedPatientId,
          validItems.map(i => ({ medicine_id: i.medicine_id, dose: i.dose, frequency: i.frequency }))
        );
        setSafetyAlerts(checkRes.alerts || []);
      } catch (err) {
        console.error("Safety check err:", err);
      }
    }

    const timer = setTimeout(runSafetyCheck, 400);
    return () => clearTimeout(timer);
  }, [items, selectedPatientId]);

  const handleSelectTemplate = (template: any) => {
    if (!template.items || template.items.length === 0) return;
    const newItems: ItemRow[] = template.items.map((tplItem: any) => {
      const matchedMed = medicinesList.find(m => m.name.toLowerCase().includes(tplItem.medicine_name.toLowerCase()));
      return {
        medicine_id: matchedMed ? matchedMed.id : '',
        medicine_name: matchedMed ? matchedMed.name : tplItem.medicine_name,
        generic_name: matchedMed ? matchedMed.generic_name : '',
        strength: matchedMed ? matchedMed.strength : '',
        dose: tplItem.dose || '1 tablet',
        frequency: tplItem.frequency || 'Twice daily',
        duration: tplItem.duration || '5 days',
        instructions: tplItem.instructions || ''
      };
    });
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof ItemRow, value: string) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };

    // If medicine changed, populate generic name and strength
    if (field === 'medicine_id') {
      const med = medicinesList.find(m => m.id === value);
      if (med) {
        updated[index].medicine_name = med.name;
        updated[index].generic_name = med.generic_name;
        updated[index].strength = med.strength;
      }
    }

    setItems(updated);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        medicine_id: '',
        medicine_name: '',
        generic_name: '',
        strength: '',
        dose: '1 tablet',
        frequency: 'Twice daily',
        duration: '5 days',
        instructions: 'Take after meals'
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const validItems = items.filter(i => i.medicine_id);
    if (validItems.length === 0) {
      setErrorMsg("Please select at least one medicine.");
      return;
    }
    if (!selectedPatientId) {
      setErrorMsg("Please select a patient.");
      return;
    }
    if (!selectedPharmacyId) {
      setErrorMsg("Please select a recipient pharmacy.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        patient_id: selectedPatientId,
        pharmacy_id: selectedPharmacyId,
        notes: clinicalNotes,
        items: validItems.map(i => ({
          medicine_id: i.medicine_id,
          dose: i.dose,
          frequency: i.frequency,
          duration: i.duration,
          instructions: i.instructions
        }))
      };

      const result = await api.createPrescription(payload, doctorId);
      onSuccess(result.id);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create prescription");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Template Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/80">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            Structured Digital Prescription
          </h2>
          <p className="text-xs text-slate-400">
            Create structured, validated medication orders with clinician-controlled execution.
          </p>
        </div>

        {/* Quick Prescription Protocols / Templates */}
        {templates.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 text-teal-400" /> Templates:
            </span>
            {templates.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleSelectTemplate(tpl)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-700/60 hover:bg-teal-900/40 hover:text-teal-200 border border-slate-600/80 text-slate-300 transition-colors cursor-pointer"
              >
                {tpl.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Patient and Recipient Pharmacy Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Select Patient <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              required
            >
              <option value="">-- Choose Patient --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} (DOB: {p.date_of_birth})
                </option>
              ))}
            </select>
          </div>

          <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Participating Pharmacy <span className="text-rose-400">*</span>
            </label>
            <select
              value={selectedPharmacyId}
              onChange={(e) => setSelectedPharmacyId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              required
            >
              <option value="">-- Choose Participating Pharmacy --</option>
              {pharmacies.map(ph => (
                <option key={ph.id} value={ph.id}>
                  {ph.name} — {ph.address}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Prescription Items (Medications) */}
        <div className="bg-slate-800/40 p-5 rounded-2xl border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Pill className="w-4 h-4 text-teal-400" />
              Medication Schedule ({items.length})
            </h3>
            <button
              type="button"
              onClick={handleAddItem}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-teal-600/30 hover:bg-teal-600/50 text-teal-300 border border-teal-500/40 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Medicine
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-400">Medicine #{idx + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="text-rose-400 hover:text-rose-300 p-1 rounded transition-colors cursor-pointer"
                      title="Remove medicine"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Pharmaceutical Product
                    </label>
                    <select
                      value={item.medicine_id}
                      onChange={(e) => handleItemChange(idx, 'medicine_id', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                      required
                    >
                      <option value="">-- Select Medicine --</option>
                      {medicinesList.map(m => (
                        <option key={m.id} value={m.id}>
                          {m.name} ({m.dosage_form}) - {m.generic_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Dosage (Units)
                    </label>
                    <input
                      type="text"
                      value={item.dose}
                      onChange={(e) => handleItemChange(idx, 'dose', e.target.value)}
                      placeholder="e.g. 1 capsule / 500mg"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Frequency
                    </label>
                    <select
                      value={item.frequency}
                      onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                    >
                      <option value="Once daily">Once daily (OD)</option>
                      <option value="Twice daily">Twice daily (BD / 2× daily)</option>
                      <option value="Thrice daily">Thrice daily (TDS / 3× daily)</option>
                      <option value="Four times daily">Four times daily (QDS)</option>
                      <option value="Once daily (at night)">Once daily (at bedtime)</option>
                      <option value="SOS / As needed">SOS / As needed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                      placeholder="e.g. 5 days, 14 days"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-medium text-slate-400 mb-1">
                      Administration Instructions
                    </label>
                    <input
                      type="text"
                      value={item.instructions}
                      onChange={(e) => handleItemChange(idx, 'instructions', e.target.value)}
                      placeholder="e.g. Take after meals with plenty of water"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clinical Notes */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Physician Clinical Notes / Diagnosis Impression
          </label>
          <textarea
            rows={2}
            value={clinicalNotes}
            onChange={(e) => setClinicalNotes(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-teal-500"
            placeholder="Document rationale, clinical impression, or pharmacy instructions..."
          />
        </div>

        {/* Assistive AI Medication Safety Panel */}
        {safetyAlerts.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                  Assistive Medication Safety Advisory
                </h4>
              </div>
              <span className="text-[10px] text-amber-400/90 font-medium px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-500/30">
                Physician confirmation required
              </span>
            </div>

            <div className="space-y-2">
              {safetyAlerts.map((alert, aidx) => (
                <div key={aidx} className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/20 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-amber-200">
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    <span>{alert.title}</span>
                  </div>
                  <p className="text-slate-300 text-[11px] mt-1 leading-relaxed">
                    {alert.description}
                  </p>
                  <p className="text-teal-300 text-[11px] mt-1 font-medium">
                    Recommendation: {alert.recommendation}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Source: {alert.source}
                  </span>
                </div>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 italic">
              * Assistive information only. The prescribing clinician retains full authority to confirm or alter the regimen.
            </p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-lg shadow-teal-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {submitting ? 'Transmitting to Network...' : 'Send Prescription to Pharmacy'}
          </button>
        </div>
      </form>
    </div>
  );
};
