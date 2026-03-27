import React, { useState, useEffect } from 'react';
import { Worker, Attendance, Payment } from '../types';
import MatrixView from './MatrixView';
import TeamView from './TeamView';
import { LayoutGrid, Users, LogOut, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import AddWorkerModal from './AddWorkerModal';
import { supabase } from '../lib/supabase';

export default function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [view, setView] = useState<'matrix' | 'team'>('matrix');
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [workersRes, attendanceRes, paymentsRes] = await Promise.all([
        supabase.from('workers').select('*').eq('user_id', user.id),
        supabase.from('attendance').select('*').eq('user_id', user.id),
        supabase.from('payments').select('*').eq('user_id', user.id),
      ]);

      if (workersRes.data) {
        setWorkers(workersRes.data.map(w => ({ id: w.id, name: w.name, dailyRate: w.daily_rate })));
      }
      if (attendanceRes.data) {
        setAttendance(attendanceRes.data.map(a => ({ id: a.id, workerId: a.worker_id, date: a.date, value: a.value })));
      }
      if (paymentsRes.data) {
        setPayments(paymentsRes.data.map(p => ({ id: p.id, workerId: p.worker_id, date: p.date, amount: p.amount })));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWorker = async (worker: Omit<Worker, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('workers')
        .insert([{ name: worker.name, daily_rate: worker.dailyRate, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setWorkers([...workers, { id: data.id, name: data.name, dailyRate: data.daily_rate }]);
        setIsAddWorkerOpen(false);
      }
    } catch (error) {
      console.error('Error adding worker:', error);
      alert('Failed to add worker');
    }
  };

  const handleUpsertAttendance = async (workerId: string, date: string, value: number | null) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const existing = attendance.find((a) => a.workerId === workerId && a.date === date);

      if (value === null) {
        if (existing) {
          const { error } = await supabase.from('attendance').delete().eq('id', existing.id);
          if (error) throw error;
          setAttendance(attendance.filter((a) => a.id !== existing.id));
        }
      } else {
        if (existing) {
          const { error } = await supabase
            .from('attendance')
            .update({ value })
            .eq('id', existing.id);
          if (error) throw error;
          setAttendance(attendance.map((a) => (a.id === existing.id ? { ...a, value } : a)));
        } else {
          const { data, error } = await supabase
            .from('attendance')
            .insert([{ worker_id: workerId, date, value, user_id: user.id }])
            .select()
            .single();
          if (error) throw error;
          if (data) {
            setAttendance([...attendance, { id: data.id, workerId: data.worker_id, date: data.date, value: data.value }]);
          }
        }
      }
    } catch (error) {
      console.error('Error upserting attendance:', error);
      alert('Failed to update attendance');
    }
  };

  const handleAddPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('payments')
        .insert([{ worker_id: payment.workerId, date: payment.date, amount: payment.amount, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setPayments([...payments, { id: data.id, workerId: data.worker_id, date: data.date, amount: data.amount }]);
      }
    } catch (error) {
      console.error('Error adding payment:', error);
      alert('Failed to add payment');
    }
  };

  const handleClearHistory = async (workerId: string) => {
    if (confirm('Are you sure you want to clear history for this worker?')) {
      try {
        const { error: attError } = await supabase.from('attendance').delete().eq('worker_id', workerId);
        if (attError) throw attError;
        
        const { error: payError } = await supabase.from('payments').delete().eq('worker_id', workerId);
        if (payError) throw payError;

        setAttendance(attendance.filter((a) => a.workerId !== workerId));
        setPayments(payments.filter((p) => p.workerId !== workerId));
      } catch (error) {
        console.error('Error clearing history:', error);
        alert('Failed to clear history');
      }
    }
  };

  const handleDeleteWorker = async (workerId: string) => {
    if (confirm('Are you sure you want to delete this worker?')) {
      try {
        const { error } = await supabase.from('workers').delete().eq('id', workerId);
        if (error) throw error;

        setWorkers(workers.filter((w) => w.id !== workerId));
        setAttendance(attendance.filter((a) => a.workerId !== workerId));
        setPayments(payments.filter((p) => p.workerId !== workerId));
      } catch (error) {
        console.error('Error deleting worker:', error);
        alert('Failed to delete worker');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold">W</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900">Workforce Manager</h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsAddWorkerOpen(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Worker
            </button>
            <button
              onClick={onLogout}
              className="text-slate-500 hover:text-slate-700 p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setView('matrix')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                view === 'matrix' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Matrix View
            </button>
            <button
              onClick={() => setView('team')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                view === 'team' ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              )}
            >
              <Users className="h-4 w-4" />
              Team View
            </button>
          </div>
        </div>

        {view === 'matrix' ? (
          <MatrixView
            workers={workers}
            attendance={attendance}
            onUpsertAttendance={handleUpsertAttendance}
          />
        ) : (
          <TeamView
            workers={workers}
            attendance={attendance}
            payments={payments}
            onAddPayment={handleAddPayment}
            onClearHistory={handleClearHistory}
            onDeleteWorker={handleDeleteWorker}
          />
        )}
      </main>

      {isAddWorkerOpen && (
        <AddWorkerModal
          onClose={() => setIsAddWorkerOpen(false)}
          onAdd={handleAddWorker}
        />
      )}
    </div>
  );
}
