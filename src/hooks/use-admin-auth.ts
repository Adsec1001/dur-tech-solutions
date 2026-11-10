import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/** Admin status comes only from the server-side user_roles table. */
export const useAdminAuth = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);

  const check = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsAdmin(false); setEmail(null); setLoading(false); return; }
    setEmail(user.email ?? null);
    const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    setIsAdmin(data === true);
    setLoading(false);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => { setTimeout(check, 0); });
    check();
    return () => sub.subscription.unsubscribe();
  }, [check]);

  const signOut = async () => { await supabase.auth.signOut(); setIsAdmin(false); };
  return { loading, isAdmin, email, signOut };
};
