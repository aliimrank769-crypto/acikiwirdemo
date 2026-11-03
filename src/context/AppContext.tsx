import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type {
  ActiveRouteInfo,
  AppBranding,
  BusinessInquiry,
  Coordinates,
  DatabaseState,
  LocationReview,
  LocationSpot,
  MissionPhoto,
  OutOfRadiusState,
  PendingQrAction,
  ToastMessage,
  TourismCategoryId,
  UserAccount,
  UserRole,
  UserVoucher,
} from '../types';
import { createInitialSeedDatabase } from '../data/seedLangsa';
import {
  loadDatabaseState,
  loadSessionEmail,
  resetDatabaseToSeed,
  saveDatabaseState,
  saveSessionEmail,
} from '../utils/storage';
import { calculateHaversineMeters, estimateTravelMinutes, hexToRgba } from '../utils/geo';
import { extractQrCodeFromPayload } from '../utils/qr';
import { getIconSvgString } from '../utils/icons';
import type { OsmLayerStyleId } from '../utils/osm';

interface OtpChallenge {
  email: string;
  code: string;
  customName?: string;
  isNewUser: boolean;
  expiresAt: number;
}

export type ActiveNavTab = 'map' | 'explore' | 'passport' | 'umkm' | 'admin';

interface AppContextValue {
  isLoading: boolean;
  db: DatabaseState;
  branding: AppBranding;
  locations: LocationSpot[];
  users: UserAccount[];
  vouchers: UserVoucher[];
  businessInquiries: BusinessInquiry[];
  currentUser: UserAccount | null;

  // Map & Filter State
  selectedCategory: TourismCategoryId | 'all';
  setSelectedCategory: (cat: TourismCategoryId | 'all') => void;
  selectedLocation: LocationSpot | null;
  setSelectedLocationId: (id: string | null) => void;
  locationSheetSnap: 'half' | 'full';
  setLocationSheetSnap: (snap: 'half' | 'full') => void;
  isDesktopSidebarCollapsed: boolean;
  setIsDesktopSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  isDesktopExplorerCollapsed: boolean;
  setIsDesktopExplorerCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  hoveredLocationId: string | null;
  setHoveredLocationId: (id: string | null) => void;
  osmLayerStyle: OsmLayerStyleId;
  setOsmLayerStyle: (style: OsmLayerStyleId) => void;
  mapFocusTarget: { lat: number; lng: number; zoom?: number; nonce: number } | null;
  flyToCoords: (lat: number, lng: number, zoom?: number) => void;

  // GPS & Routing
  userCoords: Coordinates;
  gpsSource: 'default-langsa' | 'browser-gps' | 'demo-teleport';
  isLocatingGps: boolean;
  locateMyGps: () => void;
  teleportDemoGps: (coords: Coordinates, label?: string) => void;
  activeRoute: ActiveRouteInfo | null;
  startRouteToLocation: (location: LocationSpot) => void;
  updateRouteMetrics: (distanceMeters: number, durationMinutes: number, isFallback?: boolean) => void;
  clearActiveRoute: () => void;

  // Hackathon Judge Demo Mode
  isDemoWidgetOpen: boolean;
  setIsDemoWidgetOpen: (open: boolean) => void;
  demoBypassGps: boolean;
  setDemoBypassGps: (bypass: boolean) => void;
  quickSwitchDemoRole: (targetRole?: UserRole) => void;

  // Modals & Navigation Tabs
  activeNavTab: ActiveNavTab;
  setActiveNavTab: (tab: ActiveNavTab) => void;
  isHowToUseOpen: boolean;
  setIsHowToUseOpen: (open: boolean) => void;
  isQrScannerOpen: boolean;
  openQrScannerTrigger: (preferredLocationId?: string) => void;
  closeQrScanner: () => void;
  scannerPreferredLocationId: string | null;

  // Auth & OTP
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  pendingQrAction: PendingQrAction | null;
  activeOtpChallenge: OtpChallenge | null;
  requestEmailOtp: (email: string, customName?: string) => Promise<{ ok: boolean; error?: string; isNewUser?: boolean }>;
  verifyEmailOtp: (email: string, code: string) => { ok: boolean; error?: string };
  logout: () => void;

  // QR Geofence Validation & Unlocked Area Window
  handleQrScanPayload: (rawPayload: string) => void;
  outOfRadiusState: OutOfRadiusState | null;
  closeOutOfRadiusModal: () => void;
  unlockedModalState: { location: LocationSpot; celebrate: boolean } | null;
  openUnlockedAreaModal: (location: LocationSpot, celebrate?: boolean) => void;
  closeUnlockedAreaModal: () => void;

  // Micro-Missions & Community Content
  submitMissionPhoto: (
    locationId: string,
    missionId: string,
    imageUrl: string,
    caption: string
  ) => void;
  submitLocationReview: (
    locationId: string,
    rating: number,
    comment: string,
    missionId?: string
  ) => void;

  // UMKM Owner & Voucher Redemption Features (Bebas Pilih Tempat Redeem & Tukar Poin)
  claimVoucherWithPoints: (targetLocationId: string) => {
    ok: boolean;
    message: string;
    voucher?: UserVoucher;
  };
  changeVoucherLocation: (voucherId: string, targetLocationId: string) => void;
  redeemUserVoucher: (
    voucherCode: string,
    targetLocationId?: string
  ) => {
    ok: boolean;
    message: string;
    voucher?: UserVoucher;
  };
  updateUmkmBusinessProfile: (locationId: string, patch: Partial<LocationSpot>) => void;
  submitBusinessInquiry: (
    inquiry: Omit<BusinessInquiry, 'id' | 'status' | 'createdAt'>
  ) => void;
  createUmkmAccountByAdmin: (params: {
    email: string;
    ownerName: string;
    businessName: string;
    phone: string;
    locationId: string;
    inquiryId?: string;
  }) => { ok: boolean; error?: string };
  rejectBusinessInquiry: (inquiryId: string) => void;

  // Admin Panel CRUD & White-Label CMS
  upsertLocation: (spot: LocationSpot) => void;
  deleteLocation: (locationId: string) => void;
  updateBranding: (partial: Partial<AppBranding>) => void;
  updateUserRole: (email: string, role: UserRole, managedLocationId?: string) => void;
  resetUserProgress: (email: string) => void;
  toggleUserActive: (email: string) => void;
  deleteUserAccount: (email: string) => void;
  deleteMissionPhoto: (locationId: string, photoId: string) => void;
  deleteLocationReview: (locationId: string, reviewId: string) => void;
  resetAllDataToSeed: () => Promise<void>;

  // Toast Notifications
  toasts: ToastMessage[];
  pushToast: (toast: Omit<ToastMessage, 'id'>) => void;
  dismissToast: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// Koordinat awal default posisi user di Pusat Kota Langsa
const DEFAULT_USER_COORDS: Coordinates = {
  lat: 4.4815,
  lng: 97.9655,
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [db, setDb] = useState<DatabaseState>(() => createInitialSeedDatabase());
  const [sessionEmail, setSessionEmail] = useState<string | null>(() => loadSessionEmail());

  const [selectedCategory, setSelectedCategory] = useState<TourismCategoryId | 'all'>('all');
  const [selectedLocationId, setSelectedLocationIdState] = useState<string | null>(null);
  const [locationSheetSnap, setLocationSheetSnap] = useState<'half' | 'full'>('half');
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState<boolean>(false);
  const [isDesktopExplorerCollapsed, setIsDesktopExplorerCollapsed] = useState<boolean>(false);
  const [hoveredLocationId, setHoveredLocationId] = useState<string | null>(null);

  const setSelectedLocationId = useCallback((id: string | null) => {
    setSelectedLocationIdState(id);
    setLocationSheetSnap('half');
  }, []);
  const [osmLayerStyle, setOsmLayerStyle] = useState<OsmLayerStyleId>('osm-standard');
  const [mapFocusTarget, setMapFocusTarget] = useState<{
    lat: number;
    lng: number;
    zoom?: number;
    nonce: number;
  } | null>(null);

  // GPS & Routing state
  const [userCoords, setUserCoords] = useState<Coordinates>(DEFAULT_USER_COORDS);
  const [gpsSource, setGpsSource] = useState<'default-langsa' | 'browser-gps' | 'demo-teleport'>(
    'default-langsa'
  );
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [activeRoute, setActiveRoute] = useState<ActiveRouteInfo | null>(null);

  // Hackathon Judge Demo state
  const [isDemoWidgetOpen, setIsDemoWidgetOpen] = useState(false);
  const [demoBypassGps, setDemoBypassGps] = useState(false);

  // Navigation & Modals
  const [activeNavTab, setActiveNavTab] = useState<ActiveNavTab>('map');
  const [isHowToUseOpen, setIsHowToUseOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scannerPreferredLocationId, setScannerPreferredLocationId] = useState<string | null>(null);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingQrAction, setPendingQrAction] = useState<PendingQrAction | null>(null);
  const [activeOtpChallenge, setActiveOtpChallenge] = useState<OtpChallenge | null>(null);

