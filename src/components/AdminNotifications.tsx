import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Cctv, CalendarClock, Wrench, X, Banknote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { getJobs } from "@/lib/jobStorage";

interface Notification {
  id: string;
  type: "postponed_service" | "postponed_camera" | "maintenance_due" | "unpaid_service" | "unpaid_camera" | "payment_due_service" | "payment_due_camera";
  category: "service" | "camera";
  title: string;
  description: string;
  icon: "wrench" | "cctv" | "calendar" | "banknote";
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const checkNotifications = useCallback(async () => {
    const notifs: Notification[] = [];
    const now = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(now.getDate() + 3);

    // 1. Service jobs
    const serviceJobs = await getJobs();
    serviceJobs.filter(j => j.status === "postponed").forEach(j => {
      notifs.push({
        id: `svc-postponed-${j.id}`,
        type: "postponed_service",
        category: "service",
        title: `Ertelenen Servis: ${j.customerName} ${j.customerSurname}`,
        description: `Teknik servis işi yarına ertelenmiş durumda.`,
        icon: "wrench",
      });
    });

    serviceJobs.filter(j => j.fee > 0 && j.paidAmount < j.fee).forEach(j => {
      const remaining = j.fee - j.paidAmount;
      notifs.push({
        id: `svc-unpaid-${j.id}`,
        type: "unpaid_service",
        category: "service",
        title: `Ödeme Bekliyor: ${j.customerName} ${j.customerSurname}`,
        description: j.paidAmount > 0
          ? `Kısmi ödeme: ${j.paidAmount}₺ alındı, kalan ${remaining}₺`
          : `Toplam ${j.fee}₺ ödenmedi.`,
        icon: "banknote",
      });
    });

    // Service payment date approaching
    serviceJobs.filter(j => j.promisedPaymentDate && j.paidAmount < j.fee).forEach(j => {
      const payDate = new Date(j.promisedPaymentDate!);
      if (payDate <= threeDaysLater) {
        const isOverdue = payDate < now;
        notifs.push({
          id: `svc-paydate-${j.id}`,
          type: "payment_due_service",
          category: "service",
          title: isOverdue
            ? `⚠️ Ödeme Gecikti: ${j.customerName} ${j.customerSurname}`
            : `Ödeme Yaklaşıyor: ${j.customerName} ${j.customerSurname}`,
          description: `Söz verilen tarih: ${payDate.toLocaleDateString("tr-TR")} — Kalan: ${(j.fee - j.paidAmount)}₺`,
          icon: "calendar",
        });
      }
    });

    // 2. Camera jobs
    const { data: cameraJobs } = await (supabase as any).from("camera_jobs").select("*");
    if (cameraJobs) {
      cameraJobs.filter((j: any) => j.status === "ertelendi").forEach((j: any) => {
        notifs.push({
          id: `cam-postponed-${j.id}`,
          type: "postponed_camera",
          category: "camera",
          title: `Ertelenen Kamera İşi: ${j.customer_name}`,
          description: `Kamera işi yarına ertelenmiş durumda.`,
          icon: "cctv",
        });
      });

      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      cameraJobs.filter((j: any) => j.status === "tamamlandi" && j.completed_at && new Date(j.completed_at) <= sixMonthsAgo).forEach((j: any) => {
        notifs.push({
          id: `cam-maintenance-${j.id}`,
          type: "maintenance_due",
          category: "camera",
          title: `Bakım Zamanı: ${j.customer_name}`,
          description: `Tamamlanan işin üzerinden 6 ay geçti. Bakım hatırlatması.`,
          icon: "calendar",
        });
      });

      cameraJobs.filter((j: any) => j.fee > 0 && (j.paid_amount || 0) < j.fee).forEach((j: any) => {
        const remaining = j.fee - (j.paid_amount || 0);
        notifs.push({
          id: `cam-unpaid-${j.id}`,
          type: "unpaid_camera",
          category: "camera",
          title: `Ödeme Bekliyor: ${j.customer_name}`,
          description: (j.paid_amount || 0) > 0
            ? `Kısmi ödeme: ${j.paid_amount}₺ alındı, kalan ${remaining}₺`
            : `Toplam ${j.fee}₺ ödenmedi.`,
          icon: "banknote",
        });
      });

      // Camera payment date approaching
      cameraJobs.filter((j: any) => j.promised_payment_date && (j.paid_amount || 0) < (j.fee || 0)).forEach((j: any) => {
        const payDate = new Date(j.promised_payment_date);
        if (payDate <= threeDaysLater) {
          const isOverdue = payDate < now;
          notifs.push({
            id: `cam-paydate-${j.id}`,
            type: "payment_due_camera",
            category: "camera",
            title: isOverdue
              ? `⚠️ Ödeme Gecikti: ${j.customer_name}`
              : `Ödeme Yaklaşıyor: ${j.customer_name}`,
            description: `Söz verilen tarih: ${payDate.toLocaleDateString("tr-TR")} — Kalan: ${(j.fee || 0) - (j.paid_amount || 0)}₺`,
            icon: "calendar",
          });
        }
      });
    }

    setNotifications(notifs);
    if (notifs.length > 0) setOpen(true);
  }, []);

