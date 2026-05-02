ALTER TABLE public.service_jobs ADD COLUMN IF NOT EXISTS material_cost numeric DEFAULT 0;
ALTER TABLE public.camera_jobs ADD COLUMN IF NOT EXISTS material_cost numeric DEFAULT 0;