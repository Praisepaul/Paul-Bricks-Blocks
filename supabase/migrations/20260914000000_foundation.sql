create type public.app_role as enum ('owner', 'partner');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.app_role not null default 'partner',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  occurred_at timestamptz not null default now(),
  before_data jsonb,
  after_data jsonb,
  metadata jsonb
);

create index audit_events_actor_user_id_idx on public.audit_events(actor_user_id);
create index audit_events_entity_idx on public.audit_events(entity_type, entity_id);
create index audit_events_occurred_at_idx on public.audit_events(occurred_at desc);

alter table public.profiles enable row level security;
alter table public.audit_events enable row level security;
