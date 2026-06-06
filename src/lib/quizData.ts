import { QuizSessionQuestion } from '@/hooks/useQuizStore';

export const MOCK_QUIZ_DATA: Record<string, QuizSessionQuestion[]> = {
  'struktur-atom': [
    {
      id: 1,
      question: "Siapa ilmuwan yang menemukan elektron melalui percobaan sinar katode?",
      options: [
        { label: "A", text: "John Dalton" },
        { label: "B", text: "J.J. Thomson" },
        { label: "C", text: "Ernest Rutherford" },
        { label: "D", text: "Niels Bohr" }
      ],
      correct_answer: "B",
      explanation: "J.J. Thomson menemukan elektron pada tahun 1897 melalui eksperimen tabung sinar katode, membuktikan bahwa atom memiliki subpartikel bermuatan negatif."
    },
    {
      id: 2,
      question: "Partikel dasar penyusun inti atom terdiri dari...",
      options: [
        { label: "A", text: "Proton dan Elektron" },
        { label: "B", text: "Elektron dan Neutron" },
        { label: "C", text: "Proton dan Neutron" },
        { label: "D", text: "Proton, Elektron, dan Neutron" }
      ],
      correct_answer: "C",
      explanation: "Inti atom (nukleus) tersusun atas proton yang bermuatan positif dan neutron yang tidak bermuatan (netral). Elektron bergerak mengelilingi inti."
    },
    {
      id: 3,
      question: "Tentukan konfigurasi elektron dari unsur Natrium (Na) dengan nomor atom 11.",
      options: [
        { label: "A", text: "2, 8, 1" },
        { label: "B", text: "2, 8, 2" },
        { label: "C", text: "2, 8, 8" },
        { label: "D", text: "2, 9" }
      ],
      correct_answer: "A",
      explanation: "Natrium memiliki nomor atom 11, sehingga konfigurasi elektron kulit Bohr-nya adalah 2 pada kulit K, 8 pada kulit L, dan 1 pada kulit M (2, 8, 1)."
    },
    {
      id: 4,
      question: "Bilangan kuantum yang menentukan arah rotasi elektron pada porosnya adalah...",
      options: [
        { label: "A", text: "Utama (n)" },
        { label: "B", text: "Azimut (l)" },
        { label: "C", text: "Magnetik (m)" },
        { label: "D", text: "Spin (s)" }
      ],
      correct_answer: "D",
      explanation: "Bilangan kuantum spin (s) menunjukkan arah perputaran elektron pada porosnya sendiri, dengan nilai +1/2 atau -1/2."
    },
    {
      id: 5,
      question: "Isotop adalah atom-atom dari unsur yang sama yang memiliki...",
      options: [
        { label: "A", text: "Nomor massa sama tetapi nomor atom berbeda" },
        { label: "B", text: "Nomor atom sama tetapi nomor massa berbeda" },
        { label: "C", text: "Jumlah elektron valensi yang berbeda" },
        { label: "D", text: "Jumlah proton yang berbeda" }
      ],
      correct_answer: "B",
      explanation: "Isotop didefinisikan sebagai atom yang memiliki nomor atom (jumlah proton) sama, tetapi nomor massa (jumlah neutron + proton) berbeda."
    }
  ],
  'tabel-periodik': [
    {
      id: 1,
      question: "Bagaimanakah kecenderungan jari-jari atom dalam satu golongan dari atas ke bawah?",
      options: [
        { label: "A", text: "Semakin kecil karena muatan inti bertambah" },
        { label: "B", text: "Semakin besar karena jumlah kulit elektron bertambah" },
        { label: "C", text: "Tetap sama karena elektron valensinya sama" },
        { label: "D", text: "Berubah secara acak" }
      ],
      correct_answer: "B",
      explanation: "Dalam satu golongan dari atas ke bawah, jari-jari atom semakin besar karena jumlah kulit elektron terus bertambah sehingga jarak dari inti ke kulit terluar semakin jauh."
    },
    {
      id: 2,
      question: "Unsur-unsur yang terletak pada golongan VIIA disebut golongan...",
      options: [
        { label: "A", text: "Gas Mulia" },
        { label: "B", text: "Halogen" },
        { label: "C", text: "Alkali Tanah" },
        { label: "D", text: "Kalkogen" }
      ],
      correct_answer: "B",
      explanation: "Golongan VIIA dikenal sebagai golongan Halogen, yang terdiri dari Fluor (F), Klor (Cl), Brom (Br), Iodium (I), dan Astatin (At)."
    },
    {
      id: 3,
      question: "Energi minimum yang diperlukan untuk melepaskan elektron terluar dari suatu atom gas disebut...",
      options: [
        { label: "A", text: "Afinitas elektron" },
        { label: "B", text: "Elektronegativitas" },
        { label: "C", text: "Energi ionisasi" },
        { label: "D", text: "Entalpi pembentukan" }
      ],
      correct_answer: "C",
      explanation: "Energi ionisasi adalah energi minimal yang diserap oleh atom dalam fase gas untuk melepaskan elektron terikat paling lemah dari kulit terluarnya."
    },
    {
      id: 4,
      question: "Unsur dengan konfigurasi elektron terluar 3s² 3p⁴ terletak pada periode dan golongan berapa?",
      options: [
        { label: "A", text: "Periode 3, Golongan IVA" },
        { label: "B", text: "Periode 3, Golongan VIA" },
        { label: "C", text: "Periode 4, Golongan IIB" },
        { label: "D", text: "Periode 3, Golongan VIII" }
      ],
      correct_answer: "B",
      explanation: "Nomor kulit terbesar adalah 3 (Periode 3). Jumlah elektron valensi pada subkulit s dan p adalah 2 + 4 = 6 (Golongan VIA)."
    },
    {
      id: 5,
      question: "Sifat keperiodikan keelektronegatifan unsur dari kiri ke kanan dalam satu periode cenderung...",
      options: [
        { label: "A", text: "Meningkat" },
        { label: "B", text: "Menurun" },
        { label: "C", text: "Tetap" },
        { label: "D", text: "Turun lalu naik tajam" }
      ],
      correct_answer: "A",
      explanation: "Dari kiri ke kanan dalam satu periode, muatan positif inti bertambah besar dan jari-jari mengecil, sehingga gaya tarik inti terhadap elektron semakin kuat, menyebabkan keelektronegatifan bertambah."
    }
  ],
  'ikatan-kimia': [
    {
      id: 1,
      question: "Ikatan yang terbentuk akibat serah terima elektron antara atom logam dan nonlogam disebut...",
      options: [
        { label: "A", text: "Ikatan Kovalen" },
        { label: "B", text: "Ikatan Logam" },
        { label: "C", text: "Ikatan Ionik" },
        { label: "D", text: "Gaya Van der Waals" }
      ],
      correct_answer: "C",
      explanation: "Ikatan ionik terjadi akibat adanya gaya elektrostatik antara ion positif (logam yang melepas elektron) dan ion negatif (nonlogam yang menerima elektron)."
    },
    {
      id: 2,
      question: "Senyawa berikut ini yang memiliki ikatan kovalen polar adalah...",
      options: [
        { label: "A", text: "CH₄" },
        { label: "B", text: "H₂O" },
        { label: "C", text: "O₂" },
        { label: "D", text: "CO₂" }
      ],
      correct_answer: "B",
      explanation: "Air (H₂O) merupakan senyawa kovalen polar karena memiliki perbedaan keelektronegatifan yang besar antara O dan H, serta memiliki bentuk molekul asimetris (membengkok) dengan pasangan elektron bebas (PEB) pada atom O pusat."
    },
    {
      id: 3,
      question: "Ikatan kovalen koordinasi ditunjukkan oleh adanya...",
      options: [
        { label: "A", text: "Serah terima elektron antar atom yang berikatan" },
        { label: "B", text: "Penggunaan bersama pasangan elektron di mana hanya salah satu atom yang menyediakannya" },
        { label: "C", text: "Interaksi antara molekul polar" },
        { label: "D", text: "Awan elektron bebas di antara kation logam" }
      ],
      correct_answer: "B",
      explanation: "Ikatan kovalen koordinasi adalah ikatan kovalen di mana pasangan elektron yang digunakan bersama berasal dari salah satu atom saja, sedangkan atom lainnya hanya menyediakan orbital kosong."
    },
    {
      id: 4,
      question: "Gaya antar molekul yang paling kuat di antara opsi berikut adalah...",
      options: [
        { label: "A", text: "Gaya London" },
        { label: "B", text: "Ikatan Hidrogen" },
        { label: "C", text: "Gaya Dipol-dipol" },
        { label: "D", text: "Gaya dispersi" }
      ],
      correct_answer: "B",
      explanation: "Ikatan hidrogen merupakan gaya tarik menarik elektrostatik yang sangat kuat antara atom hidrogen yang terikat pada atom sangat elektronegatif (F, O, N) dengan atom elektronegatif dari molekul tetangga."
    },
    {
      id: 5,
      question: "Bentuk molekul dari gas metana (CH₄) adalah...",
      options: [
        { label: "A", text: "Linear" },
        { label: "B", text: "Segitiga Planar" },
        { label: "C", text: "Tetrahedral" },
        { label: "D", text: "Oktahedral" }
      ],
      correct_answer: "C",
      explanation: "CH₄ memiliki 4 pasangan elektron ikatan (PEI) dan 0 pasangan elektron bebas (PEB) pada atom karbon pusat, membentuk geometri molekul tetrahedral dengan sudut ikatan 109.5°."
    }
  ],
  'stoikiometri': [
    {
      id: 1,
      question: "Berapakah jumlah partikel yang terkandung dalam 1 mol zat apapun?",
      options: [
        { label: "A", text: "6.02 x 10²² partikel" },
        { label: "B", text: "6.02 x 10²³ partikel" },
        { label: "C", text: "6.02 x 10²⁴ partikel" },
        { label: "D", text: "1.20 x 10²³ partikel" }
      ],
      correct_answer: "B",
      explanation: "Jumlah partikel dalam 1 mol setara dengan bilangan Avogadro, yaitu sebesar 6.02 x 10²³ partikel/mol."
    },
    {
      id: 2,
      question: "Berapa massa dari 2 mol molekul gas karbon dioksida (CO₂)? (Ar C=12, O=16)",
      options: [
        { label: "A", text: "44 gram" },
        { label: "B", text: "88 gram" },
        { label: "C", text: "22 gram" },
        { label: "D", text: "56 gram" }
      ],
      correct_answer: "B",
      explanation: "Mr CO₂ = 12 + (2 * 16) = 44 g/mol. Maka massa = mol * Mr = 2 mol * 44 g/mol = 88 gram."
    },
    {
      id: 3,
      question: "Volume dari 1 mol gas ideal pada keadaan standar (STP: 0°C, 1 atm) adalah...",
      options: [
        { label: "A", text: "22.4 Liter" },
        { label: "B", text: "24.0 Liter" },
        { label: "C", text: "22.7 Liter" },
        { label: "D", text: "11.2 Liter" }
      ],
      correct_answer: "A",
      explanation: "Berdasarkan hukum gas ideal, pada kondisi standar (STP), volume dari 1 mol gas ideal setara dengan 22.4 Liter."
    },
    {
      id: 4,
      question: "Hukum yang menyatakan bahwa massa total zat-zat sebelum reaksi sama dengan massa total zat-zat setelah reaksi adalah...",
      options: [
        { label: "A", text: "Hukum Proust" },
        { label: "B", text: "Hukum Lavoisier" },
        { label: "C", text: "Hukum Dalton" },
        { label: "D", text: "Hukum Gay-Lussac" }
      ],
      correct_answer: "B",
      explanation: "Hukum Kekekalan Massa dikemukakan oleh Antoine Lavoisier, menyatakan bahwa massa total zat sebelum dan sesudah reaksi kimia adalah konstan (tetap) di dalam sistem tertutup."
    },
    {
      id: 5,
      question: "Pereaksi pembatas dalam suatu reaksi kimia didefinisikan sebagai...",
      options: [
        { label: "A", text: "Pereaksi yang memiliki massa paling besar" },
        { label: "B", text: "Pereaksi yang habis terlebih dahulu dalam reaksi" },
        { label: "C", text: "Pereaksi yang tersisa melimpah" },
        { label: "D", text: "Katalisator yang mempercepat reaksi" }
      ],
      correct_answer: "B",
      explanation: "Pereaksi pembatas adalah pereaksi yang membatasi jalannya reaksi karena habis bereaksi terlebih dahulu, sehingga menentukan jumlah maksimum produk yang dapat terbentuk."
    }
  ],
  'termokimia': [
    {
      id: 1,
      question: "Reaksi kimia yang menyerap kalor dari lingkungan ke sistem ditandai dengan perubahan entalpi (ΔH)...",
      options: [
        { label: "A", text: "Bernilai positif (ΔH > 0)" },
        { label: "B", text: "Bernilai negatif (ΔH < 0)" },
        { label: "C", text: "Bernilai nol" },
        { label: "D", text: "Tidak dapat ditentukan" }
      ],
      correct_answer: "A",
      explanation: "Reaksi endoterm menyerap panas dari lingkungan ke sistem, sehingga entalpi sistem bertambah dan ΔH bernilai positif."
    },
    {
      id: 2,
      question: "Hukum yang menyatakan bahwa kalor reaksi tidak bergantung pada jalannya reaksi, melainkan hanya pada keadaan awal dan akhir adalah...",
      options: [
        { label: "A", text: "Hukum Charles" },
        { label: "B", text: "Hukum Hess" },
        { label: "C", text: "Hukum Boyle" },
        { label: "D", text: "Hukum Laplace" }
      ],
      correct_answer: "B",
      explanation: "Hukum Hess (Hukum Penjumlahan Kalor) menyatakan bahwa total perubahan entalpi suatu reaksi kimia adalah sama, baik reaksi itu berlangsung dalam satu tahap maupun beberapa tahap."
    },
    {
      id: 3,
      question: "Persamaan reaksi yang melibatkan perubahan energi/panas reaksi kimia disebut...",
      options: [
        { label: "A", text: "Persamaan stoikiometri" },
        { label: "B", text: "Persamaan termokimia" },
        { label: "C", text: "Persamaan laju reaksi" },
        { label: "D", text: "Persamaan kesetimbangan" }
      ],
      correct_answer: "B",
      explanation: "Persamaan termokimia adalah persamaan reaksi kimia berimbang yang menyertakan nilai perubahan entalpi (ΔH) untuk reaksi tersebut."
    },
    {
      id: 4,
      question: "Pada reaksi eksoterm, suhu lingkungan akan...",
      options: [
        { label: "A", text: "Mengalami penurunan" },
        { label: "B", text: "Mengalami kenaikan" },
        { label: "C", text: "Tetap stabil" },
        { label: "D", text: "Menurun secara drastis" }
      ],
      correct_answer: "B",
      explanation: "Reaksi eksoterm melepaskan kalor dari sistem ke lingkungan, sehingga suhu lingkungan akan mengalami kenaikan."
    },
    {
      id: 5,
      question: "Jumlah energi yang dilepaskan/diserap pada pembakaran sempurna 1 mol senyawa dengan oksigen disebut...",
      options: [
        { label: "A", text: "Entalpi pembentukan standar" },
        { label: "B", text: "Entalpi penguraian standar" },
        { label: "C", text: "Entalpi pembakaran standar" },
        { label: "D", text: "Entalpi netralisasi standar" }
      ],
      correct_answer: "C",
      explanation: "Entalpi pembakaran standar (ΔHc°) menyatakan perubahan entalpi pada pembakaran sempurna 1 mol senyawa/unsur dengan gas oksigen pada kondisi standar."
    }
  ]
};

