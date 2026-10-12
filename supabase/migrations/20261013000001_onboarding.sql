-- When the user finished (or skipped) the /welcome onboarding flow
alter table public.profiles add column onboarded_at timestamptz;

-- Existing users who already set up a profile don't need onboarding
update public.profiles
set onboarded_at = now()
where display_name is not null
   or username !~ '^user_[0-9a-f]{8}$';

-- Each album can only be in a user's collection once
alter table public.collections
  add constraint collections_user_album_key unique (user_id, album_id);
