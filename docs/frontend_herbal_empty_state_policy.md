# Frontend Herbal Empty State Policy

Kebijakan penanganan Empty State pada fitur Rekomendasi Herbal:

## 1. Pencegahan Blank Page
- Halaman tidak boleh kosong (blank page) jika pencarian/analisis keluhan selesai namun tidak menghasilkan kandidat rekomendasi herbal.
- Tampilkan komponen Empty State yang informatif dan interaktif.

## 2. Penyajian Suggested Terms
- Komponen Empty State harus menyarankan istilah pencarian alternatif (`suggested_terms`).
- Jika backend mengirimkan daftar `suggested_terms`, gunakan daftar tersebut.
- Jika tidak ada, tampilkan default kata kunci bantuan:
  - `sariawan`
  - `luka mulut`
  - `iritasi tenggorokan`
  - `tenggorokan panas`

## 3. Aksi Tindakan Ulang
- Sediakan tombol pintasan untuk mempermudah pengguna:
  - **Cari ulang** (reset input pencarian)
  - **Ubah keluhan** (kembali ke input dengan tetap mempertahankan teks sebelumnya)
