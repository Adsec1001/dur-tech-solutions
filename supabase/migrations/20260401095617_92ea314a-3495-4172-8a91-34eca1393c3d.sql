CREATE TABLE public.camera_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  address TEXT,
  job_type TEXT NOT NULL DEFAULT 'sifir_kurulum',
  camera_count INTEGER NOT NULL DEFAULT 0,
  dvr_model TEXT,
  notes TEXT,
  checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'bekliyor',
  fee NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.camera_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to camera_jobs" ON public.camera_jobs FOR ALL USING (true) WITH CHECK (true);