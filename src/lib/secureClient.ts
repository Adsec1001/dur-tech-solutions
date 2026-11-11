import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// No tokens on disk: refresh, new tabs and browser reopening require sign-in.
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: true, detectSessionInUrl: true } },
);