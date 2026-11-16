-- Roles
create type public.app_role as enum ('admin');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "Users read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- First account to sign up becomes the store owner (admin)
create or replace function public.assign_first_owner()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin');
  end if;
  return new;
end;
$$;
create trigger on_auth_user_created_assign_owner
  after insert on auth.users for each row execute function public.assign_first_owner();

create or replace function public.update_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

-- Departments
create table public.departments (
  id text primary key,
  label text not null,
  enabled boolean not null default false,
  sort_order int not null default 0
);
grant select on public.departments to anon, authenticated;
grant update on public.departments to authenticated;
grant all on public.departments to service_role;
alter table public.departments enable row level security;
create policy "Anyone can view departments" on public.departments for select to anon, authenticated using (true);
create policy "Admins update departments" on public.departments for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

insert into public.departments (id, label, enabled, sort_order) values
  ('women', 'Women', true, 1),
  ('accessories', 'Accessories', true, 2),
  ('men', 'Men', false, 3),
  ('kids', 'Kids', false, 4);

-- Products
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  department text not null references public.departments(id),
  fabric text not null default '',
  origin text not null default 'South Africa',
  price numeric(10,2) not null default 0,
  tag text not null default '',
  image_url text,
  is_new_arrival boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;
create policy "Public sees active products" on public.products for select to anon, authenticated using (is_active);
create policy "Admins see all products" on public.products for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins add products" on public.products for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins edit products" on public.products for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete products" on public.products for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger products_updated_at before update on public.products for each row execute function public.update_updated_at();

insert into public.products (name, department, fabric, origin, price, tag, image_url, is_new_arrival, created_at) values
  ('Indigo Shweshwe Wrap Dress', 'women', 'Shweshwe', 'South Africa', 899, 'Bestseller', '/products/p-shweshwe-wrap.jpg', false, now() - interval '11 minutes'),
  ('Sunburst Ankara Two-Piece', 'women', 'Ankara', 'South Africa', 1099, 'New arrival', '/products/p-ankara-two-piece.jpg', true, now() - interval '10 minutes'),
  ('Turquoise Ankara Kaftan', 'women', 'Ankara', 'South Africa', 949, 'Relaxed fit', '/products/p-ankara-kaftan.jpg', false, now() - interval '9 minutes'),
  ('Ember Ankara Midi Skirt', 'women', 'Ankara', 'South Africa', 649, 'Everyday', '/products/p-ankara-skirt.jpg', false, now() - interval '8 minutes'),
  ('Kente Off-Shoulder Dress', 'women', 'Kente', 'Ghana', 1299, 'Statement piece', '/products/p-kente-dress.jpg', true, now() - interval '7 minutes'),
  ('Bogolan Mudcloth Shirt Dress', 'women', 'Mudcloth', 'Mali', 999, 'Handpicked', '/products/p-mudcloth-dress.jpg', false, now() - interval '6 minutes'),
  ('Sculpted Ankara Doek', 'accessories', 'Ankara', 'South Africa', 249, 'Popular', '/products/p-ankara-doek.jpg', false, now() - interval '5 minutes'),
  ('Sunflower Ankara Tote', 'accessories', 'Ankara', 'South Africa', 549, 'Everyday', '/products/p-ankara-tote.jpg', false, now() - interval '4 minutes'),
  ('Ndebele Beaded Collar', 'accessories', 'Ndebele beadwork', 'South Africa', 699, 'Handmade', '/products/p-ndebele-necklace.jpg', true, now() - interval '3 minutes'),
  ('Ankara Teardrop Earrings', 'accessories', 'Ankara', 'South Africa', 189, 'Gift idea', '/products/p-ankara-earrings.jpg', false, now() - interval '2 minutes'),
  ('Kitenge Evening Clutch', 'accessories', 'Kitenge', 'Kenya', 429, 'New arrival', '/products/p-kitenge-clutch.jpg', true, now() - interval '1 minute');

-- Orders (customers order now, pay later once a payment system is added)
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number serial unique,
  customer_name text not null,
  phone text not null,
  email text,
  address text not null,
  notes text,
  items jsonb not null default '[]'::jsonb,
  total numeric(10,2) not null default 0,
  status text not null default 'awaiting_payment'
    check (status in ('awaiting_payment','paid','processing','shipped','delivered','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
grant usage on sequence public.orders_order_number_seq to service_role;
alter table public.orders enable row level security;
create policy "Admins see orders" on public.orders for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "Admins update orders" on public.orders for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins delete orders" on public.orders for delete to authenticated using (public.has_role(auth.uid(), 'admin'));
create trigger orders_updated_at before update on public.orders for each row execute function public.update_updated_at();

-- Staff directory
create table public.staff (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  role_title text not null default '',
  phone text,
  email text,
  notes text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select, insert, update, delete on public.staff to authenticated;
grant all on public.staff to service_role;
alter table public.staff enable row level security;
create policy "Admins manage staff" on public.staff for all to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

-- Product photos bucket policies (bucket created separately)
create policy "Admins upload product photos" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-photos' and public.has_role(auth.uid(), 'admin'));
create policy "Admins update product photos" on storage.objects for update to authenticated
  using (bucket_id = 'product-photos' and public.has_role(auth.uid(), 'admin'));
create policy "Admins delete product photos" on storage.objects for delete to authenticated
  using (bucket_id = 'product-photos' and public.has_role(auth.uid(), 'admin'));
