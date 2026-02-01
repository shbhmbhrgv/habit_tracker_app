-- Enable Row Level Security (RLS) is on by default, we just need policies.

-- 1. Create HABITS table
create table habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  name text not null,
  type text not null, -- 'good' or 'bad'
  value int, -- points for good
  cost int, -- points for bad
  icon text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table habits enable row level security;
create policy "Users can CRUD their own habits" on habits for all using (auth.uid() = user_id);

-- 2. Create ACTIVITIES table (History)
create table activities (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  habit_id uuid references habits(id) on delete set null,
  name text not null, -- snapshot name in case habit changes
  change int not null, -- + or - points
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table activities enable row level security;
create policy "Users can CRUD their own activities" on activities for all using (auth.uid() = user_id);

-- 3. Create RESOURCES table (Learning)
create table resources (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  category text not null, -- 'book', 'paper', 'project'
  total int default 100,
  current int default 0,
  status text default 'active',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table resources enable row level security;
create policy "Users can CRUD their own resources" on resources for all using (auth.uid() = user_id);

-- 4. Create GOALS table
create table goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  month int not null,
  year int not null,
  target_points int not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table goals enable row level security;
create policy "Users can CRUD their own goals" on goals for all using (auth.uid() = user_id);

-- 5. Create POINTS_BALANCE table (Optional optimization, or we can just sum activities. Let's create a table for persistence simplicity)
create table balance (
  user_id uuid references auth.users primary key,
  points int default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table balance enable row level security;
create policy "Users can CRUD their own balance" on balance for all using (auth.uid() = user_id);
