-- 프로필 테이블 (admin 권한 포함)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = '누구나 프로필 조회 가능' and tablename = 'profiles') then
    create policy "누구나 프로필 조회 가능" on public.profiles for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = '본인만 프로필 수정 가능' and tablename = 'profiles') then
    create policy "본인만 프로필 수정 가능" on public.profiles for update using (auth.uid() = id);
  end if;
end $$;

-- 회원가입 시 자동으로 profiles 레코드 생성
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, is_admin)
  values (
    new.id,
    new.raw_user_meta_data ->> 'name',
    false
  );
  return new;
end;
$$;

-- 회원가입 트리거
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 게시판 테이블
create table if not exists public.posts (
  id bigint primary key generated always as identity,
  title text not null,
  content text not null,
  author_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.posts enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = '누구나 게시글 조회 가능' and tablename = 'posts') then
    create policy "누구나 게시글 조회 가능" on public.posts for select using (true);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = '로그인 사용자 게시글 작성 가능' and tablename = 'posts') then
    create policy "로그인 사용자 게시글 작성 가능" on public.posts for insert with check (auth.role() = 'authenticated' and author_id = auth.uid());
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = '관리자 게시글 삭제 가능' and tablename = 'posts') then
    create policy "관리자 게시글 삭제 가능" on public.posts for delete using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
  end if;
end $$;

-- 광고 설정 테이블
create table if not exists public.ad_settings (
  id bigint primary key generated always as identity,
  location text not null unique,
  code text not null default '',
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.ad_settings enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = '관리자만 광고 설정 관리' and tablename = 'ad_settings') then
    create policy "관리자만 광고 설정 관리" on public.ad_settings for all using (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
  end if;
end $$;

-- 기본 광고 위치 추가
insert into public.ad_settings (location, code) values
  ('header', ''),
  ('sidebar', ''),
  ('footer', ''),
  ('between_posts', '')
on conflict (location) do nothing;
