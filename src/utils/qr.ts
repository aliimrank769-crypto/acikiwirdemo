import QRCode from 'qrcode';
import jsQR from 'jsqr';
import type { AppBranding, LocationSpot } from '../types';
import { getCategoryMeta } from './icons';

export const QR_PREFIX = 'JEJAKQR::';

export function encodeLocationQrPayload(qrCode: string): string {
  const clean = qrCode.trim();
  if (clean.startsWith(QR_PREFIX)) return clean;
  return `${QR_PREFIX}${clean}`;
}

export function buildLocationQrUrl(qrCode: string): string {
  return encodeLocationQrPayload(qrCode);
}

export function extractQrCodeFromPayload(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith(QR_PREFIX)) {
    return trimmed.slice(QR_PREFIX.length).trim();
  }
  if (trimmed.includes('qr=')) {
    try {
      const url = new URL(trimmed);
      const param = url.searchParams.get('qr');
      if (param) return param.trim();
    } catch {
      // ignore
    }
  }
  return trimmed;
}

export async function generateQrDataUrl(
  qrCode: string,
  darkColor = '#071A3E'
): Promise<string> {
  const payload = encodeLocationQrPayload(qrCode);
  return QRCode.toDataURL(payload, {
    width: 420,
    margin: 2,
    color: {
      dark: darkColor,
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}

export async function generateVoucherQrDataUrl(
  voucherCode: string,
  darkColor = '#071A3E'
): Promise<string> {
  return QRCode.toDataURL(`ACIKIWIR-VOUCHER::${voucherCode.trim().toUpperCase()}`, {
    width: 340,
    margin: 2,
    color: {
      dark: darkColor,
      light: '#ffffff',
    },
    errorCorrectionLevel: 'H',
  });
}

function loadOptionalImage(src: string): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

/**
 * Membuat Poster Kartu QR Code siap cetak/unduh PNG beridentitas ACIKIWIR / White-Label
 */
export async function generatePrintableQrCardPng(
  location: LocationSpot,
  branding: AppBranding
): Promise<string> {
  const [qrDataUrl, logoImg] = await Promise.all([
    generateQrDataUrl(location.qrCode, '#071A3E'),
    branding.logoType === 'image'
      ? loadOptionalImage(branding.logoImageUrl)
      : Promise.resolve(null),
  ]);

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error('Gagal membuat gambar QR Code'));
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 760;
      canvas.height = 1220;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(qrDataUrl);
        return;
      }

      // Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Banner with dynamic Primary Color
      ctx.fillStyle = branding.primaryColor;
      ctx.fillRect(0, 0, canvas.width, 230);

      // Accent Stripe
      ctx.fillStyle = branding.accentColor;
      ctx.fillRect(0, 224, canvas.width, 8);

      // Draw Logo Badge if available
      if (logoImg) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(336, 18, 88, 88);
        ctx.drawImage(logoImg, 342, 24, 76, 76);
      }

      const textStartY = logoImg ? 140 : 88;

      // Header Text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.font = '800 34px sans-serif';
      ctx.fillText(branding.appName, canvas.width / 2, textStartY);

      ctx.font = '600 18px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.92)';
      ctx.fillText(branding.tagline, canvas.width / 2, textStartY + 32);

      ctx.font = '700 15px sans-serif';
      ctx.fillStyle = branding.accentColor;
      ctx.fillText(
        'SCAN QR LOKASI UNTUK MEMBUKA WILAYAH, POIN & MISI WISATA',
        canvas.width / 2,
        textStartY + 64
      );

      // White QR Card Box
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(7, 26, 62, 0.14)';
      ctx.shadowBlur = 24;
      ctx.shadowOffsetY = 8;
      ctx.fillRect(60, 256, 640, 880);
      ctx.shadowColor = 'transparent';

      // Draw QR
      ctx.drawImage(img, 190, 276, 380, 380);

      // Location Name & Category
      ctx.fillStyle = '#0f172a';
      ctx.font = '800 24px sans-serif';
      const title =
        location.name.length > 34
          ? `${location.name.slice(0, 33)}…`
          : location.name;
      ctx.fillText(title, canvas.width / 2, 690);

      const categoryLabel = getCategoryMeta(location.category).label;
      ctx.fillStyle = '#1e40af';
      ctx.font = '700 16px sans-serif';
      ctx.fillText(
        `${categoryLabel} • Radius Scan GPS ≤ ${location.radiusMeters}m • ID: ${location.qrCode}`,
        canvas.width / 2,
        720
      );

      // Location Short Description
      ctx.fillStyle = '#334155';
      ctx.font = '500 15px sans-serif';
      const shortDesc =
        location.shortDescription.length > 82
          ? `${location.shortDescription.slice(0, 80)}…`
          : location.shortDescription;
      ctx.fillText(shortDesc, canvas.width / 2, 750);

      // Missions List Header
      ctx.textAlign = 'left';
      ctx.fillStyle = '#0f172a';
      ctx.font = '800 17px sans-serif';
      ctx.fillText(
        `Daftar & Deskripsi Misi QR (${location.missions.length} Misi):`,
        95,
        792
      );

      let missionY = 824;
      location.missions.slice(0, 3).forEach((m, idx) => {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(95, missionY - 22, 570, 74);

        ctx.fillStyle = '#0f172a';
        ctx.font = '800 15px sans-serif';
        ctx.fillText(
          `${idx + 1}. ${m.title} (+${m.xpReward} Poin Wisata)`,
          110,
          missionY
        );

        ctx.fillStyle = '#475569';
        ctx.font = '500 13.5px sans-serif';
        const descLine =
          m.description.length > 74
            ? `${m.description.slice(0, 72)}…`
            : m.description;
        ctx.fillText(descLine, 110, missionY + 24);
        missionY += 86;
      });

      // Footer info
      ctx.textAlign = 'center';
      ctx.fillStyle = '#475569';
      ctx.font = '700 15px monospace';
      ctx.fillText(
        `Kode QR: ${location.qrCode}  |  OSM: ${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`,
        canvas.width / 2,
        1178
      );

      resolve(canvas.toDataURL('image/png'));
    };
    img.src = qrDataUrl;
  });
}

export function decodeQrFromImageFile(file: File): Promise<string | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onerror = () => resolve(null);
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => resolve(null);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1000;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const imageData = ctx.getImageData(0, 0, width, height);
        const decoded = jsQR(imageData.data, imageData.width, imageData.height);
        resolve(decoded ? decoded.data : null);
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
