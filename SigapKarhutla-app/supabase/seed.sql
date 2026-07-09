-- Data dummy untuk demo SIGAP KARHUTLA (wilayah Riau: Rokan Hilir, Bengkalis, Dumai, Pekanbaru).
-- Jalankan setelah migrations. Password akun demo: Demo12345!

do $$
declare
  v_id uuid;
  v_password text := 'Demo12345!';
  v_accounts jsonb := '[
    {"email":"bpbd@demo.com","nama":"Budi Santoso","role":"bpbd","instansi":"BPBD Provinsi Riau"},
    {"email":"klhk@demo.com","nama":"Siti Amalia","role":"klhk","instansi":"KLHK Wilayah Riau"},
    {"email":"dishut@demo.com","nama":"Andi Wijaya","role":"dishut","instansi":"Dinas Kehutanan Provinsi Riau"},
    {"email":"bmkg@demo.com","nama":"Rina Puspita","role":"bmkg","instansi":"BMKG Staklim Pekanbaru"},
    {"email":"pemda@demo.com","nama":"Hendra Gunawan","role":"pemda","instansi":"Pemerintah Provinsi Riau"}
  ]';
  v_acc jsonb;
begin
  for v_acc in select * from jsonb_array_elements(v_accounts)
  loop
    v_id := gen_random_uuid();

    insert into auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) values (
      '00000000-0000-0000-0000-000000000000', v_id, 'authenticated', 'authenticated',
      v_acc->>'email', crypt(v_password, gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}', '{}',
      now(), now(), '', '', '', ''
    );

    insert into auth.identities (
      id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at
    ) values (
      gen_random_uuid(), v_id, v_id::text,
      jsonb_build_object('sub', v_id::text, 'email', v_acc->>'email'),
      'email', now(), now(), now()
    );

    insert into public.users (id, email, nama, role, instansi)
    values (v_id, v_acc->>'email', v_acc->>'nama', (v_acc->>'role')::public.user_role, v_acc->>'instansi');
  end loop;
end $$;

-- ============ hotspot_dummy (lapisan titik panas satelit mentah) ============
insert into public.hotspot_dummy (lokasi_lat, lokasi_lng, wilayah, tanggal, confidence) values
  (2.10, 100.86, 'Rokan Hilir', current_date, 78),
  (2.14, 100.79, 'Rokan Hilir', current_date, 65),
  (2.06, 100.91, 'Rokan Hilir', current_date - 1, 82),
  (2.20, 100.84, 'Rokan Hilir', current_date - 2, 55),
  (2.03, 100.88, 'Rokan Hilir', current_date - 4, 70),
  (1.44, 102.12, 'Bengkalis', current_date, 60),
  (1.39, 102.05, 'Bengkalis', current_date - 1, 74),
  (1.52, 102.18, 'Bengkalis', current_date - 2, 45),
  (1.36, 102.09, 'Bengkalis', current_date - 3, 68),
  (1.48, 102.22, 'Bengkalis', current_date - 5, 50),
  (1.66, 101.48, 'Dumai', current_date, 85),
  (1.70, 101.41, 'Dumai', current_date - 1, 62),
  (1.60, 101.53, 'Dumai', current_date - 3, 58),
  (1.73, 101.45, 'Dumai', current_date - 6, 40),
  (0.52, 101.46, 'Pekanbaru', current_date, 48),
  (0.57, 101.39, 'Pekanbaru', current_date - 2, 55),
  (0.46, 101.52, 'Pekanbaru', current_date - 4, 63),
  (0.60, 101.44, 'Pekanbaru', current_date - 6, 38);

-- ============ tiket + laporan_warga + riwayat_tindak_lanjut ============
do $$
declare
  v_bpbd uuid;
  v_klhk uuid;
  v_dishut uuid;
  v_bmkg uuid;
  v_id uuid;
