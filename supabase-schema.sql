create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  company text not null,
  role text not null,
  status text not null default 'Saved',
  priority text not null default 'Medium',
  applied_date date,
  follow_up_date date,
  link text,
  contact text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.job_applications enable row level security;

create index if not exists job_applications_user_id_idx on public.job_applications(user_id);
create index if not exists job_applications_follow_up_date_idx on public.job_applications(follow_up_date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_job_applications_updated_at on public.job_applications;
create trigger set_job_applications_updated_at
before update on public.job_applications
for each row
execute function public.set_updated_at();

drop policy if exists "Users can view their own job applications." on public.job_applications;
create policy "Users can view their own job applications."
on public.job_applications for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own job applications." on public.job_applications;
create policy "Users can create their own job applications."
on public.job_applications for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own job applications." on public.job_applications;
create policy "Users can update their own job applications."
on public.job_applications for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own job applications." on public.job_applications;
create policy "Users can delete their own job applications."
on public.job_applications for delete
to authenticated
using ((select auth.uid()) = user_id);
