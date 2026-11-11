import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

type Mode = "login" | "forgot";

const AdminLogin = ({ signedInEmail, onSignOut }: { signedInEmail?: string | null; onSignOut?: () => void }) => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();

  if (signedInEmail) {
    return (
      <Wrap title="Yetkisiz hesap">
        <p className="text-sm text-muted-foreground text-center">{signedInEmail} hesabının admin yetkisi yok.</p>
        <Button variant="outline" className="w-full" onClick={onSignOut}>Çıkış yap</Button>
      </Wrap>
    );
  }

  const submit = async () => {
    if (!email.trim() || (mode !== "forgot" && password.length < 8)) {
      toast({ title: "E-posta ve en az 8 karakterli şifre girin", variant: "destructive" }); return;
    }
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        const { data: allowed, error: accessError } = await supabase.rpc("start_admin_session");
        if (accessError || allowed !== true) {
          await supabase.auth.signOut();
          throw new Error("Access denied");
        }
        setPassword("");
        window.dispatchEvent(new Event("admin:session-started"));
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
        if (error) throw error;
        toast({ title: "Şifre sıfırlama bağlantısı gönderildi" });
        setMode("login");
      }
    } catch (e: any) {
      const msg = /Invalid login/i.test(e?.message) ? "E-posta veya şifre hatalı" : /already registered/i.test(e?.message) ? "Bu hesap zaten var, Giriş yap" : /not confirmed/i.test(e?.message) ? "E-posta henüz onaylanmadı" : /restricted/i.test(e?.message) ? "Bu e-posta ile kayıt yapılamaz" : "İşlem başarısız";
      toast({ title: msg, variant: "destructive" });
    } finally { setBusy(false); }
  };

  return (
    <Wrap title={mode === "login" ? "Admin Giriş" : "Şifremi Unuttum"}>
      <Input type="email" placeholder="E-posta" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
      {mode !== "forgot" && (
        <Input type="password" placeholder="Şifre" value={password} onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()} autoComplete={mode === "login" ? "current-password" : "new-password"} />
      )}
      <Button onClick={submit} disabled={busy} className="w-full">
        {mode === "login" ? "Giriş" : "Bağlantı gönder"}
      </Button>
      <div className="flex justify-between text-xs">
        {mode !== "login" ? <Button variant="link" onClick={() => setMode("login")}>Girişe dön</Button>
          : <span />}
        {mode === "login" && <Button variant="link" onClick={() => setMode("forgot")}>Şifremi unuttum</Button>}
      </div>
    </Wrap>
  );
};

const Wrap = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="min-h-screen bg-background flex items-center justify-center p-4">
    <Card className="w-full max-w-sm border-primary/30">
      <CardHeader className="text-center">
        <Lock className="h-6 w-6 text-primary mx-auto" />
        <CardTitle className="text-primary text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  </div>
);

export default AdminLogin;
