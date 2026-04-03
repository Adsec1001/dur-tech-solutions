export type ServiceType = "remote" | "freelance" | "device";

export type JobStatus = "pending" | "in_progress" | "completed" | "postponed";

export interface JobStep {
  id: string;
  description: string;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Accessory {
  id: string;
  name: string;
}

export interface ServiceJob {
  id: string;
  trackingCode: string;
  customerName: string;
  customerSurname: string;
  customerPhone: string;
  serviceType: ServiceType;
  deviceName: string;
  accessories: Accessory[];
  fee: number;
  notes: string;
  status: JobStatus;
  steps: JobStep[];
  completionNotes: string;
  createdAt: string;
  postponedTo?: string;
  completedAt?: string;
  rustdeskId?: string;
  paidAmount: number;
}
