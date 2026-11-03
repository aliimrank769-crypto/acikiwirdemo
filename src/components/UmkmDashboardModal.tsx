import React, { useEffect, useMemo, useRef, useState } from 'react';
import jsQR from 'jsqr';
import {
  Award,
  Camera,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Edit3,
  Image as ImageIcon,
  ImageUp,
  MapPin,
  Percent,
  Phone,
  Plus,
  QrCode,
  Search,
  Sparkles,
  Star,
  Store,
  Tag,
  Ticket,
  Trash2,
  Upload,
  UserCheck,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { LocationVoucherConfig, UmkmPromoItem, UserVoucher } from '../types';
import { compressImageFile } from '../utils/image';
import {
  buildLocationQrUrl,
  decodeQrFromImageFile,
  generatePrintableQrCardPng,
  generateQrDataUrl,
} from '../utils/qr';

type UmkmSubTab = 'redeem' | 'promos' | 'qr-missions' | 'profile';

export const UmkmDashboardModal: React.FC = () => {
  const {
    activeNavTab,
    setActiveNavTab,
    currentUser,
    locations,
    vouchers,
    branding,
    redeemUserVoucher,
    updateUmkmBusinessProfile,
    flyToCoords,
    setSelectedLocationId,
    pushToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<UmkmSubTab>('redeem');

  // If Admin opens UMKM tab for testing, allow picking location; UMKM owner is bound to managedLocationId
  const managedLocation = useMemo(() => {
    if (!currentUser) return null;
    if (currentUser.managedLocationId) {
      const found = locations.find((l) => l.id === currentUser.managedLocationId);
      if (found) return found;
    }
    const byOwnerEmail = locations.find(
      (l) => l.ownerEmail?.toLowerCase() === currentUser.email.toLowerCase()
    );
    if (byOwnerEmail) return byOwnerEmail;
    return locations[0] ?? null;
  }, [currentUser, locations]);

  const [selectedLocIdForAdmin, setSelectedLocIdForAdmin] = useState<string>(
    managedLocation?.id ?? ''
  );

  useEffect(() => {
    if (managedLocation && !selectedLocIdForAdmin) {
      setSelectedLocIdForAdmin(managedLocation.id);
    }
  }, [managedLocation, selectedLocIdForAdmin]);

  const activeLocation = useMemo(() => {
    if (currentUser?.role === 'admin' && selectedLocIdForAdmin) {
      return locations.find((l) => l.id === selectedLocIdForAdmin) ?? managedLocation;
    }
    return managedLocation;
  }, [currentUser?.role, locations, managedLocation, selectedLocIdForAdmin]);

  // QR Image Preview for activeLocation
  const [locationQrUrl, setLocationQrUrl] = useState<string>('');
  useEffect(() => {
    if (!activeLocation) return;
    let mounted = true;
    generateQrDataUrl(
      buildLocationQrUrl(activeLocation.qrCode),
      branding.buttonColor
    ).then((url) => {
      if (mounted) setLocationQrUrl(url);
    });
    return () => {
      mounted = false;
    };
  }, [activeLocation?.qrCode, branding.buttonColor]);

  // Redeem state + QR Scanner state for UMKM Cashier
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherFilter, setVoucherFilter] = useState<'all' | 'active' | 'redeemed'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [lastRedeemResult, setLastRedeemResult] = useState<{
    ok: boolean;
    message: string;
    voucher?: UserVoucher;
  } | null>(null);
  const [isVoucherScannerOpen, setIsVoucherScannerOpen] = useState(false);
  const [voucherCameraActive, setVoucherCameraActive] = useState(false);
  const [voucherCameraError, setVoucherCameraError] = useState<string | null>(null);
  const voucherVideoRef = useRef<HTMLVideoElement | null>(null);
  const voucherCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Voucher Config Form State
  const [voucherConfigForm, setVoucherConfigForm] = useState<LocationVoucherConfig>({
    enabled: true,
    title: '',
    discountValue: '',
    pointCost: 80,
    description: '',
    terms: '',
  });

  // Promo Form State
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoTitle, setPromoTitle] = useState('');
  const [promoDesc, setPromoDesc] = useState('');
  const [promoPriceLabel, setPromoPriceLabel] = useState('');
  const [promoBadgeText, setPromoBadgeText] = useState('Promo Spesial');
  const [promoImageUrl, setPromoImageUrl] = useState('');

  // Business Profile Form State
  const [merchantName, setMerchantName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Sync form states when activeLocation changes
  useEffect(() => {
    if (!activeLocation) return;
    setVoucherConfigForm({
      enabled: activeLocation.voucherConfig?.enabled ?? true,
      title:
        activeLocation.voucherConfig?.title ||
        `Voucher Hadiah Misi ${activeLocation.name}`,
      discountValue:
        activeLocation.voucherConfig?.discountValue || 'Diskon Produk UMKM Rp 10.000',
      pointCost: activeLocation.voucherConfig?.pointCost ?? 80,
      description:
        activeLocation.voucherConfig?.description ||
        `Tukarkan poin wisata atau selesaikan misi di ${activeLocation.name} untuk klaim voucher ini.`,
      terms:
        activeLocation.voucherConfig?.terms ||
        'Wisatawan bebas memilih untuk me-redeem voucher mereka di kasir UMKM ini.',
    });
    setMerchantName(activeLocation.merchantName || `Mitra UMKM ${activeLocation.name}`);
    setShortDescription(activeLocation.shortDescription || '');
    setOperatingHours(activeLocation.operatingHours || '');
    setPriceRange(activeLocation.priceRange || '');
    setContactName(activeLocation.contactName || '');
    setContactPhone(activeLocation.contactPhone || '');
  }, [activeLocation]);

  // All active vouchers from tourists can be freely redeemed at ANY UMKM!
  // Plus vouchers already redeemed at this UMKM location.
  const redeemableAndHistoryVouchers = useMemo(() => {
    if (!activeLocation) return [];
    return vouchers.filter(
      (v) => v.status === 'active' || v.locationId === activeLocation.id
    );
  }, [activeLocation, vouchers]);

  const filteredVouchers = useMemo(() => {
    return redeemableAndHistoryVouchers.filter((v) => {
      if (voucherFilter !== 'all' && v.status !== voucherFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          v.code.toLowerCase().includes(q) ||
          v.userName.toLowerCase().includes(q) ||
          v.userEmail.toLowerCase().includes(q) ||
          v.missionTitle.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [redeemableAndHistoryVouchers, searchQuery, voucherFilter]);

  // Live Camera QR Scanner for UMKM Voucher Redemption
  useEffect(() => {
    if (!isVoucherScannerOpen || !activeLocation) return;

    let stream: MediaStream | null = null;
    let rafId: number | null = null;
    let cancelled = false;

    const startVoucherCamera = async () => {
      setVoucherCameraError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setVoucherCameraError(
          'Kamera tidak tersedia di perangkat ini. Anda dapat mengunggah foto/screenshot QR Voucher atau memilih voucher aktif.'
        );
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (voucherVideoRef.current) {
          voucherVideoRef.current.srcObject = stream;
          await voucherVideoRef.current.play();
          setVoucherCameraActive(true);
        }

        const scanFrame = () => {
          if (cancelled) return;
          const video = voucherVideoRef.current;
          const canvas = voucherCanvasRef.current;
          if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const qr = jsQR(imgData.data, imgData.width, imgData.height);
              if (qr?.data) {
                cancelled = true;
                stream?.getTracks().forEach((t) => t.stop());
                setIsVoucherScannerOpen(false);
                setVoucherCameraActive(false);
                const cleanedCode = qr.data
                  .replace(/^ACIKIWIR-VOUCHER::/i, '')
                  .trim()
                  .toUpperCase();
                setVoucherInput(cleanedCode);
                const res = redeemUserVoucher(qr.data, activeLocation.id);
                setLastRedeemResult(res);
                return;
              }
            }
          }
          rafId = window.requestAnimationFrame(scanFrame);
        };

        rafId = window.requestAnimationFrame(scanFrame);
      } catch {
        setVoucherCameraActive(false);
        setVoucherCameraError(
          'Izin kamera belum diaktifkan. Gunakan tombol Unggah Gambar QR Voucher di bawah atau Simulasi Scan QR.'
        );
      }
    };

    startVoucherCamera();

    return () => {
      cancelled = true;
      setVoucherCameraActive(false);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [activeLocation, isVoucherScannerOpen, redeemUserVoucher]);

  const handleUploadVoucherQrImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !activeLocation) return;
    const decoded = await decodeQrFromImageFile(file);
    e.target.value = '';
    if (!decoded) {
      pushToast({
        type: 'error',
        title: 'QR Voucher Tidak Terbaca',
        message: 'Tidak ditemukan QR Code voucher yang valid pada gambar tersebut.',
      });
      return;
    }
    const cleanedCode = decoded
      .replace(/^ACIKIWIR-VOUCHER::/i, '')
      .trim()
      .toUpperCase();
    setVoucherInput(cleanedCode);
    setIsVoucherScannerOpen(false);
    const res = redeemUserVoucher(decoded, activeLocation.id);
    setLastRedeemResult(res);
  };

  if (activeNavTab !== 'umkm') return null;
  if (!currentUser || (currentUser.role !== 'umkm' && currentUser.role !== 'admin')) {
    return null;
  }
  if (!activeLocation) return null;

  const activeCount = redeemableAndHistoryVouchers.filter(
    (v) => v.status === 'active'
  ).length;
  const redeemedCount = redeemableAndHistoryVouchers.filter(
    (v) => v.status === 'redeemed' && v.locationId === activeLocation.id
  ).length;
  const promosList = activeLocation.promos ?? [];

  const handleRedeemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = redeemUserVoucher(voucherInput, activeLocation.id);
    setLastRedeemResult(res);
    if (res.ok) {
      setVoucherInput('');
    }
  };

  const handleQuickRedeemCard = (code: string) => {
    setVoucherInput(code);
    const res = redeemUserVoucher(code, activeLocation.id);
    setLastRedeemResult(res);
  };

  const handleDownloadPosterQr = async () => {
    const pngUrl = await generatePrintableQrCardPng(activeLocation, branding);
    const a = document.createElement('a');
    a.href = pngUrl;
    a.download = `QR-Lokasi-${activeLocation.qrCode}.png`;
    a.click();
  };

  const handleSaveVoucherConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateUmkmBusinessProfile(activeLocation.id, {
      voucherConfig: voucherConfigForm,
    });
  };

  const handlePromoImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImageFile(file, 720, 0.82);
    setPromoImageUrl(dataUrl);
  };

  const handleSavePromoItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoTitle.trim() || !promoPriceLabel.trim()) return;

    const currentPromos = activeLocation.promos ?? [];
    let nextPromos: UmkmPromoItem[];

    if (editingPromoId) {
      nextPromos = currentPromos.map((p) =>
        p.id === editingPromoId
          ? {
              ...p,
              title: promoTitle.trim(),
              description: promoDesc.trim(),
              priceText: promoPriceLabel.trim(),
              promoBadge: promoBadgeText.trim() || 'Promo UMKM',
              imageUrl: promoImageUrl.trim() || undefined,
            }
          : p
      );
    } else {
      const newPromo: UmkmPromoItem = {
        id: `prm-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        title: promoTitle.trim(),
        description:
          promoDesc.trim() ||
          `Produk/paket spesial dari ${activeLocation.merchantName || activeLocation.name}.`,
        priceText: promoPriceLabel.trim(),
        promoBadge: promoBadgeText.trim() || 'Promo UMKM',
        imageUrl:
          promoImageUrl.trim() ||
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=700&q=80',
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      nextPromos = [newPromo, ...currentPromos];
    }

    updateUmkmBusinessProfile(activeLocation.id, { promos: nextPromos });
    setEditingPromoId(null);
    setPromoTitle('');
    setPromoDesc('');
    setPromoPriceLabel('');
    setPromoBadgeText('Promo Spesial');
    setPromoImageUrl('');
  };

  const handleEditPromoClick = (promo: UmkmPromoItem) => {
    setEditingPromoId(promo.id);
    setPromoTitle(promo.title);
    setPromoDesc(promo.description);
    setPromoPriceLabel(promo.priceText);
    setPromoBadgeText(promo.promoBadge);
    setPromoImageUrl(promo.imageUrl || '');
  };

  const handleTogglePromoActive = (promoId: string) => {
    const nextPromos = (activeLocation.promos ?? []).map((p) =>
      p.id === promoId ? { ...p, isActive: !p.isActive } : p
    );
    updateUmkmBusinessProfile(activeLocation.id, { promos: nextPromos });
  };

  const handleDeletePromo = (promoId: string) => {
    const nextPromos = (activeLocation.promos ?? []).filter((p) => p.id !== promoId);
    updateUmkmBusinessProfile(activeLocation.id, { promos: nextPromos });
  };

  const handleSaveBusinessProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUmkmBusinessProfile(activeLocation.id, {
      merchantName: merchantName.trim() || activeLocation.merchantName,
      shortDescription: shortDescription.trim() || activeLocation.shortDescription,
      operatingHours: operatingHours.trim() || activeLocation.operatingHours,
      priceRange: priceRange.trim() || activeLocation.priceRange,
      contactName: contactName.trim() || activeLocation.contactName,
      contactPhone: contactPhone.trim() || activeLocation.contactPhone,
    });
  };

  const avgRating =
    activeLocation.reviews.length > 0
      ? (
          activeLocation.reviews.reduce((acc, r) => acc + r.rating, 0) /
          activeLocation.reviews.length
        ).toFixed(1)
      : '5.0';

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden bg-slate-100 pb-[66px] md:pb-0 z-[510]">
      {/* ===================================================================
          TOP UMKM STUDIO HEADER (High Contrast, Responsive, Non-Overlapping)
         =================================================================== */}
      <div
        className="shrink-0 px-4 py-4 md:px-6 md:py-5 lg:px-8 text-white shadow-md"
        style={{
          background: `linear-gradient(135deg, #071A3E 0%, ${branding.primaryColor} 100%)`,
        }}
      >
        <div className="mx-auto max-w-7xl space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950">
                    Panel Owner UMKM &amp; Kasir Redeem Voucher
                  </span>
                  <span className="rounded-full bg-emerald-400/20 border border-emerald-300/40 px-2 py-0.5 text-[10px] font-extrabold text-emerald-200">
                    Menerima Redeem Bebas Semua Wisatawan
                  </span>
                </div>
                <h2 className="mt-1 text-base md:text-xl font-extrabold tracking-tight text-white">
                  {activeLocation.merchantName || `UMKM ${activeLocation.name}`}
                </h2>
                <p className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-blue-100">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-300" />
                  <span>
                    Titik Wisata: {activeLocation.name} • QR: {activeLocation.qrCode}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {currentUser.role === 'admin' && (
                <select
                  value={activeLocation.id}
                  onChange={(e) => setSelectedLocIdForAdmin(e.target.value)}
                  className="rounded-xl border border-white/30 bg-slate-950/60 px-3 py-2 text-xs font-extrabold text-amber-300 focus:outline-none"
                  title="Pilih Lokasi UMKM (Mode Admin)"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id} className="bg-white text-slate-900">
                      UMKM: {loc.merchantName || loc.name}
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                onClick={() => {
                  setSelectedLocationId(activeLocation.id);
                  flyToCoords(activeLocation.lat, activeLocation.lng, 16);
                  setActiveNavTab('map');
                }}
                className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-xs font-extrabold text-white transition hover:bg-white/25"
              >
                <MapPin className="h-3.5 w-3.5 text-amber-300" />
                <span>Lihat di Peta</span>
              </button>
            </div>
          </div>

          {/* Summary KPI Strip */}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/15 bg-slate-950/40 p-2.5 px-3">
              <div className="text-[11px] font-bold text-blue-100">
                Voucher Wisatawan Siap Redeem
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-base md:text-lg font-extrabold text-amber-300">
                <Ticket className="h-4 w-4" /> {activeCount} Aktif
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-slate-950/40 p-2.5 px-3">
              <div className="text-[11px] font-bold text-blue-100">
                Sudah Di-Redeem di UMKM Ini
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-base md:text-lg font-extrabold text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> {redeemedCount} Selesai
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-slate-950/40 p-2.5 px-3">
              <div className="text-[11px] font-bold text-blue-100">
                Katalog Promosi Aktif
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-base md:text-lg font-extrabold text-white">
                <Tag className="h-4 w-4 text-amber-300" />{' '}
                {promosList.filter((p) => p.isActive).length} Promo
              </div>
            </div>
            <div className="rounded-2xl border border-white/15 bg-slate-950/40 p-2.5 px-3">
              <div className="text-[11px] font-bold text-blue-100">
                Rating &amp; Misi QR Lokasi
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-base md:text-lg font-extrabold text-white">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {avgRating} •{' '}
                {activeLocation.missions.length} Misi QR
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs (4 Tabs) */}
          <div className="grid grid-cols-2 gap-1.5 rounded-2xl border border-white/15 bg-slate-950/45 p-1.5 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => setActiveTab('redeem')}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition ${
                activeTab === 'redeem'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Ticket className="h-4 w-4 shrink-0" />
              <span>Redeem Voucher ({activeCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('promos')}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition ${
                activeTab === 'promos'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Percent className="h-4 w-4 shrink-0" />
              <span>Promosi &amp; Voucher</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('qr-missions')}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition ${
                activeTab === 'qr-missions'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <QrCode className="h-4 w-4 shrink-0" />
              <span>QR Lokasi &amp; Misi ({activeLocation.missions.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-extrabold transition ${
                activeTab === 'profile'
                  ? 'bg-amber-400 text-slate-950 shadow'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Store className="h-4 w-4 shrink-0" />
              <span>Profil Usaha</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===================================================================
          MAIN SCROLLABLE WORKSPACE
         =================================================================== */}
      <div className="thin-scrollbar flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* ================= TAB 1: REDEEM VOUCHER PENGUNJUNG (BEBAS UMKM) ================= */}
          {activeTab === 'redeem' && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Left Column: Cashier Voucher Input */}
              <div className="space-y-4 lg:col-span-5">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center gap-2.5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                      <QrCode className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Kasir Validasi &amp; Redeem Voucher Bebas
                      </h3>
                      <p className="text-xs font-medium text-slate-700">
                        Wisatawan bebas memilih untuk me-redeem voucher mereka di usaha UMKM Anda!
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons to Open Live Camera QR Scanner or Upload QR Image */}
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setIsVoucherScannerOpen((prev) => !prev)}
                      className={`flex items-center justify-center gap-2 rounded-xl border-2 px-3.5 py-2.5 text-xs font-extrabold shadow-sm transition ${
                        isVoucherScannerOpen
                          ? 'border-rose-500 bg-rose-50 text-rose-800'
                          : 'border-amber-400 bg-amber-400 text-slate-950 hover:bg-amber-500'
                      }`}
                    >
                      <Camera className="h-4 w-4 shrink-0" />
                      <span>
                        {isVoucherScannerOpen
                          ? 'Tutup Kamera QR'
                          : 'Scan QR Voucher (Kamera)'}
                      </span>
                    </button>

                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-blue-200 bg-blue-50 px-3.5 py-2.5 text-xs font-extrabold text-blue-900 shadow-sm transition hover:bg-blue-100">
                      <ImageUp className="h-4 w-4 shrink-0 text-blue-700" />
                      <span>Unggah Foto QR Voucher</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadVoucherQrImage}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Expandable Live Camera QR Voucher Scanner Box */}
                  {isVoucherScannerOpen && (
                    <div className="mt-3 overflow-hidden rounded-2xl border-2 border-amber-400 bg-slate-950 p-3 text-white space-y-2.5 animate-pop-in">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5 text-xs font-extrabold text-amber-300">
                          <QrCode className="h-4 w-4" />
                          Pemindai Kamera QR Voucher Wisatawan
                        </span>
                        <button
                          type="button"
                          onClick={() => setIsVoucherScannerOpen(false)}
                          className="rounded-lg bg-white/15 p-1 text-white hover:bg-white/25"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-xl bg-slate-900 border border-white/15">
                        <video
                          ref={voucherVideoRef}
                          className="h-full w-full object-cover"
                          playsInline
                          muted
                        />
                        <canvas ref={voucherCanvasRef} className="hidden" />

                        {/* Viewfinder Frame */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="h-36 w-36 rounded-2xl border-2 border-amber-400 shadow-[0_0_0_9999px_rgba(2,6,23,0.45)]" />
                        </div>

                        {!voucherCameraActive && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 p-4 text-center">
                            <QrCode className="mb-2 h-8 w-8 text-amber-400" />
                            <p className="text-xs font-bold text-white">
                              {voucherCameraError || 'Mengaktifkan kamera pemindai QR Voucher...'}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Quick 1-Click Simulate Scan Active Voucher for Demo */}
                      {redeemableAndHistoryVouchers.some((v) => v.status === 'active') && (
                        <div className="rounded-xl bg-white/10 p-2.5 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-amber-200">
                            Mode Uji / Demo Scan QR:
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const sampleActive = redeemableAndHistoryVouchers.find(
                                (v) => v.status === 'active'
                              );
                              if (!sampleActive) return;
                              setIsVoucherScannerOpen(false);
                              setVoucherInput(sampleActive.code);
                              const res = redeemUserVoucher(
                                `ACIKIWIR-VOUCHER::${sampleActive.code}`,
                                activeLocation.id
                              );
                              setLastRedeemResult(res);
                            }}
                            className="rounded-lg bg-emerald-500 px-3 py-1.5 text-[11px] font-extrabold text-slate-950 hover:bg-emerald-400"
                          >
                            Simulasi Scan QR Voucher Aktif
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <form onSubmit={handleRedeemSubmit} className="mt-4 space-y-3">
                    <div>
                      <label className="mb-1 block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
                        Atau Masukkan Kode Voucher Wisatawan Secara Manual
                      </label>
                      <input
                        type="text"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value.toUpperCase())}
                        placeholder="Contoh: VC-MANGRO-8821"
                        className="w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-4 py-3 font-mono text-sm font-extrabold uppercase tracking-wider text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md transition hover:opacity-95"
                      style={{ backgroundColor: branding.buttonColor }}
                    >
                      <CheckCircle2 className="h-4 w-4 text-amber-300" />
                      <span>Redeem Voucher di {activeLocation.merchantName || activeLocation.name}</span>
                    </button>
                  </form>

                  {/* Validation Result Feedback Card */}
                  {lastRedeemResult && (
                    <div
                      className={`mt-4 rounded-2xl border-2 p-4 ${
                        lastRedeemResult.ok
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-950'
                          : 'border-rose-300 bg-rose-50 text-rose-950'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2
                          className={`mt-0.5 h-5 w-5 shrink-0 ${
                            lastRedeemResult.ok ? 'text-emerald-700' : 'text-rose-700'
                          }`}
                        />
                        <div className="space-y-1 text-xs">
                          <div className="text-sm font-extrabold">
                            {lastRedeemResult.ok
                              ? 'Redeem Voucher Berhasil!'
                              : 'Validasi Voucher Gagal'}
                          </div>
                          <p className="font-medium leading-relaxed">
                            {lastRedeemResult.message}
                          </p>
                          {lastRedeemResult.voucher && (
                            <div className="mt-2 space-y-0.5 border-t border-black/10 pt-2 text-[11px]">
                              <div>
                                <strong>Pengunjung:</strong> {lastRedeemResult.voucher.userName} (
                                {lastRedeemResult.voucher.userEmail})
                              </div>
                              <div>
                                <strong>Asal Misi / Poin:</strong>{' '}
                                {lastRedeemResult.voucher.missionTitle}
                              </div>
                              <div>
                                <strong>Di-Redeem pada UMKM:</strong>{' '}
                                {lastRedeemResult.voucher.merchantName}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Box: Free-choice redemption */}
                <div className="rounded-3xl border border-blue-200 bg-blue-50 p-4 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-extrabold text-blue-950">
                    <Sparkles className="h-4 w-4 text-blue-700" />
                    <span>Sistem Poin &amp; Redeem Bebas Antar-UMKM</span>
                  </div>
                  <p className="font-medium leading-relaxed text-slate-800">
                    Poin yang dikumpulkan wisatawan dari Scan QR dan penyelesaian misi tidak mengunci mereka pada satu tempat. Wisatawan bebas memilih untuk me-redeem voucher mereka di <strong>{activeLocation.merchantName || activeLocation.name}</strong>!
                  </p>
                </div>
              </div>

              {/* Right Column: Live List of Active & Redeemed Vouchers */}
              <div className="space-y-4 lg:col-span-7">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Daftar Voucher Wisatawan ({redeemableAndHistoryVouchers.length})
                      </h3>
                      <p className="text-xs font-medium text-slate-700">
                        Klik tombol <strong>Redeem di Sini</strong> untuk memvalidasi voucher pengunjung secara instan
                      </p>
                    </div>

                    <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
                      {(['all', 'active', 'redeemed'] as const).map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setVoucherFilter(st)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition ${
                            voucherFilter === st
                              ? 'bg-white text-slate-900 shadow-sm'
                              : 'text-slate-700 hover:text-slate-950'
                          }`}
                        >
                          {st === 'all'
                            ? 'Semua'
                            : st === 'active'
                            ? `Siap Redeem (${activeCount})`
                            : `Terpakai (${redeemedCount})`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Search bar */}
                  <div className="relative mb-3">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cari kode voucher, nama wisatawan, atau email..."
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2 pl-9 pr-4 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                  </div>

                  {filteredVouchers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
                      <Ticket className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                      <div className="text-xs font-extrabold text-slate-800">
                        Belum ada data voucher sesuai filter ini
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-slate-600">
                        Voucher akan muncul saat wisatawan menukarkan Poin Wisata atau menyelesaikan misi QR.
                      </p>
                    </div>
                  ) : (
                    <div className="max-h-[480px] space-y-2.5 overflow-y-auto pr-1">
                      {filteredVouchers.map((v) => (
                        <div
                          key={v.id}
                          className={`flex flex-col justify-between gap-3 rounded-2xl border-2 p-3.5 transition sm:flex-row sm:items-center ${
                            v.status === 'active'
                              ? 'border-amber-300 bg-amber-50/40 hover:border-amber-400'
                              : 'border-slate-200 bg-slate-50'
                          }`}
                        >
                          <div className="min-w-0 space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-lg bg-[#071A3E] px-2.5 py-0.5 font-mono text-xs font-extrabold tracking-wider text-amber-300">
                                {v.code}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${
                                  v.status === 'active'
                                    ? 'bg-emerald-100 text-emerald-900'
                                    : 'bg-slate-200 text-slate-800'
                                }`}
                              >
                                {v.status === 'active'
                                  ? 'Aktif • Bebas Redeem'
                                  : 'Sudah Di-Redeem'}
                              </span>
                              <span className="text-xs font-extrabold text-blue-900">
                                {v.discountValue}
                              </span>
                            </div>

                            <div className="text-xs font-extrabold text-slate-900">
                              Wisatawan: {v.userName}{' '}
                              <span className="font-semibold text-slate-600">
                                ({v.userEmail})
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] font-medium text-slate-700">
                              <span>Sumber: {v.missionTitle}</span>
                              <span>•</span>
                              <span>
                                Pilihan Tujuan:{' '}
                                <strong className="font-extrabold text-slate-900">
                                  {v.locationName}
                                </strong>
                              </span>
                              {v.redeemedAt && (
                                <span className="font-extrabold text-emerald-800">
                                  • Di-redeem: {new Date(v.redeemedAt).toLocaleString('id-ID')}
                                </span>
                              )}
                            </div>
                          </div>

                          {v.status === 'active' ? (
                            <button
                              type="button"
                              onClick={() => handleQuickRedeemCard(v.code)}
                              className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-emerald-700"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>Redeem di Sini</span>
                            </button>
                          ) : (
                            <div className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-200 px-3 py-1.5 text-[11px] font-extrabold text-slate-800">
                              <UserCheck className="h-3.5 w-3.5" /> Tervalidasi
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 2: KELOLA PROMOSI & HADIAH VOUCHER ================= */}
          {activeTab === 'promos' && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Left Column: Voucher Settings + Add Promo Form */}
              <div className="space-y-5 lg:col-span-5">
                <form
                  onSubmit={handleSaveVoucherConfig}
                  className="space-y-3.5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-900">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-slate-900">
                          Pengaturan Voucher &amp; Tukar Poin UMKM
                        </h3>
                        <p className="text-[11px] font-medium text-slate-600">
                          Konfigurasi nilai voucher ketika wisatawan memilih UMKM Anda
                        </p>
                      </div>
                    </div>

                    <label className="inline-flex cursor-pointer items-center gap-1.5">
                      <input
                        type="checkbox"
                        checked={voucherConfigForm.enabled}
                        onChange={(e) =>
                          setVoucherConfigForm((prev) => ({
                            ...prev,
                            enabled: e.target.checked,
                          }))
                        }
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-extrabold text-slate-800">Aktif</span>
                    </label>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                      Nama Program Voucher UMKM
                    </label>
                    <input
                      type="text"
                      value={voucherConfigForm.title}
                      onChange={(e) =>
                        setVoucherConfigForm((prev) => ({ ...prev, title: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900"
                      placeholder="Contoh: Voucher Kuliner & Souvenir Mangrove"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                        Besaran Diskon / Benefit
                      </label>
                      <input
                        type="text"
                        value={voucherConfigForm.discountValue}
                        onChange={(e) =>
                          setVoucherConfigForm((prev) => ({
                            ...prev,
                            discountValue: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-extrabold text-emerald-800"
                        placeholder="Diskon Rp 10.000"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                        Biaya Tukar Poin Wisata
                      </label>
                      <input
                        type="number"
                        min={20}
                        step={10}
                        value={voucherConfigForm.pointCost ?? 80}
                        onChange={(e) =>
                          setVoucherConfigForm((prev) => ({
                            ...prev,
                            pointCost: Math.max(20, Number(e.target.value) || 80),
                          }))
                        }
                        className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-extrabold text-amber-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                      Syarat &amp; Ketentuan Redeem
                    </label>
                    <textarea
                      rows={2}
                      value={voucherConfigForm.terms}
                      onChange={(e) =>
                        setVoucherConfigForm((prev) => ({ ...prev, terms: e.target.value }))
                      }
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition"
                    style={{ backgroundColor: branding.buttonColor }}
                  >
                    Simpan Pengaturan Voucher UMKM
                  </button>
                </form>

                {/* Add / Edit Promo Form */}
                <form
                  onSubmit={handleSavePromoItem}
                  className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                      <Plus className="h-4 w-4 text-blue-700" />
                      {editingPromoId
                        ? 'Edit Item Promosi UMKM'
                        : 'Tambah Promosi / Produk UMKM'}
                    </h3>
                    {editingPromoId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingPromoId(null);
                          setPromoTitle('');
                          setPromoDesc('');
                          setPromoPriceLabel('');
                          setPromoImageUrl('');
                        }}
                        className="text-xs font-extrabold text-rose-700 hover:underline"
                      >
                        Batal Edit
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                      Nama Produk / Paket Promo *
                    </label>
                    <input
                      type="text"
                      required
                      value={promoTitle}
                      onChange={(e) => setPromoTitle(e.target.value)}
                      placeholder="Contoh: Paket Kopi Sanger + Kerupuk Mangrove"
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                        Harga / Info Diskon *
                      </label>
                      <input
                        type="text"
                        required
                        value={promoPriceLabel}
                        onChange={(e) => setPromoPriceLabel(e.target.value)}
                        placeholder="Rp 18.000 (Hemat Rp 7.000)"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-extrabold text-emerald-800"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                        Label Badge Promo
                      </label>
                      <input
                        type="text"
                        value={promoBadgeText}
                        onChange={(e) => setPromoBadgeText(e.target.value)}
                        placeholder="Promo Terlaris / Diskon 25%"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                      Unggah Foto Produk
                    </label>
                    <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-extrabold text-slate-700 hover:border-blue-600">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Pilih Foto Produk UMKM</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePromoImageUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                      Deskripsi Singkat Promosi
                    </label>
                    <textarea
                      rows={2}
                      value={promoDesc}
                      onChange={(e) => setPromoDesc(e.target.value)}
                      placeholder="Jelaskan keunggulan produk atau paket promosi usaha Anda..."
                      className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-800"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-extrabold text-slate-950 shadow-sm transition hover:bg-amber-500"
                  >
                    {editingPromoId
                      ? 'Simpan Perubahan Promo'
                      : '+ Tambahkan ke Katalog Promosi'}
                  </button>
                </form>
              </div>

              {/* Right Column: Live Catalog of UMKM Promotions */}
              <div className="space-y-4 lg:col-span-7">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900">
                        Katalog Promosi &amp; Produk Unggulan ({promosList.length})
                      </h3>
                      <p className="text-xs font-medium text-slate-600">
                        Seluruh item aktif langsung tampil di halaman wisata{' '}
                        {activeLocation.name}
                      </p>
                    </div>
                  </div>

                  {promosList.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-12 text-center">
                      <ImageIcon className="mx-auto mb-2 h-8 w-8 text-slate-400" />
                      <div className="text-xs font-extrabold text-slate-800">
                        Belum ada katalog promosi UMKM
                      </div>
                      <p className="mt-1 text-[11px] font-medium text-slate-600">
                        Tambahkan produk atau paket diskon di formulir sebelah kiri untuk menarik wisatawan!
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                      {promosList.map((promo) => (
                        <div
                          key={promo.id}
                          className={`flex flex-col justify-between overflow-hidden rounded-2xl border transition ${
                            promo.isActive
                              ? 'border-slate-200 bg-white shadow-sm'
                              : 'border-slate-200 bg-slate-100 opacity-75'
                          }`}
                        >
                          <div>
                            <div className="relative h-32 bg-slate-200">
                              {promo.imageUrl ? (
                                <img
                                  src={promo.imageUrl}
                                  alt={promo.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-slate-400">
                                  <Store className="h-8 w-8" />
                                </div>
                              )}
                              <span className="absolute left-2.5 top-2.5 rounded-full bg-amber-400 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-950 shadow">
                                {promo.promoBadge}
                              </span>
                            </div>

                            <div className="p-3.5">
                              <h4 className="line-clamp-1 text-xs font-extrabold text-slate-900">
                                {promo.title}
                              </h4>
                              <p className="mt-1 line-clamp-2 text-[11px] font-medium leading-relaxed text-slate-700">
                                {promo.description}
                              </p>
                              <div className="mt-2.5 flex items-baseline gap-2">
                                <span className="text-sm font-extrabold text-emerald-800">
                                  {promo.priceText}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50 px-3.5 py-2.5">
                            <button
                              type="button"
                              onClick={() => handleTogglePromoActive(promo.id)}
                              className={`rounded-lg px-2.5 py-1 text-[10px] font-extrabold ${
                                promo.isActive
                                  ? 'bg-emerald-100 text-emerald-900'
                                  : 'bg-slate-200 text-slate-800'
                              }`}
                            >
                              {promo.isActive ? 'Ditampilkan' : 'Disembunyikan'}
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditPromoClick(promo)}
                                className="rounded-lg p-1.5 text-blue-700 hover:bg-blue-50"
                                title="Edit Promosi"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeletePromo(promo.id)}
                                className="rounded-lg p-1.5 text-rose-700 hover:bg-rose-50"
                                title="Hapus Promosi"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 3: QR LOKASI & DESKRIPSI TIAP MISI QR ================= */}
          {activeTab === 'qr-missions' && (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
              {/* Left Column: Visual QR Card & Description */}
              <div className="space-y-4 lg:col-span-5">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm space-y-3.5">
                  <span className="inline-block rounded-full bg-blue-100 px-3 py-1 font-mono text-xs font-extrabold text-blue-950">
                    {activeLocation.qrCode}
                  </span>
                  <h3 className="text-base font-extrabold text-slate-900">
                    QR Code Lokasi: {activeLocation.name}
                  </h3>
                  <p className="text-xs font-medium leading-relaxed text-slate-700">
                    {activeLocation.shortDescription}
                  </p>

                  <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-3xl border-2 border-slate-200 bg-slate-50 p-3 shadow-inner">
                    {locationQrUrl ? (
                      <img
                        src={locationQrUrl}
                        alt={activeLocation.qrCode}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <QrCode className="h-14 w-14 text-slate-400" />
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-extrabold">
                    <span className="rounded-xl bg-slate-100 px-3 py-1 text-slate-800">
                      Radius Geofence ≤ {activeLocation.radiusMeters}m
                    </span>
                    <span className="rounded-xl bg-amber-100 px-3 py-1 text-amber-950">
                      Scan QR Unlock: +100 Poin Wisata
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadPosterQr}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#071A3E] py-3 text-xs font-extrabold text-amber-300 shadow-md transition hover:bg-slate-900"
                  >
                    <Download className="h-4 w-4" />
                    <span>Unduh Poster Cetak QR Lokasi + Deskripsi Misi (PNG)</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Detailed List of QR Missions & Descriptions */}
              <div className="space-y-4 lg:col-span-7">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm md:text-base font-extrabold text-slate-900">
                        Daftar &amp; Deskripsi Tiap Misi QR ({activeLocation.missions.length} Misi)
                      </h3>
                      <p className="text-xs font-medium text-slate-700">
                        Misi yang terbuka otomatis saat wisatawan memindai QR lokasi{' '}
                        {activeLocation.name}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-extrabold text-amber-950">
                      Total +{activeLocation.missions.reduce((s, m) => s + m.xpReward, 0)} Poin
                    </span>
                  </div>

                  <div className="space-y-3">
                    {activeLocation.missions.map((m, idx) => (
                      <div
                        key={m.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span
                              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white"
                              style={{ backgroundColor: branding.primaryColor }}
                            >
                              {idx + 1}
                            </span>
                            <div>
                              <h4 className="text-xs md:text-sm font-extrabold text-slate-900">
                                {m.title}
                              </h4>
                              <span className="text-[10px] font-extrabold uppercase text-blue-800">
                                {m.type === 'photo'
                                  ? 'Misi Unggah Foto Komunitas'
                                  : 'Misi Rating & Ulasan Pengunjung'}
                              </span>
                            </div>
                          </div>

                          <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-950">
                            +{m.xpReward} Poin Wisata
                          </span>
                        </div>

                        <p className="rounded-xl border border-slate-200 bg-white p-3 text-xs font-medium leading-relaxed text-slate-800">
                          <strong className="font-extrabold text-slate-950">
                            Deskripsi Misi QR:{' '}
                          </strong>
                          {m.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB 4: KELOLA PROFIL USAHA & WISATA ================= */}
          {activeTab === 'profile' && (
            <form
              onSubmit={handleSaveBusinessProfile}
              className="mx-auto max-w-3xl space-y-4 rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm"
            >
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Store className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    Profil Usaha UMKM &amp; Informasi Titik Wisata
                  </h3>
                  <p className="text-xs font-medium text-slate-600">
                    Perbarui informasi usaha Anda yang tampil langsung pada peta publik{' '}
                    {branding.appName}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-800">
                    Nama Usaha / Unit UMKM Resmi
                  </label>
                  <input
                    type="text"
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-bold text-slate-900"
                    placeholder="Contoh: Kafe & Galeri Souvenir Mangrove"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-800">
                    Titik Lokasi Wisata Terhubung (Ditentukan Admin)
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`${activeLocation.name} (${activeLocation.qrCode})`}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2.5 text-xs font-bold text-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-extrabold text-slate-800">
                  Deskripsi Singkat Wisata &amp; Produk Unggulan UMKM
                </label>
                <textarea
                  rows={3}
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-extrabold text-slate-800">
                    <Clock className="h-3.5 w-3.5 text-blue-700" /> Jam Operasional Usaha
                  </label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={(e) => setOperatingHours(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-bold text-slate-900"
                    placeholder="Setiap Hari, 08.00 – 18.00 WIB"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-extrabold text-slate-800">
                    <DollarSign className="h-3.5 w-3.5 text-emerald-700" /> Kisaran Harga Produk / Tiket
                  </label>
                  <input
                    type="text"
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-bold text-slate-900"
                    placeholder="Mulai Rp 10.000 – Rp 45.000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-800">
                    Nama Penanggung Jawab / Contact Person
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="mb-1 flex items-center gap-1 text-xs font-extrabold text-slate-800">
                    <Phone className="h-3.5 w-3.5 text-emerald-700" /> Nomor WhatsApp Bisnis (Format 628...)
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 font-mono text-xs font-bold text-slate-900"
                    placeholder="628116700101"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="rounded-xl px-6 py-3 text-xs sm:text-sm font-extrabold text-white shadow-md transition"
                  style={{ backgroundColor: branding.buttonColor }}
                >
                  Simpan Perubahan Profil Usaha
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
