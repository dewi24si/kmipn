alter function public.set_diperbarui_pada() set search_path = public;

-- hitung_skor_risiko dan buat_nomor_pelacakan hanya dipanggil secara internal
-- oleh submit_laporan_warga (SECURITY DEFINER), tidak perlu diekspos lewat RPC.
revoke execute on function public.hitung_skor_risiko(public.tiket_kategori, numeric, numeric) from public, anon, authenticated;
revoke execute on function public.buat_nomor_pelacakan() from public, anon, authenticated;
