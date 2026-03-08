
-- Create service_jobs table
CREATE TABLE public.service_jobs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tracking_code TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_surname TEXT NOT NULL,
  customer_phone TEXT DEFAULT '',
  service_type TEXT NOT NULL DEFAULT 'device',
  device_name TEXT DEFAULT '',
  accessories JSONB DEFAULT '[]'::jsonb,
  fee NUMERIC DEFAULT 0,
  notes TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending',
  steps JSONB DEFAULT '[]'::jsonb,
  completion_notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  postponed_to TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.service_jobs ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read (for tracking lookup)
CREATE POLICY "Anyone can read service jobs by tracking code"
  ON public.service_jobs FOR SELECT
  USING (true);

-- Allow anyone to insert (admin panel uses PIN, not auth)
CREATE POLICY "Anyone can insert service jobs"
  ON public.service_jobs FOR INSERT
  WITH CHECK (true);

-- Allow anyone to update
CREATE POLICY "Anyone can update service jobs"
  ON public.service_jobs FOR UPDATE
  USING (true);

-- Allow anyone to delete
CREATE POLICY "Anyone can delete service jobs"
  ON public.service_jobs FOR DELETE
  USING (true);

-- Index for tracking code lookups
CREATE INDEX idx_service_jobs_tracking_code ON public.service_jobs (tracking_code);
CREATE INDEX idx_service_jobs_status ON public.service_jobs (status);
