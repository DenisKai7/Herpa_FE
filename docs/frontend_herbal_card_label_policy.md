# Frontend Herbal Card Label Policy

Kebijakan penulisan dan penyajian informasi pada Card Rekomendasi Herbal:

## 1. Sinkronisasi Relevansi dan Persen
- **Aturan:** Persentase relevansi harus berasal dari nilai score utama (`relevance_score` / `confidence`), bukan dari cakupan gejala leksikal (`symptom_coverage`).
- **Pengecualian:** Cakupan Gejala (`symptom_coverage`) ditampilkan secara terpisah di bagian footer/meta informasi card jika nilainya > 0%, tidak boleh digabungkan dalam badge Relevansi Utama.
- **Tingkatan Relevansi:**
  - Score >= 75%: **Relevansi tinggi**
  - Score >= 50%: **Relevansi sedang**
  - Score >= 25%: **Relevansi rendah**
  - Score < 25%: **Kandidat awal**

## 2. Kategori Data Status
- Jangan tampilkan "Data belum dapat dipastikan" secara default. Gunakan helper untuk mendeteksi ketersediaan data secara faktual:
  - Ada references/evidence sources: **Data sumber tersedia**
  - Ada traditional uses & active compounds: **Didukung knowledge graph**
  - Ada traditional uses saja: **Data tradisional tersedia**
  - Ada preparation methods / guidelines: **Data panduan tersedia**
  - Ada active compounds saja: **Data senyawa tersedia**
  - Fallback: **Data masih terbatas**

## 3. Label Keamanan (Safety Label)
- Keamanan tidak boleh secara default dianggap "Perlu perhatian".
- Safety label disajikan berdasarkan `safety_status`:
  - `safe` / `eligible`: **Relatif aman**
  - `caution` / `conditional`: **Perlu perhatian**
  - `unsafe` / `excluded`: **Tidak aman** (hanya jika eksplisit dikirim oleh backend)
  - `unknown`: Evaluasi apakah ada kontraindikasi/interaksi tercatat. Jika ada -> **Perlu perhatian**, jika tidak ada -> **Data keamanan belum cukup**.
