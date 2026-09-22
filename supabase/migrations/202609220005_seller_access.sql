alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  add constraint profiles_role_check check (role in ('admin', 'seller'));

create or replace function public.is_staff() returns boolean language sql stable security definer set search_path=public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('admin', 'seller'))
$$;

drop policy if exists "admins manage vehicles" on public.vehicles;
create policy "staff manage vehicles" on public.vehicles for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "admins manage images" on public.vehicle_images;
create policy "staff manage images" on public.vehicle_images for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "admins read leads" on public.leads;
create policy "staff read leads" on public.leads for select using (public.is_staff());

drop policy if exists "admins manage settings" on public.site_settings;
create policy "staff manage settings" on public.site_settings for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "admins manage vehicle storage" on storage.objects;
create policy "staff manage vehicle storage" on storage.objects for all using (bucket_id = 'vehicle-images' and public.is_staff()) with check (bucket_id = 'vehicle-images' and public.is_staff());
