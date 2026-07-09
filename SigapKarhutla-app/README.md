# SIGAP KARHUTLA

Prototipe web untuk kompetisi KMIPN VIII 2026 (kategori E-Government) — platform tata kelola mitigasi kebakaran hutan dan lahan (karhutla) yang mengintegrasikan data hotspot satelit, laporan warga terverifikasi, dan workflow koordinasi lintas instansi (BPBD, KLHK, Dinas Kehutanan, BMKG).

## Tech stack

- React + Vite + Tailwind CSS v4
- Supabase (Auth, Postgres, Storage)
- react-router-dom, react-leaflet, recharts

## Struktur

Satu aplikasi, dua portal:

- **Portal Warga** (publik, tanpa login) — `src/pages/warga/*`, layout di `src/layouts/WargaLayout.jsx`
- **Portal Instansi** (perlu login) — `src/pages/instansi/*`, layout di `src/layouts/InstansiLayout.jsx`

Kode bersama: `src/lib/supabase.js` (client Supabase), `src/context/AuthContext.jsx` + `src/hooks/useAuth.js` (sesi & profil pengguna), `src/components/shared`.

## Setup lokal

```bash
npm install
cp .env.example .env   # isi VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY
npm run dev
```

## Database

Skema, RLS policy, fungsi workflow (skor risiko, nomor pelacakan, submit laporan warga), dan storage bucket foto laporan ada di `supabase/migrations/`. Jalankan urut sesuai nomor file di SQL editor project Supabase, lalu jalankan `supabase/seed.sql` untuk data dummy wilayah Riau (hotspot satelit, tiket, laporan warga, riwayat tindak lanjut) dan akun demo per role.

Akun demo Portal Instansi (password sama untuk semua): `Demo12345!`

| Email | Role |
| --- | --- |
| bpbd@demo.com | BPBD |
| klhk@demo.com | KLHK |
| dishut@demo.com | Dinas Kehutanan |
| bmkg@demo.com | BMKG/Staklim |
| pemda@demo.com | Pemda |
