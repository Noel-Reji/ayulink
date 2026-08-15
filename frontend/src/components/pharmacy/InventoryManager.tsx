import React, { useState, useEffect } from 'react';
import { 
  Boxes, 
  Search, 
  RefreshCw, 
  Filter
} from 'lucide-react';
import { api } from '../../services/api';
import type { InternalInventoryItem, AvailabilityStatus } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PosSyncModal } from './PosSyncModal';

interface InventoryManagerProps {
  pharmacyId: string;
}

export const InventoryManager: React.FC<InventoryManagerProps> = ({ pharmacyId }) => {
  const [items, setItems] = useState<InternalInventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const data = await api.getPharmacyInventory(pharmacyId);
      setItems(data);
    } catch (err) {
      console.error("Error fetching pharmacy inventory:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [pharmacyId]);

  const handleUpdateStatus = async (itemId: string, newStatus: AvailabilityStatus) => {
    try {
      setUpdatingId(itemId);
      await api.updateInventoryStatus(itemId, newStatus);
      setItems(prev =>
        prev.map(item =>
          item.id === itemId
            ? { ...item, availability_status: newStatus, last_updated: new Date().toISOString() }
            : item
        )
      );
    } catch (err) {
      console.error("Error updating inventory status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesQuery = 
      item.medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.medicine.generic_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || item.availability_status === filterStatus;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Header with Search and POS Sync trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-800/40 p-4 rounded-2xl border border-slate-700/80">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-400" />
            Live Pharmacy Stock & Availability Feeds
          </h3>
          <p className="text-xs text-slate-400">
            Real-time availability broadcasted to participating doctors and patients across Thrissur.
          </p>
        </div>

        <button
          onClick={() => setShowSyncModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          Simulate POS / ERP Sync
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search brand or generic medicine..."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses ({items.length})</option>
            <option value="available">Available Only</option>
            <option value="unavailable">Unavailable Only</option>
            <option value="uncertain">Uncertain Only</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3.5">Medicine Concept</th>
                <th className="px-4 py-3.5">Strength / Form</th>
                <th className="px-4 py-3.5">Internal Stock</th>
                <th className="px-4 py-3.5">Availability Status</th>
                <th className="px-4 py-3.5">Last Sync</th>
                <th className="px-5 py-3.5 text-right">Quick Toggle Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Loading inventory records...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    No medications match your filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-white">
                      <div className="font-bold text-slate-100">{item.medicine.name}</div>
                      <div className="text-[11px] text-slate-400">{item.medicine.generic_name}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] border border-slate-700">
                        {item.medicine.strength} • {item.medicine.dosage_form}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-200">
                      <span className="font-semibold text-emerald-400">{item.internal_stock_quantity} units</span>
                      <span className="block text-[10px] text-slate-500 font-sans">Internal only (Masked on public API)</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={item.availability_status} />
                    </td>
                    <td className="px-4 py-3.5 text-[11px] text-slate-400">
                      {new Date(item.last_updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="inline-flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'available')}
                          disabled={updatingId === item.id || item.availability_status === 'available'}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                            item.availability_status === 'available'
                              ? 'bg-emerald-500 text-slate-950 shadow-sm'
                              : 'text-slate-400 hover:text-emerald-300'
                          }`}
                          title="Mark Available"
                        >
                          Available
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(item.id, 'unavailable')}
                          disabled={updatingId === item.id || item.availability_status === 'unavailable'}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                            item.availability_status === 'unavailable'
                              ? 'bg-rose-500 text-white shadow-sm'
                              : 'text-slate-400 hover:text-rose-300'
                          }`}
                          title="Mark Unavailable"
                        >
                          Out of Stock
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(item.id, 'uncertain')}
                          disabled={updatingId === item.id || item.availability_status === 'uncertain'}
                          className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                            item.availability_status === 'uncertain'
                              ? 'bg-amber-500 text-slate-950 shadow-sm'
                              : 'text-slate-400 hover:text-amber-300'
                          }`}
                          title="Mark Uncertain"
                        >
                          Uncertain
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* POS Sync Modal */}
      {showSyncModal && (
        <PosSyncModal
          pharmacyId={pharmacyId}
          onClose={() => setShowSyncModal(false)}
          onSynced={fetchInventory}
        />
      )}
    </div>
  );
};
