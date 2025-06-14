
-- Create a table to store all admin settings (single row, upserted as needed)
create table if not exists public.store_settings (
  id uuid primary key default gen_random_uuid(),
  store_name text,
  store_description text,
  store_email text,
  store_phone text,
  currency text,
  tax_rate numeric,
  free_shipping_threshold numeric,
  standard_shipping_rate numeric,
  express_shipping_rate numeric,
  -- Optionally store system settings as JSON
  system_settings jsonb,
  updated_at timestamp with time zone not null default now()
);

-- Seed a single row (optional, for initialization)
insert into public.store_settings
  (store_name, store_description, store_email, store_phone, currency, tax_rate, free_shipping_threshold, standard_shipping_rate, express_shipping_rate, system_settings)
values
  ('LuxuriqWear', 'Premium luxury fashion for the discerning customer', 'admin@luxuriqwear.com', '+1 (555) 123-4567', 'USD', 8.5, 100, 9.99, 19.99, '{"email_notifications": {"order": true, "low_stock": true, "daily_reports": false}, "security": {"2fa": true, "login_notifications": true}}')
on conflict do nothing;

-- Allow anyone to read settings
alter table public.store_settings enable row level security;

create policy "Allow select for all" on public.store_settings for select using (true);

-- Only admin/manager can update settings
create policy "Allow admin/manager update" 
on public.store_settings 
for update 
to authenticated 
using (
  (select role from public.profiles where id = auth.uid()) in ('admin','manager')
);

create policy "Allow admin/manager insert"
on public.store_settings
for insert
to authenticated
with check (
  (select role from public.profiles where id = auth.uid()) in ('admin','manager')
);
