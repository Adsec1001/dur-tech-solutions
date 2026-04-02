ALTER TABLE public.camera_jobs ADD COLUMN postponed_to timestamptz DEFAULT NULL;
ALTER TABLE public.service_jobs ADD COLUMN rustdesk_id text DEFAULT NULL;