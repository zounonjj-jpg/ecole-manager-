-- School Manager initial multi-tenant schema.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null default '',
 avatar_url text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(id,full_name) values(new.id,coalesce(new.raw_user_meta_data->>'full_name','')) on conflict(id) do nothing;
 return new;
end; $$;
revoke all on function public.handle_new_user() from public;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create table public.institutions (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 institution_type text not null default 'school' check(institution_type in ('kindergarten','primary','middle_school','high_school','university','institute','training_center','school')),
 country_code text, timezone text not null default 'UTC', currency_code text not null default 'XOF',
 created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.institution_memberships (
 id uuid primary key default gen_random_uuid(), institution_id uuid not null references public.institutions(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 role text not null check(role in ('director','school_admin','teacher','student','parent','accountant','secretary')),
 status text not null default 'active' check(status in ('invited','active','suspended')),
 created_at timestamptz not null default now(), unique(institution_id,user_id,role)
);
create or replace function private.is_institution_member(p_institution_id uuid)
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.institution_memberships m where m.institution_id=p_institution_id and m.user_id=(select auth.uid()) and m.status='active');
$$;
create or replace function private.has_institution_role(p_institution_id uuid,p_roles text[])
returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.institution_memberships m where m.institution_id=p_institution_id and m.user_id=(select auth.uid()) and m.status='active' and m.role=any(p_roles));
$$;
revoke all on function private.is_institution_member(uuid) from public;
revoke all on function private.has_institution_role(uuid,text[]) from public;
grant execute on function private.is_institution_member(uuid) to authenticated;
grant execute on function private.has_institution_role(uuid,text[]) to authenticated;

create table public.academic_years (
 id uuid primary key default gen_random_uuid(), institution_id uuid not null references public.institutions(id) on delete cascade,
 name text not null, starts_on date not null, ends_on date not null, is_current boolean not null default false,
 created_at timestamptz not null default now(), check(ends_on>starts_on), unique(institution_id,name)
);
create table public.classes (
 id uuid primary key default gen_random_uuid(), institution_id uuid not null references public.institutions(id) on delete cascade,
 academic_year_id uuid references public.academic_years(id) on delete set null, name text not null, level text,
 capacity integer check(capacity is null or capacity>0), created_at timestamptz not null default now(), unique(institution_id,academic_year_id,name)
);
create table public.learners (
 id uuid primary key default gen_random_uuid(), institution_id uuid not null references public.institutions(id) on delete cascade,
 class_id uuid references public.classes(id) on delete set null, student_number text, first_name text not null, last_name text not null,
 date_of_birth date, gender text check(gender is null or gender in ('female','male','other','undisclosed')),
 guardian_name text, guardian_email text, guardian_phone text,
 status text not null default 'active' check(status in ('active','inactive','graduated','transferred')),
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(institution_id,student_number)
);
create table public.staff (
 id uuid primary key default gen_random_uuid(), institution_id uuid not null references public.institutions(id) on delete cascade,
 user_id uuid references auth.users(id) on delete set null, first_name text not null, last_name text not null,
 email text, phone text, job_title text not null default 'teacher', status text not null default 'active' check(status in ('active','inactive')),
 created_at timestamptz not null default now()
);
create table public.subjects (
 id uuid primary key default gen_random_uuid(), institution_id uuid not null references public.institutions(id) on delete cascade,
 name text not null, code text, coefficient numeric(5,2) not null default 1 check(coefficient>0),
 created_at timestamptz not null default now(), unique(institution_id,name)
);
create table public.attendance_records (
 id uuid primary key default gen_random_uuid(), institution_id uuid not null references public.institutions(id) on delete cascade,
 learner_id uuid not null references public.learners(id) on delete cascade, class_id uuid references public.classes(id) on delete set null,
 attendance_date date not null, status text not null check(status in ('present','absent','late','excused')), note text,
 recorded_by uuid references auth.users(id), created_at timestamptz not null default now(), unique(learner_id,attendance_date)
);
create table public.grade_records (
 id uuid primary key default gen_random_uuid(), institution_id uuid not null references public.institutions(id) on delete cascade,
 learner_id uuid not null references public.learners(id) on delete cascade, subject_id uuid references public.subjects(id) on delete set null,
 assessment_name text not null, score numeric(7,2) not null check(score>=0), max_score numeric(7,2) not null default 20 check(max_score>0),
 assessment_date date not null default current_date, recorded_by uuid references auth.users(id), created_at timestamptz not null default now(),
 check(score<=max_score)
);
create table public.invoices (
 id uuid primary key default gen_random_uuid(), institution_id uuid not null references public.institutions(id) on delete cascade,
 learner_id uuid references public.learners(id) on delete set null, invoice_number text not null, description text not null,
 amount numeric(12,2) not null check(amount>=0), currency_code text not null default 'XOF', due_date date,
 status text not null default 'unpaid' check(status in ('draft','unpaid','partial','paid','cancelled')),
 created_at timestamptz not null default now(), unique(institution_id,invoice_number)
);

