import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DeviceSidebarNav } from './components/DeviceSidebarNav';
import { HeaderBar } from './components/HeaderBar';
import { MapExplorerPanel } from './components/MapExplorerPanel';
import { InteractiveMap } from './components/InteractiveMap';
import { LocationBottomSheet } from './components/LocationBottomSheet';
import { BottomNavBar } from './components/BottomNavBar';
import { ExploreListModal } from './components/ExploreListModal';
import { UserPassportModal } from './components/UserPassportModal';
import { UmkmDashboardModal } from './components/UmkmDashboardModal';
import { AdminPanelModal } from './components/admin/AdminPanelModal';
import { HowToUseModal } from './components/HowToUseModal';
import { QrScannerModal } from './components/QrScannerModal';
import { OutOfRadiusModal } from './components/OutOfRadiusModal';
import { AuthOtpModal } from './components/AuthOtpModal';
import { AreaUnlockedModal } from './components/AreaUnlockedModal';
import { DemoJudgeWidget } from './components/DemoJudgeWidget';
import { ToastContainer } from './components/ToastContainer';

/**
 * Adaptive Multi-Device Application Shell:
 * - Mobile (< 768px): Full-bleed Map/Page + Top Glass Header + Bottom Nav Bar + Swipeable Bottom Sheet
 * - Tablet (768px - 1023px): Left 88px Vertical Icon Rail + Floating Search/Carousel + Right Glass Drawer
 * - Desktop (>= 1024px): Left 268px Branded Command Sidebar + Multi-Column Master-Detail Workspaces
 */
const MultiDeviceAppShell: React.FC = () => {
  const { isLoading, branding, activeNavTab, currentUser } = useApp();

  if (isLoading) {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-4 bg-[#071A3E] text-white">
        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-white p-2 shadow-2xl">
          {branding.logoType === 'image' && branding.logoImageUrl ? (
            <img
              src={branding.logoImageUrl}
              alt={branding.appName}
              className="h-full w-full object-contain"
            />
          ) : null}
        </div>
        <div
          className="h-9 w-9 animate-spin rounded-full border-4 border-white/20"
          style={{ borderTopColor: branding.accentColor }}
        />
        <p className="text-xs font-bold tracking-wide text-blue-100">
          Memuat {branding.appName} &amp; Peta OpenStreetMap...
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-slate-100">
      {/* Tablet Compact Rail & Desktop Expanded Sidebar */}
      <DeviceSidebarNav />

      {/* Main Dynamic Workspace */}
      <main className="relative flex h-full min-w-0 flex-1 overflow-hidden">
        {/* 1. HALAMAN PETA UTAMA (OPENSTREETMAP)
            Tetap ter-mount di balik layar saat pindah tab agar state peta & rute tidak hilang */}
        <div
          className={`relative flex h-full w-full flex-1 overflow-hidden ${
            activeNavTab === 'map' ? 'flex' : 'hidden'
          }`}
        >
          {/* Mobile Floating Top Header */}
          <HeaderBar />

          {/* Desktop Left Radar Column & Tablet Floating Search/Carousel Overlays */}
          <MapExplorerPanel />

          {/* Center Fluid OpenStreetMap Interactive Canvas */}
          <InteractiveMap />

          {/* Adaptive Location Detail:
              - Mobile: Swipeable Bottom Sheet
              - Tablet: Floating Right Overlay Drawer
              - Desktop: Docked Left/Right Inspector Sidebar */}
          <LocationBottomSheet />
        </div>

        {/* 2. HALAMAN JELAJAH DESTINASI (1-Col Mobile / 2-Col Tablet / 3-Col Bento & Table Desktop) */}
        {activeNavTab === 'explore' && <ExploreListModal />}

        {/* 3. HALAMAN PASPOR, POIN WISATA & DOMPET VOUCHER BEBAS REDEEM (KHUSUS WISATAWAN / TAMU) */}
        {activeNavTab === 'passport' &&
          (!currentUser || currentUser.role === 'user') && <UserPassportModal />}

        {/* 4. HALAMAN KHUSUS OWNER UMKM (PROFIL USAHA, PROMOSI, KASIR REDEEM VOUCHER & QR MISI) */}
        {activeNavTab === 'umkm' && <UmkmDashboardModal />}

        {/* 5. HALAMAN ADMIN PANEL & WHITE-LABEL CMS */}
        {activeNavTab === 'admin' && <AdminPanelModal />}
      </main>

      {/* Mobile-Only Bottom Navigation Bar (< 768px) */}
      <BottomNavBar />

      {/* Global Interactive Overlays & Modals */}
      <HowToUseModal />
      <DemoJudgeWidget />
      <QrScannerModal />
      <OutOfRadiusModal />
      <AuthOtpModal />
      <AreaUnlockedModal />
      <ToastContainer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <MultiDeviceAppShell />
    </AppProvider>
  );
};

export default App;
