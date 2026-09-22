alter table public.vehicles
  add column if not exists internal_notes text;

drop policy if exists "public reads published vehicles" on public.vehicles;
create policy "public reads available vehicles" on public.vehicles for select using (status = 'available');

drop policy if exists "public reads vehicle images" on public.vehicle_images;
create policy "public reads available vehicle images" on public.vehicle_images for select using (
  exists(select 1 from public.vehicles v where v.id = vehicle_id and v.status = 'available')
);
