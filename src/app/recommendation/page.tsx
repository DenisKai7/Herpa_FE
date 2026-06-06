'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Search,
  Activity,
  BookOpen,
  AlertTriangle,
  FileText,
  HelpCircle,
  Sparkles,
  Info,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Herbal Database ──────────────────────────────────────────────
interface HerbalPlant {
  name: string;
  latinName: string;
  icon: string;
  description: string;
  pengolahan: string[];
  aturanPakai: string[];
  peringatan: string;
}

interface HerbalRecommendation {
  symptomKey: string;
  title: string;
  plants: HerbalPlant[];
}

const HERBAL_DATABASE: HerbalRecommendation[] = [
  {
    symptomKey: 'batuk',
    title: 'Batuk Berdahak & Tenggorokan Gatal',
    plants: [
      {
        name: 'Jahe Merah',
        latinName: 'Zingiber officinale var. rubrum',
        icon: '🫚',
        description: 'Jahe merah mengandung minyak atsiri tinggi dan gingerol yang berkhasiat sebagai antiinflamasi dan ekspektoran alami untuk mengencerkan dahak.',
        pengolahan: [
          'Cuci bersih 2 rimpang jahe merah, lalu memarkan (geprek).',
          'Rebus dengan 2 gelas air bersih (sekitar 400ml) selama 10-15 menit hingga mendidih.',
          'Saring air rebusan ke dalam cangkir dan biarkan hangat.',
          'Tambahkan 1 sendok makan madu murni sebelum diminum.'
        ],
        aturanPakai: [
          'Minum 2 kali sehari pagi dan malam sebelum tidur.',
          'Dosis maksimal 3 cangkir per hari.',
          'Disarankan diminum setelah makan untuk menghindari iritasi lambung.'
        ],
        peringatan: 'Hindari konsumsi jahe merah secara berlebihan (lebih dari 4 gram per hari) bagi penderita maag akut atau gangguan perdarahan karena jahe dapat memperlambat pembekuan darah.'
      },
      {
        name: 'Kencur',
        latinName: 'Kaempferia galanga',
        icon: '🌱',
        description: 'Kencur memiliki efek hangat yang meringankan kejang tenggorokan, mengurangi lendir, dan meredakan rasa gatal pada saluran pernapasan.',
        pengolahan: [
          'Kupas dan cuci bersih 3 ruas kencur segar.',
          'Parut kencur hingga halus, kemudian peras airnya.',
          'Campurkan air perasan kencur dengan sedikit garam dapur (seujung sendok teh).',
          'Aduk rata dan siap diminum langsung.'
        ],
        aturanPakai: [
          'Minum air perasan kencur 1 sendok makan sebanyak 3 kali sehari.',
          'Untuk anak-anak di atas 5 tahun, cukup 1/2 dosis dewasa.'
        ],
        peringatan: 'Meskipun sangat aman, konsumsi jus kencur mentah sebaiknya dibatasi bagi individu dengan refluks asam lambung tinggi (GERD) karena dapat memicu rasa hangat berlebih di ulu hati.'
      },
      {
        name: 'Jeruk Nipis',
        latinName: 'Citrus aurantiifolia',
        icon: '🍋',
        description: 'Jeruk nipis kaya akan vitamin C dan asam sitrat yang berfungsi sebagai agen antibakteri alami serta membantu melunakkan dahak.',
        pengolahan: [
          'Belah 1 buah jeruk nipis segar menjadi dua bagian.',
          'Peras air jeruk nipis ke dalam gelas.',
          'Campurkan air perasan jeruk nipis dengan 1-2 sendok makan kecap manis atau madu murni.',
          'Seduh dengan sedikit air hangat suam-suam kuku.'
        ],
        aturanPakai: [
          'Konsumsi campuran jeruk nipis dan madu/kecap 3 kali sehari masing-masing 1 sendok makan.',
          'Diminum sebelum makan untuk efek ekspektoran optimal.'
        ],
        peringatan: 'Karena keasaman asam sitrat yang sangat tinggi, penderita sakit maag (gastritis) wajib mengencerkannya dengan air hangat yang cukup dan tidak mengonsumsinya saat perut kosong.'
      }
    ]
  },
  {
    symptomKey: 'demam',
    title: 'Demam & Tubuh Hangat',
    plants: [
      {
        name: 'Sambiloto',
        latinName: 'Andrographis paniculata',
        icon: '🌿',
        description: 'Sambiloto merupakan tanaman obat pahit legendaris yang mengandung andrografolida, berperan kuat sebagai antipiretik (penurun panas) dan imunostimulan.',
        pengolahan: [
          'Ambil 10-15 lembar daun sambiloto segar, cuci bersih.',
          'Rebus daun dengan 3 gelas air hingga tersisa sekitar 1 gelas.',
          'Saring air rebusan dan biarkan dingin.',
          'Karena rasanya sangat pahit, bisa dicampurkan sedikit madu.'
        ],
        aturanPakai: [
          'Minum 1/2 gelas rebusan sambiloto, 2 kali sehari setelah makan.',
          'Hentikan penggunaan apabila demam telah turun kembali normal.'
        ],
        peringatan: 'Daun sambiloto tidak boleh dikonsumsi oleh wanita hamil karena memiliki efek abortifacient (berisiko memicu kontraksi rahim/keguguran) serta pasien yang mengonsumsi obat pengencer darah.'
      },
      {
        name: 'Temulawak',
        latinName: 'Curcuma zanthorrhiza',
        icon: '🍠',
        description: 'Temulawak memiliki kandungan kurkuminoid yang membantu meredakan inflamasi sistemik dan menurunkan suhu tubuh secara bertahap saat demam.',
        pengolahan: [
          'Iris tipis 1 rimpang temulawak segar yang sudah dibersihkan.',
          'Rebus dengan 3 gelas air bersama 1 ruas asam jawa.',
          'Biarkan mendidih hingga air menyusut menjadi setengahnya.',
          'Saring air rebusan lalu tambahkan gula aren secukupnya.'
        ],
        aturanPakai: [
          'Minum 1 cangkir hangat rebusan temulawak 2 kali sehari secara rutin.',
          'Aman diminum sebelum atau setelah makan.'
        ],
        peringatan: 'Penderita gangguan kantung empedu atau batu empedu disarankan untuk berkonsultasi dengan dokter sebelum mengonsumsi temulawak karena temulawak menstimulasi sekresi empedu.'
      }
    ]
  },
  {
    symptomKey: 'lambung',
    title: 'Sakit Maag, Asam Lambung & Kembung',
    plants: [
      {
        name: 'Kunyit',
        latinName: 'Curcuma longa',
        icon: '🟨',
        description: 'Kurkumin dalam kunyit menstimulasi pembentukan dinding mukosa lambung, mengurangi sekresi asam lambung, dan mempercepat penyembuhan luka lambung.',
        pengolahan: [
          'Kupas 2 ruas kunyit segar, cuci bersih lalu parut.',
          'Tambahkan 1/2 cangkir air matang hangat, lalu peras airnya menggunakan kain bersih.',
          'Biarkan mengendap beberapa menit, ambil air kunyit bagian atas.',
          'Campurkan 1 sendok teh madu.'
        ],
        aturanPakai: [
          'Minum air kunyit pagi hari sebelum makan atau saat perut kosong.',
          'Konsumsi secara rutin selama 1-2 minggu untuk hasil optimal.'
        ],
        peringatan: 'Wanita hamil dan penderita batu ginjal sebaiknya membatasi konsumsi kunyit karena kurkumin dosis tinggi dapat memicu kontraksi uterus atau memengaruhi absorpsi zat besi.'
      },
      {
        name: 'Daun Mint',
        latinName: 'Mentha piperita',
        icon: '🍃',
        description: 'Mentol dalam daun mint memberikan efek relaksasi pada otot lambung dan saluran pencernaan, membantu meredakan kembung dan mual.',
        pengolahan: [
          'Seduh 5-8 lembar daun mint segar dengan 1 cangkir air panas.',
          'Tutup cangkir dan biarkan terendam selama 5-10 menit.',
          'Saring teh mint hangat dan siap dinikmati.'
        ],
        aturanPakai: [
          'Minum 1 cangkir teh mint hangat setelah makan atau saat lambung terasa tidak nyaman.',
          'Dosis maksimal 3 cangkir sehari.'
        ],
        peringatan: 'Hindari daun mint bagi penderita GERD parah karena mentol dapat melemaskan sfingter esofagus bawah, yang justru berisiko memicu naiknya asam lambung ke kerongkongan.'
      }
    ]
  }
];

