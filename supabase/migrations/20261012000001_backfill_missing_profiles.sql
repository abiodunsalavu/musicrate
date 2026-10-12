-- Accounts created before the on_auth_user_created trigger existed have no profile row
insert into public.profiles (id, username)
select u.id, 'user_' || substr(u.id::text, 1, 8)
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