begin
  select id into v_bpbd from public.users where email = 'bpbd@demo.com';
  select id into v_klhk from public.users where email = 'klhk@demo.com';
  select id into v_dishut from public.users where email = 'dishut@demo.com';
  select id into v_bmkg from public.users where email = 'bmkg@demo.com';

  -- 1
  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status, instansi_ditugaskan, sla_deadline, dibuat_pada)
  values ('warga', 2.12, 100.87, 'Rokan Hilir', 'api', 88, 'Baru', 'BPBD', now() - interval '1 hours', now() - interval '7 hours')
  returning id into v_id;
  insert into public.laporan_warga (tiket_id, nama_pelapor, no_hp, deskripsi, nomor_pelacakan, dibuat_pada)
  values (v_id, 'Joko Prasetyo', '081234500001', 'Api besar terlihat di lahan gambut dekat pemukiman, asap tebal.', public.buat_nomor_pelacakan(), now() - interval '7 hours');

  -- 2
  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status, instansi_ditugaskan, sla_deadline, dibuat_pada)
  values ('warga', 1.47, 102.08, 'Bengkalis', 'asap', 55, 'Baru', 'BPBD', now() + interval '4 hours', now() - interval '2 hours')
  returning id into v_id;
  insert into public.laporan_warga (tiket_id, nama_pelapor, no_hp, deskripsi, nomor_pelacakan, dibuat_pada)
  values (v_id, 'Siti Rahma', '081234500002', 'Asap tipis mulai terlihat dari kebun sawit warga.', public.buat_nomor_pelacakan(), now() - interval '2 hours');

  -- 3
  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status, instansi_ditugaskan, sla_deadline, dibuat_pada)
  values ('warga', 1.63, 101.47, 'Dumai', 'aktivitas_ilegal', 45, 'Diverifikasi', 'KLHK', now() - interval '18 hours', now() - interval '1 days')
  returning id into v_id;
  insert into public.laporan_warga (tiket_id, nama_pelapor, no_hp, deskripsi, nomor_pelacakan, dibuat_pada)
  values (v_id, 'Ahmad Fauzi', '081234500003', 'Ada aktivitas pembukaan lahan dengan cara dibakar di malam hari.', public.buat_nomor_pelacakan(), now() - interval '1 days');
  insert into public.riwayat_tindak_lanjut (tiket_id, catatan, oleh_user, waktu)
  values (v_id, 'Tim KLHK telah melakukan verifikasi lapangan, ditemukan bekas pembakaran seluas 0.5 ha.', v_klhk, now() - interval '20 hours');

  -- 4
  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status, instansi_ditugaskan, sla_deadline, dibuat_pada)
  values ('warga', 0.55, 101.43, 'Pekanbaru', 'api', 82, 'Ditindaklanjuti', 'BPBD', now() - interval '4 hours', now() - interval '10 hours')
  returning id into v_id;
  insert into public.laporan_warga (tiket_id, nama_pelapor, no_hp, deskripsi, nomor_pelacakan, dibuat_pada)
  values (v_id, 'Dewi Lestari', '081234500004', 'Kebakaran lahan gambut meluas, warga mulai mengungsi.', public.buat_nomor_pelacakan(), now() - interval '10 hours');
  insert into public.riwayat_tindak_lanjut (tiket_id, catatan, oleh_user, waktu) values
    (v_id, 'Tim pemadam kebakaran BPBD diberangkatkan ke lokasi.', v_bpbd, now() - interval '9 hours'),
    (v_id, 'Pemadaman tahap 1 selesai, api masih membara di titik lain.', v_bpbd, now() - interval '4 hours');

  -- 5
  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status, instansi_ditugaskan, sla_deadline, dibuat_pada)
  values ('warga', 2.08, 100.83, 'Rokan Hilir', 'asap', 40, 'Selesai', 'Dinas Kehutanan', now() - interval '2 days' + interval '6 hours', now() - interval '3 days')
  returning id into v_id;
  insert into public.laporan_warga (tiket_id, no_hp, deskripsi, nomor_pelacakan, dibuat_pada)
  values (v_id, '081234500005', 'Kabut asap mengganggu aktivitas warga sekitar.', public.buat_nomor_pelacakan(), now() - interval '3 days');
  insert into public.riwayat_tindak_lanjut (tiket_id, catatan, oleh_user, waktu) values
    (v_id, 'Tim Dinas Kehutanan melakukan pengecekan sumber asap.', v_dishut, now() - interval '2 days 12 hours'),
    (v_id, 'Penanganan selesai, sumber asap sudah padam.', v_dishut, now() - interval '2 days');

  -- 6
  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status, instansi_ditugaskan, sla_deadline, dibuat_pada)
  values ('warga', 1.42, 102.15, 'Bengkalis', 'api', 91, 'Baru', 'BPBD', now() + interval '5.5 hours', now() - interval '30 minutes')
  returning id into v_id;
  insert into public.laporan_warga (tiket_id, nama_pelapor, no_hp, deskripsi, nomor_pelacakan, dibuat_pada)
  values (v_id, 'Rudi Hartono', '081234500006', 'Titik api baru muncul dekat area gambut, berpotensi meluas cepat.', public.buat_nomor_pelacakan(), now() - interval '30 minutes');

  -- 7
  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status, instansi_ditugaskan, sla_deadline, dibuat_pada)
  values ('warga', 1.68, 101.40, 'Dumai', 'asap', 58, 'Diverifikasi', 'BMKG', now() - interval '2 hours', now() - interval '8 hours')
  returning id into v_id;
  insert into public.laporan_warga (tiket_id, nama_pelapor, no_hp, deskripsi, nomor_pelacakan, dibuat_pada)
  values (v_id, 'Yuni Astuti', '081234500007', 'Kualitas udara memburuk, jarak pandang menurun drastis.', public.buat_nomor_pelacakan(), now() - interval '8 hours');
  insert into public.riwayat_tindak_lanjut (tiket_id, catatan, oleh_user, waktu)
  values (v_id, 'Indeks standar pencemar udara (ISPU) dikonfirmasi kategori tidak sehat.', v_bmkg, now() - interval '6 hours');

  -- 8
  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status, instansi_ditugaskan, sla_deadline, dibuat_pada)
  values ('warga', 0.58, 101.38, 'Pekanbaru', 'aktivitas_ilegal', 42, 'Baru', 'KLHK', now() - interval '3 hours', now() - interval '9 hours')
  returning id into v_id;
  insert into public.laporan_warga (tiket_id, nama_pelapor, no_hp, deskripsi, nomor_pelacakan, dibuat_pada)
  values (v_id, 'Bambang Sutrisno', '081234500008', 'Terlihat rombongan membuka lahan menggunakan alat berat tanpa izin.', public.buat_nomor_pelacakan(), now() - interval '9 hours');

  -- 9
  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status, instansi_ditugaskan, sla_deadline, dibuat_pada)
  values ('warga', 2.18, 100.92, 'Rokan Hilir', 'api', 76, 'Ditindaklanjuti', 'BPBD', now() - interval '18 hours', now() - interval '1 days')
  returning id into v_id;
  insert into public.laporan_warga (tiket_id, nama_pelapor, no_hp, deskripsi, nomor_pelacakan, dibuat_pada)
  values (v_id, 'Fitriani', '081234500009', 'Api merambat ke arah kebun warga, butuh bantuan segera.', public.buat_nomor_pelacakan(), now() - interval '1 days');
  insert into public.riwayat_tindak_lanjut (tiket_id, catatan, oleh_user, waktu) values
    (v_id, 'Tim gabungan BPBD-Manggala Agni tiba di lokasi.', v_bpbd, now() - interval '22 hours'),
    (v_id, 'Sekat kanal dibangun untuk mencegah perambatan api.', v_bpbd, now() - interval '10 hours');

  -- 10
  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status, instansi_ditugaskan, sla_deadline, dibuat_pada)
  values ('warga', 1.50, 102.05, 'Bengkalis', 'asap', 35, 'Selesai', 'Dinas Kehutanan', now() - interval '3 days' + interval '6 hours', now() - interval '4 days')
  returning id into v_id;
  insert into public.laporan_warga (tiket_id, nama_pelapor, no_hp, deskripsi, nomor_pelacakan, dibuat_pada)
  values (v_id, 'Herman Wijaya', '081234500010', 'Asap dari lahan bekas terbakar musim lalu masih tersisa.', public.buat_nomor_pelacakan(), now() - interval '4 days');
  insert into public.riwayat_tindak_lanjut (tiket_id, catatan, oleh_user, waktu)
  values (v_id, 'Lahan sudah dipastikan aman, tidak ada titik panas baru.', v_dishut, now() - interval '3 days 6 hours');

  -- 11
  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status, instansi_ditugaskan, sla_deadline, dibuat_pada)
  values ('warga', 1.58, 101.52, 'Dumai', 'api', 95, 'Baru', 'BPBD', now() + interval '5.75 hours', now() - interval '15 minutes')
  returning id into v_id;
  insert into public.laporan_warga (tiket_id, no_hp, deskripsi, nomor_pelacakan, dibuat_pada)
  values (v_id, '081234500011', 'Kobaran api besar terlihat dari jalan lintas Dumai-Duri.', public.buat_nomor_pelacakan(), now() - interval '15 minutes');

  -- 12
  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status, instansi_ditugaskan, sla_deadline, dibuat_pada)
  values ('warga', 0.48, 101.50, 'Pekanbaru', 'asap', 48, 'Diverifikasi', 'BMKG', now() + interval '1 hours', now() - interval '5 hours')
  returning id into v_id;
  insert into public.laporan_warga (tiket_id, nama_pelapor, no_hp, deskripsi, nomor_pelacakan, dibuat_pada)
  values (v_id, 'Agus Salim', '081234500012', 'Bau asap tercium hingga ke pusat kota.', public.buat_nomor_pelacakan(), now() - interval '5 hours');
  insert into public.riwayat_tindak_lanjut (tiket_id, catatan, oleh_user, waktu)
  values (v_id, 'Sedang dilakukan pemantauan arah angin dan sebaran asap.', v_bmkg, now() - interval '3 hours');

  -- Tiket bersumber satelit (tanpa laporan_warga)
  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status, instansi_ditugaskan, sla_deadline, dibuat_pada)
  values ('satelit', 2.05, 100.80, 'Rokan Hilir', 'hotspot_satelit', 80, 'Baru', 'BPBD', now() + interval '3 hours', now() - interval '3 hours');

  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status, instansi_ditugaskan, sla_deadline, dibuat_pada)
  values ('satelit', 1.38, 102.20, 'Bengkalis', 'hotspot_satelit', 65, 'Ditindaklanjuti', 'Dinas Kehutanan', now() - interval '6 hours', now() - interval '12 hours')
  returning id into v_id;
  insert into public.riwayat_tindak_lanjut (tiket_id, catatan, oleh_user, waktu)
  values (v_id, 'Hasil analisis citra satelit menunjukkan titik panas confidence tinggi, tim dikerahkan.', v_dishut, now() - interval '10 hours');

  insert into public.tiket (sumber, lokasi_lat, lokasi_lng, wilayah, kategori, skor_risiko, status, instansi_ditugaskan, sla_deadline, dibuat_pada)
  values ('satelit', 1.72, 101.38, 'Dumai', 'hotspot_satelit', 55, 'Selesai', 'BPBD', now() - interval '1 days' + interval '6 hours', now() - interval '2 days')
  returning id into v_id;
  insert into public.riwayat_tindak_lanjut (tiket_id, catatan, oleh_user, waktu)
  values (v_id, 'Titik panas satelit terkonfirmasi merupakan pembakaran sampah skala kecil, sudah ditangani.', v_bpbd, now() - interval '1 days 12 hours');
end $$;
