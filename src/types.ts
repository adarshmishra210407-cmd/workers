export type Worker = {
  id: string;
  name: string;
  dailyRate: number;
};

export type Attendance = {
  id: string;
  workerId: string;
  date: string; // YYYY-MM-DD
  value: number; // 1.0, 0.5, 0.0
};

export type Payment = {
  id: string;
  workerId: string;
  date: string;
  amount: number;
};
