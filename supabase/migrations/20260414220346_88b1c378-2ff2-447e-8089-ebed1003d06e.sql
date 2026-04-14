
CREATE TABLE public.product_sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  sale_price numeric NOT NULL DEFAULT 0,
  sale_date timestamp with time zone NOT NULL DEFAULT now(),
  notes text DEFAULT '',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.product_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to product_sales"
ON public.product_sales
FOR ALL
TO public
USING (true)
WITH CHECK (true);
