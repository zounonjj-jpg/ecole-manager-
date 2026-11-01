drop policy if exists institutions_select_member on public.institutions;
create policy institutions_select_owner_or_member on public.institutions for select to authenticated using(created_by=(select auth.uid()) or private.is_institution_member(id));
