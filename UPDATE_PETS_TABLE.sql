-- Add license columns to pets table
alter table public.pets 
add column if not exists license_number text,
add column if not exists license_date date;
