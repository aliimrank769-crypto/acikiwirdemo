import React, { useEffect, useMemo, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  LayoutGrid,
  List,
  Lock,
  MapPin,
  Navigation,
  QrCode,
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
import { buildLocationQrUrl, generateQrDataUrl } from '../utils/qr';
import type { LocationSpot, TourismCategoryId } from '../types';

export const ExploreListModal: React.FC = () => {
  const {
    branding,
    locations,
    currentUser,
    userCoords,
    setSelectedLocationId,
    setActiveNavTab,
    flyToCoords,
    startRouteToLocation,
    openQrScannerTrigger,
    openUnlockedAreaModal,
  } = useApp();

  const [query, setQuery] = useState('');
  const [filterCat, setFilterCat] = useState<TourismCategoryId | 'all'>('all');
  const [sortBy, setSortBy] = useState<'distance' | 'rating' | 'photos'>('distance');
  const [desktopViewMode, setDesktopViewMode] = useState<'grid' | 'table'>('grid');
  const [qrDetailSpot, setQrDetailSpot] = useState<LocationSpot | null>(null);
  const [qrDetailDataUrl, setQrDetailDataUrl] = useState<string>('');

  useEffect(() => {
    if (!qrDetailSpot) return;
    let active = true;
    generateQrDataUrl(
      buildLocationQrUrl(qrDetailSpot.qrCode),
      branding.buttonColor
    ).then((url) => {
      if (active) setQrDetailDataUrl(url);
    });
    return () => {
      active = false;
    };
  }, [qrDetailSpot, branding.buttonColor]);

  const sortedSpots = useMemo(() => {
    return locations
      .filter((loc) => {
        if (filterCat !== 'all' && loc.category !== filterCat) return false;
        if (!query.trim()) return true;
        const q = query.toLowerCase();
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
      .sort((a, b) => {
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'photos') return b.spot.photos.length - a.spot.photos.length;
        return a.distance - b.distance;
      });
  }, [
    currentUser?.unlockedLocationIds,
    filterCat,
    locations,
    query,
    sortBy,
    userCoords,
  ]);

  const totalPhotos = useMemo(
    () => locations.reduce((acc, l) => acc + l.photos.length, 0),
    [locations]
  );
  const overallRating = useMemo(() => {
    const allReviews = locations.flatMap((l) => l.reviews);
    return getAverageRating(allReviews);
  }, [locations]);
  const unlockedCount = currentUser?.unlockedLocationIds.length ?? 0;

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden bg-slate-50 pb-[66px] md:pb-0 z-[510]">
      {/* ===================================================================
          ADAPTIVE HEADER:
          - Mobile: Compact stacked blue header
          - Tablet: Clean 2-row toolbar
          - Desktop: Widescreen Hero Banner + 4 Live Analytics Tiles
         =================================================================== */}
      <div
        className="shrink-0 px-4 pb-4 pt-5 md:px-6 md:py-5 lg:px-8 lg:py-6 text-white shadow-md"
        style={{
          background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.buttonColor} 100%)`,
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                <Sparkles className="h-3 w-3" />
                Direktori Wisata Interaktif OpenStreetMap
              </div>
              <h2 className="mt-1 text-lg md:text-xl lg:text-2xl font-extrabold tracking-tight">
                Jelajah Destinasi {branding.appName}
              </h2>
              <p className="text-xs md:text-sm text-blue-100">
                Temukan rute terdekat, pindai QR di lokasi, dan bagikan misi foto komunitas
              </p>
            </div>

            {/* Desktop Exclusive 4-Tile KPI Strip */}
            <div className="hidden lg:grid grid-cols-4 gap-3">
              <div className="rounded-2xl bg-white/12 px-4 py-2.5 backdrop-blur-sm border border-white/10">
                <p className="text-xl font-extrabold text-white">{locations.length}</p>
                <p className="text-[11px] font-semibold text-blue-100">Titik Wisata</p>
              </div>
              <div className="rounded-2xl bg-white/12 px-4 py-2.5 backdrop-blur-sm border border-white/10">
                <p className="text-xl font-extrabold text-amber-300">{totalPhotos}</p>
                <p className="text-[11px] font-semibold text-blue-100">Foto Komunitas</p>
              </div>
              <div className="rounded-2xl bg-white/12 px-4 py-2.5 backdrop-blur-sm border border-white/10">
                <p className="text-xl font-extrabold text-white">
                  ★ {overallRating > 0 ? overallRating : '5.0'}
                </p>
                <p className="text-[11px] font-semibold text-blue-100">Rating Rata-rata</p>
              </div>
              <div className="rounded-2xl bg-white/12 px-4 py-2.5 backdrop-blur-sm border border-white/10">
                <p className="text-xl font-extrabold text-amber-300">
                  {unlockedCount}/{locations.length}
                </p>
                <p className="text-[11px] font-semibold text-blue-100">Wilayah Anda</p>
              </div>
            </div>
          </div>

          {/* Interactive Search, Filter, Sort & View Mode Toolbar */}
          <div className="mt-4 flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari nama wisata, UMKM, pantai, atau sejarah..."
                className="w-full rounded-2xl bg-white py-2.5 pl-10 pr-4 text-xs md:text-sm font-semibold text-slate-800 shadow-sm focus:outline-none"
              />
            </div>

            {/* Tablet & Desktop Sort + Desktop View Toggle */}
            <div className="flex items-center justify-between md:justify-end gap-2">
              <div className="flex items-center rounded-xl bg-white/15 p-1 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => setSortBy('distance')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    sortBy === 'distance'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/85 hover:text-white'
                  }`}
                >
                  Terdekat
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('rating')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    sortBy === 'rating'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/85 hover:text-white'
                  }`}
                >
                  Rating ★
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('photos')}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                    sortBy === 'photos'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/85 hover:text-white'
                  }`}
                >
                  Terpopuler
                </button>
              </div>

              {/* Desktop Exclusive Grid vs Comparison Table Switcher */}
              <div className="hidden lg:flex items-center rounded-xl bg-white/15 p-1">
                <button
                  type="button"
                  onClick={() => setDesktopViewMode('grid')}
                  title="Tampilan Kartu Bento 3-Kolom"
                  className={`rounded-lg p-1.5 transition ${
                    desktopViewMode === 'grid'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDesktopViewMode('table')}
                  title="Tampilan Tabel Komparasi Desktop"
                  className={`rounded-lg p-1.5 transition ${
                    desktopViewMode === 'table'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-white/80 hover:text-white'
                  }`}
                >
                  <List className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Filter Chips */}
          <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto">
            <button
              type="button"
              onClick={() => setFilterCat('all')}
              className={`shrink-0 rounded-full px-3.5 py-1 text-xs font-bold transition ${
                filterCat === 'all'
                  ? 'text-slate-950 shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              style={
                filterCat === 'all'
                  ? { backgroundColor: branding.accentColor }
                  : undefined
              }
            >
              Semua Kategori
            </button>
            {TOURISM_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilterCat(cat.id)}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition ${
                  filterCat === cat.id
                    ? 'text-slate-950 shadow-sm'
                    : 'bg-white/15 text-white hover:bg-white/25'
                }`}
                style={
                  filterCat === cat.id
                    ? { backgroundColor: branding.accentColor }
                    : undefined
                }
              >
                <DynamicIcon
                  name={branding.categoryIcons[cat.id] || 'map-pin'}
                  className="h-3.5 w-3.5"
                />
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===================================================================
          ADAPTIVE CONTENT BODY:
          - Mobile: 1-Column Vertical Touch List
          - Tablet: 2-Column Balanced Card Grid (md:grid-cols-2)
          - Desktop: 3-Column Bento Grid (lg:grid-cols-3) OR Interactive Table
         =================================================================== */}
      <div className="thin-scrollbar flex-1 overflow-y-auto p-3.5 md:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Desktop Table View Mode */}
          {desktopViewMode === 'table' && (
            <div className="hidden lg:block overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-3.5">Destinasi Wisata</th>
                    <th className="px-4 py-3.5">Kategori</th>
                    <th className="px-4 py-3.5">Jarak &amp; Radius QR</th>
                    <th className="px-4 py-3.5">Rating &amp; Galeri</th>
                    <th className="px-4 py-3.5">Status Wilayah</th>
                    <th className="px-5 py-3.5 text-right">Aksi Interaktif</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {sortedSpots.map(({ spot, distance, rating, isUnlocked }) => {
                    const catMeta = getCategoryMeta(spot.category);
                    return (
                      <tr
                        key={spot.id}
                        className="transition hover:bg-blue-50/40"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                              style={{ backgroundColor: catMeta.defaultColor }}
                            >
                              <DynamicIcon
                                name={spot.pinIcon || branding.categoryIcons[spot.category]}
                                className="h-5 w-5"
                              />
                            </div>
                            <div className="max-w-xs">
                              <p className="font-extrabold text-slate-900">
                                {spot.name}
                              </p>
                              <p className="truncate text-[11px] text-slate-500">
                                {spot.operatingHours}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                            style={{ backgroundColor: catMeta.defaultColor }}
                          >
                            {catMeta.shortLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-700">
                          <div>{formatDistance(distance)}</div>
                          <div className="text-[11px] text-slate-400">
                            Radius QR ≤ {spot.radiusMeters}m
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1 font-extrabold text-amber-600">
                            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                            <span>{rating > 0 ? rating : 'Baru'}</span>
                            <span className="text-slate-400 font-medium">
                              ({spot.reviews.length})
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {spot.photos.length} Foto Komunitas
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          {isUnlocked ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-extrabold text-emerald-800">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Terbuka
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                              <Lock className="h-3 w-3" />
                              Terkunci
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLocationId(spot.id);
                                setActiveNavTab('map');
                                flyToCoords(spot.lat, spot.lng, 15);
                              }}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 font-bold text-slate-700 hover:bg-slate-50"
                            >
                              Peta OSM
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLocationId(spot.id);
                                startRouteToLocation(spot);
                              }}
                              className="rounded-xl px-3 py-1.5 font-bold text-white"
                              style={{ backgroundColor: branding.primaryColor }}
                            >
                              Rute
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                isUnlocked
                                  ? openUnlockedAreaModal(spot, false)
                                  : openQrScannerTrigger(spot.id)
                              }
                              className="rounded-xl px-3 py-1.5 font-extrabold text-slate-950"
                              style={{ backgroundColor: branding.accentColor }}
                            >
                              {isUnlocked ? 'Misi' : 'Scan QR'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Responsive Card Grid: 1-Col Mobile, 2-Col Tablet, 3-Col Desktop */}
          <div
            className={`${
              desktopViewMode === 'table' ? 'lg:hidden' : ''
            } grid grid-cols-1 gap-3.5 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6`}
          >
            {sortedSpots.map(({ spot, distance, rating, isUnlocked }) => {
              const catMeta = getCategoryMeta(spot.category);
              const coverPhoto = spot.photos[0]?.imageUrl;
              const totalXp = spot.missions.reduce((s, m) => s + m.xpReward, 0);

              return (
                <div
                  key={spot.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Visual Cover Header */}
                  <div
                    className="relative h-36 md:h-44 w-full overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.buttonColor} 100%)`,
                    }}
                  >
                    {coverPhoto && (
                      <img
                        src={coverPhoto}
                        alt={spot.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/20" />

                    <div className="absolute inset-x-3 top-3 flex items-center justify-between">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold text-white shadow"
                        style={{ backgroundColor: catMeta.defaultColor }}
                      >
                        <DynamicIcon
                          name={spot.pinIcon || branding.categoryIcons[spot.category]}
                          className="h-3 w-3"
                        />
                        {catMeta.shortLabel}
                      </span>

                      {isUnlocked ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold text-slate-950 shadow"
                          style={{ backgroundColor: branding.accentColor }}
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Terbuka
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-950/75 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                          <Lock className="h-2.5 w-2.5" />
                          Radius ≤{spot.radiusMeters}m
                        </span>
                      )}
                    </div>

                    <div className="absolute inset-x-3 bottom-2.5 flex items-center justify-between text-white">
                      <span className="inline-flex items-center gap-1 text-xs font-extrabold">
                        <MapPin className="h-3.5 w-3.5 text-amber-300" />
                        {formatDistance(distance)}
                      </span>
                      <span className="rounded-full bg-slate-950/80 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-300 backdrop-blur-sm">
                        {spot.missions.length} Misi (+{totalXp} Poin Wisata)
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-sm md:text-base font-extrabold text-slate-900">
                          {spot.name}
                        </h3>
                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-extrabold text-amber-800 border border-amber-200">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {rating > 0 ? rating : 'Baru'}
                        </span>
                      </div>

                      <p className="mt-1.5 text-xs font-medium leading-relaxed text-slate-700">
                        {spot.shortDescription}
                      </p>

                      {/* QR Lokasi & Daftar Deskripsi Misi QR */}
                      <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-2.5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-md bg-[#071A3E] px-2 py-0.5 font-mono text-[10px] font-extrabold text-amber-300">
                            QR: {spot.qrCode}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQrDetailSpot(spot)}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-900 hover:bg-blue-200"
                          >
                            <QrCode className="h-3 w-3" />
                            <span>Lihat QR &amp; Detail Misi</span>
                          </button>
                        </div>

                        <div className="space-y-1.5">
                          {spot.missions.map((m, idx) => (
                            <div
                              key={m.id}
                              className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px]"
                            >
                              <div className="flex items-center justify-between gap-1.5">
                                <span className="font-extrabold text-slate-900">
                                  {idx + 1}. {m.title}
                                </span>
                                <span className="shrink-0 rounded-full bg-amber-100 px-1.5 py-0.5 text-[9.5px] font-extrabold text-amber-950">
                                  +{m.xpReward} Poin
                                </span>
                              </div>
                              <p className="mt-0.5 text-[10.5px] font-medium leading-snug text-slate-700">
                                {m.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] font-bold text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <Camera className="h-3.5 w-3.5 text-slate-500" />
                          {spot.photos.length} Foto Komunitas
                        </span>
                        <span>{spot.reviews.length} Ulasan</span>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLocationId(spot.id);
                            setActiveNavTab('map');
                            flyToCoords(spot.lat, spot.lng, 15);
                          }}
                          className="col-span-4 rounded-xl border border-slate-200 bg-slate-100 py-2 text-xs font-extrabold text-slate-800 transition hover:bg-slate-200"
                        >
                          Peta
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedLocationId(spot.id);
                            startRouteToLocation(spot);
                          }}
                          className="col-span-4 flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-extrabold text-white transition hover:brightness-110"
                          style={{ backgroundColor: branding.primaryColor }}
                        >
                          <Navigation className="h-3.5 w-3.5" />
                          <span>Rute</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            isUnlocked
                              ? openUnlockedAreaModal(spot, false)
                              : openQrScannerTrigger(spot.id)
                          }
                          className="col-span-4 flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-extrabold text-slate-950 transition hover:brightness-105"
                          style={{ backgroundColor: branding.accentColor }}
                        >
                          <QrCode className="h-3.5 w-3.5" />
                          <span>{isUnlocked ? 'Misi' : 'Scan QR'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modal Detail QR Lokasi & Deskripsi Tiap Misi QR */}
      {qrDetailSpot && (
        <div
          className="fixed inset-0 z-[880] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
          onClick={() => setQrDetailSpot(null)}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="flex items-center justify-between px-5 py-4 text-white"
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.buttonColor} 100%)`,
              }}
            >
              <div>
                <span className="rounded-md bg-white/20 px-2 py-0.5 font-mono text-[10px] font-extrabold text-amber-300">
                  {qrDetailSpot.qrCode}
                </span>
                <h3 className="mt-1 text-sm font-extrabold">
                  QR Lokasi &amp; Deskripsi Misi: {qrDetailSpot.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setQrDetailSpot(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[75dvh] overflow-y-auto p-5 space-y-4">
              <div className="flex items-start gap-3.5 rounded-2xl border border-blue-200 bg-blue-50/60 p-3.5">
                <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
                  {qrDetailDataUrl ? (
                    <img
                      src={qrDetailDataUrl}
                      alt={qrDetailSpot.qrCode}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <QrCode className="h-10 w-10 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-extrabold text-slate-900">
                    Deskripsi QR Lokasi:
                  </p>
                  <p className="mt-1 text-[11px] font-medium leading-relaxed text-slate-700">
                    {qrDetailSpot.shortDescription}
                  </p>
                  <p className="mt-1.5 text-[10.5px] font-extrabold text-blue-900">
                    Radius Geofence ≤ {qrDetailSpot.radiusMeters}m • Unlock +100 Poin Wisata
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-extrabold text-slate-900">
                  Daftar &amp; Deskripsi Misi QR ({qrDetailSpot.missions.length} Misi):
                </p>
                {qrDetailSpot.missions.map((m, idx) => (
                  <div
                    key={m.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-slate-900">
                        {idx + 1}. {m.title}
                      </span>
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-950">
                        +{m.xpReward} Poin Wisata
                      </span>
                    </div>
                    <p className="text-[11px] font-medium leading-relaxed text-slate-700">
                      {m.description}
                    </p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  const target = qrDetailSpot;
                  setQrDetailSpot(null);
                  openQrScannerTrigger(target.id);
                }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-extrabold text-slate-950 shadow-md"
                style={{ backgroundColor: branding.accentColor }}
              >
                <QrCode className="h-4 w-4" />
                <span>Pindai / Simulasi Scan QR Lokasi Ini</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
