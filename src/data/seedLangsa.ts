import type {
  AppBranding,
  BusinessInquiry,
  DatabaseState,
  LocationSpot,
  UserAccount,
  UserVoucher,
} from '../types';
import { createPostcardDataUrl } from '../utils/image';

export const THEME_PRESETS: {
  id: string;
  name: string;
  primaryColor: string;
  accentColor: string;
  buttonColor: string;
}[] = [
  {
    id: 'acikiwir-royal',
    name: 'ACIKIWIR Royal Blue & Amber (Default)',
    primaryColor: '#0052CC',
    accentColor: '#FFA000',
    buttonColor: '#003580',
  },
  {
    id: 'samudera-kuala',
    name: 'Samudera Sky & Gold',
    primaryColor: '#0284c7',
    accentColor: '#f59e0b',
    buttonColor: '#0369a1',
  },
  {
    id: 'mangrove-emerald',
    name: 'Emerald Mangrove',
    primaryColor: '#059669',
    accentColor: '#f59e0b',
    buttonColor: '#047857',
  },
  {
    id: 'royal-aceh',
    name: 'Meugah Amber Gold',
    primaryColor: '#d97706',
    accentColor: '#0052CC',
    buttonColor: '#b45309',
  },
  {
    id: 'kreatif-indigo',
    name: 'Nusantara Indigo',
    primaryColor: '#4338ca',
    accentColor: '#FFA000',
    buttonColor: '#312e81',
  },
];

export const DEFAULT_BRANDING: AppBranding = {
  appName: 'ACIKIWIR',
  tagline: 'Jelajah Wisata Interaktif & Misi Foto',
  primaryColor: '#0052CC',
  accentColor: '#FFA000',
  buttonColor: '#003580',
  logoType: 'image',
  logoIcon: 'camera',
  logoImageUrl: '/logo-acikiwir.jpg',
  adminWhatsApp: '081168009900',
  categoryIcons: {
    alam: 'trees',
    sejarah: 'landmark',
    taman: 'sun',
    bahari: 'anchor',
    kuliner: 'store',
  },
  defaultCenter: {
    lat: 4.4965,
    lng: 97.9865,
    zoom: 13,
  },
};

