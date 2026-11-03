import type { Coordinates, LocationReview } from '../types';

/**
 * Menghitung jarak antara dua koordinat GPS dalam satuan meter
 * menggunakan rumus Haversine Formula.
 */
export function calculateHaversineMeters(a: Coordinates, b: Coordinates): number {
  const R = 6371000; // Radius bumi dalam meter
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat +
    Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

export function estimateTravelMinutes(distanceMeters: number): number {
  // Kecepatan rata-rata dalam kota ~30 km/jam (500 meter / menit)
  return Math.max(1, Math.round((distanceMeters * 1.25) / 500));
}

export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/[^\d]/g, '');
  if (digits.startsWith('0')) {
    return `62${digits.slice(1)}`;
  }
  if (digits.startsWith('8')) {
    return `62${digits}`;
  }
  return digits;
}

export function buildWhatsAppUrl(phone: string, locationName: string, appName: string): string {
  const clean = normalizePhoneForWhatsApp(phone);
  const text = encodeURIComponent(
    `Halo Pengelola ${locationName}, saya menemukan informasi destinasi ini melalui aplikasi ${appName} dan ingin bertanya lebih lanjut.`
  );
  return `https://wa.me/${clean}?text=${text}`;
}

export function getAverageRating(reviews: LocationReview[]): number {
  if (!reviews.length) return 0;
  const total = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Number((total / reviews.length).toFixed(1));
}

export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;
  const diffSec = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diffSec < 60) return 'Baru saja';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} menit lalu`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} jam lalu`;
  if (diffSec < 86400 * 7) return `${Math.floor(diffSec / 86400)} hari lalu`;

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Mengonversi HEX color ke komponen RGB string "r, g, b" atau rgba()
 */
export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean;
  const num = parseInt(full, 16);
  if (Number.isNaN(num)) return `rgba(5, 150, 105, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

