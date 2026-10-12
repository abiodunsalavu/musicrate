-- Only signed-in users can add albums (previously the policy applied to anon too)
drop policy "Enable insert for authenticated users only" on public.albums;
create policy "Authenticated users can add albums" on public.albums
  for insert to authenticated with check (true);

-- One row per Spotify album
alter table public.albums add constraint albums_spotify_id_key unique (spotify_id);

-- Enforce data rules in the database, not just in the API routes
alter table public.collections
  add constraint collections_rating_check check (rating between 1 and 10),
  add constraint collections_favourite_track_check check (char_length(favourite_track) <= 200);
alter table public.profiles
  add constraint profiles_username_format check (username ~ '^[a-z0-9_]{3,30}$'),
  add constraint profiles_display_name_length check (char_length(display_name) <= 50);

-- Avatars: images only, max 2MB
update storage.buckets
  set file_size_limit = 2097152,
      allowed_mime_types = array['image/jpeg','image/png','image/webp','image/gif']
  where id = 'avatars';

-- Lock down the signup trigger function
create or replace function public.handle_new_user() returns trigger
  language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, username)
  values (new.id, 'user_' || substr(new.id::text, 1, 8));
  return new;
end; $$;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
