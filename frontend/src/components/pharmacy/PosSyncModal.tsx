import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, X, Database } from 'lucide-react';
import { api } from '../../services/api';
import type { PosSyncResponse } from '../../types';

interface PosSyncModalProps {
  pharmacyId: string;
  onClose: () => void;
  onSynced: () => void;
}

export const PosSyncModal: React.FC<PosSyncModalProps> = ({ pharmacyId, onClose, onSynced }) => {
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<PosSyncResponse | null>(null);

  const handleRunSync = async () => {
    try {
      setSyncing(true);
      const res = await api.syncInventory(pharmacyId);
      setSyncResult(res);
      onSynced();
    } catch (err) {
      console.error("POS Sync failed:", err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Pharmacy POS / ERP Integration Sync
              </h3>
              <p className="text-xs text-slate-400">
                Automated Inventory Feed Synchronization Simulation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          In production environments, AyuLink synchronizes directly with pharmacy Point-of-Sale (POS) and Enterprise Resource Planning (ERP) database connectors.
        </p>

        {syncResult ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-3">
            <div className="flex items-center gap-2 font-bold text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Sync Cycle Completed ({syncResult.last_synchronization})
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Processed</span>
                <span className="font-bold text-white text-sm">{syncResult.medicines_processed}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Available</span>
                <span className="font-bold text-emerald-400 text-sm">{syncResult.updated}</span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Out of Stock</span>
                <span className="font-bold text-rose-400 text-sm">{syncResult.unavailable}</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-300">{syncResult.message}</p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-2 text-xs">
            <span className="font-semibold text-slate-200">Sync Status:</span>
            <div className="flex items-center justify-between text-slate-400">
              <span>Last Automated Check:</span>
              <span className="text-slate-200 font-mono">10:42 AM</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Connector Protocol:</span>
              <span className="text-teal-300">FastAPI Realtime Polling Fallback</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleRunSync}
            disabled={syncing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Executing Cycle...' : 'Run Inventory Sync Cycle'}
          </button>
        </div>
      </div>
    </div>
  );
};
