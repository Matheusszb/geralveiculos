alter table public.profiles add column if not exists full_name text;
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'seller'));

create or replace function public.is_staff() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('admin', 'seller'))
$$;

create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete restrict,
  seller_id uuid not null references public.profiles(id) on delete restrict,
  advertised_price numeric not null check (advertised_price >= 0),
  sale_price numeric not null check (sale_price >= 0),
  sale_date date not null default current_date,
  customer_name text,
  notes text,
  status text not null default 'completed' check (status in ('completed', 'cancelled')),
  created_by uuid references public.profiles(id) on delete set null,
  cancelled_at timestamptz,
  cancelled_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists sales_one_completed_sale_per_vehicle on public.sales(vehicle_id) where status = 'completed';

drop trigger if exists sales_updated_at on public.sales;
create trigger sales_updated_at before update on public.sales for each row execute procedure public.touch_updated_at();

alter table public.sales enable row level security;
drop policy if exists "staff read own sales" on public.sales;
create policy "staff read own sales" on public.sales for select using (public.is_admin() or seller_id = auth.uid());

drop policy if exists "staff manage vehicles" on public.vehicles;
drop policy if exists "staff read vehicles" on public.vehicles;
drop policy if exists "admins manage vehicles" on public.vehicles;
create policy "staff read vehicles" on public.vehicles for select using (public.is_staff());
create policy "admins manage vehicles" on public.vehicles for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "staff manage images" on public.vehicle_images;
drop policy if exists "staff read images" on public.vehicle_images;
drop policy if exists "admins manage images" on public.vehicle_images;
create policy "staff read images" on public.vehicle_images for select using (public.is_staff());
create policy "admins manage images" on public.vehicle_images for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "staff read leads" on public.leads;
drop policy if exists "admins read leads" on public.leads;
create policy "admins read leads" on public.leads for select using (public.is_admin());

drop policy if exists "staff manage settings" on public.site_settings;
drop policy if exists "admins manage settings" on public.site_settings;
create policy "admins manage settings" on public.site_settings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "staff manage vehicle storage" on storage.objects;
drop policy if exists "admins manage vehicle storage" on storage.objects;
create policy "admins manage vehicle storage" on storage.objects for all using (bucket_id = 'vehicle-images' and public.is_admin()) with check (bucket_id = 'vehicle-images' and public.is_admin());

drop policy if exists "admins read all profiles" on public.profiles;
create policy "admins read all profiles" on public.profiles for select using (public.is_admin());

create or replace function public.record_sale(
  p_vehicle_id uuid,
  p_seller_id uuid,
  p_sale_price numeric,
  p_sale_date date default current_date,
  p_customer_name text default null,
  p_notes text default null
) returns uuid language plpgsql security definer set search_path=public as $$
declare
  v_vehicle public.vehicles%rowtype;
  v_sale_id uuid;
  v_actor_role text;
begin
  select role into v_actor_role from public.profiles where id = auth.uid();
  if v_actor_role not in ('admin', 'seller') then raise exception 'Usuário não autorizado'; end if;
  if v_actor_role = 'seller' and p_seller_id <> auth.uid() then raise exception 'Vendedor não pode registrar venda para outra conta'; end if;
  if not exists(select 1 from public.profiles where id = p_seller_id and role = 'seller') then raise exception 'Vendedor inválido'; end if;
  if p_sale_price is null or p_sale_price < 0 then raise exception 'Valor da venda inválido'; end if;
  select * into v_vehicle from public.vehicles where id = p_vehicle_id for update;
  if not found then raise exception 'Veículo não encontrado'; end if;
  if v_vehicle.status <> 'available' then raise exception 'Este veículo não está disponível para venda'; end if;
  insert into public.sales(vehicle_id, seller_id, advertised_price, sale_price, sale_date, customer_name, notes, created_by)
  values(p_vehicle_id, p_seller_id, v_vehicle.price, p_sale_price, coalesce(p_sale_date, current_date), nullif(trim(p_customer_name), ''), nullif(trim(p_notes), ''), auth.uid())
  returning id into v_sale_id;
  update public.vehicles set status = 'sold', show_when_sold = false where id = p_vehicle_id;
  return v_sale_id;
end;
$$;

create or replace function public.cancel_sale(p_sale_id uuid) returns void language plpgsql security definer set search_path=public as $$
declare v_sale public.sales%rowtype;
begin
  if not public.is_admin() then raise exception 'Somente administrador pode cancelar vendas'; end if;
  select * into v_sale from public.sales where id = p_sale_id for update;
  if not found then raise exception 'Venda não encontrada'; end if;
  if v_sale.status <> 'completed' then raise exception 'Esta venda já está cancelada'; end if;
  update public.sales set status = 'cancelled', cancelled_at = now(), cancelled_by = auth.uid() where id = p_sale_id;
  update public.vehicles set status = 'available' where id = v_sale.vehicle_id;
end;
$$;

revoke all on function public.record_sale(uuid, uuid, numeric, date, text, text) from public;
grant execute on function public.record_sale(uuid, uuid, numeric, date, text, text) to authenticated;
revoke all on function public.cancel_sale(uuid) from public;
grant execute on function public.cancel_sale(uuid) to authenticated;
