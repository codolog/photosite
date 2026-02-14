-- Схема БД для сайта экспедиций ДТЮ Ижевск
-- Выполните в SQL Editor в панели Supabase после создания проекта

-- Профили пользователей (расширение auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Экспедиции (по годам: даты, место, участники)
create table if not exists public.expeditions (
  id uuid primary key default gen_random_uuid(),
  year int not null,
  title text not null,
  date_from date,
  date_to date,
  place text,
  participant_list text, -- список участников (текст или JSON)
  description text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Фото (привязка к экспедиции, подпись, место, время)
create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  expedition_id uuid references public.expeditions(id) on delete set null,
  uploaded_by uuid references auth.users(id) on delete set null,
  image_path text not null, -- путь в Storage
  caption text,
  place text,
  taken_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Теги к фото (свободные теги)
create table if not exists public.photo_tags (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos(id) on delete cascade,
  tag text not null,
  unique(photo_id, tag)
);

-- Люди на фото (имя + опционально позиция на изображении в %)
create table if not exists public.photo_persons (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos(id) on delete cascade,
  person_name text not null,
  x_percent numeric(5,2), -- 0-100, позиция метки на фото
  y_percent numeric(5,2),
  created_at timestamptz default now()
);

-- Комментарии к фото
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  photo_id uuid not null references public.photos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);

-- Индексы
create index if not exists idx_expeditions_year on public.expeditions(year);
create index if not exists idx_photos_expedition on public.photos(expedition_id);
create index if not exists idx_photos_uploaded_by on public.photos(uploaded_by);
create index if not exists idx_photos_taken_at on public.photos(taken_at);
create index if not exists idx_photo_tags_tag on public.photo_tags(tag);
create index if not exists idx_photo_tags_photo on public.photo_tags(photo_id);
create index if not exists idx_photo_persons_photo on public.photo_persons(photo_id);
create index if not exists idx_photo_persons_name on public.photo_persons(person_name);
create index if not exists idx_comments_photo on public.comments(photo_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.expeditions enable row level security;
alter table public.photos enable row level security;
alter table public.photo_tags enable row level security;
alter table public.photo_persons enable row level security;
alter table public.comments enable row level security;

-- Профили: чтение всем, запись только свой
create policy "Profiles read" on public.profiles for select using (true);
create policy "Profiles update own" on public.profiles for update using (auth.uid() = id);
create policy "Profiles insert own" on public.profiles for insert with check (auth.uid() = id);

-- Экспедиции: чтение всем, изменение только через service role или по флагу is_admin (проверяем в приложении по ADMIN_EMAIL)
create policy "Expeditions read" on public.expeditions for select using (true);
create policy "Expeditions all for service" on public.expeditions for all using (auth.role() = 'service_role');

-- Для админа через anon key будем проверять в API/Server Actions по email
-- Политика: вставка/обновление/удаление только если вызывается из trusted context (server)
-- Упростим: разрешим insert/update/delete для authenticated (админ-проверка в коде)
create policy "Expeditions insert auth" on public.expeditions for insert with check (auth.role() = 'authenticated');
create policy "Expeditions update auth" on public.expeditions for update using (auth.role() = 'authenticated');
create policy "Expeditions delete auth" on public.expeditions for delete using (auth.role() = 'authenticated');

-- Фото: чтение всем, загрузка авторизованным
create policy "Photos read" on public.photos for select using (true);
create policy "Photos insert auth" on public.photos for insert with check (auth.uid() is not null);
create policy "Photos update own or all" on public.photos for update using (auth.uid() = uploaded_by or auth.uid() is not null);
create policy "Photos delete own" on public.photos for delete using (auth.uid() = uploaded_by);

-- Теги и люди на фото: читают все, меняют авторизованные (владелец фото или админ — в коде)
create policy "Photo_tags read" on public.photo_tags for select using (true);
create policy "Photo_tags insert auth" on public.photo_tags for insert with check (auth.uid() is not null);
create policy "Photo_tags delete auth" on public.photo_tags for delete using (auth.uid() is not null);

create policy "Photo_persons read" on public.photo_persons for select using (true);
create policy "Photo_persons insert auth" on public.photo_persons for insert with check (auth.uid() is not null);
create policy "Photo_persons update auth" on public.photo_persons for update using (auth.uid() is not null);
create policy "Photo_persons delete auth" on public.photo_persons for delete using (auth.uid() is not null);

-- Комментарии: читают все, писать авторизованные
create policy "Comments read" on public.comments for select using (true);
create policy "Comments insert auth" on public.comments for insert with check (auth.uid() = user_id);
create policy "Comments delete own" on public.comments for delete using (auth.uid() = user_id);

-- Триггер создания профиля при регистрации
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket для фото (создать вручную в Dashboard: Storage -> New bucket -> "photos", public)
-- Или через SQL:
insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
on conflict (id) do nothing;

create policy "Photos storage read" on storage.objects for select using (bucket_id = 'photos');
create policy "Photos storage upload auth" on storage.objects for insert with check (bucket_id = 'photos' and auth.role() = 'authenticated');
create policy "Photos storage update auth" on storage.objects for update using (bucket_id = 'photos' and auth.role() = 'authenticated');
create policy "Photos storage delete auth" on storage.objects for delete using (bucket_id = 'photos' and auth.role() = 'authenticated');
