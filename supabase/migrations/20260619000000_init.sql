-- Course Viewer 2 — initial schema
-- Run via: npx supabase db push

-- ── Courses ────────────────────────────────────────────────────────────────
create table if not exists public.courses (
  id                text primary key,          -- e.g. "CO0001"
  title             text not null,
  description       text,
  kind              text not null default 'course', -- 'course' | 'pack'
  certificate_enabled boolean not null default false,
  categories        text[] not null default '{}',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- ── Screens ────────────────────────────────────────────────────────────────
create table if not exists public.screens (
  id              uuid primary key default gen_random_uuid(),
  course_id       text not null references public.courses(id) on delete cascade,
  position        integer not null,            -- display order within the course
  title           text not null,
  type            text not null,               -- image|html|youtube|pdf|document|powerpoint
  src             text,                        -- Drive path or full URL
  drive_file_id   text,                        -- stable Drive file ID (survives renames)
  section_heading text,                        -- Heading2 text to extract from master .docx; null = whole file
  hours           numeric(4,2) not null default 0,
  equipment       text,
  missing         boolean not null default false,
  created_at      timestamptz not null default now()
);

create index if not exists screens_course_id_position on public.screens(course_id, position);

-- ── Users ──────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  name       text,
  role       text not null default 'learner',  -- 'learner' | 'author' | 'admin'
  created_at timestamptz not null default now()
);

-- ── Progress ───────────────────────────────────────────────────────────────
create table if not exists public.progress (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references public.users(id) on delete cascade,
  screen_id        uuid not null references public.screens(id) on delete cascade,
  completed        boolean not null default false,
  time_spent_secs  integer not null default 0,
  completed_at     timestamptz,
  unique (user_id, screen_id)
);

create index if not exists progress_user_id on public.progress(user_id);
create index if not exists progress_screen_id on public.progress(screen_id);

-- ── Drive cache index ──────────────────────────────────────────────────────
-- Tracks what's been extracted and cached in Supabase Storage
create table if not exists public.drive_cache (
  id             uuid primary key default gen_random_uuid(),
  drive_file_id  text not null,
  section_key    text,                         -- null = whole file; otherwise slugified heading
  storage_path   text not null,                -- path in Supabase Storage bucket "drive-cache"
  cached_at      timestamptz not null default now(),
  unique (drive_file_id, section_key)
);

-- ── Row Level Security ─────────────────────────────────────────────────────
alter table public.courses  enable row level security;
alter table public.screens  enable row level security;
alter table public.users    enable row level security;
alter table public.progress enable row level security;
alter table public.drive_cache enable row level security;

-- Courses + screens: publicly readable
create policy "courses_public_read"  on public.courses  for select using (true);
create policy "screens_public_read"  on public.screens  for select using (true);

-- Courses + screens: only admins can write
create policy "courses_admin_write"  on public.courses  for all
  using  ((select role from public.users where id = auth.uid()) = 'admin')
  with check ((select role from public.users where id = auth.uid()) = 'admin');

create policy "screens_admin_write"  on public.screens  for all
  using  ((select role from public.users where id = auth.uid()) = 'admin')
  with check ((select role from public.users where id = auth.uid()) = 'admin');

-- Users: can read/update own row; admins can read all
create policy "users_read_own"   on public.users for select using (id = auth.uid());
create policy "users_update_own" on public.users for update using (id = auth.uid());

-- Progress: users own their rows
create policy "progress_own" on public.progress for all using (user_id = auth.uid());

-- Drive cache: service role only (managed by API routes with service key)
create policy "drive_cache_service" on public.drive_cache for all
  using ((select role from public.users where id = auth.uid()) = 'admin');

-- ── Trigger: keep updated_at current ──────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger courses_updated_at before update on public.courses
  for each row execute function public.set_updated_at();

-- ── Storage bucket for Drive cache ────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('drive-cache', 'drive-cache', false)
on conflict (id) do nothing;
