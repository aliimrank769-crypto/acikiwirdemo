export type TourismCategoryId =
  | 'alam'
  | 'sejarah'
  | 'taman'
  | 'bahari'
  | 'kuliner';

export type BuiltInIconName =
  | 'trees'
  | 'landmark'
  | 'compass'
  | 'anchor'
  | 'utensils'
  | 'sparkles'
  | 'camera'
  | 'map-pin'
  | 'mountain'
  | 'waves'
  | 'store'
  | 'award'
  | 'heart'
  | 'sun'
  | 'shield';

export type UserRole = 'user' | 'umkm' | 'admin';

export interface AppBranding {
  appName: string;
  tagline: string;
  primaryColor: string;
  accentColor: string;
  buttonColor: string;
  logoType: 'icon' | 'image';
  logoIcon: BuiltInIconName;
  logoImageUrl: string;
  adminWhatsApp?: string;
  categoryIcons: Record<TourismCategoryId, BuiltInIconName>;
  defaultCenter: {
    lat: number;
    lng: number;
    zoom: number;
  };
}

export interface MicroMission {
  id: string;
  title: string;
  description: string;
  type: 'photo' | 'review';
  xpReward: number;
}

export interface MissionPhoto {
  id: string;
  locationId: string;
  missionId: string;
  missionLabel: string;
  userEmail: string;
  userName: string;
  imageUrl: string;
  caption: string;
  createdAt: string;
}

export interface LocationReview {
  id: string;
  locationId: string;
  missionId?: string;
  userEmail: string;
  userName: string;
  rating: number; // 1 - 5
  comment: string;
  createdAt: string;
}

export interface UmkmPromoItem {
  id: string;
  title: string;
  description: string;
  priceText: string;
  promoBadge: string; // e.g. "Diskon 20%", "Best Seller", "Paket Hemat"
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface LocationVoucherConfig {
  enabled: boolean;
  title: string; // e.g. "Voucher Diskon 20% Kuliner & Souvenir Mangrove"
  discountValue: string; // e.g. "Diskon 20%" atau "Potongan Rp10.000"
  pointCost?: number; // Poin yang dibutuhkan untuk menukar voucher ini (default 100 Poin)
  description: string;
  terms: string;
}

export interface UserVoucher {
  id: string;
  code: string; // e.g. "VC-MANGROVE-4829"
  locationId: string; // ID lokasi UMKM tujuan atau 'any' (Bebas Pilih UMKM)
  locationName: string;
  merchantName: string;
  userEmail: string;
  userName: string;
  missionId: string;
  missionTitle: string;
  title: string;
  discountValue: string;
  pointCost?: number;
  terms: string;
  status: 'active' | 'redeemed';
  issuedAt: string;
  redeemedAt?: string;
  redeemedByEmail?: string;
}

export interface BusinessInquiry {
  id: string;
  ownerName: string;
  businessName: string;
  email: string; // @gmail.com
  phone: string;
  targetLocationId: string; // existing locationId or 'new'
  newLocationName?: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

export interface LocationSpot {
  id: string;
  qrCode: string;
  name: string;
  category: TourismCategoryId;
  pinIcon: BuiltInIconName;
  lat: number;
  lng: number;
  radiusMeters: number;
  shortDescription: string;
  historyDescription: string;
  operatingHours: string;
  priceRange: string;
  contactName: string;
  contactPhone: string;
  ownerEmail?: string;
  merchantName?: string;
  voucherConfig?: LocationVoucherConfig;
  promos?: UmkmPromoItem[];
  missions: MicroMission[];
  photos: MissionPhoto[];
  reviews: LocationReview[];
}

export interface UserAccount {
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  joinedAt: string;
  unlockedLocationIds: string[];
  completedMissionKeys: string[]; // `${locationId}::${missionId}`
  xp: number;
  badges: string[];
  // Khusus Role Owner UMKM / Pengelola Wisata (dibuat oleh Admin)
  managedLocationId?: string;
  businessName?: string;
  businessPhone?: string;
}

export interface DatabaseState {
  version: number;
  branding: AppBranding;
  locations: LocationSpot[];
  users: UserAccount[];
  vouchers?: UserVoucher[];
  businessInquiries?: BusinessInquiry[];
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ActiveRouteInfo {
  destinationId: string;
  destinationName: string;
  from: Coordinates;
  to: Coordinates;
  distanceMeters: number;
  durationMinutes: number;
  isFallbackLine?: boolean;
}

export type PendingQrAction =
  | { type: 'open-scanner'; preferredLocationId?: string }
  | { type: 'validate-qr'; qrPayload: string };

export interface OutOfRadiusState {
  location: LocationSpot;
  distanceMeters: number;
}

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'otp';
  title: string;
  message: string;
  otpCode?: string;
  durationMs?: number;
}

export interface CategoryMeta {
  id: TourismCategoryId;
  label: string;
  shortLabel: string;
  defaultColor: string;
}
