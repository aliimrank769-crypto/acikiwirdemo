import React, { useEffect, useState } from 'react';
import {
  Award,
  Camera,
  CheckCircle2,
  Coins,
  Compass,
  Copy,
  Lock,
  LogIn,
  LogOut,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkles,
  Store,
  Ticket,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { LocationSpot, UserVoucher } from '../types';
import { formatRelativeTime } from '../utils/geo';
import { DynamicIcon, getCategoryMeta } from '../utils/icons';
import {
  buildLocationQrUrl,
  generateQrDataUrl,
  generateVoucherQrDataUrl,
} from '../utils/qr';

export const UserPassportModal: React.FC = () => {
  const {
    branding,
    locations,
    vouchers,
    currentUser,
    openAuthModal,
    logout,
    setActiveNavTab,
    setSelectedLocationId,
    flyToCoords,
    openUnlockedAreaModal,
    openQrScannerTrigger,
    claimVoucherWithPoints,
    changeVoucherLocation,
    redeemUserVoucher,
    pushToast,
  } = useApp();

  const [selectedExchangeLocId, setSelectedExchangeLocId] = useState<string>('any');
  const [selectedVoucherForQr, setSelectedVoucherForQr] = useState<UserVoucher | null>(
    null
  );
  const [voucherQrDataUrl, setVoucherQrDataUrl] = useState<string>('');
  const [qrInspectSpot, setQrInspectSpot] = useState<LocationSpot | null>(null);
  const [qrInspectDataUrl, setQrInspectDataUrl] = useState<string>('');

  useEffect(() => {
    if (!selectedVoucherForQr) {
      setVoucherQrDataUrl('');
      return;
    }
    let active = true;
    generateVoucherQrDataUrl(selectedVoucherForQr.code, branding.primaryColor).then(
      (url) => {
        if (active) setVoucherQrDataUrl(url);
      }
    );
    return () => {
      active = false;
    };
  }, [branding.primaryColor, selectedVoucherForQr]);

  useEffect(() => {
    if (!qrInspectSpot) {
      setQrInspectDataUrl('');
      return;
    }
    let active = true;
    generateQrDataUrl(
      buildLocationQrUrl(qrInspectSpot.qrCode),
      branding.buttonColor
    ).then((url) => {
      if (active) setQrInspectDataUrl(url);
    });
    return () => {
      active = false;
    };
  }, [qrInspectSpot, branding.buttonColor]);

  if (!currentUser) {
    return (
      <div className="flex h-full w-full flex-1 flex-col items-center justify-center bg-slate-100 p-6 pb-[82px] md:pb-6 text-center z-[510]">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-blue-100 bg-white p-1.5 shadow-md">
            {branding.logoType === 'image' && branding.logoImageUrl ? (
              <img
                src={branding.logoImageUrl}
                alt={branding.appName}
                className="h-full w-full object-contain"
              />
            ) : (
              <Award
                className="h-10 w-10"
                style={{ color: branding.primaryColor }}
              />
            )}
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Paspor Wisatawan, Poin &amp; Dompet Voucher {branding.appName}
          </h2>
          <p className="mt-2 text-xs md:text-sm font-medium leading-relaxed text-slate-700">
            Masuk dengan akun Gmail OTP (<strong>1 Gmail = 1 Akun</strong>) untuk
            mengumpulkan <strong>Saldo Poin Wisata</strong> (bukan poin level!) dari Scan QR &amp; Misi, lalu tukarkan dan redeem voucher <strong>bebas di mitra UMKM mana saja pilihan Anda</strong>!
          </p>
          <button
            type="button"
            onClick={openAuthModal}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-xs md:text-sm font-extrabold text-white shadow-md transition hover:brightness-110 active:scale-95"
            style={{ backgroundColor: branding.primaryColor }}
          >
            <LogIn className="h-4 w-4" />
            <span>Masuk / Daftar dengan Gmail OTP</span>
          </button>
        </div>
      </div>
    );
  }

  const userPhotos = locations.flatMap((loc) =>
    loc.photos
      .filter((p) => p.userEmail.toLowerCase() === currentUser.email.toLowerCase())
      .map((p) => ({ ...p, locationName: loc.name }))
  );

  const myVouchers = vouchers.filter(
    (v) => v.userEmail.toLowerCase() === currentUser.email.toLowerCase()
  );
  const activeVouchersCount = myVouchers.filter((v) => v.status === 'active').length;

  const unlockedCount = currentUser.unlockedLocationIds.length;
  const progressPct = locations.length
    ? Math.round((unlockedCount / locations.length) * 100)
    : 0;

  const selectedExchangeSpot =
    selectedExchangeLocId !== 'any'
      ? locations.find((l) => l.id === selectedExchangeLocId) ?? null
      : null;
  const exchangePointCost = selectedExchangeSpot?.voucherConfig?.pointCost ?? 80;

  const handleCopyCode = (code: string) => {
    navigator.clipboard?.writeText(code);
    pushToast({
      type: 'success',
      title: 'Kode Voucher Disalin',
      message: `Kode ${code} siap di-redeem bebas di UMKM pilihan Anda.`,
    });
  };

  return (
    <div className="thin-scrollbar flex h-full w-full flex-1 flex-col overflow-y-auto bg-slate-100 pb-[74px] md:pb-6 z-[510]">
      {/* ===================================================================
          TOP PASSPORT & SALDO POIN WISATA BANNER (High-Contrast, No Levels!)
         =================================================================== */}
      <div
        className="shrink-0 px-4 pb-6 pt-5 md:px-6 lg:px-8 lg:py-6 text-white shadow-md"
        style={{
          background: `linear-gradient(135deg, #071A3E 0%, ${branding.primaryColor} 100%)`,
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Identity & Role */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3.5">
                <div
                  className="flex h-14 w-14 md:h-16 md:w-16 shrink-0 items-center justify-center rounded-2xl text-xl md:text-2xl font-extrabold text-slate-950 shadow-lg ring-4 ring-white/20"
                  style={{ backgroundColor: branding.accentColor }}
                >
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <h2 className="text-base md:text-xl font-extrabold text-white">
                      {currentUser.name}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                        currentUser.role === 'admin'
                          ? 'bg-amber-400 text-slate-950'
                          : currentUser.role === 'umkm'
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {currentUser.role === 'umkm' ? 'OWNER UMKM' : currentUser.role}
                    </span>
                    <span className="rounded-full bg-amber-400/20 border border-amber-300/40 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-200">
                      Poin Dikumpul untuk Redeem Voucher Bebas
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs md:text-sm font-medium text-blue-100">
                    {currentUser.email}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="lg:hidden flex items-center gap-1 rounded-xl bg-white/15 px-3 py-2 text-xs font-extrabold text-white hover:bg-white/25"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Keluar</span>
              </button>
            </div>

            {/* Saldo Poin Wisata Terkumpul (Bukan Poin Level!) + Scan QR CTA */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:w-[480px]">
              <div className="flex-1 rounded-2xl bg-slate-950/45 p-3.5 backdrop-blur-sm border border-white/15">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
                    <Coins className="h-4 w-4" />
                    Saldo Poin Wisata Terkumpul
                  </span>
                  <span className="rounded-lg bg-amber-400 px-2.5 py-0.5 text-xs font-extrabold text-slate-950">
                    {currentUser.xp} Poin
                  </span>
                </div>
                <p className="mt-1 text-[11px] font-medium leading-snug text-blue-100">
                  Poin murni dikumpulkan (bukan poin level) dan bebas ditukarkan menjadi voucher di UMKM mana saja pilihan Anda.
                </p>
              </div>

              <button
                type="button"
                onClick={() => openQrScannerTrigger()}
                className="hidden sm:flex shrink-0 items-center justify-center gap-1.5 rounded-2xl px-4 py-3.5 text-xs font-extrabold text-slate-950 shadow-lg transition hover:brightness-105"
                style={{ backgroundColor: branding.accentColor }}
              >
                <QrCode className="h-4 w-4" />
                <span>Scan QR Baru</span>
              </button>
            </div>
          </div>

          {/* 4-Stat Summary Strip */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:gap-4">
            <div className="rounded-2xl bg-slate-950/35 border border-white/10 p-3 text-center">
              <p className="text-lg md:text-2xl font-extrabold text-amber-300">
                {currentUser.xp} Poin
              </p>
              <p className="text-[10.5px] md:text-xs font-bold text-blue-100">
                Saldo Poin Wisata
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950/35 border border-white/10 p-3 text-center">
              <p className="text-lg md:text-2xl font-extrabold text-emerald-300">
                {activeVouchersCount} Aktif
              </p>
              <p className="text-[10.5px] md:text-xs font-bold text-blue-100">
                Voucher Bebas Redeem ({myVouchers.length})
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950/35 border border-white/10 p-3 text-center">
              <p className="text-lg md:text-2xl font-extrabold text-white">
                {unlockedCount}/{locations.length}
              </p>
              <p className="text-[10.5px] md:text-xs font-bold text-blue-100">
                Stempel Wilayah ({progressPct}%)
              </p>
            </div>
            <div className="rounded-2xl bg-slate-950/35 border border-white/10 p-3 text-center">
              <p className="text-lg md:text-2xl font-extrabold text-sky-200">
                {userPhotos.length}
              </p>
              <p className="text-[10.5px] md:text-xs font-bold text-blue-100">
                Foto Misi Komunitas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================
          MULTI-DEVICE BODY (Clean, Non-Overlapping, High-Contrast)
         =================================================================== */}
      <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6">
          {/* Right Sidebar Column on Desktop (4/12), Left Column on Tablet (5/12) */}
          <div className="space-y-4 md:col-span-5 lg:col-span-4 lg:order-2">
            {/* ================= TUKAR POIN WISATA KE VOUCHER BEBAS PILIH UMKM ================= */}
            <div className="rounded-3xl border-2 border-amber-400 bg-white p-4 md:p-5 shadow-md space-y-3.5">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-sm">
                  <Coins className="h-6 w-6" />
                </div>
                <div>
                  <span className="inline-block rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-amber-950">
                    Bebas Pilih Tempat Redeem
                  </span>
                  <h3 className="mt-1 text-sm font-extrabold text-slate-900">
                    Tukar Poin Jadi Voucher UMKM
                  </h3>
                  <p className="text-[11px] font-medium text-slate-700">
                    Gunakan Poin Wisata yang terkumpul untuk membuat voucher di UMKM mana saja yang Anda inginkan!
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-extrabold text-slate-800">
                  Pilih Lokasi UMKM Tujuan Redeem:
                </label>
                <select
                  value={selectedExchangeLocId}
                  onChange={(e) => setSelectedExchangeLocId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-xs font-extrabold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                >
                  <option value="any">
                    🌟 Bebas Redeem di Semua Mitra UMKM (Fleksibel)
                  </option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      🏪 {loc.merchantName || `UMKM ${loc.name}`} ({loc.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Keuntungan Voucher:</span>
                  <span className="font-extrabold text-emerald-700">
                    {selectedExchangeSpot?.voucherConfig?.discountValue ||
                      'Potongan Belanja UMKM Rp 10.000'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Biaya Tukar Poin:</span>
                  <span className="font-extrabold text-amber-900">
                    {exchangePointCost} Poin Wisata
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700">Saldo Poin Anda:</span>
                  <span className="font-extrabold text-blue-900">
                    {currentUser.xp} Poin Wisata
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => claimVoucherWithPoints(selectedExchangeLocId)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#071A3E] py-3 text-xs font-extrabold text-amber-300 shadow-md transition hover:bg-slate-900 active:scale-95"
              >
                <Ticket className="h-4 w-4" />
                <span>Tukar {exchangePointCost} Poin Jadi Voucher Sekarang</span>
              </button>
            </div>

            {/* UMKM Owner Dashboard Shortcut */}
            {(currentUser.role === 'umkm' || currentUser.role === 'admin') && (
              <button
                type="button"
                onClick={() => setActiveNavTab('umkm')}
                className="flex w-full items-center justify-between rounded-3xl border-2 border-emerald-400 bg-emerald-50 p-4 text-left shadow-sm transition hover:bg-emerald-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow">
                    <Store className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-extrabold text-emerald-950">
                      Buka Panel Owner UMKM
                    </p>
                    <p className="text-[11px] font-medium text-emerald-900">
                      Redeem kode voucher pengunjung, kelola promosi &amp; usaha
                    </p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-emerald-800">→</span>
              </button>
            )}

            {/* Admin Panel Shortcut */}
            {currentUser.role === 'admin' && (
              <button
                type="button"
                onClick={() => setActiveNavTab('admin')}
                className="flex w-full items-center justify-between rounded-3xl border-2 border-blue-300 bg-blue-50 p-4 text-left shadow-sm transition hover:bg-blue-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-700 text-white shadow">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs md:text-sm font-extrabold text-blue-950">
                      Buka Admin CMS Studio
                    </p>
                    <p className="text-[11px] font-medium text-blue-900">
                      Kelola titik peta OSM, buat akun UMKM, tema &amp; moderasi
                    </p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-blue-800">→</span>
              </button>
            )}

            {/* Badges Collection Card */}
            <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-5 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-xs md:text-sm font-extrabold text-slate-900">
                <Sparkles className="h-4 w-4 text-amber-500" />
                Koleksi Lencana ({currentUser.badges.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {currentUser.badges.length === 0 ? (
                  <p className="text-xs font-medium text-slate-600">
                    Belum ada lencana. Pindai QR lokasi pertamamu untuk meraih lencana!
                  </p>
                ) : (
                  currentUser.badges.map((badge) => (
                    <span
                      key={badge}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-extrabold text-amber-950"
                    >
                      🏅 {badge}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Explorer Guide Box */}
            <div className="rounded-3xl border border-blue-200 bg-blue-50 p-4 md:p-5">
              <div className="flex items-center gap-2 text-xs font-extrabold text-blue-950">
                <Compass className="h-4 w-4 text-blue-700" />
                <span>Aturan Poin &amp; Bebas Redeem Voucher</span>
              </div>
              <ul className="mt-2.5 space-y-1.5 text-xs text-slate-800 font-medium">
                <li>
                  • Scan QR di dalam radius lokasi: <strong>+100 Poin Wisata</strong>
                </li>
                <li>
                  • Selesaikan misi QR (foto/review): <strong>+40–65 Poin + Voucher Bebas UMKM</strong>
                </li>
                <li>
                  • <strong>Poin bukan level!</strong> Poin hanya dikumpul untuk ditukar &amp; di-redeem bebas di UMKM mana saja pilihan Anda.
                </li>
              </ul>
            </div>
          </div>

          {/* Main Left Column on Desktop (8/12), Right Column on Tablet (7/12) */}
          <div className="space-y-5 md:col-span-7 lg:col-span-8 lg:order-1">
            {/* ================= DOMPET VOUCHER UMKM SAYA (BEBAS PILIH TEMPAT REDEEM) ================= */}
            <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-sm">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-base font-extrabold text-slate-900">
                      Dompet Voucher UMKM Saya ({myVouchers.length})
                    </h3>
                    <p className="text-[11px] font-medium text-slate-700">
                      Pilih bebas mitra UMKM tempat Anda ingin me-redeem setiap voucher di bawah ini!
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-900">
                  {activeVouchersCount} Siap Redeem
                </span>
              </div>

              {myVouchers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-amber-400 bg-amber-50/50 p-6 text-center">
                  <Ticket className="mx-auto mb-2 h-8 w-8 text-amber-600" />
                  <p className="text-xs font-extrabold text-slate-900">
                    Belum Ada Voucher UMKM di Dompet Anda
                  </p>
                  <p className="mt-1 text-[11px] font-medium text-slate-700">
                    Tukarkan Saldo Poin Wisata Anda di panel samping atau selesaikan misi QR lokasi untuk mendapatkan Voucher UMKM!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-2">
                  {myVouchers.map((v) => {
                    const isActive = v.status === 'active';
                    return (
                      <div
                        key={v.id}
                        className={`relative overflow-hidden rounded-2xl border-2 p-4 transition flex flex-col justify-between gap-3 ${
                          isActive
                            ? 'border-amber-400 bg-white shadow-sm'
                            : 'border-slate-200 bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
                                isActive
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              {isActive ? 'Aktif • Bebas Redeem' : 'Sudah Di-Redeem'}
                            </span>
                            <span className="truncate text-[10.5px] font-bold text-slate-600">
                              {v.missionTitle}
                            </span>
                          </div>

                          <h4 className="mt-2 text-sm font-extrabold text-slate-900">
                            {v.discountValue}
                          </h4>
                          <p className="text-xs font-extrabold text-blue-900 flex items-center gap-1 mt-0.5">
                            <Store className="h-3.5 w-3.5 shrink-0 text-blue-700" />
                            <span className="truncate">{v.merchantName}</span>
                          </p>
                          <p className="text-[11px] font-semibold text-slate-700 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3 shrink-0 text-slate-500" />
                            <span className="truncate">{v.locationName}</span>
                          </p>

                          {/* Bebas Pilih / Ubah Lokasi UMKM Tujuan Redeem */}
                          {isActive && (
                            <div className="mt-2.5 rounded-xl border border-blue-200 bg-blue-50/70 p-2">
                              <label className="block text-[10px] font-extrabold uppercase text-blue-950 mb-1">
                                Pilih Sendiri Mau Redeem di UMKM Mana:
                              </label>
                              <select
                                value={v.locationId || 'any'}
                                onChange={(e) =>
                                  changeVoucherLocation(v.id, e.target.value)
                                }
                                className="w-full rounded-lg border border-blue-300 bg-white px-2.5 py-1.5 text-[11px] font-extrabold text-slate-900 focus:outline-none"
                              >
                                <option value="any">
                                  🌟 Bebas di Semua Mitra UMKM Kota Langsa
                                </option>
                                {locations.map((loc) => (
                                  <option key={loc.id} value={loc.id}>
                                    🏪 {loc.merchantName || `UMKM ${loc.name}`} ({loc.name})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>

                        <div className="pt-2.5 border-t border-slate-200 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="rounded-lg bg-[#071A3E] px-2.5 py-1 font-mono text-xs font-extrabold tracking-wider text-amber-300">
                                {v.code}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(v.code)}
                                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                                title="Salin Kode Voucher"
                              >
                                <Copy className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {isActive ? (
                              <button
                                type="button"
                                onClick={() => setSelectedVoucherForQr(v)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-amber-400 hover:bg-amber-500 px-3 py-1.5 text-xs font-extrabold text-slate-950 shadow-sm transition"
                              >
                                <QrCode className="h-3.5 w-3.5" />
                                <span>QR &amp; Redeem</span>
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800">
                                <CheckCircle2 className="h-3.5 w-3.5" /> Terpakai
                              </span>
                            )}
                          </div>

                          {isActive && (
                            <button
                              type="button"
                              onClick={() =>
                                redeemUserVoucher(
                                  v.code,
                                  v.locationId && v.locationId !== 'any'
                                    ? v.locationId
                                    : locations[0]?.id
                                )
                              }
                              className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 py-1.5 text-[11px] font-extrabold text-emerald-900 transition hover:bg-emerald-100"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                              <span>
                                Gunakan / Redeem Langsung di{' '}
                                {v.locationId && v.locationId !== 'any'
                                  ? v.locationName
                                  : locations[0]?.merchantName || 'Mitra UMKM'}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ================= DAFTAR QR LOKASI, STEMPEL & DESKRIPSI TIAP MISI QR ================= */}
            <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm md:text-base font-extrabold text-slate-900">
                    Daftar QR Lokasi &amp; Deskripsi Tiap Misi QR ({unlockedCount}/{locations.length} Terbuka)
                  </h3>
                  <p className="text-[11px] font-medium text-slate-700">
                    Setiap lokasi memiliki kode QR unik dan daftar misi beserta deskripsi tugas &amp; hadiah poinnya
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openQrScannerTrigger()}
                  className="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-extrabold text-white shadow-sm"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <QrCode className="h-3.5 w-3.5" />
                  <span>Scan QR Lokasi</span>
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {locations.map((loc) => {
                  const unlocked = currentUser.unlockedLocationIds.includes(loc.id);
                  const catMeta = getCategoryMeta(loc.category);

                  return (
                    <div
                      key={loc.id}
                      className={`flex flex-col justify-between rounded-2xl border-2 p-4 transition ${
                        unlocked
                          ? 'border-blue-300 bg-blue-50/40 shadow-sm'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                              style={{ backgroundColor: catMeta.defaultColor }}
                            >
                              <DynamicIcon name={loc.pinIcon} className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="line-clamp-1 text-xs font-extrabold text-slate-900">
                                {loc.name}
                              </p>
                              <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                                <span className="rounded-md bg-[#071A3E] px-2 py-0.5 font-mono text-[9.5px] font-extrabold text-amber-300">
                                  QR: {loc.qrCode}
                                </span>
                                <span className="text-[10px] font-bold text-slate-600">
                                  Radius ≤ {loc.radiusMeters}m
                                </span>
                              </div>
                            </div>
                          </div>

                          {unlocked ? (
                            <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold uppercase text-emerald-900 border border-emerald-300">
                              ✓ Terbuka
                            </span>
                          ) : (
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-extrabold text-slate-800">
                              <Lock className="h-3 w-3" /> Terkunci
                            </span>
                          )}
                        </div>

                        {/* Deskripsi QR Lokasi */}
                        <p className="mt-2 text-[11px] font-medium leading-relaxed text-slate-700">
                          <strong className="font-extrabold text-slate-900">
                            Deskripsi Lokasi:{' '}
                          </strong>
                          {loc.shortDescription}
                        </p>

                        {/* Daftar & Deskripsi Tiap Misi QR */}
                        <div className="mt-2.5 space-y-1.5">
                          <p className="text-[10px] font-extrabold uppercase tracking-wider text-blue-900">
                            Deskripsi Misi QR ({loc.missions.length} Misi):
                          </p>
                          {loc.missions.map((m, idx) => {
                            const done = currentUser.completedMissionKeys.includes(
                              `${loc.id}::${m.id}`
                            );
                            return (
                              <div
                                key={m.id}
                                className="rounded-xl border border-slate-200 bg-white p-2 text-[11px]"
                              >
                                <div className="flex items-center justify-between gap-1.5">
                                  <span className="font-extrabold text-slate-900">
                                    {idx + 1}. {m.title}
                                  </span>
                                  <span
                                    className={`shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold ${
                                      done
                                        ? 'bg-emerald-100 text-emerald-900'
                                        : 'bg-amber-100 text-amber-950'
                                    }`}
                                  >
                                    {done ? 'Selesai ✓' : `+${m.xpReward} Poin`}
                                  </span>
                                </div>
                                <p className="mt-0.5 text-[10.5px] font-medium leading-snug text-slate-700">
                                  {m.description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-200/80 pt-2.5">
                        <button
                          type="button"
                          onClick={() => setQrInspectSpot(loc)}
                          className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-extrabold text-slate-800 hover:bg-slate-100"
                        >
                          <QrCode className="h-3.5 w-3.5 text-blue-700" />
                          <span>Lihat QR Lokasi</span>
                        </button>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedLocationId(loc.id);
                              setActiveNavTab('map');
                              flyToCoords(loc.lat, loc.lng, 15);
                            }}
                            className="rounded-xl border border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-extrabold text-slate-800 hover:bg-slate-100"
                          >
                            Peta
                          </button>
                          {unlocked ? (
                            <button
                              type="button"
                              onClick={() => openUnlockedAreaModal(loc, false)}
                              className="rounded-xl px-3 py-1.5 text-[11px] font-extrabold text-slate-950 shadow-sm"
                              style={{ backgroundColor: branding.accentColor }}
                            >
                              Kerjakan Misi
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openQrScannerTrigger(loc.id)}
                              className="rounded-xl px-3 py-1.5 text-[11px] font-extrabold text-slate-950 shadow-sm"
                              style={{ backgroundColor: branding.accentColor }}
                            >
                              Scan QR
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* User Uploaded Mission Photos Portfolio */}
            <div className="rounded-3xl border border-slate-200 bg-white p-4 md:p-6 shadow-sm">
              <h3 className="mb-3 flex items-center gap-2 text-sm md:text-base font-extrabold text-slate-900">
                <Camera className="h-4 w-4 text-blue-700" />
                Portofolio Foto Misi Saya ({userPhotos.length})
              </h3>
              {userPhotos.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-300 py-8 text-center">
                  <Camera className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                  <p className="text-xs font-bold text-slate-700">
                    Anda belum mengunggah foto misi. Unlock titik wisata lalu abadikan momen terbaik!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  {userPhotos.map((ph) => (
                    <div
                      key={ph.id}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm"
                    >
                      <div className="aspect-[4/3] w-full overflow-hidden bg-slate-200">
                        <img
                          src={ph.imageUrl}
                          alt={ph.missionLabel}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-2.5">
                        <p className="truncate text-xs font-extrabold text-slate-900">
                          {ph.locationName}
                        </p>
                        <p className="truncate text-[10.5px] font-bold text-blue-800">
                          {ph.missionLabel}
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold text-slate-500">
                          {formatRelativeTime(ph.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL QR VOUCHER & BEBAS PILIH UMKM REDEEM ================= */}
      {selectedVoucherForQr && (
        <div
          className="fixed inset-0 z-[850] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedVoucherForQr(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-2xl animate-pop-in relative space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedVoucherForQr(null)}
              className="absolute right-4 top-4 rounded-full bg-slate-100 p-2 text-slate-700 hover:bg-slate-200"
            >
              <X className="h-4 w-4" />
            </button>

            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-extrabold text-amber-950">
              <Ticket className="h-3.5 w-3.5" /> Voucher Wisata • Bebas Pilih UMKM
            </span>

            <h3 className="text-base font-extrabold text-slate-900">
              {selectedVoucherForQr.discountValue}
            </h3>

            {/* Pilih UMKM di dalam Modal */}
            <div className="text-left rounded-2xl border border-blue-200 bg-blue-50 p-3">
              <label className="block text-[10.5px] font-extrabold uppercase text-blue-950 mb-1">
                Pilih Mitra UMKM Tempat Redeem:
              </label>
              <select
                value={selectedVoucherForQr.locationId || 'any'}
                onChange={(e) => {
                  const nextLocId = e.target.value;
                  changeVoucherLocation(selectedVoucherForQr.id, nextLocId);
                  const chosen = locations.find((l) => l.id === nextLocId);
                  setSelectedVoucherForQr((prev) =>
                    prev
                      ? {
                          ...prev,
                          locationId: chosen ? chosen.id : 'any',
                          locationName: chosen
                            ? chosen.name
                            : 'Bebas Pilih Mitra UMKM Mana Saja',
                          merchantName: chosen
                            ? chosen.merchantName || `Mitra UMKM ${chosen.name}`
                            : 'Semua Mitra UMKM Kota Langsa (Bebas Pilih)',
                        }
                      : null
                  );
                }}
                className="w-full rounded-xl border border-blue-300 bg-white px-3 py-2 text-xs font-extrabold text-slate-900 focus:outline-none"
              >
                <option value="any">
                  🌟 Bebas Redeem di Semua Mitra UMKM Kota Langsa
                </option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    🏪 {loc.merchantName || `UMKM ${loc.name}`} ({loc.name})
                  </option>
                ))}
              </select>
            </div>

            <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-2xl border-2 border-dashed border-amber-400 bg-amber-50/40 p-3">
              {voucherQrDataUrl ? (
                <img
                  src={voucherQrDataUrl}
                  alt={selectedVoucherForQr.code}
                  className="h-full w-full object-contain rounded-xl"
                />
              ) : (
                <span className="text-xs font-bold text-slate-500">
                  Memuat QR Voucher...
                </span>
              )}
            </div>

            <div className="rounded-2xl bg-[#071A3E] py-2.5 px-4 text-amber-300 font-mono text-lg font-extrabold tracking-widest">
              {selectedVoucherForQr.code}
            </div>

            <p className="text-[11px] font-medium text-slate-700 leading-relaxed">
              Tunjukkan kode di atas ke kasir UMKM mana saja pilihan Anda, atau klik tombol di bawah untuk langsung me-redeem voucher ini:
            </p>

            <button
              type="button"
              onClick={() => {
                const targetId =
                  selectedVoucherForQr.locationId &&
                  selectedVoucherForQr.locationId !== 'any'
                    ? selectedVoucherForQr.locationId
                    : locations[0]?.id;
                redeemUserVoucher(selectedVoucherForQr.code, targetId);
                setSelectedVoucherForQr(null);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-3 text-xs font-extrabold text-white shadow-md hover:bg-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Redeem Voucher Sekarang di UMKM Pilihan</span>
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL INSPEKSI QR LOKASI & DESKRIPSI MISI QR ================= */}
      {qrInspectSpot && (
        <div
          className="fixed inset-0 z-[860] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => setQrInspectSpot(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-4 text-white"
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.buttonColor} 100%)`,
              }}
            >
              <div>
                <span className="rounded-md bg-white/20 px-2 py-0.5 font-mono text-[10px] font-extrabold text-amber-300">
                  {qrInspectSpot.qrCode}
                </span>
                <h3 className="mt-1 text-sm font-extrabold">
                  QR Lokasi &amp; Deskripsi Misi: {qrInspectSpot.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQrInspectSpot(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[75dvh] overflow-y-auto p-5 space-y-4">
              <div className="flex items-start gap-3.5 rounded-2xl border border-blue-200 bg-blue-50/70 p-3.5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
                  {qrInspectDataUrl ? (
                    <img
                      src={qrInspectDataUrl}
                      alt={qrInspectSpot.qrCode}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <QrCode className="h-10 w-10 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-slate-900">
                    Deskripsi QR Lokasi:
                  </p>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-700">
                    {qrInspectSpot.shortDescription}
                  </p>
                  <p className="mt-1.5 text-[10.5px] font-extrabold text-blue-900">
                    Radius Scan ≤ {qrInspectSpot.radiusMeters}m • Unlock +100 Poin
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-extrabold text-slate-900">
                  Deskripsi Tiap Misi QR ({qrInspectSpot.missions.length} Misi):
                </p>
                {qrInspectSpot.missions.map((m, idx) => (
                  <div
                    key={m.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-900">
                        {idx + 1}. {m.title}
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-950">
                        +{m.xpReward} Poin Wisata
                      </span>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed text-slate-700">
                      {m.description}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const target = qrInspectSpot;
                  setQrInspectSpot(null);
                  openQrScannerTrigger(target.id);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-extrabold text-slate-950 shadow-md"
                style={{ backgroundColor: branding.accentColor }}
              >
                <QrCode className="h-4 w-4" />
                <span>Pindai / Simulasi Scan QR Lokasi Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