export function createSeedLocations(): LocationSpot[] {
  return [
    {
      id: 'loc-mangrove-kuala',
      qrCode: 'JL-QR-MANGROVE-001',
      name: 'Hutan Mangrove Kuala Langsa',
      category: 'alam',
      pinIcon: 'trees',
      lat: 4.521657286351418,
      lng: 98.01615887910705,
      radiusMeters: 120,
      shortDescription:
        'Kawasan ekowisata hutan bakau seluas ±8.000 hektar dengan Menara Pandang ikonik 45 meter dan jembatan lengkung kayu di atas kanopi mangrove.',
      historyDescription:
        'Hutan Mangrove Kuala Langsa merupakan salah satu ekosistem hutan bakau terlengkap di Asia Tenggara dengan lebih dari 38 spesies mangrove sejati. Menara Pandang setinggi 45 meter menyuguhkan panorama 360 derajat Selat Malaka dan kanopi hijau yang memukau.',
      operatingHours: 'Setiap Hari • 08.00 – 18.00 WIB',
      priceRange: 'Tiket Masuk Rp10.000 – Rp20.000 | Kuliner UMKM Rp15.000 – Rp45.000',
      contactName: 'Koperasi UMKM Ekowisata Mangrove (Pak Hendra)',
      contactPhone: '081260004521',
      ownerEmail: 'umkm.mangrove@gmail.com',
      merchantName: 'Koperasi UMKM Ekowisata Mangrove',
      voucherConfig: {
        enabled: true,
        title: 'Voucher Diskon 20% Kopi Sanger & Olahan Sirup Mangrove',
        discountValue: 'Diskon 20%',
        description:
          'Reward otomatis setelah menyelesaikan misi di Hutan Mangrove Kuala Langsa.',
        terms:
          'Tunjukkan Kode / QR Voucher ini ke kasir Koperasi UMKM Mangrove untuk potongan langsung.',
      },
      promos: [
        {
          id: 'pr-mangrove-1',
          title: 'Paket Kopi Sanger Dingin + Pisang Goreng Srikaya',
          description:
            'Kopi sanger racikan khas Aceh disajikan dingin bersama pisang goreng srikaya hangat di tepi hutan bakau.',
          priceText: 'Rp22.000 (Harga Normal Rp28.000)',
          promoBadge: 'Diskon 20% Voucher',
          isActive: true,
          createdAt: '2026-10-28T08:00:00.000Z',
        },
        {
          id: 'pr-mangrove-2',
          title: 'Sirup & Dodol Buah Mangrove Asli (Oleh-Oleh Khas)',
          description:
            'Minuman sehat kaya antioksidan dari buah bakau lindur & pedada hasil olahan kelompok ibu-ibu Kuala Langsa.',
          priceText: 'Rp30.000 / Botol Kemasan',
          promoBadge: 'Produk Unggulan UMKM',
          isActive: true,
          createdAt: '2026-10-29T08:00:00.000Z',
        },
      ],
      missions: [
        {
          id: 'm-mangrove-1',
          title: 'Foto Pemandangan Ikonik',
          description:
            'Abadikan sudut terbaik Jembatan Lengkung Kayu atau Menara Pandang 45m Hutan Mangrove Kuala Langsa.',
          type: 'photo',
          xpReward: 60,
        },
        {
          id: 'm-mangrove-2',
          title: 'Foto Kuliner / Produk UMKM',
          description:
            'Potret sajian Kopi Sanger dingin, Mie Kepiting Bakau, atau kerajinan sirup buah mangrove di gerai UMKM sekitar.',
          type: 'photo',
          xpReward: 60,
        },
        {
          id: 'm-mangrove-3',
          title: 'Beri Rating & Kesan Singkat',
          description:
            'Bagikan rating bintang dan pengalaman seru kamu menjelajahi udara segar hutan bakau Kuala Langsa.',
          type: 'review',
          xpReward: 40,
        },
      ],
      photos: [
        {
          id: 'ph-seed-1',
          locationId: 'loc-mangrove-kuala',
          missionId: 'm-mangrove-1',
          missionLabel: 'Foto Pemandangan Ikonik',
          userEmail: 'cut.nadia@gmail.com',
          userName: 'Cut Nadia Putri',
          imageUrl: createPostcardDataUrl({
            title: 'Jembatan Lengkung Mangrove',
            subtitle: 'Menara Pandang & Kanopi Hijau Kuala Langsa',
            bgStart: '#003580',
            bgEnd: '#0052CC',
            accent: '#FFA000',
            motif: 'mangrove',
          }),
          caption: 'Angin sepoi-sepoi dari atas jembatan lengkung mangrove luar biasa asri!',
          createdAt: '2026-10-28T09:30:00.000Z',
        },
        {
          id: 'ph-seed-2',
          locationId: 'loc-mangrove-kuala',
          missionId: 'm-mangrove-2',
          missionLabel: 'Foto Kuliner / Produk UMKM',
          userEmail: 'teuku.reza@gmail.com',
          userName: 'Teuku Reza Fahlevi',
          imageUrl: createPostcardDataUrl({
            title: 'Kopi Sanger & Sirup Mangrove',
            subtitle: 'UMKM Lokal Ekowisata Kuala Langsa',
            bgStart: '#78350f',
            bgEnd: '#FFA000',
            accent: '#fef3c7',
            motif: 'culinary',
          }),
          caption: 'Mencicipi olahan sirup buah lindur mangrove karya ibu-ibu UMKM pesisir.',
          createdAt: '2026-10-30T15:15:00.000Z',
        },
      ],
      reviews: [
        {
          id: 'rev-seed-1',
          locationId: 'loc-mangrove-kuala',
          missionId: 'm-mangrove-3',
          userEmail: 'cut.nadia@gmail.com',
          userName: 'Cut Nadia Putri',
          rating: 5,
          comment:
            'Destinasi wajib! Jembatan kayunya bersih, spot fotonya estetik, dan menara pandangnya megah sekali.',
          createdAt: '2026-10-28T09:35:00.000Z',
        },
        {
          id: 'rev-seed-2',
          locationId: 'loc-mangrove-kuala',
          missionId: 'm-mangrove-3',
          userEmail: 'teuku.reza@gmail.com',
          userName: 'Teuku Reza Fahlevi',
          rating: 5,
          comment:
            'Sangat edukatif untuk keluarga. Banyak satwa ramah dan papan informasi spesies bakau yang jelas.',
          createdAt: '2026-10-30T15:20:00.000Z',
        },
      ],
    },
    {
      id: 'loc-balee-juang',
      qrCode: 'JL-QR-BALEEJUANG-002',
      name: 'Gedung Balai Juang / Museum Kota Langsa',
      category: 'sejarah',
      pinIcon: 'landmark',
      lat: 4.471335206968261,
      lng: 97.96774289444802,
      radiusMeters: 100,
      shortDescription:
        'Bangunan cagar budaya berarsitektur kolonial Eropa tahun 1920 di jantung Kota Langsa yang kini menjadi Museum Daerah dan ikon sejarah perjuangan.',
      historyDescription:
        'Didirikan pada masa Hindia Belanda sebagai gedung Het Kantoorgebouw der Atjehsche Handel-Maatschappij, Gedung Balee Juang menjadi pusat pergerakan kemerdekaan rakyat Langsa pada 1945. Kini menyimpan artefak kesultanan, naskah kuno, dan diorama sejarah Aceh Timur & Langsa.',
      operatingHours: 'Selasa – Minggu • 08.30 – 16.30 WIB (Malam: Taman Lampu Hias)',
      priceRange: 'Tiket Museum Gratis / Donasi Sukarela | Jajanan Malam Rp10.000 – Rp25.000',
      contactName: 'Pengelola Museum & Sentra Kriya Balee Juang',
      contactPhone: '081362118890',
      merchantName: 'Sentra Kopi & Kriya Balee Juang',
      voucherConfig: {
        enabled: true,
        title: 'Voucher Potongan Rp10.000 Souvenir & Kopi Heritage',
        discountValue: 'Potongan Rp10.000',
        description:
          'Berlaku untuk pembelian miniatur Balee Juang, gantungan kunci Aceh, atau kopi alun-alun.',
        terms: 'Tukarkan pada gerai Galeri Dekranasda / UMKM pelataran Balee Juang.',
      },
      promos: [
        {
          id: 'pr-balee-1',
          title: 'Souvenir Gantungan Kunci & Pin Kupiah Meukeutop',
          description:
            'Kerajinan tangan khas pengrajin lokal Kota Langsa sebagai cinderamata kunjungan museum.',
          priceText: 'Rp15.000 – Rp35.000',
          promoBadge: 'Kriya Lokal',
          isActive: true,
          createdAt: '2026-10-29T09:00:00.000Z',
        },
      ],
      missions: [
        {
          id: 'm-balee-1',
          title: 'Foto Arsitektur Gedung Sejarah',
          description:
            'Potret fasad lengkung putih klasik Gedung Balee Juang dari pelataran depan museum.',
          type: 'photo',
          xpReward: 60,
        },
        {
          id: 'm-balee-2',
          title: 'Foto Koleksi / UMKM Sekitar Alun-Alun',
          description:
            'Abadikan koleksi favorit di dalam museum atau jajanan kopi gerobak UMKM di sekitar Lapangan Merdeka Langsa.',
          type: 'photo',
          xpReward: 50,
        },
        {
          id: 'm-balee-3',
          title: 'Beri Rating & Kesan Singkat',
          description:
            'Tuliskan kesan kamu setelah mengenal jejak sejarah Kota Langsa di Balee Juang.',
          type: 'review',
          xpReward: 40,
        },
      ],
      photos: [
        {
          id: 'ph-seed-3',
          locationId: 'loc-balee-juang',
          missionId: 'm-balee-1',
          missionLabel: 'Foto Arsitektur Gedung Sejarah',
          userEmail: 'cut.nadia@gmail.com',
          userName: 'Cut Nadia Putri',
          imageUrl: createPostcardDataUrl({
            title: 'Fasad Klasik Balee Juang',
            subtitle: 'Cagar Budaya & Museum Kota Langsa',
            bgStart: '#003580',
            bgEnd: '#FFA000',
            accent: '#fde68a',
            motif: 'heritage',
          }),
          caption: 'Arsitektur kolonial putihnya megah dan terawat rapi di pusat kota.',
          createdAt: '2026-10-29T11:00:00.000Z',
        },
      ],
      reviews: [
        {
          id: 'rev-seed-3',
          locationId: 'loc-balee-juang',
          missionId: 'm-balee-3',
          userEmail: 'cut.nadia@gmail.com',
          userName: 'Cut Nadia Putri',
          rating: 5,
          comment:
            'Pemandu museumnya ramah sekali menjelaskan sejarah perkebunan & perjuangan rakyat Langsa. Sore sampai malam lampunya cantik!',
          createdAt: '2026-10-29T11:10:00.000Z',
        },
      ],
    },
    {
      id: 'loc-hutan-kota',
      qrCode: 'JL-QR-HUTANKOTA-003',
      name: 'Taman Hutan Kota Langsa',
      category: 'taman',
      pinIcon: 'sun',
      lat: 4.490549502131046,
      lng: 97.9461458491474,
      radiusMeters: 120,
      shortDescription:
        'Ruang terbuka hijau kebanggaan warga dengan lebih dari 300 jenis tanaman, danau sepeda air, jembatan gantung kanopi, dan mini zoo edukasi.',
      historyDescription:
        'Berlokasi di Gampong Baroh Langsa Lama, Taman Hutan Kota Langsa dirancang sebagai arboretum tropis sekaligus pusat rekreasi keluarga. Pepohonan trembesi dan meranti raksasa menciptakan iklim mikro yang sejuk sepanjang hari.',
      operatingHours: 'Setiap Hari • 08.00 – 17.30 WIB',
      priceRange: 'Tiket Masuk Rp10.000 | Wahana & Kuliner UMKM Rp10.000 – Rp30.000',
      contactName: 'Pengelola RTH & Pujasera Hutan Kota Langsa',
      contactPhone: '085277441122',
      merchantName: 'Pujasera UMKM Taman Hutan Kota',
      voucherConfig: {
        enabled: true,
        title: 'Voucher Diskon 15% Rujak Aceh & Es Kelapa Muda',
        discountValue: 'Diskon 15%',
        description:
          'Segarkan diri setelah mengelilingi jembatan kanopi & danau Hutan Kota.',
        terms: 'Tunjukkan voucher pada tenant kuliner Pujasera Utama Hutan Kota.',
      },
      promos: [
        {
          id: 'pr-hutan-1',
          title: 'Rujak Aceh Buah Rumbia & Es Kelapa Muda Murni',
          description:
            'Perpaduan saus rujak buah rumbia khas Aceh yang segar, manis, dan sedikit pedas.',
          priceText: 'Rp15.000 / Porsi',
          promoBadge: 'Favorit Pengunjung',
          isActive: true,
          createdAt: '2026-10-30T10:00:00.000Z',
        },
      ],
      missions: [
        {
          id: 'm-hutan-1',
          title: 'Foto Danau / Jembatan Kanopi',
          description:
            'Ambil foto lanskap danau perahu bebek, rumah pohon Aceh, atau jembatan gantung Hutan Kota.',
          type: 'photo',
          xpReward: 55,
        },
        {
          id: 'm-hutan-2',
          title: 'Foto Kuliner / Souvenir Kreatif',
          description:
            'Potret rujak Aceh segar, es kelapa muda, atau kriya anyaman UMKM di zona kuliner taman.',
          type: 'photo',
          xpReward: 55,
        },
        {
          id: 'm-hutan-3',
          title: 'Beri Rating & Kesan Singkat',
          description:
            'Berikan penilaian kenyamanan fasilitas dan kesejukan Taman Hutan Kota Langsa.',
          type: 'review',
          xpReward: 40,
        },
      ],
      photos: [
        {
          id: 'ph-seed-4',
          locationId: 'loc-hutan-kota',
          missionId: 'm-hutan-1',
          missionLabel: 'Foto Danau / Jembatan Kanopi',
          userEmail: 'teuku.reza@gmail.com',
          userName: 'Teuku Reza Fahlevi',
          imageUrl: createPostcardDataUrl({
            title: 'Danau & Kanopi Hutan Kota',
            subtitle: 'Paru-Paru Hijau Gampong Baroh Langsa Lama',
            bgStart: '#0052CC',
            bgEnd: '#15803d',
            accent: '#FFA000',
            motif: 'park',
          }),
          caption: 'Teduh banget buat jogging pagi dan piknik bareng keluarga.',
          createdAt: '2026-11-01T08:45:00.000Z',
        },
      ],
      reviews: [
        {
          id: 'rev-seed-4',
          locationId: 'loc-hutan-kota',
          missionId: 'm-hutan-3',
          userEmail: 'teuku.reza@gmail.com',
          userName: 'Teuku Reza Fahlevi',
          rating: 4,
          comment:
            'Pohonnya rindang, ada rusa tutul dan rumah adat Aceh yang bagus untuk edukasi anak-anak.',
          createdAt: '2026-11-01T08:55:00.000Z',
        },
      ],
    },
    {
      id: 'loc-pelabuhan-kuala',
      qrCode: 'JL-QR-PELABUHAN-004',
      name: 'Pelabuhan Kuala Langsa & Pulo Teulaga Tujoh',
      category: 'bahari',
      pinIcon: 'anchor',
      lat: 4.52340030444699,
      lng: 98.02077761672405,
      radiusMeters: 110,
      shortDescription:
        'Gerbang maritim bersejarah di pesisir timur Aceh dengan panorama kapal nelayan, angin Selat Malaka, sunset keemasan, dan boga bahari segar.',
      historyDescription:
        'Sejak awal abad ke-20, Pelabuhan Kuala Langsa telah menjadi simpul perdagangan hasil bumi pesisir timur Aceh menuju Penang dan Selat Malaka. Sore hari menjadi waktu favorit wisatawan menikmati matahari terbenam sambil menyantap ikan bakar segar.',
      operatingHours: 'Setiap Hari • 06.00 – 22.00 WIB (Terbaik: 16.30 – 19.00 WIB)',
      priceRange: 'Akses Kawasan Gratis | Seafood & Kopi Pesisir Rp15.000 – Rp65.000',
      contactName: 'Komunitas Wisata Bahari Kuala Langsa',
      contactPhone: '082165439988',
      merchantName: 'Komunitas Boga Bahari Dermaga Kuala',
      voucherConfig: {
        enabled: true,
        title: 'Voucher Potongan Rp15.000 Paket Ikan Bakar Sunset',
        discountValue: 'Hemat Rp15.000',
        description:
          'Potongan spesial hidangan ikan kerapu/kakap bakar segar di tepi dermaga.',
        terms: 'Berlaku untuk makan di tempat pukul 15.00 – 21.00 WIB.',
      },
      promos: [
        {
          id: 'pr-pelabuhan-1',
          title: 'Paket Ikan Kerapu Bakar Bumbu Aceh + Nasi Hangat',
          description:
            'Ikan tangkapan nelayan hari ini dibakar dengan rempah khas pesisir timur Aceh.',
          priceText: 'Rp45.000 / Paket Lengkap',
          promoBadge: 'Spesial Sunset',
          isActive: true,
          createdAt: '2026-11-01T12:00:00.000Z',
        },
      ],
      missions: [
        {
          id: 'm-pelabuhan-1',
          title: 'Foto Panorama Dermaga & Kapal',
          description:
            'Abadikan deretan perahu nelayan tradisional atau siluet senja di tepi dermaga Kuala Langsa.',
          type: 'photo',
          xpReward: 60,
        },
        {
          id: 'm-pelabuhan-2',
          title: 'Foto Sajian Seafood / Kopi Pesisir',
          description:
            'Potret hidangan ikan bakar, udang goreng tepung, atau kopi tubruk hangat di warung tepi dermaga.',
          type: 'photo',
          xpReward: 60,
        },
        {
          id: 'm-pelabuhan-3',
          title: 'Beri Rating & Kesan Singkat',
          description: 'Ceritakan suasana senja dan keramahan warga pesisir Kuala Langsa.',
          type: 'review',
          xpReward: 40,
        },
      ],
      photos: [
        {
          id: 'ph-seed-5',
          locationId: 'loc-pelabuhan-kuala',
          missionId: 'm-pelabuhan-1',
          missionLabel: 'Foto Panorama Dermaga & Kapal',
          userEmail: 'cut.nadia@gmail.com',
          userName: 'Cut Nadia Putri',
          imageUrl: createPostcardDataUrl({
            title: 'Senja Keemasan Kuala Langsa',
            subtitle: 'Dermaga Maritim Selat Malaka',
            bgStart: '#071A3E',
            bgEnd: '#0052CC',
            accent: '#FFA000',
            motif: 'harbor',
          }),
          caption: 'Langit jingga berpadu siluet kapal kayu nelayan di ujung dermaga!',
          createdAt: '2026-11-01T17:50:00.000Z',
        },
      ],
      reviews: [
        {
          id: 'rev-seed-5',
          locationId: 'loc-pelabuhan-kuala',
          missionId: 'm-pelabuhan-3',
          userEmail: 'cut.nadia@gmail.com',
          userName: 'Cut Nadia Putri',
          rating: 5,
          comment:
            'Spot sunset paling syahdu setelah keliling hutan mangrove. Ikan kerapu bakarnya segar baru turun dari perahu!',
          createdAt: '2026-11-01T18:05:00.000Z',
        },
      ],
    },
    {
      id: 'loc-terasi-simpang-lhee',
      qrCode: 'JL-QR-TERASI-005',
      name: 'Sentra Belacan Gampong Simpang Lhee',
      category: 'kuliner',
      pinIcon: 'store',
      lat: 4.4988794710625974,
      lng: 97.96893089410344,
      radiusMeters: 100,
      shortDescription:
        'Kampung wisata kriya pangan & UMKM penghasil terasi udang rebon murni khas Langsa yang harum, gurih alami, dan diolah secara turun-temurun.',
      historyDescription:
        'Gampong Simpang Lhee dikenal luas di seluruh Aceh sebagai sentra pembuatan belacan/terasi udang rebon kualitas wahid tanpa pewarna buatan. Wisatawan dapat menyaksikan proses penjemuran udang rebon, penumbukan tradisional, hingga membeli kemasan oleh-oleh.',
      operatingHours: 'Setiap Hari • 08.00 – 18.00 WIB',
      priceRange: 'Oleh-oleh UMKM Terasi & Olahan Udang Rp15.000 – Rp50.000 / kemasan',
      contactName: 'Koperasi UMKM Terasi Simpang Lhee (Ibu Rahmah)',
      contactPhone: '081264993377',
      ownerEmail: 'umkm.terasi@gmail.com',
      merchantName: 'Koperasi Terasi Udang Rebon Simpang Lhee',
      voucherConfig: {
        enabled: true,
        title: 'Voucher Gratis 1 Pack Kerupuk Udang / Diskon 20% Terasi Rebon',
        discountValue: 'Bonus 1 Pack / 20%',
        description:
          'Dapatkan bonus kerupuk udang rebon renyah atau diskon pembelian paket oleh-oleh terasi.',
        terms: 'Tukarkan langsung kepada pengelola galeri UMKM Gampong Simpang Lhee.',
      },
      promos: [
        {
          id: 'pr-terasi-1',
          title: 'Terasi Udang Rebon Super Higienis (250gr)',
          description:
            '100% udang rebon pesisir segar tanpa pengawet dan tanpa pewarna buatan, tahan hingga 6 bulan.',
          priceText: 'Rp25.000 / Pack Vakum',
          promoBadge: 'Best Seller Oleh-Oleh',
          isActive: true,
          createdAt: '2026-11-01T09:00:00.000Z',
        },
        {
          id: 'pr-terasi-2',
          title: 'Sambal Belacan Roa & Udang Rebon Botol Siap Santap',
          description:
            'Sambal terasi khas Aceh yang sudah dimasak matang dan praktis dibawa perjalanan jauh.',
          priceText: 'Rp30.000 / Botol Kaca',
          promoBadge: 'Produk Baru',
          isActive: true,
          createdAt: '2026-11-02T09:00:00.000Z',
        },
      ],
      missions: [
        {
          id: 'm-terasi-1',
          title: 'Foto Proses Produksi Tradisional',
          description:
            'Abadikan aktivitas penjemuran udang rebon atau rumah produksi UMKM di Gampong Simpang Lhee.',
          type: 'photo',
          xpReward: 65,
        },
        {
          id: 'm-terasi-2',
          title: 'Foto Produk Oleh-Oleh UMKM',
          description:
            'Potret produk kemasan Terasi Langsa, kerupuk udang, atau sambal belacan khas Simpang Lhee.',
          type: 'photo',
          xpReward: 65,
        },
        {
          id: 'm-terasi-3',
          title: 'Beri Rating & Kesan Singkat',
          description:
            'Dukung UMKM lokal dengan memberi ulasan kualitas oleh-oleh khas Simpang Lhee!',
          type: 'review',
          xpReward: 45,
        },
      ],
      photos: [
        {
          id: 'ph-seed-6',
          locationId: 'loc-terasi-simpang-lhee',
          missionId: 'm-terasi-2',
          missionLabel: 'Foto Produk Oleh-Oleh UMKM',
          userEmail: 'teuku.reza@gmail.com',
          userName: 'Teuku Reza Fahlevi',
          imageUrl: createPostcardDataUrl({
            title: 'Terasi Udang Rebon Asli',
            subtitle: 'Oleh-Oleh Unggulan Gampong Simpang Lhee',
            bgStart: '#003580',
            bgEnd: '#0052CC',
            accent: '#FFA000',
            motif: 'culinary',
          }),
          caption: 'Aroma udang rebonnya khas banget dan kemasannya sekarang sudah modern higienis.',
          createdAt: '2026-11-02T10:15:00.000Z',
        },
      ],
      reviews: [
        {
          id: 'rev-seed-6',
          locationId: 'loc-terasi-simpang-lhee',
          missionId: 'm-terasi-3',
          userEmail: 'teuku.reza@gmail.com',
          userName: 'Teuku Reza Fahlevi',
          rating: 5,
          comment:
            'Oleh-oleh wajib kalau mampir ke Langsa! Ibu-ibu pengrajinnya ramah menjelaskan proses pembuatan dari udang segar.',
          createdAt: '2026-11-02T10:22:00.000Z',
        },
      ],
    },
  ];
}

