
ALTER TABLE public.service_jobs ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'nakit';
ALTER TABLE public.service_jobs ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1;
ALTER TABLE public.camera_jobs ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'nakit';
ALTER TABLE public.camera_jobs ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1;
ALTER TABLE public.product_sales ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'nakit';
ALTER TABLE public.product_sales ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'nakit';
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS installments INTEGER DEFAULT 1;
