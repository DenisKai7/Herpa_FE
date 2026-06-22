# Frontend Herbal Recommendation UI Fix Audit

**Date:** 2026-06-22
**Project:** HERPA Frontend (Rekomendasi Obat Herbal)

---

## 1. Masalah yang Diidentifikasi

1. **Relevansi tinggi (0%) Kontradiktif**
   - **Penyebab:** Badge Relevansi mengambil nilai dari `symptom_coverage` (yang bisa saja 0% jika tidak ada gejala yang cocok langsung secara leksikal), padahal status labelnya dipaksa dari backend `relevance_label`.
   - **Solusi:** Label dan persentase relevansi disinkronkan menggunakan score utama (`relevance_score` / `confidence` / `recommendation_score`).

2. **Blank Empty State untuk Keluhan Bebas**
   - **Penyebab:** Halaman hanya menampilkan spinner loading dan selesai tanpa hasil rekomendasi jika tidak ada kecocokan (seperti untuk `panas dalam dan sariawan`).
   - **Solusi:** Ditambahkan logic render untuk empty state khusus yang ramah dengan rekomendasi "suggested terms" (seperti `sariawan`, `luka mulut`, dll.).

3. **Lazy Detail Loading Belum Diimplementasikan**
   - **Penyebab:** Frontend hanya menampilkan data parsial dari analyze endpoint dan tidak memanggil `/api/herbal-recommendations/herbs/{herb_id}/detail`.
   - **Solusi:** Ditambahkan state `detailByHerbId`, helper `handleOpenDetail` untuk memanggil endpoint lazy detail, cache data detail per herbId, dan merge data detail dengan ringkasan card.

4. **Teks Fallback Tidak Faktual**
   - **Penyebab:** Teks fallback secara default menggunakan *"Informasi ini tidak ditampilkan karena belum lolos verifikasi."*
   - **Solusi:** Menggantinya dengan teks yang lebih faktual: *"Informasi belum tersedia pada knowledge graph."*

5. **Peringatan dengan Teks "(missing)"**
   - **Penyebab:** Menampilkan teks kasar `(missing)` dari status verifikasi.
   - **Solusi:** Menggunakan helper `formatSafetyFieldStatus` untuk memetakan status seperti `missing` menjadi `belum tercatat`, `known_issue` menjadi `tercatat`, dll.
