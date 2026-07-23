ALTER TABLE public.service_jobs ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;
ALTER TABLE public.camera_jobs ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ;