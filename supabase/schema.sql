-- Evergreen Lifecare — Donor Portal database schema
-- Run this once in your Supabase project's SQL Editor (Project → SQL Editor → New query → paste → Run).

-- 1. Profiles: one row per registered donor, auto-created on signup.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text default '',
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Donors can read their own profile; admins can read every profile
-- (needed so the admin panel can list donors to attach entries to).
create policy "profiles: read own or admin"
  on public.profiles for select
  using (
    auth.uid() = id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- 2. Donor allocations: each row = one "here's how part of your donation
--    was used" entry, entered by an admin, visible only to that donor.
create table if not exists public.donor_allocations (
  id uuid primary key default gen_random_uuid(),
  donor_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  category text not null default 'General',
  amount numeric,
  currency text not null default 'NGN',
  program text default '',
  entry_date date not null default current_date,
  description text default '',
  created_at timestamptz not null default now()
);

alter table public.donor_allocations enable row level security;

create policy "allocations: donor reads own, admin reads all"
  on public.donor_allocations for select
  using (
    auth.uid() = donor_id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "allocations: admin inserts"
  on public.donor_allocations for insert
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "allocations: admin updates"
  on public.donor_allocations for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "allocations: admin deletes"
  on public.donor_allocations for delete
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

-- 3. Auto-create a profile row whenever someone signs up through the donor portal.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Program applications (e.g. KYDEEI Cohort). Anyone can submit an
--    application without an account; only admins can read them.
create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  program text not null default 'KYDEEI Cohort',
  full_name text not null,
  email text not null,
  phone text not null,
  age int,
  location text,
  experience text,
  motivation text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

alter table public.applications enable row level security;

-- Anyone (including anonymous visitors) can submit an application.
create policy "applications: anyone can apply"
  on public.applications for insert
  with check (true);

-- Only admins can view, update (e.g. change status), or delete applications.
create policy "applications: admin reads"
  on public.applications for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "applications: admin updates"
  on public.applications for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );

create policy "applications: admin deletes"
  on public.applications for delete
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.is_admin)
  );