  const [outOfRadiusState, setOutOfRadiusState] = useState<OutOfRadiusState | null>(null);
  const [unlockedModalId, setUnlockedModalId] = useState<{
    locationId: string;
    celebrate: boolean;
  } | null>(null);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const isInitialLoadRef = useRef(true);

  const pushToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const duration = toast.durationMs ?? (toast.type === 'otp' ? 18000 : 4500);
    setToasts((prev) => [{ ...toast, id }, ...prev].slice(0, 4));
    if (duration > 0) {
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load initial persistent DB
  useEffect(() => {
    let mounted = true;
    loadDatabaseState().then((loaded) => {
      if (!mounted) return;
      setDb(loaded);
      setIsLoading(false);
      window.setTimeout(() => {
        isInitialLoadRef.current = false;
      }, 50);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Persist DB whenever modified
  useEffect(() => {
    if (isLoading || isInitialLoadRef.current) return;
    saveDatabaseState(db);
  }, [db, isLoading]);

  // Apply White-Label Dynamic CSS Variables, Document Title, Meta Theme Color & Favicon in Real-Time
  useEffect(() => {
    const { branding } = db;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', branding.primaryColor);
    root.style.setProperty('--color-primary-soft', hexToRgba(branding.primaryColor, 0.14));
    root.style.setProperty('--color-accent', branding.accentColor);
    root.style.setProperty('--color-accent-soft', hexToRgba(branding.accentColor, 0.18));
    root.style.setProperty('--color-btn', branding.buttonColor);

    document.title = `${branding.appName} — ${branding.tagline}`;

    const themeMeta = document.getElementById('meta-theme-color');
    if (themeMeta) {
      themeMeta.setAttribute('content', branding.primaryColor);
    }

    const faviconLink = document.getElementById('dynamic-favicon') as HTMLLinkElement | null;
    if (faviconLink) {
      if (branding.logoType === 'image' && branding.logoImageUrl) {
        faviconLink.href = branding.logoImageUrl;
      } else {
        const iconSvg = getIconSvgString(branding.logoIcon, '#ffffff', 72);
        const innerSvg = iconSvg
          .replace(/^<svg[^>]*>/, '')
          .replace(/<\/svg>$/, '');
        const fullFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="${branding.primaryColor}"/><g transform="translate(26, 26) scale(3.15)" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${innerSvg}</g></svg>`;
        faviconLink.href = `data:image/svg+xml;utf8,${encodeURIComponent(fullFavicon)}`;
      }
    }
  }, [db.branding]);

  const currentUser = useMemo(() => {
    if (!sessionEmail) return null;
    const found = db.users.find(
      (u) => u.email.toLowerCase() === sessionEmail.toLowerCase()
    );
    if (!found || !found.isActive) return null;
    return found;
  }, [db.users, sessionEmail]);

  // If user is no longer admin or umkm, exit restricted tabs automatically.
  // Also, UMKM and Admin do NOT have the Paspor tab!
  useEffect(() => {
    if (activeNavTab === 'admin' && currentUser?.role !== 'admin') {
      setActiveNavTab('map');
    }
    if (
      activeNavTab === 'umkm' &&
      currentUser?.role !== 'umkm' &&
      currentUser?.role !== 'admin'
    ) {
      setActiveNavTab('map');
    }
    if (
      activeNavTab === 'passport' &&
      (currentUser?.role === 'admin' || currentUser?.role === 'umkm')
    ) {
      setActiveNavTab(currentUser.role === 'admin' ? 'admin' : 'umkm');
    }
  }, [activeNavTab, currentUser]);

  const selectedLocation = useMemo(
    () => db.locations.find((l) => l.id === selectedLocationId) ?? null,
    [db.locations, selectedLocationId]
  );

  const unlockedModalState = useMemo(() => {
    if (!unlockedModalId) return null;
    const loc = db.locations.find((l) => l.id === unlockedModalId.locationId);
    if (!loc) return null;
    return { location: loc, celebrate: unlockedModalId.celebrate };
  }, [db.locations, unlockedModalId]);

  const flyToCoords = useCallback((lat: number, lng: number, zoom = 15) => {
    setMapFocusTarget({ lat, lng, zoom, nonce: Date.now() });
  }, []);

  // Browser GPS Locator
  const locateMyGps = useCallback(() => {
    if (!('geolocation' in navigator)) {
      pushToast({
        type: 'warning',
        title: 'GPS Tidak Tersedia',
        message: 'Browser tidak mendukung Geolocation. Menggunakan koordinat simulasi pusat kota.',
      });
      flyToCoords(userCoords.lat, userCoords.lng, 15);
      return;
    }

    setIsLocatingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGps(false);
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserCoords(coords);
        setGpsSource('browser-gps');
        flyToCoords(coords.lat, coords.lng, 15);
        pushToast({
          type: 'success',
          title: 'Lokasi GPS Diperbarui',
          message: `Posisi Anda: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
        });
      },
      () => {
        setIsLocatingGps(false);
        flyToCoords(userCoords.lat, userCoords.lng, 15);
        pushToast({
          type: 'info',
          title: 'Menggunakan Titik Simulasi Kota Langsa',
          message:
            'Izin GPS browser ditolak/tidak aktif. Anda tetap dapat menavigasi rute atau memakai Mode Demo Juri.',
        });
      },
      { enableHighAccuracy: true, timeout: 7000 }
    );
  }, [flyToCoords, pushToast, userCoords.lat, userCoords.lng]);

  const teleportDemoGps = useCallback(
    (coords: Coordinates, label?: string) => {
      setUserCoords(coords);
      setGpsSource('demo-teleport');
      flyToCoords(coords.lat, coords.lng, 16);
      pushToast({
        type: 'info',
        title: 'Simulasi GPS Dipindahkan',
        message: label
          ? `Posisi GPS simulasi kini berada di dekat ${label}.`
          : `Koordinat simulasi: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
      });
    },
    [flyToCoords, pushToast]
  );

  // Route Navigation
  const startRouteToLocation = useCallback(
    (location: LocationSpot) => {
      const dist = calculateHaversineMeters(userCoords, {
        lat: location.lat,
        lng: location.lng,
      });
      setActiveRoute({
        destinationId: location.id,
        destinationName: location.name,
        from: { ...userCoords },
        to: { lat: location.lat, lng: location.lng },
        distanceMeters: dist,
        durationMinutes: estimateTravelMinutes(dist),
      });
      setActiveNavTab('map');
      setOutOfRadiusState(null);
      pushToast({
        type: 'info',
        title: 'Menghitung Rute Perjalanan',
        message: `Menampilkan rute menuju ${location.name} di atas peta.`,
      });
    },
    [pushToast, userCoords]
  );

  const updateRouteMetrics = useCallback(
    (distanceMeters: number, durationMinutes: number, isFallback = false) => {
      setActiveRoute((prev) =>
        prev
          ? {
              ...prev,
              distanceMeters,
              durationMinutes: Math.max(1, durationMinutes),
              isFallbackLine: isFallback,
            }
          : null
      );
    },
    []
  );

  const clearActiveRoute = useCallback(() => {
    setActiveRoute(null);
  }, []);

  // Core QR Validation Logic (runs when user is authenticated)
  const executeAuthenticatedQrValidation = useCallback(
    (rawPayload: string, user: UserAccount, currentDb: DatabaseState) => {
      const code = extractQrCodeFromPayload(rawPayload);
      const location = currentDb.locations.find(
        (l) =>
          l.qrCode.toLowerCase() === code.toLowerCase() ||
          l.id.toLowerCase() === code.toLowerCase()
      );

      if (!location) {
        pushToast({
          type: 'error',
          title: 'QR Code Tidak Dikenali',
          message: `Kode "${code}" tidak cocok dengan titik wisata mana pun.`,
        });
        return;
      }

      const distanceMeters = calculateHaversineMeters(userCoords, {
        lat: location.lat,
        lng: location.lng,
      });

      const isInsideRadius = demoBypassGps || distanceMeters <= location.radiusMeters;

      if (!isInsideRadius) {
        setIsQrScannerOpen(false);
        setSelectedLocationId(location.id);
        setOutOfRadiusState({ location, distanceMeters });
        return;
      }

      // Valid! Unlock location for this user if not yet unlocked
      // Note: Only regular tourists ('user') collect Poin Wisata (xp) & Paspor badges.
      const alreadyUnlocked = user.unlockedLocationIds.includes(location.id);
      const isTourist = user.role === 'user';

      if (!alreadyUnlocked) {
        setDb((prev) => {
          const updatedUsers = prev.users.map((u) => {
            if (u.email.toLowerCase() !== user.email.toLowerCase()) return u;
            const nextUnlocked = [...u.unlockedLocationIds, location.id];
            const nextBadges = [...u.badges];
            if (isTourist) {
              if (nextUnlocked.length === 1 && !nextBadges.includes('Langkah Pertama')) {
                nextBadges.push('Langkah Pertama');
              }
              if (nextUnlocked.length >= 3 && !nextBadges.includes('Penjelajah Aktif')) {
                nextBadges.push('Penjelajah Aktif');
              }
              if (
                nextUnlocked.length >= prev.locations.length &&
                !nextBadges.includes('Master Jejak Wisata')
              ) {
                nextBadges.push('Master Jejak Wisata');
              }
            }
            return {
              ...u,
              unlockedLocationIds: nextUnlocked,
              xp: isTourist ? u.xp + 100 : u.xp,
              badges: nextBadges,
            };
          });
          return { ...prev, users: updatedUsers };
        });
      }

      setIsQrScannerOpen(false);
      setOutOfRadiusState(null);
      setSelectedLocationId(location.id);
      flyToCoords(location.lat, location.lng, 16);
      setUnlockedModalId({ locationId: location.id, celebrate: true });

      pushToast({
        type: 'success',
        title: alreadyUnlocked
          ? 'Wilayah Terbuka!'
          : isTourist
          ? 'Wilayah Baru Berhasil Di-Unlock! (+100 Poin Wisata)'
          : 'Wilayah Baru Berhasil Di-Unlock!',
        message: isTourist
          ? `Selamat menjelajahi ${location.name}. Kumpulkan Poin dari Misi QR untuk ditukar & di-redeem bebas di UMKM mana saja!`
          : `Anda berhasil memindai QR lokasi ${location.name}.`,
      });
    },
    [demoBypassGps, flyToCoords, pushToast, userCoords]
  );

  // Triggered when user clicks "Scan QR" button
  const openQrScannerTrigger = useCallback(
    (preferredLocationId?: string) => {
      if (!currentUser) {
        // Lazy Auth: Pause and open Gmail OTP Modal, then auto-open scanner after login!
        setPendingQrAction({ type: 'open-scanner', preferredLocationId });
        setIsAuthModalOpen(true);
        pushToast({
          type: 'info',
          title: 'Login Gmail OTP Diperlukan',
          message: 'Masuk terlebih dahulu — pemindai QR akan terbuka otomatis setelah verifikasi.',
        });
        return;
      }
      setScannerPreferredLocationId(preferredLocationId ?? null);
      setIsQrScannerOpen(true);
    },
    [currentUser, pushToast]
  );

  // Triggered when QR code is scanned (or simulated in Demo Mode, even if logged out!)
  const handleQrScanPayload = useCallback(
    (rawPayload: string) => {
      if (!currentUser) {
        // Lazy Auth: Pause validation of this exact QR code, prompt Gmail OTP, then auto-validate!
        setIsQrScannerOpen(false);
        setPendingQrAction({ type: 'validate-qr', qrPayload: rawPayload });
        setIsAuthModalOpen(true);
        pushToast({
          type: 'info',
          title: 'QR Code Terdeteksi — Verifikasi Akun',
          message:
            'Masukkan Gmail & OTP Anda. Validasi QR lokasi ini akan dilanjutkan otomatis setelah login!',
        });
        return;
      }
      executeAuthenticatedQrValidation(rawPayload, currentUser, db);
    },
    [currentUser, db, executeAuthenticatedQrValidation, pushToast]
  );

  // Request 6-digit OTP for 1 Gmail = 1 Account
  // NOTE: Self-registration is strictly for regular visitors ('user').
  // UMKM/Tourism owners cannot self-register — their accounts must be created by Admin after Business Chat!
  const requestEmailOtp = useCallback(
    async (
      rawEmail: string,
      customName?: string
    ): Promise<{ ok: boolean; error?: string; isNewUser?: boolean }> => {
      const email = rawEmail.trim().toLowerCase();
      const gmailRegex = /^[a-z0-9._%+-]+@gmail\.com$/;
      if (!gmailRegex.test(email)) {
        return {
          ok: false,
          error: 'Gunakan alamat email resmi berakhiran @gmail.com (1 Gmail = 1 Akun).',
        };
      }

      const existing = db.users.find((u) => u.email.toLowerCase() === email);
      if (existing && !existing.isActive) {
        return {
          ok: false,
          error: 'Akun Gmail ini telah dinonaktifkan oleh Admin. Hubungi pengelola aplikasi.',
        };
      }

      const otpCode = String(Math.floor(100000 + Math.random() * 900000));
      const isNewUser = !existing;

      setActiveOtpChallenge({
        email,
        code: otpCode,
        customName: customName?.trim() || undefined,
        isNewUser,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      // Attempt server SMTP email delivery in background
      let smtpDelivered = false;
      try {
        const res = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            otp: otpCode,
            appName: db.branding.appName,
            isNewUser,
          }),
        });
        if (res.ok) {
          const data = (await res.json()) as { emailSent?: boolean };
          smtpDelivered = Boolean(data.emailSent);
        }
      } catch {
        // Fallback to instant on-screen toast OTP
      }

      // Always display instant fallback OTP toast so hackathon demo works without SMTP setup
      pushToast({
        type: 'otp',
        title: smtpDelivered
          ? `OTP Terkirim ke ${email}`
          : `Kode OTP ${db.branding.appName} (Demo Fallback)`,
        message: isNewUser
          ? `Pendaftaran akun wisatawan ${email}. Masukkan 6-digit kode di bawah:`
          : `Login akun terdaftar ${email} (${existing.role.toUpperCase()}). Masukkan 6-digit kode di bawah:`,
        otpCode,
        durationMs: 25000,
      });

      return { ok: true, isNewUser };
    },
    [db.branding.appName, db.users, pushToast]
  );

  // Verify 6-digit OTP and resume any pending QR scan automatically!
  const verifyEmailOtp = useCallback(
    (rawEmail: string, inputCode: string): { ok: boolean; error?: string } => {
      const email = rawEmail.trim().toLowerCase();
      const cleanCode = inputCode.trim();

      if (!activeOtpChallenge || activeOtpChallenge.email !== email) {
        return { ok: false, error: 'Sesi OTP tidak ditemukan. Silakan minta ulang kode OTP.' };
      }

      if (Date.now() > activeOtpChallenge.expiresAt) {
        return { ok: false, error: 'Kode OTP sudah kedaluwarsa. Silakan kirim ulang OTP.' };
      }

      if (activeOtpChallenge.code !== cleanCode) {
        return { ok: false, error: 'Kode OTP tidak sesuai. Periksa 6-digit angka pada notifikasi.' };
      }

      let loggedInUser = db.users.find((u) => u.email.toLowerCase() === email);
      let nextDb = db;

      if (!loggedInUser) {
        const defaultName =
          activeOtpChallenge.customName ||
          email
            .split('@')[0]
            .replace(/[._-]+/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());

        // Strict rule: Self-created accounts can only be 'user' (or default 'admin@gmail.com').
        // 'umkm' accounts can ONLY be created by Admin!
        const autoRole: UserRole = email === 'admin@gmail.com' ? 'admin' : 'user';
        loggedInUser = {
          email,
          name: defaultName,
          role: autoRole,
          isActive: true,
          joinedAt: new Date().toISOString(),
          unlockedLocationIds: [],
          completedMissionKeys: [],
          xp: 50,
          badges: autoRole === 'admin' ? ['Pengelola Utama'] : ['Penjelajah Baru'],
        };

        nextDb = {
          ...db,
          users: [...db.users, loggedInUser],
        };
        setDb(nextDb);
      }

      setSessionEmail(loggedInUser.email);
      saveSessionEmail(loggedInUser.email);
      setActiveOtpChallenge(null);
      setIsAuthModalOpen(false);

      // Dismiss OTP toast once verified
      setToasts((prev) => prev.filter((t) => t.type !== 'otp'));

      const roleLabel =
        loggedInUser.role === 'admin'
          ? 'Admin Pengelola'
          : loggedInUser.role === 'umkm'
          ? `Owner UMKM (${loggedInUser.businessName || 'Mitra Usaha'})`
          : 'Wisatawan';

      pushToast({
        type: 'success',
        title: `Selamat Datang, ${loggedInUser.name}!`,
        message: `Login berhasil sebagai ${roleLabel}.`,
      });

      if (loggedInUser.role === 'umkm' && !pendingQrAction) {
        setActiveNavTab('umkm');
      }

      // Automatically continue paused QR scan / validation!
      const pending = pendingQrAction;
      if (pending) {
        setPendingQrAction(null);
        const userRef = loggedInUser;
        window.setTimeout(() => {
          if (pending.type === 'validate-qr') {
            executeAuthenticatedQrValidation(pending.qrPayload, userRef, nextDb);
          } else if (pending.type === 'open-scanner') {
            setScannerPreferredLocationId(pending.preferredLocationId ?? null);
            setIsQrScannerOpen(true);
          }
        }, 180);
      }

      return { ok: true };
    },
    [activeOtpChallenge, db, executeAuthenticatedQrValidation, pendingQrAction, pushToast]
  );

  const logout = useCallback(() => {
    setSessionEmail(null);
    saveSessionEmail(null);
    setActiveNavTab('map');
    pushToast({
      type: 'info',
      title: 'Sesi Berakhir',
      message: 'Anda telah keluar dari akun. Peta wisata tetap dapat diakses secara publik.',
    });
  }, [pushToast]);

  // Quick Switch Role (User <-> UMKM Owner <-> Admin) for Hackathon Judges
  const quickSwitchDemoRole = useCallback(
    (targetRole?: UserRole) => {
      const desiredRole: UserRole =
        targetRole ??
        (currentUser?.role === 'user'
          ? 'umkm'
          : currentUser?.role === 'umkm'
          ? 'admin'
          : 'user');

      if (desiredRole === 'admin') {
        let adminAcc = db.users.find((u) => u.email.toLowerCase() === 'admin@gmail.com');
        if (!adminAcc) {
          adminAcc = {
            email: 'admin@gmail.com',
            name: 'Admin Pengelola Wisata',
            role: 'admin',
            isActive: true,
            joinedAt: new Date().toISOString(),
            unlockedLocationIds: [],
            completedMissionKeys: [],
            xp: 200,
            badges: ['Pengelola Utama'],
          };
          setDb((prev) => ({ ...prev, users: [adminAcc!, ...prev.users] }));
        } else if (adminAcc.role !== 'admin' || !adminAcc.isActive) {
          setDb((prev) => ({
            ...prev,
            users: prev.users.map((u) =>
              u.email.toLowerCase() === 'admin@gmail.com'
                ? { ...u, role: 'admin', isActive: true }
                : u
            ),
          }));
        }
        setSessionEmail('admin@gmail.com');
        saveSessionEmail('admin@gmail.com');
        setActiveNavTab('admin');
        pushToast({
          type: 'success',
          title: 'Quick Switch → Role ADMIN',
          message: 'Masuk sebagai admin@gmail.com. Admin Panel terbuka otomatis!',
        });
      } else if (desiredRole === 'umkm') {
        const umkmEmail = 'umkm.mangrove@gmail.com';
        let umkmAcc = db.users.find(
          (u) => u.role === 'umkm' && u.isActive
        );
        if (!umkmAcc) {
          umkmAcc = {
            email: umkmEmail,
            name: 'Bang Hendra (Owner Kafe & Souvenir Mangrove)',
            role: 'umkm',
            isActive: true,
            joinedAt: new Date().toISOString(),
            unlockedLocationIds: ['loc-mangrove-kuala'],
            completedMissionKeys: [],
            xp: 200,
            badges: ['Mitra UMKM Resmi'],
            managedLocationId: 'loc-mangrove-kuala',
            businessName: 'Kafe & Galeri Souvenir Mangrove Kuala Langsa',
            businessPhone: '628116700101',
          };
          setDb((prev) => ({ ...prev, users: [...prev.users, umkmAcc!] }));
        }
        setSessionEmail(umkmAcc.email);
        saveSessionEmail(umkmAcc.email);
        setActiveNavTab('umkm');
        pushToast({
          type: 'success',
          title: 'Quick Switch → Role OWNER UMKM',
          message: `Masuk sebagai ${umkmAcc.businessName || umkmAcc.name}. Panel UMKM & Redeem Voucher aktif!`,
        });
      } else {
        // Switch to a visitor user account
        const visitorEmail = 'cut.nadia@gmail.com';
        let visitor = db.users.find(
          (u) => u.role === 'user' && u.isActive && u.email !== 'admin@gmail.com'
        );
        if (!visitor) {
          visitor = {
            email: visitorEmail,
            name: 'Wisatawan Demo Juri',
            role: 'user',
            isActive: true,
            joinedAt: new Date().toISOString(),
            unlockedLocationIds: [],
            completedMissionKeys: [],
            xp: 100,
            badges: ['Penjelajah Demo'],
          };
          setDb((prev) => ({ ...prev, users: [...prev.users, visitor!] }));
        }
        setSessionEmail(visitor.email);
        saveSessionEmail(visitor.email);
        if (activeNavTab === 'admin' || activeNavTab === 'umkm') {
          setActiveNavTab('map');
        }
        pushToast({
          type: 'info',
          title: 'Quick Switch → Role WISATAWAN (USER)',
          message: `Beralih ke tampilan pengunjung (${visitor.email}).`,
        });
      }
    },
    [activeNavTab, currentUser?.role, db.users, pushToast]
  );

  // Helper to build a new UserVoucher when a mission is completed
  const createMissionVoucherReward = useCallback(
    (
      location: LocationSpot,
      user: UserAccount,
      missionId: string,
      missionTitle: string
    ): UserVoucher => {
      const prefix = location.id
        .replace(/^loc-/, '')
        .split('-')[0]
        .slice(0, 6)
        .toUpperCase();
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const code = `VC-${prefix}-${randomDigits}`;

      return {
        id: `vch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code,
        locationId: 'any',
        locationName: 'Bebas Pilih Mitra UMKM Mana Saja',
        merchantName: `Bebas Redeem di Semua UMKM (Asal Misi: ${location.name})`,
        title: location.voucherConfig?.title || `Voucher Wisata Bebas Pilih UMKM`,
        discountValue: location.voucherConfig?.discountValue || 'Diskon UMKM Rp 10.000',
        pointCost: location.voucherConfig?.pointCost ?? 80,
        terms:
          location.voucherConfig?.terms ||
          'Bebas digunakan/di-redeem di mitra UMKM mana saja pilihan Anda di Kota Langsa.',
        userEmail: user.email,
        userName: user.name,
        missionId,
        missionTitle: `${missionTitle} (${location.name})`,
        status: 'active',
        issuedAt: new Date().toISOString(),
      };
    },
    []
  );

  // Submit Micro-Mission Photo -> Automatically synced to Location Gallery + Collects Points & Issues Flexible UMKM Voucher!
  const submitMissionPhoto = useCallback(
    (locationId: string, missionId: string, imageUrl: string, caption: string) => {
      if (!currentUser) return;
      const location = db.locations.find((l) => l.id === locationId);
      if (!location) return;
      const mission = location.missions.find((m) => m.id === missionId);
      const missionLabel = mission?.title ?? 'Misi Foto Wisata';
      const xpReward = mission?.xpReward ?? 50;
      const missionKey = `${locationId}::${missionId}`;

      const newPhoto: MissionPhoto = {
        id: `ph-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        locationId,
        missionId,
        missionLabel,
        userEmail: currentUser.email,
        userName: currentUser.name,
        imageUrl,
        caption: caption.trim() || `Menyelesaikan misi "${missionLabel}" di ${location.name}`,
        createdAt: new Date().toISOString(),
      };

      const isTourist = currentUser.role === 'user';

      const alreadyReceivedVoucherForMission = (db.vouchers ?? []).some(
        (v) =>
          v.userEmail.toLowerCase() === currentUser.email.toLowerCase() &&
          v.missionId === missionId
      );

      const shouldIssueVoucher =
        isTourist &&
        location.voucherConfig?.enabled !== false &&
        !alreadyReceivedVoucherForMission;

      const earnedVoucher = shouldIssueVoucher
        ? createMissionVoucherReward(location, currentUser, missionId, missionLabel)
        : null;

      setDb((prev) => {
        const nextLocations = prev.locations.map((loc) =>
          loc.id === locationId
            ? { ...loc, photos: [newPhoto, ...loc.photos] }
            : loc
        );

        const nextUsers = prev.users.map((u) => {
          if (u.email.toLowerCase() !== currentUser.email.toLowerCase()) return u;
          const alreadyDone = u.completedMissionKeys.includes(missionKey);
          const nextKeys = alreadyDone
            ? u.completedMissionKeys
            : [...u.completedMissionKeys, missionKey];
          const nextBadges =
            isTourist && !u.badges.includes('Kontributor Galeri')
              ? [...u.badges, 'Kontributor Galeri']
              : u.badges;
          return {
            ...u,
            completedMissionKeys: nextKeys,
            xp: isTourist ? (alreadyDone ? u.xp + 15 : u.xp + xpReward) : u.xp,
            badges: nextBadges,
          };
        });

        const nextVouchers = earnedVoucher
          ? [earnedVoucher, ...(prev.vouchers ?? [])]
          : prev.vouchers ?? [];

        return {
          ...prev,
          locations: nextLocations,
          users: nextUsers,
          vouchers: nextVouchers,
        };
      });

      pushToast({
        type: 'success',
        title: isTourist
          ? `Foto Misi Tersimpan! (+${xpReward} Poin Wisata)`
          : 'Foto Misi Tersimpan ke Galeri!',
        message: `Foto langsung tampil di Galeri Komunitas ${location.name}.`,
      });

      if (earnedVoucher) {
        window.setTimeout(() => {
          pushToast({
            type: 'success',
            title: `🎟️ Voucher Bebas UMKM Didapatkan! (${earnedVoucher.discountValue})`,
            message: `Kode: ${earnedVoucher.code} — Bebas pilih mau redeem di UMKM mana saja!`,
            durationMs: 8000,
          });
        }, 350);
      }
    },
    [createMissionVoucherReward, currentUser, db.locations, db.vouchers, pushToast]
  );

  // Submit Rating & Review -> Automatically synced to Location Reviews + Collects Points & Issues Flexible UMKM Voucher!
  const submitLocationReview = useCallback(
    (locationId: string, rating: number, comment: string, missionId?: string) => {
      if (!currentUser) return;
      const location = db.locations.find((l) => l.id === locationId);
      if (!location) return;
      const safeRating = Math.min(5, Math.max(1, Math.round(rating)));
      const mission = missionId
        ? location.missions.find((m) => m.id === missionId)
        : location.missions.find((m) => m.type === 'review');
      const xpReward = mission?.xpReward ?? 40;
      const resolvedMissionId = mission?.id ?? 'mission-review';
      const missionTitle = mission?.title ?? 'Rating & Review Pengunjung';
      const missionKey = mission ? `${locationId}::${mission.id}` : null;

      const newReview: LocationReview = {
        id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        locationId,
        missionId: mission?.id,
        userEmail: currentUser.email,
        userName: currentUser.name,
        rating: safeRating,
        comment: comment.trim() || 'Tempat wisata yang sangat berkesan dan direkomendasikan!',
        createdAt: new Date().toISOString(),
      };

      const isTourist = currentUser.role === 'user';

      const alreadyReceivedVoucherForMission = (db.vouchers ?? []).some(
        (v) =>
          v.userEmail.toLowerCase() === currentUser.email.toLowerCase() &&
          v.missionId === resolvedMissionId
      );

      const shouldIssueVoucher =
        isTourist &&
        location.voucherConfig?.enabled !== false &&
        !alreadyReceivedVoucherForMission;

      const earnedVoucher = shouldIssueVoucher
        ? createMissionVoucherReward(location, currentUser, resolvedMissionId, missionTitle)
        : null;

      setDb((prev) => {
        const nextLocations = prev.locations.map((loc) =>
          loc.id === locationId
            ? { ...loc, reviews: [newReview, ...loc.reviews] }
            : loc
        );

        const nextUsers = prev.users.map((u) => {
          if (u.email.toLowerCase() !== currentUser.email.toLowerCase()) return u;
          const alreadyDone = missionKey ? u.completedMissionKeys.includes(missionKey) : false;
          const nextKeys =
            missionKey && !alreadyDone
              ? [...u.completedMissionKeys, missionKey]
              : u.completedMissionKeys;
          return {
            ...u,
            completedMissionKeys: nextKeys,
            xp: isTourist ? (alreadyDone ? u.xp + 10 : u.xp + xpReward) : u.xp,
          };
        });

        const nextVouchers = earnedVoucher
          ? [earnedVoucher, ...(prev.vouchers ?? [])]
          : prev.vouchers ?? [];

        return {
          ...prev,
          locations: nextLocations,
          users: nextUsers,
          vouchers: nextVouchers,
        };
      });

      pushToast({
        type: 'success',
        title: isTourist
          ? `Ulasan Terkirim! (★ ${safeRating}/5 • +${xpReward} Poin Wisata)`
          : `Ulasan Terkirim! (★ ${safeRating}/5)`,
        message: `Ulasan Anda kini muncul di halaman publik ${location.name}.`,
      });

      if (earnedVoucher) {
        window.setTimeout(() => {
          pushToast({
            type: 'success',
            title: `🎟️ Voucher Bebas UMKM Didapatkan! (${earnedVoucher.discountValue})`,
            message: `Kode: ${earnedVoucher.code} — Bebas pilih mau redeem di UMKM mana saja!`,
            durationMs: 8000,
          });
        }, 350);
      }
    },
    [createMissionVoucherReward, currentUser, db.locations, db.vouchers, pushToast]
  );

  // ================= UMKM OWNER & FREE-CHOICE VOUCHER REDEMPTION OPERATIONS =================

  // Wisatawan menukarkan Poin Wisata yang terkumpul menjadi Voucher UMKM pilihan mereka sendiri (bebas pilih UMKM!)
  const claimVoucherWithPoints = useCallback(
    (
      targetLocationId: string
    ): {
      ok: boolean;
      message: string;
      voucher?: UserVoucher;
    } => {
      if (!currentUser) {
        return {
          ok: false,
          message: 'Silakan login terlebih dahulu untuk menukarkan Poin Wisata menjadi Voucher.',
        };
      }

      if (currentUser.role !== 'user') {
        pushToast({
          type: 'info',
          title: 'Khusus Akun Wisatawan',
          message: 'Pengumpulan Poin & Paspor Voucher hanya berlaku untuk akun Wisatawan (User).',
        });
        return {
          ok: false,
          message: 'Fitur pengumpulan poin & tukar voucher hanya tersedia untuk akun Wisatawan.',
        };
      }

      const chosenSpot =
        targetLocationId && targetLocationId !== 'any'
          ? db.locations.find((l) => l.id === targetLocationId) ?? null
          : null;

      const pointCost = chosenSpot?.voucherConfig?.pointCost ?? 80;

      if (currentUser.xp < pointCost) {
        pushToast({
          type: 'warning',
          title: 'Saldo Poin Wisata Belum Cukup',
          message: `Butuh ${pointCost} Poin (Saldo Anda: ${currentUser.xp} Poin). Scan QR lokasi atau selesaikan misi untuk kumpul poin!`,
        });
        return {
          ok: false,
          message: `Saldo Poin Wisata Anda (${currentUser.xp} Poin) belum mencukupi untuk tukar voucher ini (${pointCost} Poin).`,
        };
      }

      const prefix = chosenSpot
        ? chosenSpot.id
            .replace(/^loc-/, '')
            .split('-')[0]
            .slice(0, 6)
            .toUpperCase()
        : 'BEBAS';
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      const code = `VC-${prefix}-${randomDigits}`;

      const newVoucher: UserVoucher = {
        id: `vch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        code,
        locationId: chosenSpot ? chosenSpot.id : 'any',
        locationName: chosenSpot
          ? chosenSpot.name
          : 'Bebas Pilih Mitra UMKM Mana Saja',
        merchantName: chosenSpot
          ? chosenSpot.merchantName || `Mitra UMKM ${chosenSpot.name}`
          : 'Semua Mitra UMKM Kota Langsa (Bebas Pilih)',
        title: chosenSpot?.voucherConfig?.title || 'Voucher Tukar Poin Wisata (Bebas UMKM)',
        discountValue:
          chosenSpot?.voucherConfig?.discountValue || 'Potongan Belanja UMKM Rp 10.000',
        pointCost,
        terms:
          chosenSpot?.voucherConfig?.terms ||
          'Wisatawan bebas memilih dan mengganti mitra UMKM tempat menukarkan voucher ini.',
        userEmail: currentUser.email,
        userName: currentUser.name,
        missionId: 'point-exchange',
        missionTitle: `Tukar ${pointCost} Poin Wisata`,
        status: 'active',
        issuedAt: new Date().toISOString(),
      };

      setDb((prev) => ({
        ...prev,
        vouchers: [newVoucher, ...(prev.vouchers ?? [])],
        users: prev.users.map((u) =>
          u.email.toLowerCase() === currentUser.email.toLowerCase()
            ? { ...u, xp: Math.max(0, u.xp - pointCost) }
            : u
        ),
      }));

      pushToast({
        type: 'success',
        title: `🎟️ Poin Ditukar Jadi Voucher! (-${pointCost} Poin)`,
        message: `Kode ${newVoucher.code} aktif untuk ${newVoucher.merchantName}. Anda bebas memilih tempat redeem!`,
      });

      return {
        ok: true,
        message: `Berhasil menukar ${pointCost} Poin menjadi Voucher ${newVoucher.code} (${newVoucher.discountValue})!`,
        voucher: newVoucher,
      };
    },
    [currentUser, db.locations, pushToast]
  );

  // Wisatawan dapat mengubah sendiri lokasi UMKM tujuan redeem kapan saja sebelum voucher digunakan
  const changeVoucherLocation = useCallback(
    (voucherId: string, targetLocationId: string) => {
      const chosenSpot =
        targetLocationId && targetLocationId !== 'any'
          ? db.locations.find((l) => l.id === targetLocationId) ?? null
          : null;

      setDb((prev) => ({
        ...prev,
        vouchers: (prev.vouchers ?? []).map((v) => {
          if (v.id !== voucherId || v.status === 'redeemed') return v;
          if (!chosenSpot) {
            return {
              ...v,
              locationId: 'any',
              locationName: 'Bebas Pilih Mitra UMKM Mana Saja',
              merchantName: 'Semua Mitra UMKM Kota Langsa (Bebas Pilih)',
            };
          }
          return {
            ...v,
            locationId: chosenSpot.id,
            locationName: chosenSpot.name,
            merchantName: chosenSpot.merchantName || `Mitra UMKM ${chosenSpot.name}`,
            title: chosenSpot.voucherConfig?.title || v.title,
            discountValue: chosenSpot.voucherConfig?.discountValue || v.discountValue,
          };
        }),
      }));

      pushToast({
        type: 'info',
        title: 'Tempat Redeem UMKM Diperbarui',
        message: chosenSpot
          ? `Voucher kini diarahkan untuk redeem di ${chosenSpot.merchantName || chosenSpot.name}.`
          : 'Voucher diatur ke mode Bebas Redeem di Semua Mitra UMKM.',
      });
    },
    [db.locations, pushToast]
  );

  // Redeem Voucher (Bebas di UMKM mana saja pilihan wisatawan / kasir UMKM yang sedang bertugas)
  const redeemUserVoucher = useCallback(
    (
      rawCode: string,
      targetLocationId?: string
    ): {
      ok: boolean;
      message: string;
      voucher?: UserVoucher;
    } => {
      const cleaned = rawCode
        .trim()
        .replace(/^ACIKIWIR-VOUCHER::/i, '')
        .trim()
        .toUpperCase();

      if (!cleaned) {
        return { ok: false, message: 'Masukkan kode voucher terlebih dahulu.' };
      }

      const allVouchers = db.vouchers ?? [];
      const found = allVouchers.find((v) => v.code.toUpperCase() === cleaned);

      if (!found) {
        pushToast({
          type: 'error',
          title: 'Kode Voucher Tidak Ditemukan',
          message: `Kode "${cleaned}" tidak terdaftar di sistem.`,
        });
        return {
          ok: false,
          message: `Kode voucher "${cleaned}" tidak ditemukan. Pastikan pengunjung menunjukkan kode yang valid.`,
        };
      }

      if (found.status === 'redeemed') {
        const redeemedDate = found.redeemedAt
          ? new Date(found.redeemedAt).toLocaleString('id-ID')
          : 'sebelumnya';
        pushToast({
          type: 'warning',
          title: 'Voucher Sudah Pernah Digunakan',
          message: `Kode ${found.code} sudah di-redeem pada ${redeemedDate} di ${found.merchantName}.`,
        });
        return {
          ok: false,
          message: `Voucher "${found.code}" milik ${found.userName} sudah pernah ditukarkan (redeemed) pada ${redeemedDate} di ${found.merchantName}.`,
          voucher: found,
        };
      }

      // Tentukan UMKM tempat voucher ini di-redeem:
      // 1. Jika parameter targetLocationId dikirim (misal dipilih langsung oleh wisatawan atau kasir UMKM)
      // 2. Atau jika yang me-redeem adalah Owner UMKM yang sedang login (currentUser.managedLocationId)
      // 3. Atau gunakan lokasi yang sudah tertera di voucher
      const resolvedLocId =
        targetLocationId && targetLocationId !== 'any'
          ? targetLocationId
          : currentUser?.role === 'umkm' && currentUser.managedLocationId
          ? currentUser.managedLocationId
          : found.locationId !== 'any'
          ? found.locationId
          : db.locations[0]?.id ?? found.locationId;

      const redeemedSpot = db.locations.find((l) => l.id === resolvedLocId);

      const updatedVoucher: UserVoucher = {
        ...found,
        locationId: redeemedSpot ? redeemedSpot.id : found.locationId,
        locationName: redeemedSpot ? redeemedSpot.name : found.locationName,
        merchantName: redeemedSpot
          ? redeemedSpot.merchantName || `Mitra UMKM ${redeemedSpot.name}`
          : found.merchantName,
        status: 'redeemed',
        redeemedAt: new Date().toISOString(),
        redeemedByEmail:
          currentUser?.email ?? redeemedSpot?.ownerEmail ?? 'kasir.umkm@gmail.com',
      };

      setDb((prev) => ({
        ...prev,
        vouchers: (prev.vouchers ?? []).map((v) =>
          v.id === found.id ? updatedVoucher : v
        ),
      }));

      pushToast({
        type: 'success',
        title: `Voucher Berhasil Di-Redeem! (${found.code})`,
        message: `${updatedVoucher.discountValue} telah di-redeem di ${updatedVoucher.merchantName} untuk ${found.userName}.`,
      });

      return {
        ok: true,
        message: `Berhasil! Voucher ${found.code} (${updatedVoucher.discountValue}) milik ${found.userName} telah di-redeem di ${updatedVoucher.merchantName}.`,
        voucher: updatedVoucher,
      };
    },
    [currentUser, db.locations, db.vouchers, pushToast]
  );

  const updateUmkmBusinessProfile = useCallback(
    (locationId: string, patch: Partial<LocationSpot>) => {
      setDb((prev) => ({
        ...prev,
        locations: prev.locations.map((loc) =>
          loc.id === locationId ? { ...loc, ...patch } : loc
        ),
        users: prev.users.map((u) =>
          u.managedLocationId === locationId && patch.merchantName
            ? { ...u, businessName: patch.merchantName }
            : u
        ),
      }));
      pushToast({
        type: 'success',
        title: 'Profil Usaha & Promosi Diperbarui',
        message: 'Perubahan informasi usaha, promosi, dan voucher langsung aktif di halaman wisata.',
      });
    },
    [pushToast]
  );

  const submitBusinessInquiry = useCallback(
    (inquiry: Omit<BusinessInquiry, 'id' | 'status' | 'createdAt'>) => {
      const newInquiry: BusinessInquiry = {
        ...inquiry,
        id: `inq-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      setDb((prev) => ({
        ...prev,
        businessInquiries: [newInquiry, ...(prev.businessInquiries ?? [])],
      }));

      pushToast({
        type: 'success',
        title: 'Pengajuan Akun Bisnis Terkirim ke Admin!',
        message:
          'Admin akan memverifikasi usaha Anda dan membuatkan akun Owner UMKM. Anda juga dapat melanjutkan via WhatsApp Admin.',
        durationMs: 7000,
      });
    },
    [pushToast]
  );

  const createUmkmAccountByAdmin = useCallback(
    (params: {
      email: string;
      ownerName: string;
      businessName: string;
      phone: string;
      locationId: string;
      inquiryId?: string;
    }): { ok: boolean; error?: string } => {
      const cleanEmail = params.email.trim().toLowerCase();
      const gmailRegex = /^[a-z0-9._%+-]+@gmail\.com$/;
      if (!gmailRegex.test(cleanEmail)) {
        return {
          ok: false,
          error: 'Alamat email Owner UMKM wajib menggunakan @gmail.com.',
        };
      }
      if (!params.locationId) {
        return {
          ok: false,
          error: 'Pilih titik lokasi wisata/UMKM yang akan dikelola oleh akun ini.',
        };
      }

      const targetLoc = db.locations.find((l) => l.id === params.locationId);
      if (!targetLoc) {
        return { ok: false, error: 'Titik lokasi tidak ditemukan.' };
      }

      setDb((prev) => {
        const existingUser = prev.users.find(
          (u) => u.email.toLowerCase() === cleanEmail
        );

        let nextUsers: UserAccount[];
        if (existingUser) {
          nextUsers = prev.users.map((u) =>
            u.email.toLowerCase() === cleanEmail
              ? {
                  ...u,
                  name: params.ownerName.trim() || u.name,
                  role: 'umkm',
                  isActive: true,
                  managedLocationId: params.locationId,
                  businessName: params.businessName.trim() || targetLoc.name,
                  businessPhone: params.phone.trim() || targetLoc.contactPhone,
                  badges: u.badges.includes('Mitra UMKM Resmi')
                    ? u.badges
                    : [...u.badges, 'Mitra UMKM Resmi'],
                }
              : u
          );
        } else {
          const newUmkmUser: UserAccount = {
            email: cleanEmail,
            name: params.ownerName.trim() || 'Owner UMKM Mitra',
            role: 'umkm',
            isActive: true,
            joinedAt: new Date().toISOString(),
            unlockedLocationIds: [params.locationId],
            completedMissionKeys: [],
            xp: 150,
            badges: ['Mitra UMKM Resmi', 'Pengelola Wisata'],
            managedLocationId: params.locationId,
            businessName: params.businessName.trim() || targetLoc.name,
            businessPhone: params.phone.trim() || targetLoc.contactPhone,
          };
          nextUsers = [newUmkmUser, ...prev.users];
        }

        const nextLocations = prev.locations.map((loc) =>
          loc.id === params.locationId
            ? {
                ...loc,
                ownerEmail: cleanEmail,
                merchantName: params.businessName.trim() || loc.merchantName || loc.name,
                contactName: params.ownerName.trim() || loc.contactName,
                contactPhone: params.phone.trim() || loc.contactPhone,
              }
            : loc
        );

        const nextInquiries = (prev.businessInquiries ?? []).map((inq) =>
          params.inquiryId && inq.id === params.inquiryId
            ? { ...inq, status: 'approved' as const }
            : inq
        );

        return {
          ...prev,
          users: nextUsers,
          locations: nextLocations,
          businessInquiries: nextInquiries,
        };
      });

      pushToast({
        type: 'success',
        title: 'Akun Owner UMKM Berhasil Dibuat!',
        message: `${cleanEmail} kini dapat login dan mengelola "${params.businessName || targetLoc.name}".`,
      });

      return { ok: true };
    },
    [db.locations, pushToast]
  );

  const rejectBusinessInquiry = useCallback(
    (inquiryId: string) => {
      setDb((prev) => ({
        ...prev,
        businessInquiries: (prev.businessInquiries ?? []).map((inq) =>
          inq.id === inquiryId ? { ...inq, status: 'rejected' as const } : inq
        ),
      }));
      pushToast({
        type: 'info',
        title: 'Pengajuan Bisnis Ditolak',
        message: 'Status pengajuan akun usaha telah diperbarui.',
      });
    },
    [pushToast]
  );

  // ================= ADMIN PANEL CRUD OPERATIONS =================

  const upsertLocation = useCallback(
    (spot: LocationSpot) => {
      setDb((prev) => {
        const exists = prev.locations.some((l) => l.id === spot.id);
        const nextLocations = exists
          ? prev.locations.map((l) => (l.id === spot.id ? spot : l))
          : [...prev.locations, spot];
        return { ...prev, locations: nextLocations };
      });
      pushToast({
        type: 'success',
        title: 'Titik Lokasi Tersimpan',
        message: `Data "${spot.name}" telah diperbarui di peta secara real-time.`,
      });
    },
    [pushToast]
  );

  const deleteLocation = useCallback(
    (locationId: string) => {
      setDb((prev) => ({
        ...prev,
        locations: prev.locations.filter((l) => l.id !== locationId),
      }));
      if (selectedLocationId === locationId) {
        setSelectedLocationId(null);
      }
      if (activeRoute?.destinationId === locationId) {
        setActiveRoute(null);
      }
      pushToast({
        type: 'info',
        title: 'Titik Lokasi Dihapus',
        message: 'Marker lokasi telah dihapus dari peta publik.',
      });
    },
    [activeRoute?.destinationId, pushToast, selectedLocationId]
  );

  const updateBranding = useCallback(
    (partial: Partial<AppBranding>) => {
      setDb((prev) => ({
        ...prev,
        branding: {
          ...prev.branding,
          ...partial,
          categoryIcons: {
            ...prev.branding.categoryIcons,
            ...(partial.categoryIcons ?? {}),
          },
        },
      }));
    },
    []
  );

  const updateUserRole = useCallback(
    (email: string, role: UserRole, managedLocationId?: string) => {
      setDb((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.email.toLowerCase() === email.toLowerCase()
            ? {
                ...u,
                role,
                managedLocationId:
                  role === 'umkm'
                    ? managedLocationId ?? u.managedLocationId ?? prev.locations[0]?.id
                    : u.managedLocationId,
              }
            : u
        ),
      }));
      pushToast({
        type: 'success',
        title: 'Role Akun Diperbarui',
        message: `Akun ${email} kini berstatus sebagai ${role.toUpperCase()}.`,
      });
    },
    [pushToast]
  );

  const resetUserProgress = useCallback(
    (email: string) => {
      setDb((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.email.toLowerCase() === email.toLowerCase()
            ? {
                ...u,
                unlockedLocationIds: [],
                completedMissionKeys: [],
                xp: 0,
                badges: ['Progres Direset'],
              }
            : u
        ),
      }));
      pushToast({
        type: 'info',
        title: 'Progres Lokasi Direset',
        message: `Riwayat unlock wilayah akun ${email} telah dikosongkan untuk uji coba ulang.`,
      });
    },
    [pushToast]
  );

  const toggleUserActive = useCallback(
    (email: string) => {
      if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
        pushToast({
          type: 'warning',
          title: 'Tidak Dapat Menonaktifkan Diri Sendiri',
          message: 'Gunakan akun admin lain jika ingin menonaktifkan akun ini.',
        });
        return;
      }
      setDb((prev) => ({
        ...prev,
        users: prev.users.map((u) =>
          u.email.toLowerCase() === email.toLowerCase()
            ? { ...u, isActive: !u.isActive }
            : u
        ),
      }));
      pushToast({
        type: 'info',
        title: 'Status Akun Diubah',
        message: `Status aktif akun ${email} berhasil diperbarui.`,
      });
    },
    [currentUser, pushToast]
  );

  const deleteUserAccount = useCallback(
    (email: string) => {
      if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
        pushToast({
          type: 'warning',
          title: 'Aksi Ditolak',
          message: 'Anda tidak dapat menghapus akun Admin yang sedang digunakan.',
        });
        return;
      }
      setDb((prev) => ({
        ...prev,
        users: prev.users.filter((u) => u.email.toLowerCase() !== email.toLowerCase()),
      }));
      pushToast({
        type: 'info',
        title: 'Akun Pengguna Dihapus',
        message: `Akun ${email} telah dihapus dari database.`,
      });
    },
    [currentUser, pushToast]
  );

  const deleteMissionPhoto = useCallback(
    (locationId: string, photoId: string) => {
      setDb((prev) => ({
        ...prev,
        locations: prev.locations.map((loc) =>
          loc.id === locationId
            ? { ...loc, photos: loc.photos.filter((p) => p.id !== photoId) }
            : loc
        ),
      }));
      pushToast({
        type: 'info',
        title: 'Foto Moderasi Dihapus',
        message: 'Foto telah dihapus dari galeri publik lokasi.',
      });
    },
    [pushToast]
  );

  const deleteLocationReview = useCallback(
    (locationId: string, reviewId: string) => {
      setDb((prev) => ({
        ...prev,
        locations: prev.locations.map((loc) =>
          loc.id === locationId
            ? { ...loc, reviews: loc.reviews.filter((r) => r.id !== reviewId) }
            : loc
        ),
      }));
      pushToast({
        type: 'info',
        title: 'Ulasan Dihapus',
        message: 'Ulasan telah dihapus dan rata-rata rating diperbarui otomatis.',
      });
    },
    [pushToast]
  );

  const resetAllDataToSeed = useCallback(async () => {
    const fresh = await resetDatabaseToSeed();
    setDb(fresh);
    setActiveRoute(null);
    setSelectedLocationId(null);
    pushToast({
      type: 'success',
      title: 'Database Direset ke Data Awal',
      message: 'Seluruh lokasi, voucher UMKM, tema, dan pengguna telah dikembalikan ke seed ACIKIWIR.',
    });
  }, [pushToast]);

  const value: AppContextValue = {
    isLoading,
    db,
    branding: db.branding,
    locations: db.locations,
    users: db.users,
    vouchers: db.vouchers ?? [],
    businessInquiries: db.businessInquiries ?? [],
    currentUser,

    selectedCategory,
    setSelectedCategory,
    selectedLocation,
    setSelectedLocationId,
    locationSheetSnap,
    setLocationSheetSnap,
    isDesktopSidebarCollapsed,
    setIsDesktopSidebarCollapsed,
    isDesktopExplorerCollapsed,
    setIsDesktopExplorerCollapsed,
    hoveredLocationId,
    setHoveredLocationId,
    osmLayerStyle,
    setOsmLayerStyle,
    mapFocusTarget,
    flyToCoords,

    userCoords,
    gpsSource,
    isLocatingGps,
    locateMyGps,
    teleportDemoGps,
    activeRoute,
    startRouteToLocation,
    updateRouteMetrics,
    clearActiveRoute,

    isDemoWidgetOpen,
    setIsDemoWidgetOpen,
    demoBypassGps,
    setDemoBypassGps,
    quickSwitchDemoRole,

    activeNavTab,
    setActiveNavTab,
    isHowToUseOpen,
    setIsHowToUseOpen,
    isQrScannerOpen,
    openQrScannerTrigger,
    closeQrScanner: () => setIsQrScannerOpen(false),
    scannerPreferredLocationId,

    isAuthModalOpen,
    openAuthModal: () => setIsAuthModalOpen(true),
    closeAuthModal: () => {
      setIsAuthModalOpen(false);
      setPendingQrAction(null);
    },
    pendingQrAction,
    activeOtpChallenge,
    requestEmailOtp,
    verifyEmailOtp,
    logout,

    handleQrScanPayload,
    outOfRadiusState,
    closeOutOfRadiusModal: () => setOutOfRadiusState(null),
    unlockedModalState,
    openUnlockedAreaModal: (loc, celebrate = false) =>
      setUnlockedModalId({ locationId: loc.id, celebrate }),
    closeUnlockedAreaModal: () => setUnlockedModalId(null),

    submitMissionPhoto,
    submitLocationReview,

    claimVoucherWithPoints,
    changeVoucherLocation,
    redeemUserVoucher,
    updateUmkmBusinessProfile,
    submitBusinessInquiry,
    createUmkmAccountByAdmin,
    rejectBusinessInquiry,

    upsertLocation,
    deleteLocation,
    updateBranding,
    updateUserRole,
    resetUserProgress,
    toggleUserActive,
    deleteUserAccount,
    deleteMissionPhoto,
    deleteLocationReview,
    resetAllDataToSeed,

    toasts,
    pushToast,
    dismissToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp harus digunakan di dalam AppProvider');
  }
  return ctx;
}