  useEffect(() => {
    checkNotifications();
  }, [checkNotifications]);

  const activeNotifs = notifications.filter(n => !dismissed.includes(n.id));
  const serviceNotifs = activeNotifs.filter(n => n.category === "service");
  const cameraNotifs = activeNotifs.filter(n => n.category === "camera");
  const count = activeNotifs.length;

  const IconMap = { wrench: Wrench, cctv: Cctv, calendar: CalendarClock, banknote: Banknote };

  const colorMap: Record<Notification["type"], string> = {
    postponed_service: "text-orange-400",
    postponed_camera: "text-orange-400",
    maintenance_due: "text-yellow-400",
    unpaid_service: "text-red-400",
    unpaid_camera: "text-red-400",
    payment_due_service: "text-blue-400",
    payment_due_camera: "text-blue-400",
  };

  const renderNotifList = (notifs: Notification[]) => (
    notifs.map(n => {
      const Icon = IconMap[n.icon];
      return (
        <div key={n.id} className="flex items-start gap-2 p-2 rounded-lg border border-border/50 bg-card/50">
          <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${colorMap[n.type]}`} />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">{n.title}</p>
            <p className="text-[11px] text-muted-foreground">{n.description}</p>
          </div>
          <Button size="sm" variant="ghost" className="h-5 w-5 p-0 shrink-0" onClick={() => setDismissed([...dismissed, n.id])}>
            <X className="h-3 w-3 text-muted-foreground" />
          </Button>
        </div>
      );
    })
  );

  return (
    <div className="relative">
      <Button
        size="sm"
        variant="outline"
        className="relative gap-1"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-4 w-4" />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center animate-pulse">
            {count}
          </span>
        )}
      </Button>

      {open && (
        <Card className="absolute right-0 top-10 w-80 md:w-96 z-50 border-primary/30 shadow-xl animate-fade-in max-h-[70vh] overflow-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" /> Bildirimler ({count})
              </span>
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => setOpen(false)}>
                <X className="h-3 w-3" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pb-3">
            {count === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Bildirim yok ✓</p>
            ) : (
              <>
                {serviceNotifs.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Wrench className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-foreground">Teknik Servis ({serviceNotifs.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {renderNotifList(serviceNotifs)}
                    </div>
                  </div>
                )}
                {cameraNotifs.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Cctv className="h-3.5 w-3.5 text-primary" />
                      <span className="text-xs font-semibold text-foreground">Kamera İşleri ({cameraNotifs.length})</span>
                    </div>
                    <div className="space-y-1.5">
                      {renderNotifList(cameraNotifs)}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminNotifications;