export function createSeedUsers(): UserAccount[] {
  return [
    {
      email: 'admin@gmail.com',
      name: 'Admin Pengelola ACIKIWIR',
      role: 'admin',
      isActive: true,
      joinedAt: '2026-10-01T08:00:00.000Z',
      unlockedLocationIds: ['loc-mangrove-kuala', 'loc-balee-juang'],
      completedMissionKeys: [],
      xp: 240,
      badges: ['Pengelola Utama', 'Pelopor ACIKIWIR'],
    },
    {
      email: 'umkm.mangrove@gmail.com',
      name: 'Pak Hendra (Mitra UMKM Mangrove)',
      role: 'umkm',
      isActive: true,
      joinedAt: '2026-10-12T08:30:00.000Z',
      unlockedLocationIds: ['loc-mangrove-kuala'],
      completedMissionKeys: [],
      xp: 320,
      badges: ['Mitra Resmi UMKM', 'Duta Ekowisata'],
      managedLocationId: 'loc-mangrove-kuala',
      businessName: 'Koperasi UMKM Ekowisata Mangrove',
      businessPhone: '081260004521',
    },
    {
      email: 'umkm.terasi@gmail.com',
      name: 'Ibu Rahmah (Sentra Terasi Simpang Lhee)',
      role: 'umkm',
      isActive: true,
      joinedAt: '2026-10-15T10:00:00.000Z',
      unlockedLocationIds: ['loc-terasi-simpang-lhee'],
      completedMissionKeys: [],
      xp: 290,
      badges: ['Mitra Resmi UMKM', 'Pelestari Kuliner'],
      managedLocationId: 'loc-terasi-simpang-lhee',
      businessName: 'Koperasi Terasi Udang Rebon Simpang Lhee',
      businessPhone: '081264993377',
    },
    {
      email: 'cut.nadia@gmail.com',
      name: 'Cut Nadia Putri',
      role: 'user',
      isActive: true,
      joinedAt: '2026-10-25T09:15:00.000Z',
      unlockedLocationIds: [
        'loc-mangrove-kuala',
        'loc-balee-juang',
        'loc-pelabuhan-kuala',
      ],
      completedMissionKeys: [
        'loc-mangrove-kuala::m-mangrove-1',
        'loc-mangrove-kuala::m-mangrove-3',
        'loc-balee-juang::m-balee-1',
        'loc-balee-juang::m-balee-3',
        'loc-pelabuhan-kuala::m-pelabuhan-1',
        'loc-pelabuhan-kuala::m-pelabuhan-3',
      ],
      xp: 600,
      badges: ['Penjelajah Pesisir', 'Kontributor Foto Aktif', 'Duta Sejarah'],
    },
    {
      email: 'teuku.reza@gmail.com',
      name: 'Teuku Reza Fahlevi',
      role: 'user',
      isActive: true,
      joinedAt: '2026-10-27T13:40:00.000Z',
      unlockedLocationIds: [
        'loc-mangrove-kuala',
        'loc-hutan-kota',
        'loc-terasi-simpang-lhee',
      ],
      completedMissionKeys: [
        'loc-mangrove-kuala::m-mangrove-2',
        'loc-mangrove-kuala::m-mangrove-3',
        'loc-hutan-kota::m-hutan-1',
        'loc-hutan-kota::m-hutan-3',
        'loc-terasi-simpang-lhee::m-terasi-2',
        'loc-terasi-simpang-lhee::m-terasi-3',
      ],
      xp: 605,
      badges: ['Sahabat UMKM', 'Rimbawan Kota'],
    },
  ];
}

