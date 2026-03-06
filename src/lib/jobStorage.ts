import { ServiceJob } from "@/types/serviceJob";

const STORAGE_KEY = "db_service_jobs";

export const getJobs = (): ServiceJob[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveJobs = (jobs: ServiceJob[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
};

export const addJob = (job: ServiceJob) => {
  const jobs = getJobs();
  jobs.unshift(job);
  saveJobs(jobs);
};

export const updateJob = (updated: ServiceJob) => {
  const jobs = getJobs().map((j) => (j.id === updated.id ? updated : j));
  saveJobs(jobs);
};

export const deleteJob = (id: string) => {
  saveJobs(getJobs().filter((j) => j.id !== id));
};

export const findByTrackingCode = (code: string): ServiceJob | undefined => {
  return getJobs().find((j) => j.trackingCode.toUpperCase() === code.toUpperCase());
};

export const generateTrackingCode = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "DB-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};
