alter table public.vehicle_images
  add column if not exists object_position text not null default '50% 50%';