alter table public.profiles enable row level security;
alter table public.institutions enable row level security;
alter table public.institution_memberships enable row level security;
alter table public.academic_years enable row level security;
alter table public.classes enable row level security;
alter table public.learners enable row level security;
alter table public.staff enable row level security;
alter table public.subjects enable row level security;
alter table public.attendance_records enable row level security;
alter table public.grade_records enable row level security;
alter table public.invoices enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated using((select auth.uid())=id);
create policy profiles_insert_own on public.profiles for insert to authenticated with check((select auth.uid())=id);
create policy profiles_update_own on public.profiles for update to authenticated using((select auth.uid())=id) with check((select auth.uid())=id);
create policy institutions_select_member on public.institutions for select to authenticated using(private.is_institution_member(id));
create policy institutions_insert_owner on public.institutions for insert to authenticated with check(created_by=(select auth.uid()));
create policy institutions_update_admin on public.institutions for update to authenticated using(private.has_institution_role(id,array['director','school_admin'])) with check(private.has_institution_role(id,array['director','school_admin']));
create policy memberships_select_self_or_admin on public.institution_memberships for select to authenticated using(user_id=(select auth.uid()) or private.has_institution_role(institution_id,array['director','school_admin']));
create policy memberships_insert_owner_self on public.institution_memberships for insert to authenticated with check(user_id=(select auth.uid()) and role='director' and exists(select 1 from public.institutions i where i.id=institution_id and i.created_by=(select auth.uid())));

do $$ declare t text; begin
 foreach t in array array['academic_years','classes','learners','staff','subjects','attendance_records','grade_records','invoices'] loop
  execute format('create policy %I on public.%I for select to authenticated using(private.is_institution_member(institution_id))',t||'_select_member',t);
 end loop;
end $$;

create policy academic_years_insert_admin on public.academic_years for insert to authenticated with check(private.has_institution_role(institution_id,array['director','school_admin']));
create policy academic_years_update_admin on public.academic_years for update to authenticated using(private.has_institution_role(institution_id,array['director','school_admin'])) with check(private.has_institution_role(institution_id,array['director','school_admin']));
create policy academic_years_delete_admin on public.academic_years for delete to authenticated using(private.has_institution_role(institution_id,array['director','school_admin']));
create policy classes_insert_admin on public.classes for insert to authenticated with check(private.has_institution_role(institution_id,array['director','school_admin']));
create policy classes_update_admin on public.classes for update to authenticated using(private.has_institution_role(institution_id,array['director','school_admin'])) with check(private.has_institution_role(institution_id,array['director','school_admin']));
create policy classes_delete_admin on public.classes for delete to authenticated using(private.has_institution_role(institution_id,array['director','school_admin']));
create policy learners_insert_admin on public.learners for insert to authenticated with check(private.has_institution_role(institution_id,array['director','school_admin','secretary']));
create policy learners_update_admin on public.learners for update to authenticated using(private.has_institution_role(institution_id,array['director','school_admin','secretary'])) with check(private.has_institution_role(institution_id,array['director','school_admin','secretary']));
create policy learners_delete_admin on public.learners for delete to authenticated using(private.has_institution_role(institution_id,array['director','school_admin']));
create policy staff_insert_admin on public.staff for insert to authenticated with check(private.has_institution_role(institution_id,array['director','school_admin']));
create policy staff_update_admin on public.staff for update to authenticated using(private.has_institution_role(institution_id,array['director','school_admin'])) with check(private.has_institution_role(institution_id,array['director','school_admin']));
create policy staff_delete_admin on public.staff for delete to authenticated using(private.has_institution_role(institution_id,array['director','school_admin']));
create policy subjects_insert_admin on public.subjects for insert to authenticated with check(private.has_institution_role(institution_id,array['director','school_admin']));
create policy subjects_update_admin on public.subjects for update to authenticated using(private.has_institution_role(institution_id,array['director','school_admin'])) with check(private.has_institution_role(institution_id,array['director','school_admin']));
create policy subjects_delete_admin on public.subjects for delete to authenticated using(private.has_institution_role(institution_id,array['director','school_admin']));
create policy attendance_insert_teacher on public.attendance_records for insert to authenticated with check(private.has_institution_role(institution_id,array['director','school_admin','teacher']));
create policy attendance_update_teacher on public.attendance_records for update to authenticated using(private.has_institution_role(institution_id,array['director','school_admin','teacher'])) with check(private.has_institution_role(institution_id,array['director','school_admin','teacher']));
create policy attendance_delete_admin on public.attendance_records for delete to authenticated using(private.has_institution_role(institution_id,array['director','school_admin']));
create policy grades_insert_teacher on public.grade_records for insert to authenticated with check(private.has_institution_role(institution_id,array['director','school_admin','teacher']));
create policy grades_update_teacher on public.grade_records for update to authenticated using(private.has_institution_role(institution_id,array['director','school_admin','teacher'])) with check(private.has_institution_role(institution_id,array['director','school_admin','teacher']));
create policy grades_delete_admin on public.grade_records for delete to authenticated using(private.has_institution_role(institution_id,array['director','school_admin']));
create policy invoices_insert_finance on public.invoices for insert to authenticated with check(private.has_institution_role(institution_id,array['director','school_admin','accountant']));
create policy invoices_update_finance on public.invoices for update to authenticated using(private.has_institution_role(institution_id,array['director','school_admin','accountant'])) with check(private.has_institution_role(institution_id,array['director','school_admin','accountant']));
create policy invoices_delete_admin on public.invoices for delete to authenticated using(private.has_institution_role(institution_id,array['director','school_admin']));

grant select,insert,update on public.profiles to authenticated;
grant select,insert,update on public.institutions to authenticated;
grant select,insert,update on public.institution_memberships to authenticated;
grant select,insert,update,delete on public.academic_years,public.classes,public.learners,public.staff,public.subjects,public.attendance_records,public.grade_records,public.invoices to authenticated;
