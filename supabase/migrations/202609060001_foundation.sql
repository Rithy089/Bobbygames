-- BobbyGames: closed score writes, safe public identity, migration-owned catalog.
create table public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default 'Player' check (char_length(btrim(display_name)) between 3 and 20 and display_name !~ '[<>/\\&;]' and lower(btrim(display_name)) not in ('admin','administrator','moderator','bobbygames','supabase')),
 avatar smallint not null default 0 check(avatar between 0 and 5),
 created_at timestamptz not null default now()
);
create table public.games (id text primary key, published boolean not null default false, released_at timestamptz not null default now());
create table public.game_translations(game_id text references public.games on delete cascade, language text check(language in ('en','km')), title text not null, description text not null, primary key(game_id,language));
create table public.categories(id text primary key);
create table public.game_categories(game_id text references public.games on delete cascade,category_id text references public.categories on delete cascade, primary key(game_id,category_id));
create table public.gameplay_sessions(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles on delete cascade,game_id text not null references public.games,started_at timestamptz not null default clock_timestamp(),finished_at timestamptz,duration_ms integer,used boolean not null default false);
create index sessions_owner_started on public.gameplay_sessions(user_id,started_at desc);
create table public.scores(id uuid primary key default gen_random_uuid(),user_id uuid not null references public.profiles on delete cascade,game_id text not null references public.games,session_id uuid not null unique references public.gameplay_sessions,score integer not null check(score between 0 and 500000),duration_ms integer not null check(duration_ms between 250 and 3600000),created_at timestamptz not null default now());
create index scores_game_rank on public.scores(game_id,score desc,created_at);
create table public.favorites(user_id uuid not null references public.profiles on delete cascade,game_id text not null references public.games,primary key(user_id,game_id));
create table public.recently_played(user_id uuid not null references public.profiles on delete cascade,game_id text not null references public.games,played_at timestamptz not null default now(),primary key(user_id,game_id));
create table public.achievements(id text primary key,threshold integer not null);
create table public.player_achievements(user_id uuid not null references public.profiles on delete cascade,achievement_id text not null references public.achievements,unlocked_at timestamptz not null default now(),primary key(user_id,achievement_id));
create table public.player_preferences(user_id uuid primary key references public.profiles on delete cascade,language text not null default 'en' check(language in('en','km')),theme text not null default 'system' check(theme in('light','dark','system')));
create table public.suspicious_score_events(id bigint generated always as identity primary key,user_id uuid references public.profiles on delete cascade,session_id uuid,reason text not null,created_at timestamptz not null default clock_timestamp());

alter table public.profiles enable row level security;
alter table public.games enable row level security;
alter table public.game_translations enable row level security;
alter table public.categories enable row level security;
alter table public.game_categories enable row level security;
alter table public.gameplay_sessions enable row level security;
alter table public.scores enable row level security;
alter table public.favorites enable row level security;
alter table public.recently_played enable row level security;
alter table public.achievements enable row level security;
alter table public.player_achievements enable row level security;
alter table public.player_preferences enable row level security;
alter table public.suspicious_score_events enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant select on public.games,public.game_translations,public.categories,public.game_categories,public.achievements to anon,authenticated;
grant select on public.profiles,public.scores,public.gameplay_sessions,public.favorites,public.recently_played,public.player_preferences,public.player_achievements to authenticated;
grant update(display_name,avatar) on public.profiles to authenticated;
grant insert,update,delete on public.favorites,public.player_preferences to authenticated;

create policy published_games on public.games for select using(published);
create policy published_translations on public.game_translations for select using(exists(select 1 from public.games where games.id=game_id and published));
create policy read_categories on public.categories for select using(true);
create policy published_categories on public.game_categories for select using(exists(select 1 from public.games where games.id=game_id and published));
create policy read_achievements on public.achievements for select using(true);
create policy own_profile_read on public.profiles for select to authenticated using(id=auth.uid());
create policy own_profile_update on public.profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy own_sessions on public.gameplay_sessions for select to authenticated using(user_id=auth.uid());
create policy own_scores on public.scores for select to authenticated using(user_id=auth.uid());
create policy own_favorites on public.favorites for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid() and exists(select 1 from public.games where games.id=game_id and published));
create policy own_recent on public.recently_played for select to authenticated using(user_id=auth.uid());
create policy own_preferences on public.player_preferences for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy own_achievements on public.player_achievements for select to authenticated using(user_id=auth.uid());
-- Deliberately no policies/grants on suspicious_score_events and no client writes to scores/sessions/awards.

create function public.create_player() returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.profiles(id,display_name) values(new.id,'Player-'||substr(new.id::text,1,8));
 insert into public.player_preferences(user_id) values(new.id);
 return new;
end;$$;
revoke all on function public.create_player() from public,anon,authenticated;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.create_player();

create function public.start_game(p_game text) returns uuid language plpgsql security definer set search_path='' as $$
declare sid uuid; uid uuid:=auth.uid();
begin
 if uid is null then raise exception 'authentication_required';end if;
 perform pg_advisory_xact_lock(hashtext(uid::text));
 if not exists(select 1 from public.games where id=p_game and published) then raise exception 'invalid_game';end if;
 if (select count(*) from public.gameplay_sessions where user_id=uid and started_at>clock_timestamp()-interval '1 minute')>=12 then raise exception 'rate_limited';end if;
 insert into public.gameplay_sessions(user_id,game_id) values(uid,p_game) returning id into sid;
 insert into public.recently_played(user_id,game_id) values(uid,p_game) on conflict(user_id,game_id) do update set played_at=now();
 return sid;
