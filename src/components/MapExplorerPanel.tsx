import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Globe,
  Lock,
  MapPin,
  Navigation,
  Search,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  calculateHaversineMeters,
  formatDistance,
  getAverageRating,
} from '../utils/geo';
import { DynamicIcon, getCategoryMeta, TOURISM_CATEGORIES } from '../utils/icons';
import { searchOsmNominatim, type OsmSearchResult } from '../utils/osm';

export const MapExplorerPanel: React.FC = () => {
  const {
    branding,
    locations,
    currentUser,
    userCoords,
    selectedCategory,
    setSelectedCategory,
    selectedLocation,
    setSelectedLocationId,
    isDesktopExplorerCollapsed,
    setIsDesktopExplorerCollapsed,
    hoveredLocationId,
    setHoveredLocationId,
    flyToCoords,
    startRouteToLocation,
    pushToast,
  } = useApp();

  const [searchText, setSearchText] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [osmResults, setOsmResults] = useState<OsmSearchResult[]>([]);
  const [isSearchingOsm, setIsSearchingOsm] = useState(false);

  // Debounced OpenStreetMap Nominatim live geocoding search
  useEffect(() => {
    const q = searchText.trim();
    if (q.length < 3) {
      setOsmResults([]);
      setIsSearchingOsm(false);
      return;
    }

    setIsSearchingOsm(true);
    const timer = window.setTimeout(async () => {
      const found = await searchOsmNominatim(q);
      setOsmResults(found);
      setIsSearchingOsm(false);
    }, 420);

    return () => window.clearTimeout(timer);
  }, [searchText]);

  const enrichedSpots = useMemo(() => {
    return locations
      .filter((loc) => {
        if (selectedCategory !== 'all' && loc.category !== selectedCategory) {
          return false;
        }
        if (!searchText.trim()) return true;
        const q = searchText.toLowerCase();
        return (
          loc.name.toLowerCase().includes(q) ||
          loc.shortDescription.toLowerCase().includes(q)
        );
      })
      .map((loc) => ({
        spot: loc,
        distance: calculateHaversineMeters(userCoords, {
          lat: loc.lat,
          lng: loc.lng,
        }),
        rating: getAverageRating(loc.reviews),
        isUnlocked: Boolean(currentUser?.unlockedLocationIds.includes(loc.id)),
      }))
      .sort((a, b) =>
        sortBy === 'distance' ? a.distance - b.distance : b.rating - a.rating
      );
  }, [
    currentUser?.unlockedLocationIds,
    locations,
    searchText,
    selectedCategory,
    sortBy,
    userCoords,
  ]);

  const handleSelectSpot = (spotId: string, lat: number, lng: number) => {
    setSelectedLocationId(spotId);
    // Offset slightly east on wide screens so pin centers cleanly in open map area
    flyToCoords(lat, lng + 0.0022, 15);
  };

  const handleJumpOsmPlace = (place: OsmSearchResult) => {
    flyToCoords(place.lat, place.lng, 16);
    setSearchText('');
    setOsmResults([]);
    pushToast({
      type: 'info',
      title: `OpenStreetMap: ${place.shortName}`,
      message: place.displayName,
    });
  };

  return (
    <>
      {/* =====================================================================
          TABLET MAP OVERLAYS (768px - 1023px):
          1. Floating Top Search & Category Bar
          2. Floating Bottom Quick-Destination Carousel Strip
         ===================================================================== */}
      <div className="hidden md:block lg:hidden pointer-events-none">
        {/* Tablet Top-Left Search & Filter Toolbar */}
        <div
          className={`pointer-events-auto absolute left-4 top-4 z-[460] flex flex-col gap-2 transition-all ${
            selectedLocation ? 'right-[390px]' : 'right-44'
          }`}
        >
          <div className="relative flex items-center rounded-2xl border border-slate-200/90 bg-white/95 shadow-floating backdrop-blur-md">
            <Search className="ml-3.5 h-4 w-4 shrink-0 text-slate-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Cari destinasi wisata atau lokasi OpenStreetMap..."
              className="w-full bg-transparent py-2.5 pl-2.5 pr-8 text-xs font-semibold text-slate-800 focus:outline-none"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => {
                  setSearchText('');
                  setOsmResults([]);
                }}
                className="mr-2.5 rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* OSM Nominatim Dropdown Results on Tablet */}
          {osmResults.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-floating">
              <p className="px-2 py-1 text-[10px] font-extrabold uppercase text-slate-400">
                Hasil Lokasi OpenStreetMap
              </p>
              {osmResults.map((place) => (
                <button
                  key={place.placeId}
                  type="button"
                  onClick={() => handleJumpOsmPlace(place)}
                  className="flex w-full items-start gap-2 rounded-xl px-2.5 py-2 text-left hover:bg-blue-50"
                >
                  <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800">
                      {place.shortName}
                    </p>
                    <p className="truncate text-[10.5px] text-slate-500">
                      {place.displayName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Tablet Category Chips */}
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm transition ${
                selectedCategory === 'all'
                  ? 'text-white'
                  : 'bg-white/95 text-slate-700 hover:bg-white'
              }`}
              style={
                selectedCategory === 'all'
                  ? { backgroundColor: branding.primaryColor }
                  : undefined
              }
            >
              Semua ({locations.length})
            </button>
            {TOURISM_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(active ? 'all' : cat.id)}
                  className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-bold shadow-sm transition ${
                    active
                      ? 'text-white'
                      : 'bg-white/95 text-slate-700 hover:bg-white'
                  }`}
                  style={
                    active ? { backgroundColor: branding.primaryColor } : undefined
                  }
                >
                  <DynamicIcon
                    name={branding.categoryIcons[cat.id] || 'map-pin'}
                    className="h-3 w-3"
                  />
                  <span>{cat.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tablet Bottom Interactive Carousel Dock (Hidden when Detail Drawer is open to prevent crowding) */}
        {!selectedLocation && (
          <div className="pointer-events-auto absolute bottom-4 left-4 right-16 z-[450] transition-all">
            <div className="no-scrollbar flex gap-2.5 overflow-x-auto pb-1">
              {enrichedSpots.map(({ spot, distance, rating, isUnlocked }) => {
                const catMeta = getCategoryMeta(spot.category);
                return (
                  <button
                    key={spot.id}
                    type="button"
                    onMouseEnter={() => setHoveredLocationId(spot.id)}
                    onMouseLeave={() => setHoveredLocationId(null)}
                    onClick={() => handleSelectSpot(spot.id, spot.lat, spot.lng)}
                    className="flex w-64 shrink-0 items-center gap-2.5 rounded-2xl border border-slate-200 bg-white/95 p-2.5 text-left shadow-floating backdrop-blur-md transition hover:bg-white"
                  >
                    <div
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                      style={{ backgroundColor: catMeta.defaultColor }}
                    >
                      <DynamicIcon
                        name={spot.pinIcon || branding.categoryIcons[spot.category]}
                        className="h-5 w-5"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate text-xs font-extrabold text-slate-900">
                          {spot.name}
                        </span>
                        {isUnlocked && (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[10.5px] font-bold text-slate-600">
                        <span>{formatDistance(distance)}</span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-0.5 text-amber-700">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {rating > 0 ? rating : 'Baru'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          DESKTOP LEFT RADAR & OSM EXPLORER PANEL (>= 1024px):
          Dilengkapi Tombol Buka-Tutup (Collapse / Expand) Panel Daftar Wisata
         ===================================================================== */}
      {isDesktopExplorerCollapsed ? (
        <div className="hidden lg:flex pointer-events-none absolute left-4 top-4 z-[465]">
          <button
            type="button"
            onClick={() => setIsDesktopExplorerCollapsed(false)}
            className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-extrabold text-slate-900 shadow-floating transition hover:bg-blue-50 hover:text-blue-700"
            title="Buka Panel Radar Wisata"
          >
            <Compass className="h-4 w-4 text-blue-600" />
            <span>Buka Panel Radar Wisata ({enrichedSpots.length})</span>
            <ChevronRight className="h-4 w-4 text-slate-500" />
          </button>
        </div>
      ) : (
        <section
          className={`${
            selectedLocation ? 'hidden 2xl:flex' : 'hidden lg:flex'
          } h-full w-[328px] shrink-0 flex-col border-r border-slate-200 bg-white z-[460]`}
        >
          {/* Search & OSM Geocoding Header */}
          <div className="border-b border-slate-100 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Compass
                  className="h-4 w-4"
                  style={{ color: branding.primaryColor }}
                />
                <h2 className="text-sm font-extrabold text-slate-900">
                  Radar Wisata &amp; Peta OSM
                </h2>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-700">
                  {enrichedSpots.length} Titik
                </span>
                <button
                  type="button"
                  onClick={() => setIsDesktopExplorerCollapsed(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
                  title="Tutup Panel Radar Wisata"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </div>

          {/* Search Box (Local Spots + OpenStreetMap Nominatim) */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Cari wisata / jalan OpenStreetMap..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-xs font-semibold text-slate-800 transition focus:border-blue-600 focus:bg-white focus:outline-none"
            />
            {searchText && (
              <button
                type="button"
                onClick={() => {
                  setSearchText('');
                  setOsmResults([]);
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Live OpenStreetMap Nominatim Geocoding Results */}
          {(isSearchingOsm || osmResults.length > 0) && (
            <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-2 space-y-1">
              <div className="flex items-center justify-between px-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-700">
                  Pencarian Global OpenStreetMap
                </span>
                {isSearchingOsm && (
                  <span className="text-[10px] font-semibold text-blue-500">
                    Mencari...
                  </span>
                )}
              </div>
              {osmResults.map((place) => (
                <button
                  key={place.placeId}
                  type="button"
                  onClick={() => handleJumpOsmPlace(place)}
                  className="flex w-full items-start gap-2 rounded-lg bg-white px-2.5 py-1.5 text-left shadow-sm transition hover:bg-blue-50"
                >
                  <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800">
                      {place.shortName}
                    </p>
                    <p className="truncate text-[10px] text-slate-500">
                      {place.displayName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Category Filter Pills Wrap */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                selectedCategory === 'all'
                  ? 'text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              style={
                selectedCategory === 'all'
                  ? { backgroundColor: branding.primaryColor }
                  : undefined
              }
            >
              <Sparkles className="h-3 w-3" />
              <span>Semua</span>
            </button>
            {TOURISM_CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(active ? 'all' : cat.id)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    active
                      ? 'text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  style={
                    active ? { backgroundColor: branding.primaryColor } : undefined
                  }
                >
                  <DynamicIcon
                    name={branding.categoryIcons[cat.id] || 'map-pin'}
                    className="h-3 w-3"
                  />
                  <span>{cat.shortLabel}</span>
                </button>
              );
            })}
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center justify-between pt-0.5 text-[11px]">
            <span className="font-semibold text-slate-400">Urutkan:</span>
            <div className="flex rounded-lg bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setSortBy('distance')}
                className={`rounded-md px-2.5 py-1 font-bold transition ${
                  sortBy === 'distance'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Terdekat
              </button>
              <button
                type="button"
                onClick={() => setSortBy('rating')}
                className={`rounded-md px-2.5 py-1 font-bold transition ${
                  sortBy === 'rating'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                Rating ★
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Interactive Destination Cards (Hover Synced with Map Pins!) */}
        <div className="thin-scrollbar flex-1 overflow-y-auto p-3 space-y-2.5 bg-slate-50/60">
          {enrichedSpots.map(({ spot, distance, rating, isUnlocked }) => {
            const isSelected = selectedLocation?.id === spot.id;
            const isHovered = hoveredLocationId === spot.id;
            const catMeta = getCategoryMeta(spot.category);

            return (
              <div
                key={spot.id}
                onMouseEnter={() => setHoveredLocationId(spot.id)}
                onMouseLeave={() => setHoveredLocationId(null)}
                onClick={() => handleSelectSpot(spot.id, spot.lat, spot.lng)}
                className={`cursor-pointer rounded-2xl border bg-white p-3 transition-all ${
                  isSelected
                    ? 'border-blue-600 shadow-md ring-2 ring-blue-500/20'
                    : isHovered
                    ? 'border-amber-400 shadow-md -translate-y-0.5'
                    : 'border-slate-200/90 shadow-sm hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                    style={{ backgroundColor: catMeta.defaultColor }}
                  >
                    <DynamicIcon
                      name={spot.pinIcon || branding.categoryIcons[spot.category]}
                      className="h-5 w-5"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="line-clamp-1 text-xs font-extrabold text-slate-900">
                        {spot.name}
                      </h3>
                      {isUnlocked ? (
                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9.5px] font-extrabold text-amber-800">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          Terbuka
                        </span>
                      ) : (
                        <Lock className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                      )}
                    </div>

                    <p className="mt-0.5 line-clamp-2 text-[11px] font-medium leading-relaxed text-slate-600">
                      {spot.shortDescription}
                    </p>

                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className="rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[9.5px] font-extrabold text-slate-800">
                        QR: {spot.qrCode}
                      </span>
                      <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[9.5px] font-extrabold text-amber-900">
                        {spot.missions.length} Misi QR
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-[11px] font-bold text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-blue-600" />
                          {formatDistance(distance)}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-amber-600">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {rating > 0 ? rating : 'Baru'}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLocationId(spot.id);
                          startRouteToLocation(spot);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-[10.5px] font-extrabold text-blue-700 transition hover:bg-blue-100"
                      >
                        <Navigation className="h-3 w-3" />
                        <span>Rute</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      )}
    </>
  );
};

