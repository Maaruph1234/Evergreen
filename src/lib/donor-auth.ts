import { supabase, isSupabaseConfigured } from './supabase';

export interface AllocationEntry {
  id: string;
  title: string;
  category: string;
  amount: number | null;
  currency: string;
  program: string | null;
  entry_date: string;
  description: string | null;
}

export interface DonorProfile {
  id: string;
  email: string;
  full_name: string;
  is_admin: boolean;
}

export { isSupabaseConfigured };

export async function signUpDonor(email: string, password: string, fullName: string) {
  if (!supabase) throw new Error('Donor portal is not configured yet.');
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });
  if (error) throw error;
  return data;
}

export async function signInDonor(email: string, password: string) {
  if (!supabase) throw new Error('Donor portal is not configured yet.');
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOutDonor() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(cb: (session: import('@supabase/supabase-js').Session | null) => void) {
  if (!supabase) return { unsubscribe() {} };
  const { data } = supabase.auth.onAuthStateChange((_event, session) => cb(session));
  return data.subscription;
}

export async function fetchMyProfile(userId: string): Promise<DonorProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_admin')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as DonorProfile;
}

export async function fetchMyAllocations(userId: string): Promise<AllocationEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('donor_allocations')
    .select('id, title, category, amount, currency, program, entry_date, description')
    .eq('donor_id', userId)
    .order('entry_date', { ascending: false });
  if (error) throw error;
  return (data ?? []) as AllocationEntry[];
}

export interface AllocationWithDonor extends AllocationEntry {
  profiles: { email: string; full_name: string } | null;
}

export async function fetchAllProfiles(): Promise<DonorProfile[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, is_admin')
    .order('email', { ascending: true });
  if (error) throw error;
  return (data ?? []) as DonorProfile[];
}

export async function fetchAllAllocations(): Promise<AllocationWithDonor[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('donor_allocations')
    .select('id, title, category, amount, currency, program, entry_date, description, donor_id, profiles(email, full_name)')
    .order('created_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as unknown as AllocationWithDonor[];
}

export interface NewAllocation {
  donor_id: string;
  title: string;
  category: string;
  amount: number | null;
  currency: string;
  program: string;
  entry_date: string;
  description: string;
}

export async function insertAllocation(entry: NewAllocation): Promise<void> {
  if (!supabase) throw new Error('Not configured.');
  const { error } = await supabase.from('donor_allocations').insert(entry);
  if (error) throw error;
}

export async function deleteAllocation(id: string): Promise<void> {
  if (!supabase) throw new Error('Not configured.');
  const { error } = await supabase.from('donor_allocations').delete().eq('id', id);
  if (error) throw error;
}

export interface NewApplication {
  program: string;
  full_name: string;
  email: string;
  phone: string;
  age: number | null;
  location: string;
  experience: string;
  motivation: string;
}

/** Anyone can submit an application — no login required (see RLS policy). */
export async function submitApplication(entry: NewApplication): Promise<void> {
  if (!supabase) throw new Error('Applications are not accepting submissions yet.');
  const { error } = await supabase.from('applications').insert(entry);
  if (error) throw error;
}

export interface ApplicationRecord extends NewApplication {
  id: string;
  status: string;
  created_at: string;
}

export async function fetchAllApplications(): Promise<ApplicationRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('applications')
    .select('id, program, full_name, email, phone, age, location, experience, motivation, status, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as ApplicationRecord[];
}

export async function deleteApplication(id: string): Promise<void> {
  if (!supabase) throw new Error('Not configured.');
  const { error } = await supabase.from('applications').delete().eq('id', id);
  if (error) throw error;
}

export async function updateApplicationStatus(id: string, status: string): Promise<void> {
  if (!supabase) throw new Error('Not configured.');
  const { error } = await supabase.from('applications').update({ status }).eq('id', id);
  if (error) throw error;
}
