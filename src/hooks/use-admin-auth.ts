import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { sessionExpired } from "@/lib/adminSessionPolicy";

/** Admin status comes only from the server-side user_roles table. */
export const useAdminAuth = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const times = useRef({ started: Date.now(), activity: Date.now(), touched: 0 });

  const signOut = useCallback(async () => {
    setIsAdmin(false);
    setEmail(null);
    try { await supabase.rpc("end_admin_session"); }
    finally { await supabase.auth.signOut({ scope: "local" }); }
  }, []);

  const check = useCallback(async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) { setIsAdmin(false); setEmail(null); setLoading(false); return; }
    const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    setIsAdmin(data === true);
    setEmail(data === true ? user.email ?? null : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange(() => { setTimeout(check, 0); });
    const started = () => {
      times.current = { started: Date.now(), activity: Date.now(), touched: 0 };
      void check();
    };
    window.addEventListener("admin:session-started", started);
    check();
    return () => { sub.subscription.unsubscribe(); window.removeEventListener("admin:session-started", started); };
  }, [check]);

  useEffect(() => {
    if (!isAdmin) return;
    const activity = async () => {
      const now = Date.now();
      if (sessionExpired(times.current.started, times.current.activity, now)) { void signOut(); return; }
      times.current.activity = now;
      if (now - times.current.touched < 30000) return;
      times.current.touched = now;
      const { data, error } = await supabase.rpc("touch_admin_session");
      if (error || data !== true) void signOut();
    };
    const interval = window.setInterval(() => {
      if (sessionExpired(times.current.started, times.current.activity, Date.now())) void signOut();
    }, 1000);
    const events = ["pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, activity, { passive: true }));
    const leave = () => { setIsAdmin(false); void signOut(); };
    window.addEventListener("pagehide", leave);
    return () => {
      clearInterval(interval);
      events.forEach(event => window.removeEventListener(event, activity));
      window.removeEventListener("pagehide", leave);
    };
  }, [isAdmin, signOut]);
  return { loading, isAdmin, email, signOut };
};
