import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const { toast } = useToast();
  const nav = useNavigate();
  const submit = async () => {
    if (pw.length < 8) { toast({ title: "En az 8 karakter", variant: "destructive" }); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast({ title: "Şifre güncellenemedi", description: "Bağlantının süresi dolmuş olabilir.", variant: "destructive" }); return; }
    toast({ title: "Şifre güncellendi" });
    nav("/admin");
  };
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm border-primary/30">
        <CardHeader className="text-center"><CardTitle className="text-primary text-xl">Yeni Şifre</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input type="password" placeholder="Yeni şifre" value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" />
          <Button onClick={submit} disabled={busy} className="w-full">Kaydet</Button>
        </CardContent>
      </Card>
    </div>
  );
};
export default ResetPassword;
