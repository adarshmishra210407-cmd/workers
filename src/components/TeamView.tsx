import React, { useState } from 'react';
import { Worker, Attendance, Payment } from '../types';
import WorkerCard from './WorkerCard';
import AddPaymentModal from './AddPaymentModal';

type TeamViewProps = {
  workers: Worker[];
  attendance: Attendance[];
  payments: Payment[];
  onAddPayment: (payment: Omit<Payment, 'id'>) => void;
  onClearHistory: (workerId: string) => void;
  onDeleteWorker: (workerId: string) => void;
};

export default function TeamView({
  workers,
  attendance,
  payments,
  onAddPayment,
  onClearHistory,
  onDeleteWorker,
}: TeamViewProps) {
  const [selectedWorkerForPayment, setSelectedWorkerForPayment] = useState<Worker | null>(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workers.map((worker) => (
          <WorkerCard
            key={worker.id}
            worker={worker}
            attendance={attendance.filter((a) => a.workerId === worker.id)}
            payments={payments.filter((p) => p.workerId === worker.id)}
            onAddPayment={() => setSelectedWorkerForPayment(worker)}
            onClearHistory={() => onClearHistory(worker.id)}
            onDelete={() => onDeleteWorker(worker.id)}
          />
        ))}
        {workers.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-slate-200 border-dashed">
            <p className="text-slate-500">No workers in your team yet.</p>
          </div>
        )}
      </div>

      {selectedWorkerForPayment && (
        <AddPaymentModal
          worker={selectedWorkerForPayment}
          onClose={() => setSelectedWorkerForPayment(null)}
          onAdd={(payment) => {
            onAddPayment(payment);
            setSelectedWorkerForPayment(null);
          }}
        />
      )}
    </div>
  );
}
