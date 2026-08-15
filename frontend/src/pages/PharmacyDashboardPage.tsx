import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  TrendingUp, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { api } from '../services/api';
import type { PharmacyProfile, Prescription } from '../types';
import { PrescriptionInbox } from '../components/pharmacy/PrescriptionInbox';
import { InventoryManager } from '../components/pharmacy/InventoryManager';
import { DemandCharts } from '../components/pharmacy/DemandCharts';

interface PharmacyDashboardPageProps {
  pharmacyProfile: PharmacyProfile;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  selectedPrescriptionId?: string | null;
}

export const PharmacyDashboardPage: React.FC<PharmacyDashboardPageProps> = ({
  pharmacyProfile,
  activeTab,
  setActiveTab,
}) => {
  const [dashboardData, setDashboardData] = useState<any | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  const fetchPharmacyData = async () => {
    try {
      const [dash, rxList] = await Promise.all([
        api.getPharmacyDashboard(pharmacyProfile.pharmacy_id),
        api.getPrescriptions({ pharmacy_id: pharmacyProfile.pharmacy_id })
      ]);
      setDashboardData(dash);
      setPrescriptions(rxList);
    } catch (err) {
      console.error("Error fetching pharmacy data:", err);
    }
  };

  useEffect(() => {
    fetchPharmacyData();
    const interval = setInterval(fetchPharmacyData, 5000);
    return () => clearInterval(interval);
  }, [pharmacyProfile.pharmacy_id]);

  const incomingCount = prescriptions.filter(p => p.status === 'sent' || p.status === 'received').length;
  const pendingDocCount = prescriptions.filter(p => p.status === 'unavailable' || p.status === 'doctor_review').length;
  const resolvedCount = prescriptions.filter(p => p.status === 'resolved').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Pharmacy Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border border-emerald-500/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white">
              {dashboardData?.pharmacy_name || pharmacyProfile.name || 'CarePlus Pharmacy'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Verified Partner
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Location: <span className="text-slate-300">{pharmacyProfile.address || 'Round North, Thrissur, Kerala'}</span> | AyuLink POS Feed: Active
          </p>
        </div>

        {/* Tab Quick Switcher */}
        <div className="flex items-center gap-2 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('inbox')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'inbox'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inbox
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'inventory'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('demand')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'demand'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Demand Intel
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Incoming Prescriptions</span>
            <Inbox className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white">{incomingCount}</div>
          <span className="text-[10px] text-emerald-400 font-medium">Digital orders to dispense</span>
        </div>

        <div className={`p-4 rounded-2xl border space-y-1 ${
          pendingDocCount > 0 ? 'bg-amber-950/20 border-amber-500/40' : 'bg-slate-900 border-slate-800'
        }`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Awaiting Physician Review</span>
            <Clock className={`w-4 h-4 ${pendingDocCount > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className={`text-2xl font-black ${pendingDocCount > 0 ? 'text-amber-300' : 'text-white'}`}>
            {pendingDocCount}
          </div>
          <span className="text-[10px] text-amber-400 font-medium">Out-of-stock escalated</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Resolved by Doctor</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-purple-300">{resolvedCount}</div>
          <span className="text-[10px] text-purple-400 font-medium">Ready for fulfillment</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Supply Gap Alerts</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">1 Signal</div>
          <span className="text-[10px] text-slate-400">ORS demand spike</span>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'inventory' ? (
        <InventoryManager pharmacyId={pharmacyProfile.pharmacy_id} />
      ) : activeTab === 'demand' ? (
        <DemandCharts />
      ) : (
        <PrescriptionInbox
          pharmacyId={pharmacyProfile.pharmacy_id}
          prescriptions={prescriptions}
          onRefresh={fetchPharmacyData}
        />
      )}
    </div>
  );
};
