ALTER TABLE public.camera_jobs ADD COLUMN IF NOT EXISTS tracking_code TEXT;

UPDATE public.camera_jobs
SET tracking_code = 'DB-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))
WHERE tracking_code IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS camera_jobs_tracking_code_key ON public.camera_jobs (tracking_code);