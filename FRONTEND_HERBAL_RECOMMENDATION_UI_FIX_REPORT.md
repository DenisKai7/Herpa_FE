# Frontend Herbal Recommendation UI Fix Report

Laporan hasil perbaikan antarmuka pengguna (UI/UX) fitur **Rekomendasi Obat Herbal** pada HERPA Frontend.

---

## 1. File Frontend Yang Diubah / Dibuat

1. **`src/lib/herbalRecommendationNormalize.ts`** *(Baru)*
   - Berisi fungsi helper dan normalizer data rekomendasi herbal untuk mengatasi inkonsistensi label relevansi, status data, keamanan, dan tingkat bukti medis.
2. **`src/lib/api/herbalRecommendation.ts`** *(Diubah)*
   - Menambahkan fungsi `getHerbRecommendationDetail` untuk pemanggilan API lazy load detail herbal.
3. **`src/app/recommendation/page.tsx`** *(Diubah)*
   - Refaktor badge card rekomendasi, mengimplementasikan lazy detail drawer dengan memicu pemanggilan API, menambahkan filter normalisasi, dan mengimplementasikan friendly empty state dengan saran pencarian.
4. **`src/lib/api/herbalRecommendation.contract.test.ts`** *(Diubah)*
   - Menambahkan 11 unit/contract test baru untuk memvalidasi kelayakan fungsionalitas normalizer, badge, detail fallback, dan data status.

---

## 2. Helper Frontend yang Dibuat (`herbalRecommendationNormalize.ts`)

- `resolveHerbId`: Mendapatkan ID herbal yang valid (`herb_id` atau `plant_id`).
- `getRelevancePercent`: Menghitung persentase relevansi dari score utama.
- `getRelevanceLabel` & `getRelevanceBadgeText`: Menghindari teks kontradiktif seperti `Relevansi tinggi (0%)`.
- `getDataStatusLabel`: Mendeteksi kelengkapan data secara dinamis dari detail knowledge graph.
- `getSafetyLabelV2`: Penentuan status keamanan yang lebih aman dan faktual.
- `getEvidenceLabelV2`: Menentukan tingkat bukti dengan fallback ketersediaan data tradisional.
- `formatSafetyFieldStatus`: Memformat status warning/kontraindikasi (misal `missing` menjadi `belum tercatat`).

---

## 3. Perubahan Card Label (Sebelum vs Sesudah)

| Kasus | Tampilan Sebelum Perbaikan | Tampilan Sesudah Perbaikan |
|---|---|---|
| **Relevansi & Gejala** | `Relevansi tinggi (0%)` | `Kandidat awal (0%)` atau `Relevansi tinggi (85%)` |
| **Data Status** | `Data belum dapat dipastikan` | `Data tradisional tersedia` / `Didukung knowledge graph` |
| **Tingkat Bukti** | `Data bukti belum tersedia` (walau ada data tradisional) | `Data tradisional tersedia` |
| **Keamanan** | `Perlu perhatian` secara default | `Relatif aman` / `Perlu perhatian` / `Data keamanan belum cukup` |

---

## 4. Hasil Validasi Build

Perintah `npm run build` dijalankan dan lulus dengan sukses tanpa adanya peringatan/kesalahan tipe TypeScript baru.
Semua unit test di `herbalRecommendation.contract.test.ts` lulus 100%.

---

## 5. Fitur Lain yang Dipastikan Tidak Disentuh

- Fitur Chat UI & General Chat page.
- Auth page & Login flow.
- Admin dashboard & panel.
- Supabase client & MinIO storage handler.
- Backend routing & controllers.
- Schema database PostgreSQL & Neo4j.
