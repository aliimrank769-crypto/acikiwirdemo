import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Lock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  QrCode,
  Sparkles,
  Star,
  Store,
  Tag,
  Ticket,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  buildWhatsAppUrl,
  calculateHaversineMeters,
  formatDistance,
  formatRelativeTime,
  getAverageRating,
} from '../utils/geo';
import { DynamicIcon, getCategoryMeta } from '../utils/icons';
import { buildLocationQrUrl, generateQrDataUrl } from '../utils/qr';
import { useDeviceTier } from '../utils/useDeviceTier';
import type { MissionPhoto } from '../types';

type DetailTab = 'info' | 'qr-missions' | 'gallery' | 'reviews';

/**
 * Panel Detail Lokasi Multi-Device:
 * - Mobile (<768px): Swipeable Bottom Sheet dari bawah layar
 * - Tablet (768px-1023px): Floating Glass Drawer di sisi kanan atas peta
 * - Desktop (>=1024px): Docked Inspector Sidebar dengan Hero Cover & QR Misi
 */
export const LocationBottomSheet: React.FC = () => {
  const {
    branding,
    selectedLocation,
    setSelectedLocationId,
    locationSheetSnap: snap,
    setLocationSheetSnap: setSnap,
    currentUser,
    userCoords,
    startRouteToLocation,
    openQrScannerTrigger,
    openUnlockedAreaModal,
    claimVoucherWithPoints,
    openAuthModal,
  } = useApp();

  const deviceTier = useDeviceTier();
  const [activeTab, setActiveTab] = useState<DetailTab>('info');
  const [dragOffsetY, setDragOffsetY] = useState(0);
  const [lightboxPhoto, setLightboxPhoto] = useState<MissionPhoto | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const dragStartYRef = useRef<number | null>(null);

  useEffect(() => {
    if (selectedLocation) {
      setSnap('half');
      setActiveTab('info');
      setDragOffsetY(0);
    }
  }, [selectedLocation?.id, setSnap]);

  useEffect(() => {
    if (!selectedLocation) return;
    let active = true;
    generateQrDataUrl(
      buildLocationQrUrl(selectedLocation.qrCode),
      branding.buttonColor
    ).then((url) => {
      if (active) setQrDataUrl(url);
    });
    return () => {
      active = false;
    };
  }, [selectedLocation?.qrCode, branding.buttonColor]);

  if (!selectedLocation) return null;

  const isUnlocked = Boolean(
    currentUser?.unlockedLocationIds.includes(selectedLocation.id)
  );
  const distanceMeters = calculateHaversineMeters(userCoords, {
    lat: selectedLocation.lat,
    lng: selectedLocation.lng,
  });
  const avgRating = getAverageRating(selectedLocation.reviews);
  const catMeta = getCategoryMeta(selectedLocation.category);
  const waUrl = buildWhatsAppUrl(
    selectedLocation.contactPhone,
    selectedLocation.name,
    branding.appName
  );
  const heroCover = selectedLocation.photos[0]?.imageUrl;

  // Mobile-only Touch / Mouse Drag Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    if (deviceTier !== 'mobile') return;
    dragStartYRef.current = e.clientY;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (deviceTier !== 'mobile' || dragStartYRef.current === null) return;
    const delta = e.clientY - dragStartYRef.current;
    setDragOffsetY(Math.max(-90, delta));
  };

  const handlePointerUp = () => {
    if (deviceTier !== 'mobile' || dragStartYRef.current === null) return;
    const delta = dragOffsetY;
    dragStartYRef.current = null;
    setDragOffsetY(0);

    if (delta < -45) {
      setSnap('full');
    } else if (delta > 65) {
      if (snap === 'full') {
        setSnap('half');
      } else {
        setSelectedLocationId(null);
      }
    }
  };

  // Distinct wrapper geometry per device tier!
  // On mobile: when snap === 'full', HeaderBar and BottomNavBar hide automatically,
  // so the sheet sits cleanly at bottom-0 with 95dvh height and zero overlap!
  const containerClasses =
    deviceTier === 'mobile'
      ? `pointer-events-auto fixed inset-x-0 flex flex-col rounded-t-3xl border-t border-slate-200/90 bg-white shadow-sheet transition-all duration-300 ease-out ${
          snap === 'full'
            ? 'bottom-0 z-[560] h-[95dvh]'
            : 'bottom-[66px] z-[470] h-[54dvh]'
        }`
      : deviceTier === 'tablet'
      ? 'pointer-events-auto absolute right-4 top-4 bottom-4 z-[470] flex w-[368px] flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white/98 shadow-2xl backdrop-blur-md animate-slide-right'
      : 'pointer-events-auto relative z-[470] flex h-full w-[396px] shrink-0 flex-col overflow-hidden border-l border-slate-200 bg-white animate-slide-right';

  return (
    <>
      <div
        className={containerClasses}
        style={
          deviceTier === 'mobile' && dragOffsetY
            ? { transform: `translateY(${Math.max(-40, dragOffsetY)}px)` }
            : undefined
        }
      >
        {/* Desktop & Tablet Hero Cover Image Header */}
        {deviceTier !== 'mobile' && (
          <div
            className="relative h-40 w-full shrink-0 overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.buttonColor} 100%)`,
            }}
          >
            {heroCover && (
              <img
                src={heroCover}
                alt={selectedLocation.name}
                className="h-full w-full object-cover opacity-85"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent" />

            <button
              type="button"
              onClick={() => setSelectedLocationId(null)}
              className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-slate-950/75 px-3 py-1.5 text-[11px] font-extrabold text-white backdrop-blur-sm transition hover:bg-slate-950"
              title="Kembali ke Daftar Wisata"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Daftar Wisata</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedLocationId(null)}
              className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-slate-950/75 text-white backdrop-blur-sm transition hover:bg-slate-950"
              title="Tutup Detail"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="absolute inset-x-4 bottom-3 text-white">
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white shadow"
                  style={{ backgroundColor: catMeta.defaultColor }}
                >
                  <DynamicIcon
                    name={
                      selectedLocation.pinIcon ||
                      branding.categoryIcons[selectedLocation.category]
                    }
                    className="h-3 w-3"
                  />
                  {catMeta.label}
                </span>

                {isUnlocked ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-slate-950 shadow"
                    style={{ backgroundColor: branding.accentColor }}
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    Wilayah Terbuka
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                    <Lock className="h-2.5 w-2.5" />
                    Radius QR ≤ {selectedLocation.radiusMeters}m
                  </span>
                )}
              </div>
              <h2 className="line-clamp-1 text-base font-extrabold leading-snug">
                {selectedLocation.name}
              </h2>
            </div>
          </div>
        )}

        {/* Mobile Swipeable Grab Handle Header (or Tablet/Desktop Metrics Bar) */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className={
            deviceTier === 'mobile'
              ? 'cursor-grab touch-none select-none px-4 pb-2 pt-2.5 active:cursor-grabbing'
              : 'px-4 pb-2 pt-3'
          }
        >
          {deviceTier === 'mobile' && (
            <>
              <div className="mx-auto mb-2.5 h-1.5 w-11 rounded-full bg-slate-300" />
              <div className="flex items-start justify-between gap-2.5">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-1.5">
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                      style={{ backgroundColor: catMeta.defaultColor }}
                    >
                      <DynamicIcon
                        name={
                          selectedLocation.pinIcon ||
                          branding.categoryIcons[selectedLocation.category]
                        }
                        className="h-3 w-3"
                      />
                      {catMeta.label}
                    </span>

                    {isUnlocked ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                        <CheckCircle2 className="h-3 w-3 text-amber-600" />
                        Wilayah Terbuka
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                        <Lock className="h-2.5 w-2.5" />
                        Radius QR ≤ {selectedLocation.radiusMeters}m
                      </span>
                    )}
                  </div>

                  <h2 className="truncate text-base font-extrabold text-slate-900">
                    {selectedLocation.name}
                  </h2>
                </div>

                <div className="flex shrink-0 items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSnap(snap === 'full' ? 'half' : 'full')}
                    className="flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2.5 text-[10.5px] font-extrabold text-slate-700 hover:bg-slate-200"
                    title={snap === 'full' ? 'Turunkan Panel' : 'Perbesar Panel'}
                  >
                    {snap === 'full' ? (
                      <>
                        <ChevronDown className="h-3.5 w-3.5" />
                        <span>Turunkan</span>
                      </>
                    ) : (
                      <>
                        <ChevronUp className="h-3.5 w-3.5" />
                        <span>Penuh</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedLocationId(null)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                    title="Tutup Panel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Distance & Rating Subbar */}
          <div className="mt-1 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span className="inline-flex items-center gap-1 text-amber-600">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              {avgRating > 0 ? avgRating : 'Baru'} ({selectedLocation.reviews.length} ulasan)
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin
                className="h-3.5 w-3.5"
                style={{ color: branding.primaryColor }}
              />
              {formatDistance(distanceMeters)} dari posisi Anda
            </span>
          </div>
        </div>

        {/* Action Buttons Row: Rute Navigasi OSM, Scan QR / Misi, WhatsApp */}
        <div className="grid grid-cols-12 gap-2 px-4 pb-2.5">
          <button
            type="button"
            onClick={() => {
              startRouteToLocation(selectedLocation);
              if (deviceTier === 'mobile') setSnap('half');
            }}
            className="col-span-5 flex items-center justify-center gap-1.5 rounded-xl bg-[#071A3E] px-3 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-110 active:scale-95"
          >
            <Navigation
              className="h-3.5 w-3.5"
              style={{ color: branding.accentColor }}
            />
            <span>Rute ke Lokasi</span>
          </button>

          {isUnlocked ? (
            <button
              type="button"
              onClick={() => openUnlockedAreaModal(selectedLocation, false)}
              className="col-span-5 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
              style={{ backgroundColor: branding.primaryColor }}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Misi ({selectedLocation.missions.length})</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openQrScannerTrigger(selectedLocation.id)}
              className="col-span-5 flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-extrabold text-slate-950 shadow-sm transition hover:brightness-105 active:scale-95"
              style={{ backgroundColor: branding.accentColor }}
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Unlock QR</span>
            </button>
          )}

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={`Hubungi WhatsApp ${selectedLocation.contactName}`}
            className="col-span-2 flex items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 active:scale-95"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>

        {/* Navigation Tabs: Info, QR & Misi, Foto Komunitas, Ulasan */}
        <div className="flex border-b border-slate-200 px-3">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex-1 border-b-2 py-2 text-[11px] font-extrabold transition ${
              activeTab === 'info'
                ? 'text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
            style={
              activeTab === 'info'
                ? { borderColor: branding.primaryColor, color: branding.primaryColor }
                : undefined
            }
          >
            Info &amp; UMKM
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qr-missions')}
            className={`flex-1 border-b-2 py-2 text-[11px] font-extrabold transition ${
              activeTab === 'qr-missions'
                ? 'text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
            style={
              activeTab === 'qr-missions'
                ? { borderColor: branding.primaryColor, color: branding.primaryColor }
                : undefined
            }
          >
            QR &amp; Misi ({selectedLocation.missions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gallery')}
            className={`flex-1 border-b-2 py-2 text-[11px] font-extrabold transition ${
              activeTab === 'gallery'
                ? 'text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
            style={
              activeTab === 'gallery'
                ? { borderColor: branding.primaryColor, color: branding.primaryColor }
                : undefined
            }
          >
            Foto ({selectedLocation.photos.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 border-b-2 py-2 text-[11px] font-extrabold transition ${
              activeTab === 'reviews'
                ? 'text-slate-900'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
            style={
              activeTab === 'reviews'
                ? { borderColor: branding.primaryColor, color: branding.primaryColor }
                : undefined
            }
          >
            Ulasan ({selectedLocation.reviews.length})
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="thin-scrollbar flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5">
          {activeTab === 'info' && (
            <>
              <p className="text-xs font-semibold leading-relaxed text-slate-800">
                {selectedLocation.shortDescription}
              </p>

              {/* Hadiah Voucher Misi & Tukar Poin Bebas UMKM Banner */}
              {selectedLocation.voucherConfig?.enabled !== false && (
                <div className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-3 shadow-sm space-y-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-sm">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="inline-block rounded-full bg-amber-200 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-slate-950">
                        Voucher UMKM &amp; Tukar Poin Bebas
                      </span>
                      <p className="mt-1 text-xs font-extrabold text-slate-950">
                        {selectedLocation.voucherConfig?.discountValue ||
                          'Voucher Diskon Spesial UMKM'}
                      </p>
                      <p className="text-[11px] font-bold text-blue-900 flex items-center gap-1 mt-0.5">
                        <Store className="h-3 w-3 shrink-0" />
                        <span className="truncate">
                          {selectedLocation.merchantName ||
                            `Mitra UMKM ${selectedLocation.name}`}
                        </span>
                      </p>
                      <p className="mt-1 text-[10.5px] font-medium text-slate-700 leading-relaxed">
                        Kumpulkan Poin Wisata dari Scan QR &amp; Misi (bukan poin level!), lalu tukarkan atau redeem voucher bebas di UMKM ini maupun mitra UMKM lainnya.
                      </p>
                    </div>
                  </div>

                  {(!currentUser || currentUser.role === 'user') && (
                    <div className="flex items-center justify-between gap-2 border-t border-amber-200/80 pt-2">
                      <span className="text-[10.5px] font-extrabold text-slate-800">
                        Harga Tukar: {selectedLocation.voucherConfig?.pointCost ?? 80} Poin Wisata
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!currentUser) {
                            openAuthModal();
                            return;
                          }
                          claimVoucherWithPoints(selectedLocation.id);
                        }}
                        className="rounded-xl bg-[#071A3E] px-3 py-1.5 text-[10.5px] font-extrabold text-amber-300 shadow-sm transition hover:bg-slate-900"
                      >
                        Tukar Poin ke Voucher UMKM Ini
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Katalog Promosi & Produk Unggulan UMKM */}
              {(selectedLocation.promos ?? []).filter((p) => p.isActive).length > 0 && (
                <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-blue-700" />
                      Promosi &amp; Produk UMKM Lokal
                    </span>
                    <span className="text-[10px] font-extrabold text-blue-800">
                      Dikelola Owner UMKM
                    </span>
                  </div>
                  <div className="space-y-2">
                    {(selectedLocation.promos ?? [])
                      .filter((p) => p.isActive)
                      .map((promo) => (
                        <div
                          key={promo.id}
                          className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-2 shadow-sm"
                        >
                          {promo.imageUrl && (
                            <img
                              src={promo.imageUrl}
                              alt={promo.title}
                              className="h-14 w-14 shrink-0 rounded-lg object-cover bg-slate-100"
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-950">
                                {promo.promoBadge}
                              </span>
                            </div>
                            <p className="truncate text-xs font-extrabold text-slate-900 mt-0.5">
                              {promo.title}
                            </p>
                            <p className="line-clamp-2 text-[10.5px] font-medium text-slate-600">
                              {promo.description}
                            </p>
                            <div className="mt-1 flex items-baseline gap-1.5">
                              <span className="text-xs font-extrabold text-emerald-700">
                                {promo.priceText}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {selectedLocation.historyDescription && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <h4 className="mb-1 text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                    Sejarah &amp; Edukasi Wisata
                  </h4>
                  <p className="text-xs font-medium leading-relaxed text-slate-700">
                    {selectedLocation.historyDescription}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary-soft">
                    <Clock className="h-4 w-4" style={{ color: branding.primaryColor }} />
                  </div>
                  <div>
                    <p className="text-[10.5px] font-extrabold uppercase text-slate-500">
                      Jam Operasional
                    </p>
                    <p className="text-xs font-bold text-slate-900">
                      {selectedLocation.operatingHours}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-sm">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent-soft">
                    <Ticket className="h-4 w-4" style={{ color: branding.accentColor }} />
                  </div>
                  <div>
                    <p className="text-[10.5px] font-extrabold uppercase text-slate-500">
                      Tiket &amp; Kisaran Harga UMKM
                    </p>
                    <p className="text-xs font-bold text-slate-900">
                      {selectedLocation.priceRange}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact Person Direct WhatsApp & Phone Card */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className="text-[10.5px] font-extrabold uppercase"
                      style={{ color: branding.primaryColor }}
                    >
                      Contact Person Pengelola
                    </p>
                    <p className="truncate text-xs font-extrabold text-slate-900">
                      {selectedLocation.contactName}
                    </p>
                    <p className="text-[11px] font-bold text-slate-700">
                      {selectedLocation.contactPhone}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <a
                      href={`tel:${selectedLocation.contactPhone}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-800 shadow-sm hover:bg-slate-50"
                      title="Telepon Pengelola"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-700"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Ringkasan QR Lokasi & Deskripsi Tiap Misi QR */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1.5">
                    <QrCode className="h-4 w-4 text-blue-700" />
                    QR Lokasi &amp; Deskripsi Misi ({selectedLocation.missions.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('qr-missions')}
                    className="rounded-lg bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-900 hover:bg-blue-200"
                  >
                    Lihat QR Lokasi →
                  </button>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-extrabold text-blue-900">
                      Kode QR: {selectedLocation.qrCode}
                    </span>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-950">
                      +100 Poin Unlock +{' '}
                      {selectedLocation.missions.reduce((s, m) => s + m.xpReward, 0)} Poin Misi
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-slate-700">
                    Scan kode QR ini saat berada dalam radius ≤ {selectedLocation.radiusMeters}m dari lokasi untuk membuka daftar misi berikut:
                  </p>
                </div>

                <div className="space-y-2">
                  {selectedLocation.missions.map((m, idx) => {
                    const done = currentUser?.completedMissionKeys.includes(
                      `${selectedLocation.id}::${m.id}`
                    );
                    return (
                      <div
                        key={m.id}
                        className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex min-w-0 items-center gap-2">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-extrabold text-blue-900">
                              {idx + 1}
                            </span>
                            <span className="font-extrabold text-slate-900">
                              {m.title}
                            </span>
                          </div>
                          {done ? (
                            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800">
                              Selesai ✓
                            </span>
                          ) : (
                            <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-950">
                              +{m.xpReward} Poin
                            </span>
                          )}
                        </div>
                        <p className="mt-1 pl-7 text-[11px] font-medium leading-relaxed text-slate-700">
                          {m.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === 'qr-missions' && (
            <div className="space-y-3.5">
              {/* Visual QR Lokasi & Deskripsi QR Lokasi */}
              <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/60 p-3.5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt={selectedLocation.qrCode}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <QrCode className="h-10 w-10 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="inline-block rounded-md bg-blue-900 px-2 py-0.5 font-mono text-[10px] font-extrabold text-amber-300">
                      {selectedLocation.qrCode}
                    </span>
                    <h4 className="mt-1 text-xs font-extrabold text-slate-900">
                      QR Code Lokasi: {selectedLocation.name}
                    </h4>
                    <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-700">
                      {selectedLocation.shortDescription}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px] font-extrabold">
                      <span className="rounded-md bg-white px-2 py-0.5 text-slate-800 border border-slate-200">
                        Radius Scan ≤ {selectedLocation.radiusMeters}m
                      </span>
                      <span className="rounded-md bg-amber-100 px-2 py-0.5 text-amber-950">
                        Unlock: +100 Poin Wisata
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isUnlocked ? (
                    <button
                      type="button"
                      onClick={() => openUnlockedAreaModal(selectedLocation, false)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold text-white shadow-sm"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      <Sparkles className="h-4 w-4" />
                      <span>Kerjakan Misi QR Sekarang</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openQrScannerTrigger(selectedLocation.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-extrabold text-slate-950 shadow-sm"
                      style={{ backgroundColor: branding.accentColor }}
                    >
                      <QrCode className="h-4 w-4" />
                      <span>Pindai / Simulasi Scan QR Ini</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Daftar Lengkap Deskripsi Tiap Misi QR */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-extrabold text-slate-900">
                    Deskripsi Lengkap Tiap Misi QR ({selectedLocation.missions.length} Misi)
                  </h4>
                  <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-950">
                    Total +{selectedLocation.missions.reduce((s, m) => s + m.xpReward, 0)} Poin
                  </span>
                </div>

                {selectedLocation.missions.map((m, idx) => {
                  const done = currentUser?.completedMissionKeys.includes(
                    `${selectedLocation.id}::${m.id}`
                  );
                  return (
                    <div
                      key={m.id}
                      className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white"
                            style={{ backgroundColor: branding.primaryColor }}
                          >
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-extrabold text-slate-900">
                              {m.title}
                            </p>
                            <span className="text-[10px] font-bold uppercase text-blue-700">
                              {m.type === 'photo'
                                ? 'Misi Unggah Foto'
                                : 'Misi Rating & Ulasan'}
                            </span>
                          </div>
                        </div>

                        {done ? (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800">
                            Selesai ✓
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-950">
                            +{m.xpReward} Poin Wisata
                          </span>
                        )}
                      </div>

                      <p className="rounded-xl bg-slate-50 p-2.5 text-xs font-medium leading-relaxed text-slate-700 border border-slate-100">
                        <strong className="font-extrabold text-slate-900">
                          Deskripsi Misi QR:{' '}
                        </strong>
                        {m.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'gallery' && (
            <>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-600">
                  Kumpulan foto hasil misi dari pengunjung:
                </p>
                {isUnlocked && (
                  <button
                    type="button"
                    onClick={() => openUnlockedAreaModal(selectedLocation, false)}
                    className="shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold text-white"
                    style={{ backgroundColor: branding.buttonColor }}
                  >
                    + Unggah Misi
                  </button>
                )}
              </div>

              {selectedLocation.photos.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 py-8 text-center">
                  <Camera className="mb-2 h-8 w-8 text-slate-300" />
                  <p className="text-xs font-bold text-slate-700">
                    Belum ada foto misi komunitas
                  </p>
                  <p className="mt-0.5 max-w-[230px] text-[11px] text-slate-500">
                    Jadilah pengunjung pertama yang meng-unlock QR lokasi ini!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  {selectedLocation.photos.map((photo) => (
                    <button
                      key={photo.id}
                      type="button"
                      onClick={() => setLightboxPhoto(photo)}
                      className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:shadow-md"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100">
                        <img
                          src={photo.imageUrl}
                          alt={photo.missionLabel}
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                        />
                        <span
                          className="absolute left-1.5 top-1.5 max-w-[90%] truncate rounded-full px-2 py-0.5 text-[9.5px] font-bold text-white shadow"
                          style={{ backgroundColor: branding.primaryColor }}
                        >
                          {photo.missionLabel}
                        </span>
                      </div>
                      <div className="p-2">
                        <p className="line-clamp-2 text-[11px] font-medium text-slate-700">
                          {photo.caption}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                          <span className="truncate font-bold text-slate-600">
                            {photo.userName}
                          </span>
                          <span className="shrink-0">
                            {formatRelativeTime(photo.createdAt)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'reviews' && (
            <>
              <div className="flex items-center justify-between rounded-2xl border border-amber-200/70 bg-amber-50/60 p-3">
                <div className="flex items-center gap-3">
                  <div className="text-3xl font-extrabold text-slate-900">
                    {avgRating > 0 ? avgRating.toFixed(1) : '—'}
                  </div>
                  <div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(avgRating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-0.5 text-[11px] font-semibold text-slate-600">
                      {selectedLocation.reviews.length} ulasan pengunjung
                    </p>
                  </div>
                </div>

                {isUnlocked && (
                  <button
                    type="button"
                    onClick={() => openUnlockedAreaModal(selectedLocation, false)}
                    className="rounded-xl px-3 py-1.5 text-xs font-bold text-white shadow-sm"
                    style={{ backgroundColor: branding.buttonColor }}
                  >
                    + Rating
                  </button>
                )}
              </div>

              {selectedLocation.reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 py-8 text-center">
                  <p className="text-xs font-bold text-slate-700">Belum ada ulasan</p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Unlock wilayah ini untuk memberikan rating pertama!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedLocation.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
                            style={{ backgroundColor: branding.primaryColor }}
                          >
                            {rev.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-800">{rev.userName}</p>
                            <p className="text-[10px] text-slate-400">
                              {formatRelativeTime(rev.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-extrabold text-amber-700">
                          <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                          <span>{rev.rating}.0</span>
                        </div>
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-slate-700">
                        {rev.comment}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Photo Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-[900] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-sm"
          onClick={() => setLightboxPhoto(null)}
        >
          <div
            className="w-full max-w-[520px] overflow-hidden rounded-3xl bg-white shadow-2xl animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative bg-slate-900">
              <img
                src={lightboxPhoto.imageUrl}
                alt={lightboxPhoto.missionLabel}
                className="max-h-[62vh] w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setLightboxPhoto(null)}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900/75 text-white hover:bg-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <span
                className="inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white"
                style={{ backgroundColor: branding.primaryColor }}
              >
                Misi: {lightboxPhoto.missionLabel}
              </span>
              <p className="mt-2 text-sm font-semibold text-slate-800">
                {lightboxPhoto.caption}
              </p>
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="font-bold text-slate-700">
                  Oleh {lightboxPhoto.userName}
                </span>
                <span>{formatRelativeTime(lightboxPhoto.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
