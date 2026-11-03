import React from 'react';
import {
  Trees,
  Landmark,
  Compass,
  Anchor,
  Utensils,
  Sparkles,
  Camera,
  MapPin,
  Mountain,
  Waves,
  Store,
  Award,
  Heart,
  Sun,
  Shield,
} from 'lucide-react';
import type { BuiltInIconName, CategoryMeta, TourismCategoryId } from '../types';

export const BUILT_IN_ICONS: { name: BuiltInIconName; label: string }[] = [
  { name: 'compass', label: 'Kompas Wisata' },
  { name: 'trees', label: 'Hutan / Alam' },
  { name: 'landmark', label: 'Museum / Sejarah' },
  { name: 'anchor', label: 'Pelabuhan / Bahari' },
  { name: 'utensils', label: 'Kuliner Khas' },
  { name: 'store', label: 'Sentra UMKM' },
  { name: 'waves', label: 'Pesisir / Laut' },
  { name: 'mountain', label: 'Lanskap / Bukit' },
  { name: 'sun', label: 'Taman / Rekreasi' },
  { name: 'camera', label: 'Spot Foto' },
  { name: 'sparkles', label: 'Ikonik / Kreatif' },
  { name: 'map-pin', label: 'Pin Lokasi' },
  { name: 'award', label: 'Warisan Unggulan' },
  { name: 'heart', label: 'Favorit Warga' },
  { name: 'shield', label: 'Cagar Budaya' },
];

export const TOURISM_CATEGORIES: CategoryMeta[] = [
  { id: 'alam', label: 'Alam & Ekowisata', shortLabel: 'Ekowisata', defaultColor: '#059669' },
  { id: 'sejarah', label: 'Sejarah & Budaya', shortLabel: 'Sejarah', defaultColor: '#d97706' },
  { id: 'taman', label: 'Taman & Rekreasi', shortLabel: 'Taman Kota', defaultColor: '#16a34a' },
  { id: 'bahari', label: 'Bahari & Pesisir', shortLabel: 'Bahari', defaultColor: '#0284c7' },
  { id: 'kuliner', label: 'Kuliner & UMKM', shortLabel: 'UMKM', defaultColor: '#e11d48' },
];

export function getCategoryMeta(id: TourismCategoryId): CategoryMeta {
  return TOURISM_CATEGORIES.find((c) => c.id === id) ?? TOURISM_CATEGORIES[0];
}

export const DynamicIcon: React.FC<{
  name: BuiltInIconName;
  className?: string;
  size?: number;
}> = ({ name, className = 'w-5 h-5', size }) => {
  const props = { className, ...(size ? { size } : {}) };
  switch (name) {
    case 'trees':
      return <Trees {...props} />;
    case 'landmark':
      return <Landmark {...props} />;
    case 'compass':
      return <Compass {...props} />;
    case 'anchor':
      return <Anchor {...props} />;
    case 'utensils':
      return <Utensils {...props} />;
    case 'sparkles':
      return <Sparkles {...props} />;
    case 'camera':
      return <Camera {...props} />;
    case 'mountain':
      return <Mountain {...props} />;
    case 'waves':
      return <Waves {...props} />;
    case 'store':
      return <Store {...props} />;
    case 'award':
      return <Award {...props} />;
    case 'heart':
      return <Heart {...props} />;
    case 'sun':
      return <Sun {...props} />;
    case 'shield':
      return <Shield {...props} />;
    case 'map-pin':
    default:
      return <MapPin {...props} />;
  }
};

/**
 * Raw SVG paths (24x24 viewBox) for Leaflet HTML divIcon markers & dynamic favicons.
 */
export function getIconSvgString(name: BuiltInIconName, stroke = '#ffffff', size = 18): string {
  const inner: Record<BuiltInIconName, string> = {
    trees:
      '<path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/>',
    landmark:
      '<line x1="3" x2="21" y1="22" y2="22"/><line x1="6" x2="6" y1="18" y2="11"/><line x1="10" x2="10" y1="18" y2="11"/><line x1="14" x2="14" y1="18" y2="11"/><line x1="18" x2="18" y1="18" y2="11"/><polygon points="12 2 20 7 4 7"/>',
    compass:
      '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>',
    anchor:
      '<path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/>',
    utensils:
      '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
    sparkles:
      '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    camera:
      '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    'map-pin':
      '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    mountain: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
    waves:
      '<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>',
    store:
      '<path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/>',
    award:
      '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
    heart:
      '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>',
  };

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${stroke}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${
    inner[name] || inner['map-pin']
  }</svg>`;
}

