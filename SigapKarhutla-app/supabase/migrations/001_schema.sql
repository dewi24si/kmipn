-- SIGAP KARHUTLA: skema inti

create type public.user_role as enum ('bpbd', 'klhk', 'dishut', 'bmkg', 'pemda');
create type public.tiket_sumber as enum ('satelit', 'warga');
create type public.tiket_kategori as enum ('api', 'asap', 'aktivitas_ilegal', 'hotspot_satelit');
create type public.tiket_status as enum ('Baru', 'Diverifikasi', 'Ditindaklanjuti', 'Selesai');

-- ============ users ============
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  nama text not null,
  role public.user_role not null,
  instansi text not null,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users_select_authenticated" on public.users
  for select to authenticated using (true);

-- ============ tiket ============
create table public.tiket (
  id uuid primary key default gen_random_uuid(),
  sumber public.tiket_sumber not null,
  lokasi_lat numeric(9,6) not null,
  lokasi_lng numeric(9,6) not null,
  wilayah text not null,
  kategori public.tiket_kategori not null,
  skor_risiko int not null check (skor_risiko between 0 and 100),
  darurat boolean generated always as (skor_risiko >= 80) stored,
  status public.tiket_status not null default 'Baru',
  instansi_ditugaskan text,
  sla_deadline timestamptz not null default (now() + interval '6 hours'),
  dibuat_pada timestamptz not null default now(),
  diperbarui_pada timestamptz not null default now()
);

create index tiket_status_idx on public.tiket (status);
create index tiket_sumber_idx on public.tiket (sumber);
create index tiket_dibuat_pada_idx on public.tiket (dibuat_pada);
create index tiket_lokasi_idx on public.tiket (lokasi_lat, lokasi_lng);

alter table public.tiket enable row level security;

create policy "tiket_select_public" on public.tiket
  for select using (true);

create policy "tiket_insert_authenticated" on public.tiket
  for insert to authenticated with check (true);

create policy "tiket_update_authenticated" on public.tiket
  for update to authenticated using (true) with check (true);

create or replace function public.set_diperbarui_pada()
returns trigger
language plpgsql
as $$
begin
  new.diperbarui_pada := now();
  return new;
end;
$$;

create trigger tiket_set_diperbarui_pada
  before update on public.tiket
  for each row execute function public.set_diperbarui_pada();

-- ============ laporan_warga ============
create table public.laporan_warga (
  id uuid primary key default gen_random_uuid(),
  tiket_id uuid not null references public.tiket(id) on delete cascade,
  nama_pelapor text,
  no_hp text,
  foto_url text,
  deskripsi text not null,
  nomor_pelacakan text not null unique,
  dibuat_pada timestamptz not null default now()
);

create index laporan_warga_tiket_id_idx on public.laporan_warga (tiket_id);
create index laporan_warga_no_hp_idx on public.laporan_warga (no_hp);

alter table public.laporan_warga enable row level security;

create policy "laporan_warga_select_authenticated" on public.laporan_warga
  for select to authenticated using (true);

-- ============ hotspot_dummy ============
create table public.hotspot_dummy (
  id uuid primary key default gen_random_uuid(),
  lokasi_lat numeric(9,6) not null,
  lokasi_lng numeric(9,6) not null,
  wilayah text not null,
  tanggal date not null,
  sumber text not null default 'satelit_dummy',
  confidence int check (confidence between 0 and 100)
);

create index hotspot_dummy_tanggal_idx on public.hotspot_dummy (tanggal);

alter table public.hotspot_dummy enable row level security;

create policy "hotspot_dummy_select_public" on public.hotspot_dummy
  for select using (true);

-- ============ riwayat_tindak_lanjut ============
create table public.riwayat_tindak_lanjut (
  id uuid primary key default gen_random_uuid(),
  tiket_id uuid not null references public.tiket(id) on delete cascade,
  catatan text not null,
  oleh_user uuid references public.users(id),
  waktu timestamptz not null default now()
);

create index riwayat_tindak_lanjut_tiket_id_idx on public.riwayat_tindak_lanjut (tiket_id);

alter table public.riwayat_tindak_lanjut enable row level security;

create policy "riwayat_select_authenticated" on public.riwayat_tindak_lanjut
  for select to authenticated using (true);

create policy "riwayat_insert_authenticated" on public.riwayat_tindak_lanjut
  for insert to authenticated with check (oleh_user = auth.uid());
