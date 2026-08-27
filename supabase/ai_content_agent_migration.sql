-- AI content-agent workflow: drafts, approval, audit and playlist idempotency.
-- This migration creates no content rows and does not modify existing course/lesson data.

create extension if not exists pgcrypto;

alter table public.courses add column if not exists source_playlist_id text null;

create unique index if not exists courses_teacher_playlist_unique
  on public.courses (teacher_assignment_id, source_playlist_id)
  where source_playlist_id is not null;

create unique index if not exists lessons_course_video_unique
  on public.lessons (course_id, youtube_video_id);

create table if not exists public.content_agent_drafts (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null references auth.users(id) on delete cascade,
  intent text not null check (intent in ('course_import', 'course_update', 'course_delete', 'publish_course', 'unpublish_course')),
  status text not null default 'draft' check (status in ('draft', 'approved', 'executed', 'cancelled', 'failed', 'expired')),
  source_url text,
  source_playlist_id text,
  input_fingerprint text not null,
  payload jsonb not null,
  validation jsonb not null default '{}'::jsonb,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  executed_by uuid references auth.users(id) on delete set null,
  executed_at timestamptz,
  result jsonb,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_agent_drafts_creator_status_idx
  on public.content_agent_drafts (created_by, status, created_at desc);
create index if not exists content_agent_drafts_fingerprint_idx
  on public.content_agent_drafts (created_by, input_fingerprint, created_at desc);

create table if not exists public.content_agent_audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  draft_id uuid references public.content_agent_drafts(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  outcome text not null check (outcome in ('approved', 'executed', 'rejected', 'failed', 'cancelled')),
  summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists content_agent_audit_actor_created_idx
  on public.content_agent_audit_logs (actor_user_id, created_at desc);
create index if not exists content_agent_audit_draft_idx
  on public.content_agent_audit_logs (draft_id, created_at desc);

alter table public.content_agent_drafts enable row level security;
alter table public.content_agent_audit_logs enable row level security;

drop policy if exists "admins read content agent drafts" on public.content_agent_drafts;
create policy "admins read content agent drafts" on public.content_agent_drafts
  for select to authenticated using (public.is_admin());
drop policy if exists "admins insert content agent drafts" on public.content_agent_drafts;
create policy "admins insert content agent drafts" on public.content_agent_drafts
  for insert to authenticated with check (public.is_admin() and created_by = auth.uid());
drop policy if exists "admins update content agent drafts" on public.content_agent_drafts;
create policy "admins update content agent drafts" on public.content_agent_drafts
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "admins read content agent audit logs" on public.content_agent_audit_logs;
create policy "admins read content agent audit logs" on public.content_agent_audit_logs
  for select to authenticated using (public.is_admin());
drop policy if exists "admins insert content agent audit logs" on public.content_agent_audit_logs;
create policy "admins insert content agent audit logs" on public.content_agent_audit_logs
  for insert to authenticated with check (public.is_admin() and actor_user_id = auth.uid());

grant select, insert, update on public.content_agent_drafts to authenticated;
grant select, insert on public.content_agent_audit_logs to authenticated;
