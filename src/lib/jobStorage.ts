import { supabase } from "@/integrations/supabase/client";
import { ServiceJob } from "@/types/serviceJob";

// Convert DB row to ServiceJob
const rowToJob = (row: any): ServiceJob => ({
  id: row.id,
  trackingCode: row.tracking_code,
  customerName: row.customer_name,
  customerSurname: row.customer_surname,
  customerPhone: row.customer_phone || "",
  serviceType: row.service_type,
  deviceName: row.device_name || "",
  accessories: row.accessories || [],
  fee: Number(row.fee) || 0,
  notes: row.notes || "",
  status: row.status,
  steps: row.steps || [],
  completionNotes: row.completion_notes || "",
  createdAt: row.created_at,
  postponedTo: row.postponed_to || undefined,
  completedAt: row.completed_at || undefined,
  rustdeskId: row.rustdesk_id || undefined,
  paidAmount: Number(row.paid_amount) || 0,
  promisedPaymentDate: row.promised_payment_date || undefined,
});

// Convert ServiceJob to DB row
const jobToRow = (job: ServiceJob) => ({
  id: job.id,
  tracking_code: job.trackingCode,
  customer_name: job.customerName,
  customer_surname: job.customerSurname,
  customer_phone: job.customerPhone,
  service_type: job.serviceType,
  device_name: job.deviceName,
  accessories: JSON.parse(JSON.stringify(job.accessories)),
  fee: job.fee,
  notes: job.notes,
  status: job.status,
  steps: JSON.parse(JSON.stringify(job.steps)),
  completion_notes: job.completionNotes,
  created_at: job.createdAt,
  postponed_to: job.postponedTo || null,
  completed_at: job.completedAt || null,
  rustdesk_id: job.rustdeskId || null,
  paid_amount: job.paidAmount || 0,
  promised_payment_date: job.promisedPaymentDate || null,
});

export const getJobs = async (): Promise<ServiceJob[]> => {
  const { data, error } = await supabase
    .from("service_jobs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getJobs error:", error);
    return [];
  }
  return (data || []).map(rowToJob);
};

export const addJob = async (job: ServiceJob): Promise<void> => {
  const { error } = await supabase.from("service_jobs").insert(jobToRow(job));
  if (error) console.error("addJob error:", error);
};

export const updateJob = async (job: ServiceJob): Promise<void> => {
  const row = jobToRow(job);
  const { id, ...rest } = row;
  const { error } = await supabase.from("service_jobs").update(rest).eq("id", id);
  if (error) console.error("updateJob error:", error);
};

export const deleteJob = async (id: string): Promise<void> => {
  const { error } = await supabase.from("service_jobs").delete().eq("id", id);
  if (error) console.error("deleteJob error:", error);
};

export const findByTrackingCode = async (code: string): Promise<ServiceJob | undefined> => {
  const { data, error } = await supabase
    .from("service_jobs")
    .select("*")
    .ilike("tracking_code", code)
    .maybeSingle();
  if (error) {
    console.error("findByTrackingCode error:", error);
    return undefined;
  }
  return data ? rowToJob(data) : undefined;
};

export const saveJobs = async (jobs: ServiceJob[]): Promise<void> => {
  // Update each job individually
  for (const job of jobs) {
    await updateJob(job);
  }
};

export const generateTrackingCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "DB-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

// Format phone: 05XXXXXXXXX -> (05XX) XXX XX XX
export const formatPhone = (phone: string): string => {
  if (!phone || phone.length !== 11) return phone;
  return `(${phone.slice(0, 4)}) ${phone.slice(4, 7)} ${phone.slice(7, 9)} ${phone.slice(9, 11)}`;
};
