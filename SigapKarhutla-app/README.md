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
