alter table public.learners
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists guardian_user_id uuid references auth.users(id) on delete set null;
alter table public.academic_years add constraint academic_years_id_tenant_unique unique(id,institution_id);
alter table public.classes add constraint classes_id_tenant_unique unique(id,institution_id);
alter table public.learners add constraint learners_id_tenant_unique unique(id,institution_id);
alter table public.subjects add constraint subjects_id_tenant_unique unique(id,institution_id);
alter table public.learners add constraint learners_class_tenant_fk foreign key(class_id,institution_id) references public.classes(id,institution_id) on delete set null (class_id);
alter table public.attendance_records
 add constraint attendance_learner_tenant_fk foreign key(learner_id,institution_id) references public.learners(id,institution_id) on delete cascade,
 add constraint attendance_class_tenant_fk foreign key(class_id,institution_id) references public.classes(id,institution_id) on delete set null (class_id);
alter table public.grade_records
 add constraint grades_learner_tenant_fk foreign key(learner_id,institution_id) references public.learners(id,institution_id) on delete cascade,
 add constraint grades_subject_tenant_fk foreign key(subject_id,institution_id) references public.subjects(id,institution_id) on delete set null (subject_id);
alter table public.invoices add constraint invoices_learner_tenant_fk foreign key(learner_id,institution_id) references public.learners(id,institution_id) on delete set null (learner_id);
drop policy if exists learners_select_member on public.learners;
create policy learners_select_scoped on public.learners for select to authenticated using (
 private.has_institution_role(institution_id,array['director','school_admin','teacher','secretary'])
 or (private.is_institution_member(institution_id) and (user_id=(select auth.uid()) or guardian_user_id=(select auth.uid())))
);
drop policy if exists staff_select_member on public.staff;
create policy staff_select_scoped on public.staff for select to authenticated using(private.has_institution_role(institution_id,array['director','school_admin','teacher','secretary','accountant']));
drop policy if exists attendance_records_select_member on public.attendance_records;
create policy attendance_select_scoped on public.attendance_records for select to authenticated using (
 private.has_institution_role(institution_id,array['director','school_admin','teacher','secretary'])
 or (private.is_institution_member(institution_id) and exists(select 1 from public.learners l where l.id=learner_id and l.institution_id=institution_id and (l.user_id=(select auth.uid()) or l.guardian_user_id=(select auth.uid()))))
);
drop policy if exists grade_records_select_member on public.grade_records;
create policy grades_select_scoped on public.grade_records for select to authenticated using (
 private.has_institution_role(institution_id,array['director','school_admin','teacher'])
 or (private.is_institution_member(institution_id) and exists(select 1 from public.learners l where l.id=learner_id and l.institution_id=institution_id and (l.user_id=(select auth.uid()) or l.guardian_user_id=(select auth.uid()))))
);
drop policy if exists invoices_select_member on public.invoices;
create policy invoices_select_scoped on public.invoices for select to authenticated using (
 private.has_institution_role(institution_id,array['director','school_admin','accountant'])
 or (private.is_institution_member(institution_id) and exists(select 1 from public.learners l where l.id=learner_id and l.institution_id=institution_id and (l.user_id=(select auth.uid()) or l.guardian_user_id=(select auth.uid()))))
);