export function createSeedVouchers(): UserVoucher[] {
  return [
    {
      id: 'vc-seed-1',
      code: 'VC-MANGROVE-7721',
      locationId: 'loc-mangrove-kuala',
      locationName: 'Hutan Mangrove Kuala Langsa',
      merchantName: 'Koperasi UMKM Ekowisata Mangrove',
      userEmail: 'cut.nadia@gmail.com',
      userName: 'Cut Nadia Putri',
      missionId: 'm-mangrove-1',
      missionTitle: 'Foto Pemandangan Ikonik',
      title: 'Voucher Diskon 20% Kopi Sanger & Olahan Sirup Mangrove',
      discountValue: 'Diskon 20%',
      terms: 'Tunjukkan Kode / QR Voucher ini ke kasir Koperasi UMKM Mangrove.',
      status: 'active',
      issuedAt: '2026-10-28T09:32:00.000Z',
    },
    {
      id: 'vc-seed-2',
      code: 'VC-TERASI-9942',
      locationId: 'loc-terasi-simpang-lhee',
      locationName: 'Sentra Terasi Simpang Lhee',
      merchantName: 'Koperasi Terasi Udang Rebon Simpang Lhee',
      userEmail: 'teuku.reza@gmail.com',
      userName: 'Teuku Reza Fahlevi',
      missionId: 'm-terasi-2',
      missionTitle: 'Foto Produk Oleh-Oleh UMKM',
      title: 'Voucher Gratis 1 Pack Kerupuk Udang / Diskon 20% Terasi Rebon',
      discountValue: 'Bonus 1 Pack / 20%',
      terms: 'Tukarkan langsung kepada pengelola galeri UMKM Gampong Simpang Lhee.',
      status: 'active',
      issuedAt: '2026-11-02T10:16:00.000Z',
    },
    {
      id: 'vc-seed-3',
      code: 'VC-MANGROVE-3105',
      locationId: 'loc-mangrove-kuala',
      locationName: 'Hutan Mangrove Kuala Langsa',
      merchantName: 'Koperasi UMKM Ekowisata Mangrove',
      userEmail: 'teuku.reza@gmail.com',
      userName: 'Teuku Reza Fahlevi',
      missionId: 'm-mangrove-2',
      missionTitle: 'Foto Kuliner / Produk UMKM',
      title: 'Voucher Diskon 20% Kopi Sanger & Olahan Sirup Mangrove',
      discountValue: 'Diskon 20%',
      terms: 'Tunjukkan Kode / QR Voucher ini ke kasir Koperasi UMKM Mangrove.',
      status: 'redeemed',
      issuedAt: '2026-10-30T15:16:00.000Z',
      redeemedAt: '2026-10-30T15:42:00.000Z',
      redeemedByEmail: 'umkm.mangrove@gmail.com',
    },
  ];
}

export function createSeedInquiries(): BusinessInquiry[] {
  return [
    {
      id: 'inq-seed-1',
      ownerName: 'Bapak Zulkifli Hasan',
      businessName: 'Komunitas Boga Bahari Dermaga Kuala',
      email: 'umkm.dermaga@gmail.com',
      phone: '082165439988',
      targetLocationId: 'loc-pelabuhan-kuala',
      message:
        'Halo Admin ACIKIWIR, kami dari asosiasi pedagang kuliner seafood Pelabuhan Kuala Langsa ingin mengajukan pembuatan akun Owner UMKM agar bisa mengelola promo ikan bakar dan menerima redeem voucher wisatawan.',
      status: 'pending',
      createdAt: '2026-11-02T14:20:00.000Z',
    },
  ];
}

export function createInitialSeedDatabase(): DatabaseState {
  return {
    version: 4,
    branding: {
      ...DEFAULT_BRANDING,
      categoryIcons: { ...DEFAULT_BRANDING.categoryIcons },
      defaultCenter: { ...DEFAULT_BRANDING.defaultCenter },
    },
    locations: createSeedLocations(),
    users: createSeedUsers(),
    vouchers: createSeedVouchers(),
    businessInquiries: createSeedInquiries(),
  };
}