end;$$;

create function public.submit_score(p_session uuid,p_score integer,p_duration_ms integer) returns jsonb language plpgsql security definer set search_path='' as $$
declare s public.gameplay_sessions; uid uuid:=auth.uid(); reason text; seconds numeric; maximum numeric;
begin
 if uid is null then raise exception 'authentication_required';end if;
 select * into s from public.gameplay_sessions where id=p_session and user_id=uid for update;
 if s.id is null then return jsonb_build_object('accepted',false,'reason','invalid_session');end if;
 -- One consumed session yields at most one score and one suspicious log.
 if s.used then return jsonb_build_object('accepted',false,'reason','used_session');end if;
 seconds:=p_duration_ms/1000.0;
 maximum:=case s.game_id when 'mango-catch' then 120 when 'temple-tower' then 10 when 'tuk-tuk-rush' then 160 else 0 end;
 if not exists(select 1 from public.games where id=s.game_id and published) then reason:='invalid_game';
 elsif p_score is null or p_duration_ms is null then reason:='missing_values';
 elsif p_score<0 or p_score>500000 or p_duration_ms<250 or p_duration_ms>3600000 then reason:='out_of_bounds';
 elsif clock_timestamp()-s.started_at>interval '2 hours' then reason:='expired_session';
 elsif p_duration_ms > extract(epoch from (clock_timestamp()-s.started_at))*1000+2000 then reason:='invalid_duration';
 elsif p_score>seconds*maximum+50 then reason:='impossible_rate';
 end if;
 update public.gameplay_sessions set used=true,finished_at=clock_timestamp(),duration_ms=case when reason is null then p_duration_ms else null end where id=s.id;
 if reason is not null then
  insert into public.suspicious_score_events(user_id,session_id,reason) values(uid,s.id,reason);
  return jsonb_build_object('accepted',false,'reason',reason);
 end if;
 insert into public.scores(user_id,game_id,session_id,score,duration_ms) values(uid,s.game_id,s.id,p_score,p_duration_ms);
 insert into public.player_achievements(user_id,achievement_id) values(uid,'firstPlay') on conflict do nothing;
 if (select count(distinct game_id) from public.scores where user_id=uid)=3 then insert into public.player_achievements(user_id,achievement_id) values(uid,'explorer') on conflict do nothing;end if;
 if s.game_id='mango-catch' and p_score>=100 then insert into public.player_achievements(user_id,achievement_id) values(uid,'mangoMaster') on conflict do nothing;end if;
 if s.game_id='temple-tower' and p_score>=10 then insert into public.player_achievements(user_id,achievement_id) values(uid,'towerMaster') on conflict do nothing;end if;
 if s.game_id='tuk-tuk-rush' and p_score>=500 then insert into public.player_achievements(user_id,achievement_id) values(uid,'rushMaster') on conflict do nothing;end if;
 return jsonb_build_object('accepted',true);
end;$$;

create function public.leaderboard(p_game text) returns table(display_name text,avatar smallint,score integer,game_id text,created_at timestamptz) language sql stable security definer set search_path='' as $$
 select p.display_name,p.avatar,s.score,s.game_id,s.created_at
 from (select distinct on (user_id) user_id,score,game_id,created_at from public.scores where game_id=p_game order by user_id,score desc,created_at asc) s
 join public.profiles p on p.id=s.user_id join public.games g on g.id=s.game_id and g.published
 order by s.score desc,s.created_at asc limit 100
$$;
revoke all on function public.start_game(text),public.submit_score(uuid,integer,integer),public.leaderboard(text) from public,anon,authenticated;
grant execute on function public.start_game(text),public.submit_score(uuid,integer,integer) to authenticated;
grant execute on function public.leaderboard(text) to anon,authenticated;

insert into public.games(id,published) values('mango-catch',true),('temple-tower',true),('tuk-tuk-rush',true);
insert into public.categories(id) values('arcade'),('precision'),('racing');
insert into public.game_categories values('mango-catch','arcade'),('temple-tower','precision'),('tuk-tuk-rush','racing');
insert into public.game_translations values
('mango-catch','en','Mango Catch','Catch fruit, dodge stones and keep your streak alive.'),
('mango-catch','km','ចាប់ស្វាយ','ចាប់ផ្លែឈើ និងជៀសវាងថ្ម។'),
('temple-tower','en','Temple Tower','Time each block and build a fictional sandstone tower.'),
('temple-tower','km','ប៉មប្រាសាទ','ដាក់ដុំថ្មឱ្យចំពេល និងសង់ប៉មស្រមើស្រមៃ។'),
('tuk-tuk-rush','en','Tuk-Tuk Rush','Dodge traffic on a Phnom Penh-inspired street.'),
('tuk-tuk-rush','km','តុកតុកប្រញាប់','ជៀសវាងចរាចរណ៍តាមផ្លូវដែលបំផុសគំនិតពីភ្នំពេញ។');
insert into public.achievements values('firstPlay',1),('explorer',3),('mangoMaster',100),('towerMaster',10),('rushMaster',500);

