-- Collections are public so profiles and album pages can show everyone's ratings.
-- Insert, update and delete stay limited to the owner.
drop policy "Users can view their own collection" on public.collections;
create policy "Anyone can view collections" on public.collections
  for select to anon, authenticated using (true);
