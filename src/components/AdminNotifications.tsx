import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Cctv, CalendarClock, Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ServiceJob } from "@/types/serviceJob";
import { getJobs } from "@/lib/jobStorage";

interface Notification {
  id: string;
  type: "postponed_service" | "postponed_camera" | "maintenance_due";
  title: string;
  description: string;
  icon: "wrench" | "cctv" | "calendar";
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const checkNotifications = useCallback(async () => {
    const notifs: Notification[] = [];

    // 1. Check postponed service jobs
    const serviceJobs = await getJobs();
    const postponedServices = serviceJobs.filter(j => j.status === "postponed");
    postponedServices.forEach(j => {
      notifs.push({
        id: `svc-postponed-${j.id}`,
        type: "postponed_service",
        title: `Ertelenen Servis: ${j.customerName} ${j.customerSurname}`,
        description: `Teknik servis işi yarına ertelenmiş durumda.`,
        icon: "wrench",
      });
    });

    // 2. Check postponed camera jobs
    const { data: cameraJobs } = await (supabase as any)
      .from("camera_jobs")
      .select("*");
    
    if (cameraJobs) {
      const postponedCameras = cameraJobs.filter((j: any) => j.status === "ertelendi");
      postponedCameras.forEach((j: any) => {
        notifs.push({
          id: `cam-postponed-${j.id}`,
          type: "postponed_camera",
          title: `Ertelenen Kamera İşi: ${j.customer_name}`,
          description: `Kamera işi yarına ertelenmiş durumda.`,
          icon: "cctv",
        });
      });

      // 3. Check 6-month maintenance due
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      const maintenanceDue = cameraJobs.filter((j: any) => 
        j.status === "tamamlandi" && 
        j.completed_at && 
        new Date(j.completed_at) <= sixMonthsAgo
      );
      maintenanceDue.forEach((j: any) => {
        notifs.push({
          id: `cam-maintenance-${j.id}`,
          type: "maintenance_due",
          title: `Bakım Zamanı: ${j.customer_name}`,
          description: `Tamamlanan işin üzerinden 6 ay geçti. Bakım hatırlatması.`,
          icon: "calendar",
        });
      });
    }

    setNotifications(notifs);
    if (notifs.length > 0) setOpen(true);
  }, []);

  useEffect(() => {
    checkNotifications();
  }, [checkNotifications]);

  const activeNotifs = notifications.filter(n => !dismissed.includes(n.id));
  const count = activeNotifs.length;

  const IconMap = { wrench: Wrench, cctv: Cctv, calendar: CalendarClock };

  const colorMap: Record<Notification["type"], string> = {
    postponed_service: "text-orange-400",
    postponed_camera: "text-orange-400",
    maintenance_due: "text-yellow-400",
  };

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
          <CardContent className="space-y-2 pb-3">
            {count === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Bildirim yok ✓</p>
            ) : (
              activeNotifs.map(n => {
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
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminNotifications;
