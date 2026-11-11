import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Discard tokens retained by the previous persistent client, without reading them.
try {
  const host = new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split(".")[0];
  window.localStorage.removeItem(`sb-${host}-auth-token`);
} catch { /* Storage can be unavailable in private browsing. */ }

// No tokens on disk: refresh, new tabs and browser reopening require sign-in.
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: true } },
);