import { createClient } from '@supabase/supabase-js';

export const SUPABASE_PROJECT_ID = 'wzjfoimorynzpupjcaah';
export const SUPABASE_DEFAULT_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_DEFAULT_KEY = 'sb_publishable_6mobKsrcOR_V6IVQTeNP-Q_ICwj5sYU';

const supabaseUrl =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_URL) ||
  SUPABASE_DEFAULT_URL;
const supabaseAnonKey =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  SUPABASE_DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'pxc_customer_session_v2',
    flowType: 'pkce',
    persistSession: true,
    autoRefreshToken: true,
  },
});

// An admin session must not overwrite the customer session. Database policies
// enforce privileges on every request; browser state only controls the UI.
export const adminSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'pxc_admin_session_v2',
    storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

export default supabase;
