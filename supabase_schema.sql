-- Profils utilisateurs (extension de auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'agent' check (role in ('agent', 'admin')),
  created_at timestamptz default now()
);
alter table public.profiles enable row level security;
create policy "Chaque utilisateur voit tous les profils" on public.profiles for select using (auth.role() = 'authenticated');
create policy "Chaque utilisateur gère son profil" on public.profiles for all using (auth.uid() = id);

-- Création automatique du profil à l'inscription
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Véhicules
create table public.vehicles (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text,
  immatriculation text,
  created_at timestamptz default now()
);
alter table public.vehicles enable row level security;
create policy "Tous les agents voient les véhicules" on public.vehicles for select using (auth.role() = 'authenticated');
create policy "Admins gèrent les véhicules" on public.vehicles for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- Contrôles hebdomadaires
create table public.controls (
  id uuid default gen_random_uuid() primary key,
  vehicle_id uuid references public.vehicles on delete cascade not null,
  agent_id uuid references public.profiles on delete set null,
  has_ko boolean default false,
  sections jsonb,
  created_at timestamptz default now()
);
alter table public.controls enable row level security;
create policy "Tous les agents voient les contrôles" on public.controls for select using (auth.role() = 'authenticated');
create policy "Les agents créent des contrôles" on public.controls for insert with check (auth.uid() = agent_id);

-- Données de démo : véhicules
insert into public.vehicles (name, type, immatriculation) values
  ('VSAV 1', 'Véhicule de Secours et d''Assistance aux Victimes', 'AA-001-AA'),
  ('FPT', 'Fourgon Pompe Tonne', 'BB-002-BB'),
  ('VTU', 'Véhicule Tout Usage', 'CC-003-CC'),
  ('VLHR', 'Véhicule Léger Hors Route', 'DD-004-DD');
