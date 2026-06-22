# Frontend Herbal Detail Drawer Policy

Kebijakan penyajian informasi pada Detail Drawer Rekomendasi Herbal:

## 1. Lazy Loading Data Detail
- **Aturan:** Detail Drawer wajib memanggil endpoint `/api/herbal-recommendations/herbs/{herb_id}/detail` secara asinkron (lazy load) saat pengguna mengklik tombol "Detail".
- **Caching:** Data detail yang telah dimuat harus disimpan/dicache dalam memori frontend (`detailByHerbId`) agar tidak memicu pemanggilan ulang jika drawer yang sama dibuka kembali.
- **Loading State:** Saat data sedang dimuat, tampilkan indikator loading yang ramah, jangan tampilkan fallback kosong.

## 2. Penggabungan Data (Data Merging)
- Data yang ditampilkan di drawer merupakan gabungan dari data ringkas dari endpoint analisis (`selectedItem`) dan data kaya dari endpoint detail (`loadedDetail`). Preferensi visual harus diberikan pada data detail jika tersedia.

## 3. Penghapusan Fallback Tidak Faktual
- Jangan gunakan teks *"Informasi ini tidak ditampilkan karena belum lolos verifikasi"* sebagai fallback jika data tidak ada di database, melainkan gunakan *"Informasi belum tersedia pada knowledge graph."*
- Peringatan Medis (Kontraindikasi, Interaksi, Kelompok Berisiko, Efek Samping) tidak boleh menampilkan kata `(missing)`. Gunakan status yang dimapping ramah seperti `belum tercatat` atau `data bertentangan`.
