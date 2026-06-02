# Overhaul Quiz End-Screen Plan

We will overhaul the quiz completion screen inside `src/components/quiz/InteractiveQuiz.tsx` to match the exact visual fidelity and layout behavior of the Gemini Quiz screenshots.

## Steps:
1. **Extend Type Definitions:** Add optional `ExtendedQuizData` type mapping in `src/components/quiz/InteractiveQuiz.tsx` to support the custom `analisis_performa` backend payload structure.
2. **Rebuild the Score & Stats Matrix Grid:** Implement a premium dark-themed responsive 3-column row grid:
   - Card 1 (Skor): Display fractional tracker `{score}/{questions.length}`.
   - Card 2 (Akurasi): Display dynamic percentage value (e.g. `67%`).
   - Card 3 (Detail Tally): Stacked list showing Benar, Salah, Dilewati.
   - Card Styling: `bg-[#181C25]`, border `border-gray-800/60`, rounded `rounded-2xl`, padding `p-5`.
3. **Implement Expandable "Analisis Performa Saya" Panel:**
   - Establish state `showAnalysis` via `useState(false)`.
   - Collapsed state: Render a banner layout with description and pill button labeled "Analisis performa saya" with background `bg-[#004D7A] hover:bg-[#0066A3] text-[#A6E1FF] text-sm px-4 py-2 rounded-full font-medium transition-all`.
   - Expanded state: Fade/slide in a micro-dashboard detailing "Sorotan" and "Area fokus" from `quiz_data.analisis_performa` (or dynamic medical-themed fallback data based on score percentage), styled with low-opacity slate lines for list items and clean headers.
4. **Implement "Teruslah Belajar" Micro-Cards Grid:**
   - Header: "Teruslah Belajar" (`text-base font-medium text-slate-300 mt-8 mb-4`).
   - 2-Column row grid with Card A (Kartu Tanya Jawab) and Card B (Panduan belajar).
   - Styling: `bg-[#181C25]/40 border border-gray-800/50 rounded-2xl p-4`.
5. **Bottom Row Action Navigation Bar:**
   - Render "Tinjau kuis" link on the left (letting the user navigate back through their locked answers to review them, with the final question's button returning them to this dashboard).
   - Render "Pertanyaan lainnya" pill button on the right, wired to restart/reset the quiz.
6. **Ensure Styling Consistency:** Use `bg-[#0F131C]` for the main canvas container and include premium `lucide-react` icons (`Trophy`, `TrendingUp`, `Check`, `X`, `Bookmark`, `BookOpen`, `Sparkles`) to elevate data presentation.
7. **Verify Changes:** Test that compilation succeeds and the UI matches all criteria.
