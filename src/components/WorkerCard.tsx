import React, { useState, useRef, useEffect } from 'react';
import { Worker, Attendance, Payment } from '../types';
import { MoreVertical, Wallet, Trash2, History, DollarSign } from 'lucide-react';
import { cn } from '../lib/utils';

type WorkerCardProps = {
  worker: Worker;
  attendance: Attendance[];
  payments: Payment[];
  onAddPayment: () => void;
  onClearHistory: () => void;
  onDelete: () => void;
};

const WorkerCard: React.FC<WorkerCardProps> = ({
  worker,
  attendance,
  payments,
  onAddPayment,
  onClearHistory,
  onDelete,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalEarned = attendance.reduce((sum, a) => sum + a.value * worker.dailyRate, 0);
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  const balance = totalEarned - totalPaid;

  const fullDays = attendance.filter(a => a.value === 1.0).length;
  const halfDays = attendance.filter(a => a.value === 0.5).length;
  const absentDays = attendance.filter(a => a.value === 0.0).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-5 border-b border-slate-100 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{worker.name}</h3>
          <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {worker.dailyRate.toFixed(2)} / day
          </p>
        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-slate-200 py-1 z-20">
              <button
                onClick={() => { setIsMenuOpen(false); onClearHistory(); }}
                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
              >
                <History className="h-4 w-4 text-slate-400" />
                Clear History
              </button>
              <button
                onClick={() => { setIsMenuOpen(false); onDelete(); }}
                className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Worker
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Earned</p>
            <p className="text-lg font-semibold text-slate-900">${totalEarned.toFixed(2)}</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Total Paid</p>
            <p className="text-lg font-semibold text-slate-900">${totalPaid.toFixed(2)}</p>
          </div>
        </div>

        <div className={cn(
          "p-4 rounded-lg border flex items-center justify-between",
          balance > 0 ? "bg-amber-50 border-amber-200" : "bg-emerald-50 border-emerald-200"
        )}>
          <div>
            <p className={cn(
              "text-xs font-medium uppercase tracking-wider mb-1",
              balance > 0 ? "text-amber-700" : "text-emerald-700"
            )}>
              Current Balance
            </p>
            <p className={cn(
              "text-2xl font-bold",
              balance > 0 ? "text-amber-900" : "text-emerald-900"
            )}>
              ${Math.abs(balance).toFixed(2)}
              <span className="text-sm font-medium ml-1">
                {balance > 0 ? 'Due' : balance < 0 ? 'Overpaid' : 'Settled'}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500 justify-center mt-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {fullDays} Full</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> {halfDays} Half</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> {absentDays} Absent</span>
        </div>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <button
          onClick={onAddPayment}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
        >
          <Wallet className="h-4 w-4 text-slate-500" />
          Add Payment
        </button>
      </div>
    </div>
  );
};

export default WorkerCard;
