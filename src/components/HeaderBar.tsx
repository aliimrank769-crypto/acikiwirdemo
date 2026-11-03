import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  FlaskConical,
  Globe,
  LogIn,
  Search,
  ShieldCheck,
  Sparkles,
  Store,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DynamicIcon, TOURISM_CATEGORIES } from '../utils/icons';
import { searchOsmNominatim, type OsmSearchResult } from '../utils/osm';

/**
 * HeaderBar khusus tampilan Mobile (< 768px) dengan Logo Putih ACIKIWIR,
 * Pencarian Lokasi OpenStreetMap, Panduan Cara Pakai, dan Filter Kategori Horizontal.
 */
export const HeaderBar: React.FC = () => {
  const {
    branding,
    locations,
    currentUser,
    selectedCategory,
    setSelectedCategory,
    selectedLocation,
    locationSheetSnap,
    openAuthModal,
    setActiveNavTab,
    setIsHowToUseOpen,
    isDemoWidgetOpen,
    setIsDemoWidgetOpen,
    demoBypassGps,
    flyToCoords,
    pushToast,
  } = useApp();

  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [query, setQuery] = useState('');
  const [osmPlaces, setOsmPlaces] = useState<OsmSearchResult[]>([]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) {
      setOsmPlaces([]);
      return;
    }
    const timer = window.setTimeout(async () => {
      const res = await searchOsmNominatim(q);
      setOsmPlaces(res);
    }, 420);
    return () => window.clearTimeout(timer);
  }, [query]);

  // Saat panel detail lokasi di-keataskan (full) pada tampilan mobile,
  // sembunyikan HeaderBar atas & filter kategori terlebih dahulu agar tidak bertumpuk!
  if (selectedLocation && locationSheetSnap === 'full') {
    return null;
  }

  const unlockedCount = currentUser?.unlockedLocationIds.length ?? 0;

  return (
    <div className="md:hidden pointer-events-none absolute inset-x-0 top-0 z-[500] flex flex-col gap-2 p-3">
      {/* Main Glassmorphic Mobile App Header */}
      <div className="pointer-events-auto flex items-center justify-between gap-2 rounded-2xl border border-white/80 bg-white/95 px-3 py-2 shadow-floating backdrop-blur-md">
        {/* Brand Identity (White-Label Dynamic + Crisp White Frame for ACIKIWIR Logo) */}
        <button
          type="button"
          onClick={() => setActiveNavTab('map')}
          className="flex min-w-0 items-center gap-2.5 text-left"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-sm ${
              branding.logoType === 'image' && branding.logoImageUrl
                ? 'border border-blue-100 bg-white p-0.5'
                : 'text-white'
            }`}
            style={
              !(branding.logoType === 'image' && branding.logoImageUrl)
                ? { backgroundColor: branding.primaryColor }
                : undefined
            }
          >
            {branding.logoType === 'image' && branding.logoImageUrl ? (
              <img
                src={branding.logoImageUrl}
                alt={branding.appName}
                className="h-full w-full object-contain"
              />
            ) : (
              <DynamicIcon name={branding.logoIcon} className="h-5 w-5" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1
                className="truncate text-sm font-extrabold tracking-tight"
                style={{ color: branding.buttonColor }}
              >
                {branding.appName}
              </h1>
              <span
                className="inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider text-slate-950"
                style={{ backgroundColor: branding.accentColor }}
              >
                OSM
              </span>
            </div>
            <p className="truncate text-[10.5px] font-medium text-slate-500">
              {branding.tagline}
            </p>
          </div>
        </button>

        {/* Right Actions: How to Use + OSM Search Toggle + Demo Toggle + Auth */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => setIsHowToUseOpen(true)}
            title="Cara Pakai Aplikasi (How to Use)"
            className="flex h-8 items-center gap-1 rounded-xl border border-blue-200 bg-blue-50 px-2 text-[10.5px] font-extrabold text-blue-800 transition hover:bg-blue-100"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-600" />
            <span className="hidden xs:inline">Cara Pakai</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            title="Cari di OpenStreetMap"
            className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
              showMobileSearch
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <Search className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsDemoWidgetOpen(!isDemoWidgetOpen)}
            title="Mode Demo Juri"
            className={`flex items-center gap-1 rounded-xl border px-2 py-1.5 text-[11px] font-bold transition ${
              isDemoWidgetOpen || demoBypassGps
                ? 'border-amber-400 bg-amber-50 text-amber-900 shadow-sm'
                : 'border-slate-200 bg-slate-50 text-slate-600'
            }`}
          >
            <FlaskConical className="h-3.5 w-3.5 text-amber-500" />
            {demoBypassGps && (
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            )}
          </button>

          {currentUser ? (
            <button
              type="button"
              onClick={() =>
                setActiveNavTab(
                  currentUser.role === 'admin'
                    ? 'admin'
                    : currentUser.role === 'umkm'
                    ? 'umkm'
                    : 'passport'
                )
              }
              className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 py-1 pl-1.5 pr-2 text-left"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-extrabold text-white"
                style={{
                  backgroundColor:
                    currentUser.role === 'admin'
                      ? branding.buttonColor
                      : currentUser.role === 'umkm'
                      ? '#d97706'
                      : branding.primaryColor,
                }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-0.5">
                  <span className="max-w-[54px] truncate text-[10.5px] font-bold text-slate-800">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  {currentUser.role === 'admin' && (
                    <ShieldCheck className="h-3 w-3 text-amber-500" />
                  )}
                  {currentUser.role === 'umkm' && (
                    <Store className="h-3 w-3 text-amber-600" />
                  )}
                </div>
                <span className="block text-[9px] font-semibold text-slate-500">
                  {currentUser.role === 'admin'
                    ? 'Admin'
                    : currentUser.role === 'umkm'
                    ? 'UMKM'
                    : `${unlockedCount}/${locations.length}`}
                </span>
              </div>
            </button>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-xs font-bold text-white shadow-sm active:scale-95"
              style={{ backgroundColor: branding.buttonColor }}
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>

      {/* Expandable Mobile OpenStreetMap Search Bar */}
      {showMobileSearch && (
        <div className="pointer-events-auto rounded-2xl border border-slate-200 bg-white/95 p-2.5 shadow-floating backdrop-blur-md animate-pop-in space-y-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari jalan / kota di OpenStreetMap..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs font-semibold text-slate-800 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setOsmPlaces([]);
                setShowMobileSearch(false);
              }}
              className="absolute right-2.5 text-slate-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {osmPlaces.length > 0 && (
            <div className="max-h-44 overflow-y-auto space-y-1">
              {osmPlaces.map((pl) => (
                <button
                  key={pl.placeId}
                  type="button"
                  onClick={() => {
                    flyToCoords(pl.lat, pl.lng, 16);
                    setShowMobileSearch(false);
                    setQuery('');
                    setOsmPlaces([]);
                    pushToast({
                      type: 'info',
                      title: `OpenStreetMap: ${pl.shortName}`,
                      message: pl.displayName,
                    });
                  }}
                  className="flex w-full items-start gap-2 rounded-xl px-2.5 py-1.5 text-left hover:bg-blue-50"
                >
                  <Globe className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-bold text-slate-800">
                      {pl.shortName}
                    </p>
                    <p className="truncate text-[10px] text-slate-500">
                      {pl.displayName}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Mobile Category Filter Horizontal Pills (Disembunyikan saat Bottom Sheet lokasi sedang terbuka agar layar bersih) */}
      {!selectedLocation && (
        <div className="pointer-events-auto no-scrollbar flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-md transition ${
              selectedCategory === 'all'
                ? 'border-transparent text-white'
                : 'border-white/80 bg-white/92 text-slate-700'
            }`}
            style={
              selectedCategory === 'all'
                ? { backgroundColor: branding.primaryColor }
                : undefined
            }
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Semua ({locations.length})</span>
          </button>

          {TOURISM_CATEGORIES.map((cat) => {
            const count = locations.filter((l) => l.category === cat.id).length;
            const isActive = selectedCategory === cat.id;
            const catIcon = branding.categoryIcons[cat.id] || 'map-pin';
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(isActive ? 'all' : cat.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm backdrop-blur-md transition ${
                  isActive
                    ? 'border-transparent text-white'
                    : 'border-white/80 bg-white/92 text-slate-700'
                }`}
                style={isActive ? { backgroundColor: branding.primaryColor } : undefined}
              >
                <DynamicIcon name={catIcon} className="h-3.5 w-3.5" />
                <span>
                  {cat.shortLabel} ({count})
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