export default function HerbalRecommendationPage() {
  const router = useRouter();
  const [complaint, setComplaint] = useState('');
  const [activeRecommendation, setActiveRecommendation] = useState<HerbalRecommendation | null>(null);
  const [isSearched, setIsSearched] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState<HerbalPlant | null>(null);
  const [activeTab, setActiveTab] = useState<'pengolahan' | 'aturan' | 'efek'>('pengolahan');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint.trim()) return;

    const query = complaint.toLowerCase();

    // Simple key match in database
    const match = HERBAL_DATABASE.find(item =>
      query.includes(item.symptomKey) ||
      item.symptomKey.split('-').some(word => query.includes(word))
    );

    if (match) {
      setActiveRecommendation(match);
    } else {
      // General fallback if no direct match
      setActiveRecommendation({
        symptomKey: 'umum',
        title: `Rekomendasi untuk "${complaint}"`,
        plants: [
          {
            name: 'Jahe Merah',
            latinName: 'Zingiber officinale var. rubrum',
            icon: '🫚',
            description: 'Jahe merah berkhasiat sebagai penghangat tubuh alami, meningkatkan imunitas, meredakan inflamasi ringan, dan melancarkan sirkulasi darah.',
            pengolahan: [
              'Memarkan 2 rimpang jahe merah segar.',
              'Rebus dengan 2 gelas air selama 10 menit.',
              'Saring dan nikmati dengan tambahan madu.'
            ],
            aturanPakai: [
              'Minum 1-2 cangkir sehari.',
              'Lebih disukai dikonsumsi sesudah makan.'
            ],
            peringatan: 'Gunakan dosis wajar. Jangan dikonsumsi berlebihan apabila memiliki riwayat maag akut.'
          },
          {
            name: 'Kunyit',
            latinName: 'Curcuma longa',
            icon: '🟨',
            description: 'Kunyit mengandung zat kurkuminoid aktif yang berperan sebagai antioksidan kuat, penenang lambung, serta pemelihara kesehatan pencernaan.',
            pengolahan: [
              'Parut kunyit segar lalu peras airnya.',
              'Campurkan perasan kunyit dengan sedikit madu dan air hangat.'
            ],
            aturanPakai: [
              'Konsumsi 1 kali sehari di pagi hari.',
              'Sebaiknya dikonsumsi secara konsisten.'
            ],
            peringatan: 'Batasi penggunaan bagi ibu hamil dan penderita batu empedu.'
          }
        ]
      });
    }

    setIsSearched(true);
  };

  const resetSearch = () => {
    setComplaint('');
    setActiveRecommendation(null);
    setIsSearched(false);
    setSelectedPlant(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-950 dark:text-gray-50 flex flex-col relative overflow-hidden">

      {/* Top Header bar */}
      <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-40 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-purple-600" />
              <span>Rekomendasi Obat Herbal</span>
            </h1>
          </div>
        </div>
        <button
          onClick={resetSearch}
          disabled={!isSearched}
          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-30 disabled:no-underline cursor-pointer disabled:cursor-not-allowed"
        >
          Cari Ulang
        </button>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl w-full mx-auto px-6 py-8 relative">
        <AnimatePresence mode="wait">
          {!isSearched ? (
            /* Symptom Input Screen Layout */
            <motion.div
              key="input-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-lg space-y-8"
            >
              <div className="text-center space-y-3">
                <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white shadow-md">
                  <Activity className="h-7 w-7" />
                </div>
                <h2 className="text-xl md:text-2xl font-black">Apa Keluhan Kesehatan Anda?</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                  Tulis keluhan atau gejala fisik yang Anda alami di bawah. Kami akan menyarankan ramuan herbal penunjang berdasarkan tanaman obat tradisional.
                </p>
              </div>

              <form onSubmit={handleSearch} className="space-y-4">
                <div className="relative">
                  <textarea
                    rows={4}
                    value={complaint}
                    onChange={(e) => setComplaint(e.target.value)}
                    placeholder="Contoh: batuk berdahak dan tenggorokan gatal, atau asam lambung naik..."
                    className="w-full p-4 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500 transition-all placeholder:text-gray-400 leading-relaxed shadow-sm resize-none"
                    required
                  />
                  <div className="absolute right-3 bottom-3 text-xs text-gray-400 font-medium">
                    Mendukung Bahasa Indonesia
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-bold text-sm uppercase tracking-wider transition-all duration-200 shadow-md shadow-green-500/10 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                  Analisis Gejala & Cari Ramuan
                </button>
              </form>

              {/* Quick suggestions chips */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Keluhan Populer</span>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { label: 'Batuk Berdahak', text: 'batuk berdahak dan tenggorokan gatal' },
                    { label: 'Asam Lambung / Maag', text: 'sakit maag dan asam lambung naik' },
                    { label: 'Demam & Panas', text: 'badan hangat dan demam' }
                  ].map((chip) => (
                    <button
                      key={chip.label}
                      type="button"
                      onClick={() => {
                        setComplaint(chip.text);
                      }}
                      className="text-xs font-semibold px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-green-400 dark:hover:border-green-800 rounded-full transition-colors cursor-pointer"
                    >
                      {chip.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            /* NotebookLM-Style Mindmap Canvas Renderer */
            <motion.div
              key="mindmap-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center justify-center space-y-12 py-6 min-h-[450px]"
            >
              <div className="text-center space-y-1 max-w-md">
                <span className="text-[10px] font-bold tracking-widest text-green-600 dark:text-green-400 uppercase">
                  Peta Koneksi Ramuan Herbal
                </span>
                <h3 className="text-lg font-bold truncate leading-tight">
                  {activeRecommendation?.title}
                </h3>
              </div>

              {/* Mindmap canvas representation */}
              <div className="relative w-full max-w-xl h-64 md:h-80 flex items-center justify-center">
                {/* Connecting SVG lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {activeRecommendation?.plants.map((_, idx) => {
                    const total = activeRecommendation.plants.length;

                    // Angles calculation for layout positioning
                    let angle = 0;
                    if (total === 1) angle = 0;
                    else if (total === 2) angle = idx === 0 ? -45 : 45;
                    else angle = (360 / total) * idx - 90;

                    const rad = (angle * Math.PI) / 180;

                    // Radial coordinates
                    const r = 120; // Radius
                    const x2 = 50 + (r * Math.cos(rad)) / 3; // percentage x
                    const y2 = 50 + (r * Math.sin(rad)) / 2; // percentage y

                    return (
                      <line
                        key={idx}
                        x1="50%"
                        y1="50%"
                        x2={`${x2}%`}
                        y2={`${y2}%`}
                        stroke="#22c55e"
                        strokeWidth="2.5"
                        strokeDasharray="5,5"
                        className="opacity-40"
                      />
                    );
                  })}
                </svg>

                {/* Central core node */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="z-10 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-full w-24 h-24 md:w-28 md:h-28 flex flex-col items-center justify-center text-center p-3 shadow-lg shadow-green-500/20 relative"
                >
                  <Activity className="h-5 w-5 text-green-100 mb-1" />
                  <span className="text-[10px] font-black uppercase leading-tight tracking-wider">Gejala Utama</span>
                  <span className="text-[11px] font-bold truncate max-w-full leading-tight mt-0.5">
                    {activeRecommendation?.symptomKey}
                  </span>
                </motion.div>

                {/* Peripheral nodes */}
                {activeRecommendation?.plants.map((plant, idx) => {
                  const total = activeRecommendation.plants.length;

                  // Same radial angles calculations
                  let angle = 0;
                  if (total === 1) angle = 0;
                  else if (total === 2) angle = idx === 0 ? -45 : 45;
                  else angle = (360 / total) * idx - 90;

                  const rad = (angle * Math.PI) / 180;
                  const r = 120; // Radius in pixels
                  const translateX = r * Math.cos(rad);
                  const translateY = r * Math.sin(rad);

                  return (
                    <motion.div
                      key={plant.name}
                      initial={{ scale: 0, x: 0, y: 0 }}
                      animate={{ scale: 1, x: translateX, y: translateY }}
                      transition={{ type: 'spring', stiffness: 180, damping: 12, delay: 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setSelectedPlant(plant)}
                      className={cn(
                        'absolute z-10 bg-white dark:bg-gray-900 border-2 border-green-500 rounded-2xl p-3 shadow-md hover:shadow-lg transition-all cursor-pointer w-28 md:w-36 text-center select-none'
                      )}
                    >
                      <span className="text-2xl block mb-1">{plant.icon}</span>
                      <h4 className="font-bold text-xs md:text-sm text-gray-800 dark:text-gray-100 truncate">
                        {plant.name}
                      </h4>
                      <p className="text-[9px] text-gray-400 dark:text-gray-500 italic truncate mt-0.5">
                        {plant.latinName}
                      </p>
                    </motion.div>
                  );
                })}
              </div>

              <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-800 px-4 py-2.5 rounded-full inline-flex items-center gap-1.5 font-medium">
                <Info className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                <span>Klik salah satu <strong>tanaman herbal</strong> di atas untuk melihat panduan detail ilmiah.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic Context Panel Drawer (On-Click Event) */}
      <AnimatePresence>
        {selectedPlant && (
          <div className="fixed inset-0 z-50 flex justify-end">

            {/* Backdrop cover overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlant(null)}
              className="absolute inset-0 bg-black"
            />

            {/* Slide-over Drawer block */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className="relative w-full max-w-md h-full bg-white dark:bg-gray-900 shadow-2xl flex flex-col justify-between border-l border-gray-200 dark:border-gray-800 z-10"
            >
              {/* Header drawer info */}
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedPlant.icon}</span>
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-gray-50 leading-tight">
                      {selectedPlant.name}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 italic mt-0.5">
                      {selectedPlant.latinName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlant(null)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Scrollable contents info */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Description */}
                <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-normal">
                  {selectedPlant.description}
                </p>

                {/* Tab selector bar */}
                <div className="flex border-b border-gray-100 dark:border-gray-800 gap-4 text-xs font-bold uppercase tracking-wider">
                  <button
                    onClick={() => setActiveTab('pengolahan')}
                    className={cn(
                      'pb-2.5 transition-colors cursor-pointer border-b-2',
                      activeTab === 'pengolahan'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    )}
                  >
                    Cara Pengolahan
                  </button>
                  <button
                    onClick={() => setActiveTab('aturan')}
                    className={cn(
                      'pb-2.5 transition-colors cursor-pointer border-b-2',
                      activeTab === 'aturan'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    )}
                  >
                    Aturan Pakai
                  </button>
                  <button
                    onClick={() => setActiveTab('efek')}
                    className={cn(
                      'pb-2.5 transition-colors cursor-pointer border-b-2',
                      activeTab === 'efek'
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-400 hover:text-gray-600'
                    )}
                  >
                    Peringatan
                  </button>
                </div>

                {/* Tab layout details */}
                <div className="space-y-4">
                  {activeTab === 'pengolahan' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">
                        Cara Pengolahan Rumahan
                      </h4>
                      <ol className="space-y-2.5">
                        {selectedPlant.pengolahan.map((step, idx) => (
                          <li key={idx} className="flex gap-3 text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                            <span className="w-5 h-5 rounded-full bg-green-500/10 border border-green-500/20 text-green-600 font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {activeTab === 'aturan' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">
                        Aturan Konsumsi Aman
                      </h4>
                      <div className="space-y-2">
                        {selectedPlant.aturanPakai.map((rule, idx) => (
                          <div key={idx} className="flex gap-2.5 items-start bg-gray-50 dark:bg-gray-800/40 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                            <ShieldCheck className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">
                              {rule}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeTab === 'efek' && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold uppercase text-gray-400 tracking-wider">
                        Kontraindikasi & Bahaya
                      </h4>
                      {/* CRITICAL Safety alert red/amber banner box */}
                      <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/50 p-4 rounded-2xl flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-black text-red-800 dark:text-red-400 block mb-1 uppercase tracking-wide">
                            Peringatan Keamanan Medis
                          </span>
                          <p className="text-xs text-red-700 dark:text-red-300 leading-relaxed font-semibold">
                            {selectedPlant.peringatan}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Bottom footer button */}
              <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setSelectedPlant(null)}
                  className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Tutup Panduan
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
