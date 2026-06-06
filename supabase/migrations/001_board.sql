-- 게시판 테이블
create table if not exists public.posts (
  id bigint primary key generated always as identity,
  title text not null,
  content text not null,
  author_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS 활성화
alter table public.posts enable row level security;

-- 읽기는 누구나 가능
create policy "누구나 게시글을 읽을 수 있음"
  on public.posts for select
  using (true);

-- 쓰기는 로그인한 사용자만 (author_id가 본인인 경우)
create policy "로그인한 사용자만 게시글 작성 가능"
  on public.posts for insert
  with check (auth.role() = 'authenticated' and author_id = auth.uid());
