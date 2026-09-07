import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True once real Supabase project credentials have been supplied via
 * `.env` (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY). Until then the donor
 * portal and admin panel render in a "not configured yet" state instead of
 * crashing, so the rest of the site keeps working during setup.
 */
export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL as string, SUPABASE_ANON_KEY as string)
  : null;
