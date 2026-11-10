import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPassword() {
  const [recovery, setRecovery] = useState(window.location.hash.includes("type=recovery"));
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => { if (event === "PASSWORD_RECOVERY") setRecovery(true); });
    return () => subscription.unsubscribe();
  }, []);
  return <main className="min-h-screen bg-background grid place-items-center p-4"><form className="w-full max-w-sm space-y-4" onSubmit={async e => {
    e.preventDefault();
    if (!recovery || password !== confirm || password.length < 12) { setMessage("Geçerli bağlantı ve eşleşen en az 12 karakterli şifre gerekli."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setMessage(error ? "Şifre yenilenemedi. Yeni bir bağlantı isteyin." : "Şifreniz yenilendi.");
    if (!error) { setRecovery(false); await supabase.auth.signOut(); }
    setBusy(false);
  }}><h1 className="text-xl font-bold text-primary">Şifre Yenile</h1>
    <Input aria-label="Yeni şifre" type="password" placeholder="Yeni şifre" minLength={12} required value={password} onChange={e => setPassword(e.target.value)} />
    <Input aria-label="Yeni şifre tekrar" type="password" placeholder="Yeni şifre tekrar" required value={confirm} onChange={e => setConfirm(e.target.value)} />
    <Button disabled={!recovery || busy}>Şifreyi Kaydet</Button>
    {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
    <Link className="block text-primary" to="/admin">Yönetici Girişine Dön</Link>
  </form></main>;
}