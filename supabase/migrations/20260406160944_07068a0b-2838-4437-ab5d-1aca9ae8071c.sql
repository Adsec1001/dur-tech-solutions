CREATE TABLE public.expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  category text DEFAULT 'genel',
  notes text DEFAULT '',
  expense_date timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to expenses" ON public.expenses
  FOR ALL TO public
  USING (true)
  WITH CHECK (true);