import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Camera,
  CheckCircle2,
  Compass,
  MapPin,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Sparkles,
  Store,
  Ticket,
  UserCheck,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useDeviceTier } from '../utils/useDeviceTier';

export const HowToUseModal: React.FC = () => {
  const {
    branding,
    isHowToUseOpen,
    setIsHowToUseOpen,
    setActiveNavTab,
    openQrScannerTrigger,
    openAuthModal,
    quickSwitchDemoRole,
    currentUser,
  } = useApp();
  const device = useDeviceTier();
  const [activeGuideTab, setActiveGuideTab] = useState<'wisatawan' | 'umkm'>('wisatawan');

  if (!isHowToUseOpen) return null;

  const touristSteps = [
    {
      step: '01',
      title: 'Jelajah Peta OSM & Rute Navigasi',
      desc: 'Pilih titik wisata di peta interaktif OpenStreetMap untuk melihat deskripsi sejarah, harga tiket, jam buka, katalog promosi UMKM, serta gambar garis rute GPS menuju lokasi.',
      icon: Compass,
      badge: 'TanpaWajibLogin',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      step: '02',
      title: 'Scan QR Code di Lokasi (Geofencing)',
      desc: 'Dekati titik lokasi wisata (radius <= 120–200m) lalu tekan tombol "Scan QR". Jika belum login, masukkan @gmail.com & kode OTP 6-digit — validasi QR akan lanjut otomatis!',
      icon: QrCode,
      badge: 'ValidasiRadiusGPS',
      color: 'from-amber-500 to-orange-500',
    },
    {
      step: '03',
      title: 'Selesaikan Misi QR & Kumpulkan Poin Wisata',
      desc: 'Setelah wilayah terbuka (Area Unlocked), kerjakan misi sesuai deskripsi tiap QR misi (memotret spot ikonik, kuliner UMKM, atau memberi ulasan). Poin murni dikumpulkan (bukan poin level!).',
      icon: Camera,
      badge: 'KumpulPoinWisata',
      color: 'from-emerald-500 to-teal-600',
    },
    {
      step: '04',
      title: 'Bebas Pilih Sendiri Mau Redeem Voucher di UMKM Mana!',
      desc: 'Tukarkan Poin Wisata yang terkumpul menjadi Voucher UMKM dan pilih bebas mitra UMKM mana saja tempat Anda ingin me-redeem diskon tersebut!',
      icon: Ticket,
      badge: 'BebasPilihUMKM',
      color: 'from-purple-600 to-pink-600',
    },
  ];

  const umkmSteps = [
    {
      step: '01',
      title: 'Aturan Khusus: Akun Dibuatkan oleh Admin',
      desc: 'Pemilik UMKM atau pengelola wisata TIDAK dapat membuat akun usaha sendiri melalui registrasi biasa demi menjaga keaslian mitra resmi di setiap titik wisata.',
      icon: ShieldCheck,
      badge: 'VerifikasiMitraResmi',
      color: 'from-amber-500 to-orange-600',
    },
    {
      step: '02',
      title: 'Chat Bisnis dengan Admin Pengelola',
      desc: 'Klik menu "Masuk / Daftar" lalu pilih tab "Mitra UMKM / Wisata". Hubungi Admin via tombol Chat Bisnis WhatsApp atau kirim Form Pengajuan Akun Usaha langsung dari aplikasi.',
      icon: MessageCircle,
      badge: 'ChatBisnisAdmin',
      color: 'from-emerald-600 to-green-600',
    },
    {
      step: '03',
      title: 'Admin Mengaktifkan Akun Gmail Usaha Anda',
      desc: 'Admin memverifikasi data usaha Anda dan mengaktifkan alamat @gmail.com Anda menjadi Role "Owner UMKM" yang terhubung langsung dengan titik wisata terkait.',
      icon: UserCheck,
      badge: '1Gmail=1AkunUsaha',
      color: 'from-blue-600 to-indigo-700',
    },
    {
      step: '04',
      title: 'Kelola Usaha, Promosi & Redeem Voucher User',
      desc: 'Setelah login dengan Gmail usaha Anda, buka menu "Panel UMKM" untuk mengelola profil toko, mengunggah katalog promosi, mengatur hadiah voucher misi, dan me-redeem kode voucher milik pengunjung!',
      icon: Store,
      badge: 'DashboardUMKMLengkap',
      color: 'from-purple-600 to-indigo-600',
    },
  ];

  const activeSteps = activeGuideTab === 'wisatawan' ? touristSteps : umkmSteps;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-md p-3 sm:p-5 animate-fade-in">
      <div
        className={`relative w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92dvh] ${
          device === 'desktop'
            ? 'max-w-5xl'
            : device === 'tablet'
            ? 'max-w-3xl'
            : 'max-w-md'
        }`}
      >
        {/* Top Gradient Header */}
        <div
          className="relative px-5 py-5 sm:px-7 sm:py-6 text-white overflow-hidden shrink-0"
          style={{
            background: `linear-gradient(135deg, ${branding.primaryColor} 0%, #002855 100%)`,
          }}
        >
          <div className="absolute -right-10 -top-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-inner shrink-0">
                <BookOpen className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 text-[11px] font-semibold mb-1">
                  <Sparkles className="w-3 h-3" /> Panduan Interaktif Penggunaan
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  Cara Pakai {branding.appName} (How to Use)
                </h2>
                <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5">
                  Panduan lengkap untuk Wisatawan & Pemilik UMKM / Pengelola Wisata
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsHowToUseOpen(false)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              title="Tutup Panduan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Guide Switcher Tabs */}
          <div className="mt-5 grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-slate-950/30 border border-white/15 relative z-10">
            <button
              onClick={() => setActiveGuideTab('wisatawan')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeGuideTab === 'wisatawan'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'text-blue-100 hover:bg-white/10'
              }`}
            >
              <Compass className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Panduan Wisatawan (User)</span>
            </button>
            <button
              onClick={() => setActiveGuideTab('umkm')}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition ${
                activeGuideTab === 'umkm'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-amber-100 hover:bg-white/10'
              }`}
            >
              <Store className="w-4 h-4 shrink-0" />
              <span>Panduan Owner UMKM & Wisata</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/70">
          {/* Highlight Callout Banner */}
          {activeGuideTab === 'wisatawan' ? (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-amber-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Ticket className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Kumpulkan Poin Wisata &amp; Bebas Pilih Sendiri Tempat Redeem Voucher UMKM!
                  </h3>
                  <p className="text-xs font-medium text-slate-700 mt-0.5 leading-relaxed">
                    Poin dari Scan QR dan penyelesaian Misi QR hanya dikumpulkan sebagai <strong>Saldo Poin Wisata (bukan poin level)</strong>. Anda bebas memilih mitra UMKM mana saja untuk me-redeem voucher diskon Anda!
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsHowToUseOpen(false);
                  openQrScannerTrigger();
                }}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition"
              >
                <QrCode className="w-4 h-4" />
                Coba Scan QR
              </button>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border border-amber-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Khusus Pemilik UMKM & Pengelola Wisata: Akun Dibuatkan Admin
                  </h3>
                  <p className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                    Untuk mencegah klaim sepihak atas tempat usaha, pemilik UMKM <strong>tidak bisa mendaftar sendiri</strong>. Silakan <strong>Chat Bisnis dengan Admin</strong> agar Admin membuatkan akun usaha Anda.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsHowToUseOpen(false);
                  openAuthModal();
                }}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-extrabold shadow-sm flex items-center justify-center gap-1.5 transition"
              >
                <MessageCircle className="w-4 h-4" />
                Chat Bisnis Admin
              </button>
            </div>
          )}

          {/* Multi-Device Step Cards Grid */}
          <div
            className={`grid gap-3.5 ${
              device === 'desktop'
                ? 'grid-cols-2'
                : device === 'tablet'
                ? 'grid-cols-2'
                : 'grid-cols-1'
            }`}
          >
            {activeSteps.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.step}
                  className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${item.color} text-white flex items-center justify-center shadow-sm shrink-0`}
                    >
                      <IconComp className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                          LANGKAH {item.step}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          #{item.badge}
                        </span>
                      </div>
                      <h4 className="text-sm font-extrabold text-slate-900 leading-snug">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual Flow Summary (Alur Voucher & Redeem) */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-500" />
              Alur Ekosistem Wisatawan ↔ UMKM ↔ Admin {branding.appName}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                <div className="font-extrabold text-blue-900 flex items-center gap-1.5 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  1. Wisatawan Selesaikan Misi
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Datang ke titik wisata, scan QR dalam radius GPS, unggah foto misi/review, dan terima <strong>Kode Voucher Unik</strong>.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-100">
                <div className="font-extrabold text-amber-900 flex items-center gap-1.5 mb-1">
                  <Store className="w-3.5 h-3.5 text-amber-600" />
                  2. Owner UMKM Redeem Voucher
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Wisatawan menunjukkan kode/QR voucher di kasir UMKM. Owner UMKM memasukkan kode di <strong>Panel UMKM</strong> untuk memvalidasi diskon.
                </p>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                <div className="font-extrabold text-emerald-900 flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  3. Admin Pantau & Kelola Mitra
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Admin menerima Chat Bisnis dari pemilik usaha baru, membuatkan akun UMKM, serta memoderasi titik lokasi & galeri foto.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Quick Actions & Hackathon Demo Shortcuts */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-500 mr-1">
              Simulasi Cepat Role (Demo):
            </span>
            <button
              onClick={() => {
                quickSwitchDemoRole('user');
                setIsHowToUseOpen(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                currentUser?.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Wisatawan
            </button>
            <button
              onClick={() => {
                quickSwitchDemoRole('umkm');
                setIsHowToUseOpen(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                currentUser?.role === 'umkm'
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
              }`}
            >
              Owner UMKM
            </button>
            <button
              onClick={() => {
                quickSwitchDemoRole('admin');
                setIsHowToUseOpen(false);
              }}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                currentUser?.role === 'admin'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              Admin
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => {
                setIsHowToUseOpen(false);
                setActiveNavTab('passport');
              }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
            >
              Buka Dompet Voucher
            </button>
            <button
              onClick={() => setIsHowToUseOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition"
              style={{ backgroundColor: branding.buttonColor }}
            >
              Mengerti & Mulai Jelajah
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
