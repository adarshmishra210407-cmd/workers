import React, { useState } from 'react';
import { Worker, Attendance } from '../types';
import { format, eachDayOfInterval, startOfMonth, endOfMonth, isToday, isWeekend } from 'date-fns';
import { cn } from '../lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type MatrixViewProps = {
  workers: Worker[];
  attendance: Attendance[];
  onUpsertAttendance: (workerId: string, date: string, value: number | null) => void;
};

export default function MatrixView({ workers, attendance, onUpsertAttendance }: MatrixViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate),
  });

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const getAttendanceValue = (workerId: string, dateStr: string) => {
    return attendance.find((a) => a.workerId === workerId && a.date === dateStr)?.value ?? null;
  };

  const cycleAttendance = (workerId: string, dateStr: string, currentValue: number | null) => {
    let nextValue: number | null = null;
    if (currentValue === null) nextValue = 1.0;
    else if (currentValue === 1.0) nextValue = 0.5;
    else if (currentValue === 0.5) nextValue = 0.0;
    else if (currentValue === 0.0) nextValue = null;

    onUpsertAttendance(workerId, dateStr, nextValue);
  };

  const renderCellContent = (value: number | null) => {
    if (value === 1.0) return <span className="text-emerald-600 font-bold">F</span>;
    if (value === 0.5) return <span className="text-amber-500 font-bold">H</span>;
    if (value === 0.0) return <span className="text-rose-500 font-bold">A</span>;
    return <span className="text-slate-300">-</span>;
  };

  const getCellClass = (value: number | null) => {
    if (value === 1.0) return 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200';
    if (value === 0.5) return 'bg-amber-50 hover:bg-amber-100 border-amber-200';
    if (value === 0.0) return 'bg-rose-50 hover:bg-rose-100 border-rose-200';
    return 'hover:bg-slate-50 border-slate-200';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-900">Attendance Grid</h2>
        <div className="flex items-center gap-4">
          <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-200 rounded-md transition-colors">
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </button>
          <span className="text-sm font-medium text-slate-900 w-32 text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button onClick={handleNextMonth} className="p-1 hover:bg-slate-200 rounded-md transition-colors">
            <ChevronRight className="h-5 w-5 text-slate-600" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 bg-slate-50 border-b border-r border-slate-200 p-3 text-left font-semibold text-slate-700 min-w-[200px]">
                Worker
              </th>
              {daysInMonth.map((day) => (
                <th
                  key={day.toISOString()}
                  className={cn(
                    "border-b border-slate-200 p-2 text-center font-medium min-w-[40px]",
                    isWeekend(day) ? "bg-slate-100 text-slate-500" : "bg-slate-50 text-slate-700",
                    isToday(day) && "bg-indigo-50 text-indigo-700"
                  )}
                >
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] uppercase tracking-wider">{format(day, 'EEE')}</span>
                    <span>{format(day, 'd')}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {workers.length === 0 ? (
              <tr>
                <td colSpan={daysInMonth.length + 1} className="p-8 text-center text-slate-500">
                  No workers found. Add a worker to get started.
                </td>
              </tr>
            ) : (
              workers.map((worker) => (
                <tr key={worker.id} className="group">
                  <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50 border-b border-r border-slate-200 p-3 font-medium text-slate-900">
                    {worker.name}
                  </td>
                  {daysInMonth.map((day) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const value = getAttendanceValue(worker.id, dateStr);
                    return (
                      <td
                        key={dateStr}
                        onClick={() => cycleAttendance(worker.id, dateStr, value)}
                        className={cn(
                          "border-b border-slate-200 p-0 cursor-pointer transition-colors",
                          getCellClass(value)
                        )}
                      >
                        <div className="h-10 w-full flex items-center justify-center select-none">
                          {renderCellContent(value)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex gap-6 text-sm text-slate-600">
        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-emerald-100 border border-emerald-200 flex items-center justify-center text-[10px] font-bold text-emerald-600">F</span> Full Day (1.0)</div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-amber-100 border border-amber-200 flex items-center justify-center text-[10px] font-bold text-amber-500">H</span> Half Day (0.5)</div>
        <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-rose-100 border border-rose-200 flex items-center justify-center text-[10px] font-bold text-rose-500">A</span> Absent (0.0)</div>
      </div>
    </div>
  );
}
