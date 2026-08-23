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

/** Same as onAuthChange, but also passes the event name — used to catch
 * the PASSWORD_RECOVERY event fired after a donor follows a reset link. */
export function onAuthEvent(cb: (event: string, session: import('@supabase/supabase-js').Session | null) => void) {
  if (!supabase) return { unsubscribe() {} };
  const { data } = supabase.auth.onAuthStateChange((event, session) => cb(event, session));
  return data.subscription;
}

export async function sendPasswordReset(email: string): Promise<void> {
  if (!supabase) throw new Error('Donor portal is not configured yet.');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/index.html#donor-portal`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string): Promise<void> {
  if (!supabase) throw new Error('Donor portal is not configured yet.');
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
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

/** Anyone can submit an application — no login required (see RLS policy).
 * Returns the access code the applicant uses to check their status later. */
export async function submitApplication(entry: NewApplication): Promise<string> {
  if (!supabase) throw new Error('Applications are not accepting submissions yet.');
  const { data, error } = await supabase.from('applications').insert(entry).select('access_code').single();
  if (error) throw error;
  return (data as { access_code: string }).access_code;
}

export interface ApplicationRecord extends NewApplication {
  id: string;
  status: string;
  access_code: string;
  stage: string;
  score: number | null;
  beneficiary_notes: string | null;
  created_at: string;
}

export async function fetchAllApplications(): Promise<ApplicationRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('applications')
    .select('id, program, full_name, email, phone, age, location, experience, motivation, status, access_code, stage, score, beneficiary_notes, created_at')
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

export interface BeneficiaryUpdate {
  stage: string;
  score: number | null;
  beneficiary_notes: string;
}

export async function updateApplicationBeneficiary(id: string, entry: BeneficiaryUpdate): Promise<void> {
  if (!supabase) throw new Error('Not configured.');
  const { error } = await supabase.from('applications').update(entry).eq('id', id);
  if (error) throw error;
}

export interface BeneficiaryRecord {
  program: string;
  full_name: string;
  stage: string;
  score: number | null;
  beneficiary_notes: string | null;
  created_at: string;
}

/** Looks up one applicant's status by their access code, via the
 * security-definer RPC in schema.sql — never reads the full table. */
export async function fetchBeneficiaryByCode(code: string): Promise<BeneficiaryRecord | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc('get_beneficiary_by_code', { p_code: code });
  if (error) throw error;
  const rows = data as BeneficiaryRecord[] | null;
  return rows && rows.length > 0 ? rows[0] : null;
}

export interface NewPledge {
  full_name: string;
  email: string;
  amount: number;
  note?: string;
}

export interface PledgeRecord {
  id: string;
  full_name: string;
  email: string;
  amount: number;
  currency: string;
  status: string;
  note: string | null;
  created_at: string;
}

/** Recorded automatically when someone submits the bank-transfer donate
 * form — lets it show up as "pending" before staff confirm the transfer. */
export async function submitDonationPledge(entry: NewPledge): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase.from('donation_pledges').insert(entry);
  if (error) throw error;
}

/** Pledges belonging to the signed-in donor (matched by account email via RLS). */
export async function fetchMyPledges(): Promise<PledgeRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('donation_pledges')
    .select('id, full_name, email, amount, currency, status, note, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as PledgeRecord[];
}

export async function fetchAllPledges(): Promise<PledgeRecord[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('donation_pledges')
    .select('id, full_name, email, amount, currency, status, note, created_at')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as PledgeRecord[];
}

export async function updatePledgeStatus(id: string, status: string): Promise<void> {
  if (!supabase) throw new Error('Not configured.');
  const { error } = await supabase.from('donation_pledges').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function deletePledge(id: string): Promise<void> {
  if (!supabase) throw new Error('Not configured.');
  const { error } = await supabase.from('donation_pledges').delete().eq('id', id);
  if (error) throw error;
}