// Fallback generator for other topics if accessed
export function getQuestionsForTopic(topicId: string): QuizSessionQuestion[] {
  if (MOCK_QUIZ_DATA[topicId]) {
    return MOCK_QUIZ_DATA[topicId];
  }

  // Generic fallback questions generator
  const capitalizedTopic = topicId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  return [
    {
      id: 1,
      question: `Manakah konsep utama yang mendasari materi tentang ${capitalizedTopic}?`,
      options: [
        { label: "A", text: `Prinsip termodinamika molekuler dalam sistem ${capitalizedTopic}` },
        { label: "B", text: "Konsep transfer proton dan struktur ikatan kovalen polar" },
        { label: "C", text: `Aplikasi stoikiometri dan interaksi antarmolekul pada ${capitalizedTopic}` },
        { label: "D", text: "Sifat periodik unsur logam transisi" }
      ],
      correct_answer: "C",
      explanation: `Materi ${capitalizedTopic} mencakup pembahasan mendalam mengenai interaksi molekuler, hukum dasar kimia, serta perhitungan laju dan perubahan energi terkait.`
    },
    {
      id: 2,
      question: `Di bawah ini, faktor manakah yang paling memengaruhi reaksi pada ${capitalizedTopic}?`,
      options: [
        { label: "A", text: "Suhu sistem dan tekanan parsial gas" },
        { label: "B", text: "Kehadiran katalisator inert" },
        { label: "C", text: "Konsentrasi reaktan dan luas permukaan sentuh" },
        { label: "D", text: "Semua benar" }
      ],
      correct_answer: "D",
      explanation: "Kondisi fisik reaktan seperti suhu, konsentrasi, luas permukaan, serta penggunaan katalis secara kolektif memengaruhi laju dan hasil reaksi kimia."
    },
    {
      id: 3,
      question: `Salah satu aplikasi praktis konsep ${capitalizedTopic} dalam kehidupan sehari-hari adalah...`,
      options: [
        { label: "A", text: "Pembuatan pupuk urea melalui proses Haber-Bosch" },
        { label: "B", text: "Pembersihan noda air menggunakan sabun/detergen" },
        { label: "C", text: "Penggunaan baterai lithium pada perangkat elektronik" },
        { label: "D", text: "Semua opsi di atas benar" }
      ],
      correct_answer: "D",
      explanation: "Prinsip-prinsip kimia terapan diimplementasikan luas di berbagai sektor industri, manufaktur baterai, produksi pertanian, dan pembersih rumah tangga."
    },
    {
      id: 4,
      question: `Mengapa pemahaman tentang ${capitalizedTopic} sangat penting bagi pelajar kimia?`,
      options: [
        { label: "A", text: "Sebagai dasar analisis kuantitatif di laboratorium" },
        { label: "B", text: "Untuk menghafal lambang-lambang unsur berkala" },
        { label: "C", text: "Hanya untuk memenuhi syarat ujian semester" },
        { label: "D", text: "Untuk mengabaikan efek samping reaksi eksoterm" }
      ],
      correct_answer: "A",
      explanation: `Menguasai ${capitalizedTopic} membantu pelajar memiliki logika berpikir ilmiah dalam menganalisis data empiris di laboratorium kimia secara presisi.`
    },
    {
      id: 5,
      question: `Dalam eksperimen ${capitalizedTopic}, aspek keselamatan kerja terpenting yang wajib ditaati adalah...`,
      options: [
        { label: "A", text: "Memakai jas laboratorium, kacamata pelindung, dan sarung tangan medis" },
        { label: "B", text: "Menghirup gas keluaran reaksi untuk mendeteksi aromanya" },
        { label: "C", text: "Mencampur larutan pekat tanpa menggunakan lemari asam" },
        { label: "D", text: "Membuang limbah logam berat langsung ke wastafel umum" }
      ],
      correct_answer: "A",
      explanation: "Peralatan perlindungan diri (APD) dasar seperti jas lab, pelindung mata, dan sarung tangan sangat krusial untuk melindungi praktikan dari bahaya cipratan zat kimia korosif."
    }
  ];
}
