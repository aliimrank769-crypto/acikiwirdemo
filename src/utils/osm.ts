export type OsmLayerStyleId = 'osm-standard' | 'osm-hot' | 'osm-cyclosm';

export interface OsmTileLayerConfig {
  id: OsmLayerStyleId;
  name: string;
  shortName: string;
  description: string;
  url: string;
  attribution: string;
  maxZoom: number;
  subdomains?: string;
}

export const OSM_TILE_LAYERS: OsmTileLayerConfig[] = [
  {
    id: 'osm-standard',
    name: 'OpenStreetMap Standard',
    shortName: 'OSM Standard',
    description: 'Peta resmi OpenStreetMap detail jalan & bangunan',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
    maxZoom: 19,
    subdomains: 'abc',
  },
  {
    id: 'osm-hot',
    name: 'OSM Humanitarian (Wisata)',
    shortName: 'OSM Wisata',
    description: 'Gaya peta hangat & bersih dari Humanitarian OSM Team',
    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors, HOT',
    maxZoom: 19,
    subdomains: 'abc',
  },
  {
    id: 'osm-cyclosm',
    name: 'OSM Outdoor & Topografi',
    shortName: 'OSM Topo',
    description: 'Kontur alam, jalur sepeda/pejalan kaki & pelabuhan OSM',
    url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors, CyclOSM',
    maxZoom: 19,
    subdomains: 'abc',
  },
];

export function getOsmTileConfig(id: OsmLayerStyleId): OsmTileLayerConfig {
  return OSM_TILE_LAYERS.find((l) => l.id === id) ?? OSM_TILE_LAYERS[0];
}

export interface OsmSearchResult {
  placeId: string;
  shortName: string;
  displayName: string;
  lat: number;
  lng: number;
  category?: string;
}

/**
 * Pencarian lokasi interaktif menggunakan OpenStreetMap Nominatim API gratis
 */
export async function searchOsmNominatim(query: string): Promise<OsmSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&countrycodes=id&q=${encodeURIComponent(
      q
    )}`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'id,en',
      },
    });
    if (!res.ok) return [];
    const raw = (await res.json()) as Array<{
      place_id: number | string;
      name?: string;
      display_name: string;
      lat: string;
      lon: string;
      type?: string;
    }>;

    return raw.map((item) => ({
      placeId: String(item.place_id),
      shortName: item.name || item.display_name.split(',')[0],
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      category: item.type,
    }));
  } catch {
    return [];
  }
}

/**
 * Reverse Geocoding koordinat ke nama jalan/desa melalui OpenStreetMap Nominatim
 */
export async function reverseGeocodeOsm(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=17`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'id,en',
      },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { display_name?: string };
    return data.display_name ?? null;
  } catch {
    return null;
  }
}

