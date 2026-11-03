import React from 'react';
import {
  Award,
  BookOpen,
  Compass,
  FlaskConical,
  LogIn,
  LogOut,
  Map,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-react';
import { useApp, type ActiveNavTab } from '../context/AppContext';
import { DynamicIcon } from '../utils/icons';

export const DeviceSidebarNav: React.FC = () => {
  const {
    branding,
    locations,
    currentUser,
    activeNavTab,
    setActiveNavTab,
    setIsHowToUseOpen,
    openQrScannerTrigger,
    openAuthModal,
    logout,
    isDemoWidgetOpen,
    setIsDemoWidgetOpen,
    demoBypassGps,
    setDemoBypassGps,
    quickSwitchDemoRole,
    isDesktopSidebarCollapsed,
    setIsDesktopSidebarCollapsed,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';
  const isUmkm = currentUser?.role === 'umkm';
  const unlockedCount = currentUser?.unlockedLocationIds.length ?? 0;

  const navItems: {
    id: ActiveNavTab;
    label: string;
    shortLabel: string;
    badge?: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'map',
      label: 'Peta Interaktif OSM',
      shortLabel: 'Peta',
      badge: 'OSM',
      icon: <Map className="h-5 w-5" />,
    },
    {
      id: 'explore',
      label: 'Jelajah Destinasi',
      shortLabel: 'Jelajah',
      badge: `${locations.length}`,
      icon: <Compass className="h-5 w-5" />,
    },
  ];

  // Fitur Paspor & Pengumpulan Poin HANYA untuk Wisatawan ('user') atau pengunjung belum login
  if (!isAdmin && !isUmkm) {
    navItems.push({
      id: 'passport',
      label: 'Paspor & Voucher',
      shortLabel: 'Paspor',
      badge: currentUser ? `${unlockedCount}/${locations.length}` : undefined,
      icon: <Award className="h-5 w-5" />,
    });
  }

  // Menu Khusus Owner UMKM
  if (isUmkm) {
    navItems.push({
      id: 'umkm',
      label: 'Panel Owner UMKM',
      shortLabel: 'UMKM',
      badge: 'Kasir',
      icon: <Store className="h-5 w-5" />,
    });
  }

  // Menu Khusus Admin
  if (isAdmin) {
    navItems.push({
      id: 'admin',
      label: 'Admin CMS Studio',
      shortLabel: 'Admin',
      badge: 'CMS',
      icon: <ShieldCheck className="h-5 w-5" />,
    });
  }

  return (
    <>
      {/* =====================================================================
          TABLET NAVIGATION RAIL (768px - 1023px): Compact 88px Vertical Rail
         ===================================================================== */}
      <aside className="hidden md:flex lg:hidden h-full w-[88px] shrink-0 flex-col items-center justify-between border-r border-slate-800 bg-[#071A3E] py-4 text-white z-[560] select-none">
        {/* Top Logo Badge */}
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveNavTab('map')}
            className="group flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-lg ring-2 ring-white/20 transition hover:scale-105"
            title={branding.appName}
          >
            {branding.logoType === 'image' && branding.logoImageUrl ? (
              <img
                src={branding.logoImageUrl}
                alt={branding.appName}
                className="h-full w-full object-contain"
              />
            ) : (
              <div
                className="flex h-full w-full items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: branding.primaryColor }}
              >
                <DynamicIcon name={branding.logoIcon} className="h-6 w-6" />
              </div>
            )}
          </button>
          <span
            className="rounded-md px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase tracking-wider text-slate-950"
            style={{ backgroundColor: branding.accentColor }}
          >
            Tablet
          </span>
        </div>

        {/* Center Navigation Icons */}
        <nav className="flex w-full flex-col items-center gap-1.5 px-2">
          {navItems.map((item) => {
            const active = activeNavTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveNavTab(item.id)}
                className={`relative flex w-full flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-bold transition ${
                  active
                    ? 'bg-white text-slate-950 shadow-md'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {active && (
                  <span
                    className="absolute -left-2 h-7 w-1.5 rounded-r-full"
                    style={{ backgroundColor: branding.accentColor }}
                  />
                )}
                <span
                  style={active ? { color: branding.primaryColor } : undefined}
                >
                  {item.icon}
                </span>
                <span>{item.shortLabel}</span>
              </button>
            );
          })}

          {/* How to Use Button on Tablet */}
          <button
            type="button"
            onClick={() => setIsHowToUseOpen(true)}
            className="flex w-full flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-bold text-amber-200 hover:bg-white/10 transition"
            title="Cara Pakai Aplikasi (How to Use)"
          >
            <BookOpen className="h-5 w-5" />
            <span>Panduan</span>
          </button>

          {/* Elevated Tablet Scan QR Button */}
          <button
            type="button"
            onClick={() => openQrScannerTrigger()}
            className="mt-1 flex w-full flex-col items-center justify-center gap-1 rounded-2xl py-2.5 text-[10px] font-extrabold text-slate-950 shadow-lg transition hover:brightness-105 active:scale-95"
            style={{ backgroundColor: branding.accentColor }}
            title="Scan QR Lokasi"
          >
            <QrCode className="h-5 w-5" />
            <span>Scan QR</span>
          </button>
        </nav>

        {/* Bottom Demo & Profile Controls */}
        <div className="flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsDemoWidgetOpen(!isDemoWidgetOpen)}
            title="Mode Demo Juri"
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
              isDemoWidgetOpen || demoBypassGps
                ? 'border-amber-400 bg-amber-400/20 text-amber-300'
                : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/15'
            }`}
          >
            <FlaskConical className="h-4 w-4" />
            {demoBypassGps && (
              <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
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
              title={`${currentUser.name} (${currentUser.role})`}
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-extrabold text-white shadow ring-2 ring-white/20"
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
            </button>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              title="Masuk Gmail OTP"
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 shadow hover:bg-slate-100"
            >
              <LogIn className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* =====================================================================
          DESKTOP COMMAND SIDEBAR (>= 1024px):
          Mendukung Tombol Buka-Tutup (Collapse 82px <-> Expand 272px)
         ===================================================================== */}
      {isDesktopSidebarCollapsed ? (
        <aside className="hidden lg:flex h-full w-[82px] shrink-0 flex-col items-center justify-between border-r border-slate-800 bg-[#071A3E] py-4 text-white z-[560] select-none transition-all duration-200">
          {/* Top Logo + Expand Sidebar Button */}
          <div className="flex flex-col items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsDesktopSidebarCollapsed(false)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/50 bg-amber-400 text-slate-950 shadow-md transition hover:brightness-105"
              title="Buka Sidebar Desktop"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={() => setActiveNavTab('map')}
              className="group flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-lg ring-2 ring-white/20 transition hover:scale-105"
              title={branding.appName}
            >
              {branding.logoType === 'image' && branding.logoImageUrl ? (
                <img
                  src={branding.logoImageUrl}
                  alt={branding.appName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center rounded-xl text-white"
                  style={{ backgroundColor: branding.primaryColor }}
                >
                  <DynamicIcon name={branding.logoIcon} className="h-6 w-6" />
                </div>
              )}
            </button>
          </div>

          {/* Center Navigation Icons */}
          <nav className="flex w-full flex-col items-center gap-1.5 px-2">
            {navItems.map((item) => {
              const active = activeNavTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNavTab(item.id)}
                  title={item.label}
                  className={`relative flex w-full flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-extrabold transition ${
                    active
                      ? 'bg-white text-slate-950 shadow-md'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span style={active ? { color: branding.primaryColor } : undefined}>
                    {item.icon}
                  </span>
                  <span>{item.shortLabel}</span>
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setIsHowToUseOpen(true)}
              className="flex w-full flex-col items-center justify-center gap-1 rounded-2xl py-2 text-[10px] font-bold text-amber-200 hover:bg-white/10 transition"
              title="Cara Pakai Aplikasi (How to Use)"
            >
              <BookOpen className="h-5 w-5" />
              <span>Panduan</span>
            </button>

            <button
              type="button"
              onClick={() => openQrScannerTrigger()}
              className="mt-1 flex w-full flex-col items-center justify-center gap-1 rounded-2xl py-2.5 text-[10px] font-extrabold text-slate-950 shadow-lg transition hover:brightness-105"
              style={{ backgroundColor: branding.accentColor }}
              title="Scan QR Lokasi"
            >
              <QrCode className="h-5 w-5" />
              <span>Scan QR</span>
            </button>
          </nav>

          {/* Bottom Demo & Profile Controls */}
          <div className="flex flex-col items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsDemoWidgetOpen(!isDemoWidgetOpen)}
              title="Buka Jendela Switch Role & Demo"
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                isDemoWidgetOpen || demoBypassGps
                  ? 'border-amber-400 bg-amber-400 text-slate-950'
                  : 'border-white/20 bg-white/10 text-amber-300 hover:bg-white/20'
              }`}
            >
              <FlaskConical className="h-4 w-4" />
            </button>

            {currentUser ? (
              <button
                type="button"
                onClick={logout}
                title={`Keluar (${currentUser.name})`}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
              >
                <LogOut className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                title="Masuk Gmail OTP"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-900 shadow hover:bg-slate-100"
              >
                <LogIn className="h-4 w-4" />
              </button>
            )}
          </div>
        </aside>
      ) : (
        <aside className="hidden lg:flex h-full w-[272px] shrink-0 flex-col justify-between border-r border-slate-800/80 bg-[#071A3E] p-4 text-white z-[560] select-none overflow-y-auto thin-scrollbar transition-all duration-200">
          <div className="space-y-4">
            {/* Crisp White Brand Showcase Card for ACIKIWIR Logo + Collapse Sidebar Button */}
            <div className="flex items-center gap-2 rounded-2xl bg-white p-2.5 shadow-lg">
              <button
                type="button"
                onClick={() => setActiveNavTab('map')}
                className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-white p-0.5">
                  {branding.logoType === 'image' && branding.logoImageUrl ? (
                    <img
                      src={branding.logoImageUrl}
                      alt={branding.appName}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center rounded-lg text-white"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      <DynamicIcon name={branding.logoIcon} className="h-6 w-6" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <h1
                      className="truncate text-sm font-extrabold tracking-tight"
                      style={{ color: branding.buttonColor }}
                    >
                      {branding.appName}
                    </h1>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase text-slate-950"
                      style={{ backgroundColor: branding.accentColor }}
                    >
                      OSM
                    </span>
                  </div>
                  <p className="line-clamp-1 text-[10.5px] font-semibold text-slate-500">
                    {branding.tagline}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsDesktopSidebarCollapsed(true)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                title="Tutup / Kecilkan Sidebar Desktop"
              >
                <PanelLeftClose className="h-4 w-4" />
              </button>
            </div>

            {/* Desktop Navigation Menu */}
            <div className="space-y-1">
              <div className="flex items-center justify-between px-2">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                  Menu Navigasi Utama
                </p>
                <button
                  type="button"
                  onClick={() => setIsDesktopSidebarCollapsed(true)}
                  className="text-[10px] font-bold text-amber-300 hover:underline"
                >
                  Kecilkan
                </button>
              </div>
              <nav className="space-y-1 pt-1">
                {navItems.map((item) => {
                  const active = activeNavTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveNavTab(item.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                        active
                          ? 'text-white shadow-md'
                          : 'text-slate-300 hover:bg-white/10 hover:text-white'
                      }`}
                      style={
                        active
                          ? { backgroundColor: branding.primaryColor }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                            active
                              ? 'bg-white/20 text-white'
                              : 'bg-white/10 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}

                {/* How to Use (Panduan Cara Pakai) Button */}
                <button
                  type="button"
                  onClick={() => setIsHowToUseOpen(true)}
                  className="flex w-full items-center justify-between rounded-xl border border-amber-400/30 bg-amber-400/10 px-3.5 py-2.5 text-xs font-extrabold text-amber-200 transition hover:bg-amber-400/20"
                >
                  <div className="flex items-center gap-2.5">
                    <BookOpen className="h-5 w-5 text-amber-300" />
                    <span>Cara Pakai (How to Use)</span>
                  </div>
                  <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-extrabold text-amber-200">
                    Panduan
                  </span>
                </button>
              </nav>
            </div>

            {/* Interactive Geofencing Scan QR Card */}
            <div
              className="rounded-2xl p-3.5 shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.buttonColor} 100%)`,
              }}
            >
              <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>
                  {isAdmin || isUmkm
                    ? 'Uji Pemindaian QR Lokasi'
                    : 'Unlock Wilayah & Voucher UMKM'}
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-blue-100">
                {isAdmin || isUmkm
                  ? 'Pindai atau simulasikan QR Code titik wisata di Kota Langsa.'
                  : 'Pindai QR lokasi & selesaikan misi untuk kumpul Poin & Voucher UMKM!'}
              </p>
              <button
                type="button"
                onClick={() => openQrScannerTrigger()}
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold text-slate-950 shadow-md transition hover:brightness-105 active:scale-95"
                style={{ backgroundColor: branding.accentColor }}
              >
                <QrCode className="h-4 w-4" />
                <span>Scan QR Lokasi</span>
              </button>
            </div>
          </div>

          {/* Bottom Section: Solid Clean Switch Role Box + User Account Card */}
          <div className="space-y-3 pt-3">
            {/* Solid White High-Contrast Demo Switch Role Card */}
            <div className="rounded-2xl border-2 border-amber-400 bg-white p-3 text-slate-900 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-slate-900">
                  <FlaskConical className="h-3.5 w-3.5 text-amber-600" />
                  Mode Demo &amp; Switch Role
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveNavTab('map');
                    setIsDemoWidgetOpen(!isDemoWidgetOpen);
                  }}
                  className="rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-950 hover:bg-amber-200"
                >
                  {isDemoWidgetOpen ? 'Tutup Panel' : 'Simulasi QR'}
                </button>
              </div>

              <label className="flex cursor-pointer items-center justify-between rounded-lg bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 border border-slate-200">
                <span>Bypass Radius GPS</span>
                <input
                  type="checkbox"
                  checked={demoBypassGps}
                  onChange={(e) => setDemoBypassGps(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-blue-600"
                />
              </label>

              <div className="space-y-1">
                <span className="block text-[9.5px] font-extrabold uppercase tracking-wider text-slate-500">
                  Pilih Role Akun Demo:
                </span>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => quickSwitchDemoRole('user')}
                    className={`rounded-lg py-1.5 text-[10px] font-extrabold transition ${
                      currentUser?.role === 'user'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Wisatawan
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSwitchDemoRole('umkm')}
                    className={`rounded-lg py-1.5 text-[10px] font-extrabold transition ${
                      currentUser?.role === 'umkm'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    UMKM
                  </button>
                  <button
                    type="button"
                    onClick={() => quickSwitchDemoRole('admin')}
                    className={`rounded-lg py-1.5 text-[10px] font-extrabold transition ${
                      currentUser?.role === 'admin'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>
            </div>

            {/* User Profile / Login Card (Tanpa Indikator Poin pada UMKM & Admin!) */}
            {currentUser ? (
              <div className="rounded-2xl border border-white/15 bg-white/10 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-slate-950"
                      style={{ backgroundColor: branding.accentColor }}
                    >
                      {currentUser.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-extrabold text-white">
                        {currentUser.name}
                      </p>
                      <p className="truncate text-[10px] font-bold text-amber-200">
                        {currentUser.role === 'umkm'
                          ? 'OWNER UMKM • MITRA RESMI'
                          : currentUser.role === 'admin'
                          ? 'ADMIN • PENGELOLA UTAMA'
                          : `WISATAWAN • ${currentUser.xp} Poin Wisata`}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    title="Keluar Akun"
                    className="rounded-lg bg-white/10 p-1.5 text-slate-300 hover:bg-rose-500/30 hover:text-rose-200"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={openAuthModal}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-xs font-extrabold text-slate-950 shadow transition hover:bg-slate-100"
              >
                <LogIn className="h-4 w-4" style={{ color: branding.primaryColor }} />
                <span>Masuk / Mitra UMKM</span>
              </button>
            )}
          </div>
        </aside>
      )}
    </>
  );
};
