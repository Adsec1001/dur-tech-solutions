import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { REFRESH_GRACE_MS } from "@/lib/adminSessionPolicy";

try {
  const host = new URL(import.meta.env.VITE_SUPABASE_URL).hostname.split(".")[0];
  window.localStorage.removeItem(`sb-${host}-auth-token`);
} catch { /* ignore */ }

export const STAMP_KEY = "admin-last-seen";

// Tab-only storage (cleared when the browser closes); a refresh within the grace window keeps the session.
const graceStorage = {
  getItem(key: string) {
    try {
      const seen = Number(sessionStorage.getItem(STAMP_KEY) || 0);
      if (!seen || Date.now() - seen > REFRESH_GRACE_MS) { sessionStorage.removeItem(key); return null; }
      return sessionStorage.getItem(key);
    } catch { return null; }
  },
  setItem(key: string, value: string) {
    try { sessionStorage.setItem(key, value); sessionStorage.setItem(STAMP_KEY, String(Date.now())); } catch { /* ignore */ }
  },
  removeItem(key: string) {
    try { sessionStorage.removeItem(key); sessionStorage.removeItem(STAMP_KEY); } catch { /* ignore */ }
  },
};

export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  { auth: { storage: graceStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
);
