CREATE TABLE public.computer_sales (
  id uuid primary key default gen_random_uuid(),
  brand text not null default '',
  model text not null default '',
  serial_number text default '',
  cpu text default '',
  gpu text default '',
  ram_gb text default '',
  storage text default '',
  os text default '',
  condition text not null default 'yeni',
  purchase_date timestamptz not null default now(),
  purchase_price numeric not null default 0,
  supplier text default '',
  warranty_months integer default 24,
  accessories text default '',
  notes text default '',
  status text not null default 'stokta',
  sale_price numeric,
  sale_date timestamptz,
  buyer_name text default '',
  buyer_phone text default '',
  buyer_address text default '',
  payment_method text default 'nakit',
  installments integer default 1,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.computer_sales TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.computer_sales TO anon;
GRANT ALL ON public.computer_sales TO service_role;
ALTER TABLE public.computer_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access to computer_sales" ON public.computer_sales FOR ALL USING (true) WITH CHECK (true);
CREATE TRIGGER update_computer_sales_updated_at BEFORE UPDATE ON public.computer_sales FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();