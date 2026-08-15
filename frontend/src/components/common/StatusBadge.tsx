import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Sparkles } from 'lucide-react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', showIcon = true }) => {
  const normalized = status.toLowerCase();

  switch (normalized) {
    case 'available':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className}`}>
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5" />}
          Available
        </span>
      );

    case 'unavailable':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 ${className}`}>
          {showIcon && <XCircle className="w-3.5 h-3.5" />}
          Unavailable
        </span>
      );

    case 'uncertain':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className}`}>
          {showIcon && <AlertTriangle className="w-3.5 h-3.5" />}
          Availability Uncertain
        </span>
      );

    case 'received':
    case 'sent':
    case 'pending':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30 ${className}`}>
          {showIcon && <Clock className="w-3.5 h-3.5" />}
          {normalized === 'received' ? 'Received at Pharmacy' : 'Sent'}
        </span>
      );

    case 'doctor_review':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse ${className}`}>
          {showIcon && <AlertTriangle className="w-3.5 h-3.5" />}
          Doctor Review Required
        </span>
      );

    case 'resolved':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/30 ${className}`}>
          {showIcon && <Sparkles className="w-3.5 h-3.5" />}
          Physician Resolved
        </span>
      );

    case 'completed':
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/15 text-teal-400 border border-teal-500/30 ${className}`}>
          {showIcon && <CheckCircle2 className="w-3.5 h-3.5" />}
          Dispensed & Completed
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 ${className}`}>
          {status}
        </span>
      );
  }
};
