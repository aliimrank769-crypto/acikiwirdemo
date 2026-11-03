import React from 'react';
import { FlaskConical, MapPinOff, Navigation, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OutOfRadiusModal: React.FC = () => {
  const {
    branding,
    outOfRadiusState,
    closeOutOfRadiusModal,
    startRouteToLocation,
    teleportDemoGps,
    handleQrScanPayload,
  } = useApp();

  if (!outOfRadiusState) return null;

  const { location, distanceMeters } = outOfRadiusState;

  return (
    <div className="fixed inset-0 z-[780] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
      <div className="w-full max-w-[400px] overflow-hidden rounded-3xl bg-white shadow-2xl animate-pop-in">
        <div className="relative bg-rose-50 px-5 pb-4 pt-6 text-center">
          <button
            type="button"
            onClick={closeOutOfRadiusModal}
            className="absolute right-3.5 top-3.5 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 shadow-sm">
            <MapPinOff className="h-7 w-7" />
          </div>

          <span className="inline-block rounded-full bg-rose-600 px-3 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white">
            Di Luar Radius Geofencing (Maks {location.radiusMeters}m)
          </span>

          <h3 className="mt-2 text-base font-extrabold text-slate-900">
            {location.name}
          </h3>
        </div>

        <div className="p-5 space-y-4">
          <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-3.5 text-center">
            <p className="text-xs font-semibold leading-relaxed text-slate-800">
              &ldquo;Kamu masih berada{' '}
              <span className="font-extrabold text-rose-600">
                {distanceMeters.toLocaleString('id-ID')} meter
              </span>{' '}
              dari lokasi ini. Dekati titik lokasi atau gunakan tombol Rute untuk membuka wilayah ini!&rdquo;
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => startRouteToLocation(location)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-xs font-extrabold text-white shadow-md transition active:scale-95"
              style={{ backgroundColor: branding.buttonColor }}
            >
              <Navigation className="h-4 w-4" />
              <span>Tampilkan Rute ke Lokasi</span>
            </button>

            {/* Hackathon Judge Quick Teleport & Unlock Option */}
            <button
              type="button"
              onClick={() => {
                // Teleport simulated GPS 15m from spot so Haversine formula genuinely passes!
                teleportDemoGps(
                  { lat: location.lat + 0.00011, lng: location.lng + 0.00008 },
                  location.name
                );
                closeOutOfRadiusModal();
                window.setTimeout(() => {
                  handleQrScanPayload(location.qrCode);
                }, 120);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
            >
              <FlaskConical className="h-4 w-4 text-amber-600" />
              <span>Mode Demo Juri: Simulasi Dekati Lokasi & Scan QR</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

