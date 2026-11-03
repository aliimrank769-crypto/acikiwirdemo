import type { DatabaseState } from '../types';
import {
  createInitialSeedDatabase,
  createSeedInquiries,
  createSeedLocations,
  createSeedUsers,
  createSeedVouchers,
  DEFAULT_BRANDING,
} from '../data/seedLangsa';

const CURRENT_DB_VERSION = 4;
const LS_DB_KEY = 'acikiwir_cms_db_v4';
const LEGACY_KEYS = [
  'acikiwir_cms_db_v3',
  'acikiwir_cms_db_v2',
  'jejaklangsa_cms_db_v1',
];
const LS_SESSION_KEY = 'acikiwir_session_email_v2';

/**
 * Otomatis memigrasi database versi lama ke v4 ACIKIWIR
 * (menyinkronkan titik koordinat akurat ke-5 lokasi wisata utama Kota Langsa,
 * akun Owner UMKM bawaan, konfigurasi Voucher & Promo, serta kotak masuk Chat Bisnis Admin).
 */
function migrateDatabaseIfNeeded(rawDb: DatabaseState): {
  state: DatabaseState;
  migrated: boolean;
} {
  if ((rawDb.version ?? 1) >= CURRENT_DB_VERSION) {
    return { state: rawDb, migrated: false };
  }

  const seedLocations = createSeedLocations();
  const seedUsers = createSeedUsers();

  // Sync existing seed locations with updated exact coordinates, names, voucherConfig & promos
  const mergedLocations = rawDb.locations.map((loc) => {
    const seedMatch = seedLocations.find((s) => s.id === loc.id);
    if (!seedMatch) return loc;
    return {
      ...loc,
      name: seedMatch.name,
      lat: seedMatch.lat,
      lng: seedMatch.lng,
      ownerEmail: loc.ownerEmail ?? seedMatch.ownerEmail,
      merchantName: loc.merchantName ?? seedMatch.merchantName,
      voucherConfig: loc.voucherConfig ?? seedMatch.voucherConfig,
      promos: loc.promos && loc.promos.length > 0 ? loc.promos : seedMatch.promos,
    };
  });

  // Ensure default UMKM owner accounts exist
  const existingEmails = new Set(rawDb.users.map((u) => u.email.toLowerCase()));
  const mergedUsers = [...rawDb.users];
  seedUsers.forEach((su) => {
    if (!existingEmails.has(su.email.toLowerCase())) {
      mergedUsers.push(su);
    }
  });

  const upgraded: DatabaseState = {
    ...rawDb,
    version: CURRENT_DB_VERSION,
    branding: {
      ...rawDb.branding,
      appName: DEFAULT_BRANDING.appName,
      tagline: DEFAULT_BRANDING.tagline,
      primaryColor: DEFAULT_BRANDING.primaryColor,
      accentColor: DEFAULT_BRANDING.accentColor,
      buttonColor: DEFAULT_BRANDING.buttonColor,
      logoType: 'image',
      logoIcon: DEFAULT_BRANDING.logoIcon,
      logoImageUrl: DEFAULT_BRANDING.logoImageUrl,
      adminWhatsApp: rawDb.branding?.adminWhatsApp ?? DEFAULT_BRANDING.adminWhatsApp,
    },
    locations: mergedLocations,
    users: mergedUsers,
    vouchers:
      rawDb.vouchers && rawDb.vouchers.length > 0
        ? rawDb.vouchers
        : createSeedVouchers(),
    businessInquiries:
      rawDb.businessInquiries && rawDb.businessInquiries.length > 0
        ? rawDb.businessInquiries
        : createSeedInquiries(),
  };

  return { state: upgraded, migrated: true };
}

export async function loadDatabaseState(): Promise<DatabaseState> {
  try {
    const res = await fetch('/api/db', { method: 'GET' });
    if (res.ok) {
      const json = (await res.json()) as { ok?: boolean; data?: DatabaseState | null };
      if (json.ok && json.data && Array.isArray(json.data.locations)) {
        const { state, migrated } = migrateDatabaseIfNeeded(json.data);
        if (migrated) {
          await saveDatabaseState(state);
        } else {
          try {
            localStorage.setItem(LS_DB_KEY, JSON.stringify(state));
          } catch {
            // ignore quota overflow
          }
        }
        return state;
      }
    }
  } catch {
    // Fallback to localStorage when offline / static hosting
  }

  try {
    let raw = localStorage.getItem(LS_DB_KEY);
    if (!raw) {
      for (const k of LEGACY_KEYS) {
        const found = localStorage.getItem(k);
        if (found) {
          raw = found;
          break;
        }
      }
    }
    if (raw) {
      const parsed = JSON.parse(raw) as DatabaseState;
      if (parsed && Array.isArray(parsed.locations) && parsed.branding) {
        const { state, migrated } = migrateDatabaseIfNeeded(parsed);
        if (migrated) {
          await saveDatabaseState(state);
        }
        return state;
      }
    }
  } catch {
    // ignore corrupted localStorage
  }

  const seed = createInitialSeedDatabase();
  await saveDatabaseState(seed);
  return seed;
}

export async function saveDatabaseState(state: DatabaseState): Promise<void> {
  try {
    localStorage.setItem(LS_DB_KEY, JSON.stringify(state));
  } catch {
    // Server /api/db still persists up to 50MB
  }

  try {
    await fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: state }),
    });
  } catch {
    // Ignore when running purely static build without dev/node server
  }
}

export async function resetDatabaseToSeed(): Promise<DatabaseState> {
  try {
    localStorage.removeItem(LS_DB_KEY);
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    // ignore
  }
  try {
    await fetch('/api/reset-db', { method: 'POST' });
  } catch {
    // ignore
  }
  const fresh = createInitialSeedDatabase();
  await saveDatabaseState(fresh);
  return fresh;
}

export function loadSessionEmail(): string | null {
  try {
    return (
      localStorage.getItem(LS_SESSION_KEY) ??
      localStorage.getItem('jejaklangsa_session_email_v1')
    );
  } catch {
    return null;
  }
}

export function saveSessionEmail(email: string | null): void {
  try {
    if (email) {
      localStorage.setItem(LS_SESSION_KEY, email.toLowerCase().trim());
    } else {
      localStorage.removeItem(LS_SESSION_KEY);
      localStorage.removeItem('jejaklangsa_session_email_v1');
    }
  } catch {
    // ignore
  }
}
