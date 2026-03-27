# Workforce Manager

A modern, React-based web application for managing workers, tracking daily attendance, and recording payments. Built with Vite, Tailwind CSS, and Supabase for authentication and database management.

## Application Architecture

![Application Flowchart](https://q9ki2f3og4rxackg.public.blob.vercel-storage.com/Worker%20Attendance%20Payment-2026-03-27-095246.png)

*(Note: Please save your flowchart image as `flowchart.jpg` in the root directory of this project so it displays correctly here.)*

## Features

- **Authentication**: Secure login and signup powered by Supabase Auth.
- **Dashboard**: A central hub to manage your workforce.
- **Matrix View (Attendance Grid)**: 
  - Visual grid to track attendance for the current month.
  - Click cells to toggle between Full Day (1.0), Half Day (0.5), Absent (0.0), or clear.
- **Team View (Worker Profiles)**:
  - Individual cards for each worker.
  - Automatic balance calculation: `(Total Days Worked * Daily Rate) - Total Paid`.
  - Record new payments.
  - Manage worker data (Clear history or delete worker).
- **Cloud Sync**: All data is securely stored and synced using Supabase PostgreSQL database.

## Tech Stack

- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Date Formatting**: date-fns
- **Backend & Auth**: Supabase (@supabase/supabase-js)

## Setup Instructions

### 1. Environment Variables
Ensure you have added your Supabase credentials to the AI Studio Secrets panel or your local `.env` file:
```env
VITE_SUPABASE_URL="your_supabase_project_url"
VITE_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### 2. Supabase Database Setup
Run the following SQL commands in your Supabase SQL Editor to create the required tables and security policies:

```sql
-- Create workers table
create table workers (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  daily_rate numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create attendance table
create table attendance (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  worker_id uuid references workers(id) on delete cascade not null,
  date date not null,
  value numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(worker_id, date)
);

-- Create payments table
create table payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  worker_id uuid references workers(id) on delete cascade not null,
  date date not null,
  amount numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security (RLS)
alter table workers enable row level security;
alter table attendance enable row level security;
alter table payments enable row level security;

-- Create policies to only allow users to see and edit their own data
create policy "Users can view own workers" on workers for select using (auth.uid() = user_id);
create policy "Users can insert own workers" on workers for insert with check (auth.uid() = user_id);
create policy "Users can update own workers" on workers for update using (auth.uid() = user_id);
create policy "Users can delete own workers" on workers for delete using (auth.uid() = user_id);

create policy "Users can view own attendance" on attendance for select using (auth.uid() = user_id);
create policy "Users can insert own attendance" on attendance for insert with check (auth.uid() = user_id);
create policy "Users can update own attendance" on attendance for update using (auth.uid() = user_id);
create policy "Users can delete own attendance" on attendance for delete using (auth.uid() = user_id);

create policy "Users can view own payments" on payments for select using (auth.uid() = user_id);
create policy "Users can insert own payments" on payments for insert with check (auth.uid() = user_id);
create policy "Users can update own payments" on payments for update using (auth.uid() = user_id);
create policy "Users can delete own payments" on payments for delete using (auth.uid() = user_id);
```

### 3. Running the App
If running locally outside of AI Studio:
```bash
npm install
npm run dev
```
