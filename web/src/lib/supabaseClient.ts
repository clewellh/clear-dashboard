import { createClient } from "@supabase/supabase-js";

/**
 * CLEAR – Supabase client
 * Cloud-first, fail-fast configuration
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Hard fail if env is misconfigured
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check web/.env.local."
  );
}

// Hard fail if accidentally pointing at local Supabase
if (
  supabaseUrl.includes("localhost") ||
  supabaseUrl.includes("127.0.0.1")
) {
  throw new Error(
    `Supabase is pointing to LOCAL (${supabaseUrl}). CLEAR is running in CLOUD mode.
Update web/.env.local to use https://<project-ref>.supabase.co`
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

