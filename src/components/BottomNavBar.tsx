import React from 'react';
import { Award, Compass, Map, QrCode, ShieldCheck, Store } from 'lucide-react';
import { useApp } from '../context/AppContext';

/**
 * Navigasi Bottom Bar khusus perangkat Mobile (< 768px).
 * Pada Tablet digunakan Vertical Rail kiri, dan pada Desktop digunakan Branded Command Sidebar.
 */
export const BottomNavBar: React.FC = () => {
  const {
    branding,
    currentUser,
    activeNavTab,
    setActiveNavTab,
    openQrScannerTrigger,
    selectedLocation,
    locationSheetSnap,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';
  const isUmkm = currentUser?.role === 'umkm';

  // Ketika panel detail lokasi di-keataskan (full) pada tampilan peta mobile,
  // sembunyikan navbar mobile terlebih dahulu agar tidak tumpang tindih!
  if (activeNavTab === 'map' && selectedLocation && locationSheetSnap === 'full') {
    return null;
  }

  return (
    <nav className="md:hidden pointer-events-auto fixed inset-x-0 bottom-0 z-[550] flex h-[66px] items-center justify-around border-t border-slate-200/90 bg-white/98 px-2 shadow-lg backdrop-blur-md">
      {/* 1. Peta Utama */}
      <button
        type="button"
        onClick={() => setActiveNavTab('map')}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10.5px] font-extrabold transition ${
          activeNavTab === 'map' ? 'text-primary' : 'text-slate-500 hover:text-slate-800'
        }`}
        style={activeNavTab === 'map' ? { color: branding.primaryColor } : undefined}
      >
        <Map className="h-5 w-5" />
        <span>Peta</span>
      </button>

      {/* 2. Jelajah Wisata */}
      <button
        type="button"
        onClick={() => setActiveNavTab('explore')}
        className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10.5px] font-extrabold transition ${
          activeNavTab === 'explore' ? 'text-primary' : 'text-slate-500 hover:text-slate-800'
        }`}
        style={activeNavTab === 'explore' ? { color: branding.primaryColor } : undefined}
      >
        <Compass className="h-5 w-5" />
        <span>Jelajah</span>
      </button>

      {/* 3. Center Elevated Scan QR Button */}
      <div className="flex flex-1 items-center justify-center">
        <button
          type="button"
          onClick={() => openQrScannerTrigger()}
          className="-mt-6 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ring-4 ring-white transition hover:brightness-105 active:scale-95"
          style={{ backgroundColor: branding.buttonColor }}
          title="Scan QR Lokasi"
        >
          <QrCode className="h-6 w-6" style={{ color: branding.accentColor }} />
        </button>
      </div>

      {/* 4A. Paspor & Dompet Voucher (HANYA untuk Wisatawan / Guest — Dihapus pada UMKM & Admin) */}
      {!isAdmin && !isUmkm && (
        <button
          type="button"
          onClick={() => setActiveNavTab('passport')}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10.5px] font-extrabold transition ${
            activeNavTab === 'passport' ? 'text-primary' : 'text-slate-500 hover:text-slate-800'
          }`}
          style={activeNavTab === 'passport' ? { color: branding.primaryColor } : undefined}
        >
          <Award className="h-5 w-5" />
          <span>Paspor</span>
        </button>
      )}

      {/* 4B. Menu Khusus Owner UMKM */}
      {isUmkm && (
        <button
          type="button"
          onClick={() => setActiveNavTab('umkm')}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10.5px] font-extrabold transition ${
            activeNavTab === 'umkm'
              ? 'text-amber-600'
              : 'text-slate-500 hover:text-amber-600'
          }`}
        >
          <Store className="h-5 w-5" />
          <span>Panel UMKM</span>
        </button>
      )}

      {/* 4C. Menu Khusus Admin Panel */}
      {isAdmin && (
        <button
          type="button"
          onClick={() => setActiveNavTab('admin')}
          className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10.5px] font-extrabold transition ${
            activeNavTab === 'admin'
              ? 'text-blue-700'
              : 'text-slate-500 hover:text-blue-700'
          }`}
        >
          <ShieldCheck className="h-5 w-5" />
          <span>Admin</span>
        </button>
      )}
    </nav>
  );
};
