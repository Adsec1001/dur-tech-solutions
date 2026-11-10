import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminAccess({ children }: { children: React.ReactNode }) {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("durbilisimguvenlik@gmail.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  useEffect(() => {
    let active = true;
    let revision = 0;
    const check = async () => {
      const current = ++revision;
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = user ? await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }) : { data: false, error: null };
      if (active && current === revision) { setAllowed(data === true && !error); setChecking(false); }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      setAllowed(false);
      setChecking(true);
      setTimeout(() => { if (active) void check(); }, 0);
    });
    void check();
    return () => { active = false; subscription.unsubscribe(); };
  }, []);
  const submit = async (mode: "login" | "signup" | "reset") => {
    if (busy) return;
    setBusy(true); setMessage("");
    try {
      if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        setMessage(error ? "E-posta gönderilemedi. Lütfen tekrar deneyin." : "Şifre yenileme bağlantısı e-posta adresinize gönderildi.");
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: window.location.origin } });
        setMessage(error ? "Hesap oluşturulamadı. Adresi ve şifrenizi kontrol edin." : "Hesabınızı etkinleştirmek için e-postanızdaki doğrulama bağlantısına tıklayın, ardından giriş yapın.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        setMessage(error ? "Giriş başarısız. E-posta, şifre ve e-posta doğrulamasını kontrol edin." : "Yönetici yetkisi kontrol ediliyor.");
      }
    } catch { setMessage("İşlem tamamlanamadı. Lütfen tekrar deneyin."); }
    finally { setBusy(false); }
  };
  if (checking) return <div className="min-h-screen bg-background grid place-items-center text-muted-foreground">Giriş kontrol ediliyor…</div>;
  if (allowed) return <>{children}</>;
  return <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <Card className="w-full max-w-sm border-primary/30">
      <CardHeader><CardTitle className="text-primary">Yönetici Girişi</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-3" onSubmit={e => { e.preventDefault(); void submit("login"); }}>
          <Input aria-label="E-posta" type="email" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} required maxLength={254} />
          <Input aria-label="Şifre" type="password" autoComplete="current-password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)} required minLength={12} maxLength={128} />
          <Button className="w-full" disabled={busy}>Giriş Yap</Button>
        </form>
        <Button variant="outline" className="w-full" disabled={busy || password.length < 12} onClick={() => void submit("signup")}>İlk Kez Hesap Oluştur</Button>
        <Button variant="ghost" className="w-full" disabled={busy} onClick={() => void submit("reset")}>Şifremi Unuttum</Button>
        {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
      </CardContent>
    </Card>
  </div>;
}