-- Risk scoring: kategori dasar + jumlah laporan lain di radius ~5km / 24 jam terakhir
create or replace function public.hitung_skor_risiko(
  p_kategori public.tiket_kategori,
  p_lat numeric,
  p_lng numeric
)
returns int
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_base int;
  v_jumlah_dekat int;
  v_skor int;
begin
  v_base := case p_kategori
    when 'api' then 70
    when 'hotspot_satelit' then 60
    when 'asap' then 50
    when 'aktivitas_ilegal' then 40
    else 30
  end;

  select count(*) into v_jumlah_dekat
  from public.tiket t
  where t.dibuat_pada >= now() - interval '24 hours'
    and abs(t.lokasi_lat - p_lat) < 0.05
    and abs(t.lokasi_lng - p_lng) < 0.05;

  v_skor := least(100, v_base + least(30, v_jumlah_dekat * 10));
  return v_skor;
end;
$$;

-- Nomor pelacakan unik format SGP-YYYYMMDD-XXXX
create or replace function public.buat_nomor_pelacakan()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_nomor text;
  v_exists boolean;
begin
  loop
    v_nomor := 'SGP-' || to_char(now(), 'YYYYMMDD') || '-' ||
      upper(substr(md5(random()::text || clock_timestamp()::text), 1, 4));
    select exists(select 1 from public.laporan_warga where nomor_pelacakan = v_nomor) into v_exists;
    exit when not v_exists;
  end loop;
  return v_nomor;
end;
$$;

-- Submit laporan warga: buat tiket + laporan_warga dalam satu transaksi, kembalikan nomor pelacakan
create or replace function public.submit_laporan_warga(
  p_kategori public.tiket_kategori,
  p_lat numeric,
  p_lng numeric,
  p_wilayah text,
  p_deskripsi text,
  p_nama_pelapor text default null,
  p_no_hp text default null,
  p_foto_url text default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_skor int;
  v_tiket_id uuid;
  v_nomor text;
begin
  if p_deskripsi is null or length(trim(p_deskripsi)) = 0 then
    raise exception 'Deskripsi wajib diisi';
  end if;

  v_skor := public.hitung_skor_risiko(p_kategori, p_lat, p_lng);

  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status)
  values ('warga', p_lat, p_lng, p_wilayah, p_kategori, v_skor, 'Baru')
  returning id into v_tiket_id;

  v_nomor := public.buat_nomor_pelacakan();

  insert into public.laporan_warga (tiket_id, nama_pelapor, no_hp, foto_url, deskripsi, nomor_pelacakan)
  values (v_tiket_id, p_nama_pelapor, p_no_hp, p_foto_url, p_deskripsi, v_nomor);

  return v_nomor;
end;
$$;

grant execute on function public.submit_laporan_warga(
  public.tiket_kategori, numeric, numeric, text, text, text, text, text
) to anon, authenticated;

-- Cek status laporan tanpa membocorkan data pribadi pelapor lain
create or replace function public.cek_status_laporan(
  p_nomor_pelacakan text default null,
  p_no_hp text default null
)
returns table (
  nomor_pelacakan text,
  kategori public.tiket_kategori,
  wilayah text,
  status public.tiket_status,
  skor_risiko int,
  darurat boolean,
  dibuat_pada timestamptz,
  diperbarui_pada timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if (p_nomor_pelacakan is null or length(trim(p_nomor_pelacakan)) = 0)
     and (p_no_hp is null or length(trim(p_no_hp)) = 0) then
    raise exception 'Masukkan nomor pelacakan atau nomor HP';
  end if;

  return query
  select lw.nomor_pelacakan, t.kategori, t.wilayah, t.status, t.skor_risiko, t.darurat,
         t.dibuat_pada, t.diperbarui_pada
  from public.laporan_warga lw
  join public.tiket t on t.id = lw.tiket_id
  where (p_nomor_pelacakan is not null and lw.nomor_pelacakan = p_nomor_pelacakan)
     or (p_no_hp is not null and lw.no_hp = p_no_hp)
  order by lw.dibuat_pada desc;
end;
$$;

grant execute on function public.cek_status_laporan(text, text) to anon, authenticated;
