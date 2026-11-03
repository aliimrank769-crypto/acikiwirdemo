import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  FlaskConical,
  ImageUp,
  MapPin,
  QrCode,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateHaversineMeters, formatDistance } from '../utils/geo';
import {
  buildLocationQrUrl,
  decodeQrFromImageFile,
  generateQrDataUrl,
} from '../utils/qr';

export const QrScannerModal: React.FC = () => {
  const {
    branding,
    locations,
    isQrScannerOpen,
    closeQrScanner,
    scannerPreferredLocationId,
    handleQrScanPayload,
    userCoords,
    demoBypassGps,
    setDemoBypassGps,
    pushToast,
  } = useApp();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualQrInput, setManualQrInput] = useState('');
  const [selectedDemoSpotId, setSelectedDemoSpotId] = useState<string>('');
  const [previewQrUrl, setPreviewQrUrl] = useState<string>('');

  useEffect(() => {
    if (isQrScannerOpen) {
      const preferred =
        scannerPreferredLocationId || locations[0]?.id || '';
      setSelectedDemoSpotId(preferred);
      setManualQrInput('');
    }
  }, [isQrScannerOpen, scannerPreferredLocationId, locations]);

  const selectedSpot =
    locations.find((l) => l.id === selectedDemoSpotId) ?? locations[0];

  useEffect(() => {
    if (!isQrScannerOpen || !selectedSpot) return;
    let active = true;
    generateQrDataUrl(
      buildLocationQrUrl(selectedSpot.qrCode),
      branding.buttonColor
    ).then((url) => {
      if (active) setPreviewQrUrl(url);
    });
    return () => {
      active = false;
    };
  }, [isQrScannerOpen, selectedSpot?.qrCode, branding.buttonColor]);

  // Start real camera QR scanner loop using jsQR when modal opens
  useEffect(() => {
    if (!isQrScannerOpen) return;

    let stream: MediaStream | null = null;
    let rafId: number | null = null;
    let cancelled = false;

    const startCamera = async () => {
      setCameraError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Kamera tidak tersedia di perangkat ini. Gunakan unggah gambar QR atau Mode Simulasi Demo di bawah.');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraActive(true);
        }

        const scanFrame = () => {
          if (cancelled) return;
          const video = videoRef.current;
          const canvas = canvasRef.current;
          if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
              const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const qr = jsQR(imgData.data, imgData.width, imgData.height);
              if (qr?.data) {
                cancelled = true;
                stream?.getTracks().forEach((t) => t.stop());
                handleQrScanPayload(qr.data);
                return;
              }
            }
          }
          rafId = window.requestAnimationFrame(scanFrame);
        };

        rafId = window.requestAnimationFrame(scanFrame);
      } catch {
        setCameraActive(false);
        setCameraError(
          'Izin kamera tidak diaktifkan. Anda dapat mengunggah foto QR Code atau klik Simulasi Scan QR Juri di bawah.'
        );
      }
    };

    startCamera();

    return () => {
      cancelled = true;
      setCameraActive(false);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [handleQrScanPayload, isQrScannerOpen]);

  if (!isQrScannerOpen) return null;

  const handleUploadQrFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const decoded = await decodeQrFromImageFile(file);
    e.target.value = '';
    if (!decoded) {
      pushToast({
        type: 'error',
        title: 'QR Tidak Terbaca',
        message: 'Tidak ditemukan QR Code yang valid pada gambar tersebut.',
      });
      return;
    }
    handleQrScanPayload(decoded);
  };

  return (
    <div className="fixed inset-0 z-[750] flex items-end sm:items-center justify-center bg-slate-950/75 p-0 sm:p-4 backdrop-blur-sm">
      <div className="flex max-h-[92dvh] w-full max-w-[520px] flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl animate-pop-in">
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3.5 text-white"
          style={{ backgroundColor: branding.primaryColor }}
        >
          <div className="flex items-center gap-2.5">
            <QrCode className="h-5 w-5" />
            <div>
              <h3 className="text-sm font-extrabold">Scan QR Titik Wisata</h3>
              <p className="text-[11px] text-white/85">
                Validasi Geofencing GPS Real-Time (Haversine)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeQrScanner}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="thin-scrollbar overflow-y-auto p-4 space-y-4">
          {/* Camera Viewfinder */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-900">
            <video
              ref={videoRef}
              playsInline
              muted
              className={`h-full w-full object-cover ${cameraActive ? 'opacity-100' : 'opacity-20'}`}
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Scanning Frame Reticle */}
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center p-6">
              <div className="relative h-44 w-44 rounded-2xl border-2 border-emerald-400/90 shadow-[0_0_0_9999px_rgba(15,23,42,0.45)]">
                <div className="absolute inset-x-2 top-1/2 h-0.5 -translate-y-1/2 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" />
              </div>
              <p className="mt-3 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-semibold text-white">
                {cameraActive
                  ? 'Arahkan kamera ke papan QR Code lokasi wisata'
                  : 'Mode Pemindai File / Simulasi Aktif'}
              </p>
            </div>

            {cameraError && (
              <div className="absolute inset-x-3 bottom-3 rounded-xl bg-slate-900/90 p-2.5 text-center text-[11px] text-slate-200">
                <Camera className="mx-auto mb-1 h-4 w-4 text-amber-400" />
                {cameraError}
              </div>
            )}
          </div>

          {/* Upload QR Image File (Supports scanning downloaded Admin QR cards!) */}
          <div className="flex items-center gap-2">
            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100">
              <ImageUp className="h-4 w-4 text-slate-600" />
              <span>Unggah Gambar QR Code</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleUploadQrFile}
                className="hidden"
              />
            </label>
          </div>

          {/* Manual QR Code Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (manualQrInput.trim()) {
                handleQrScanPayload(manualQrInput.trim());
              }
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={manualQrInput}
              onChange={(e) => setManualQrInput(e.target.value)}
              placeholder="Atau ketik ID QR (misal: JL-QR-MANGROVE-001)"
              className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-slate-800 px-3.5 py-2 text-xs font-bold text-white hover:bg-slate-900"
            >
              Validasi
            </button>
          </form>

          {/* Hackathon Judge Simulation Panel right inside QR Modal */}
          <div className="rounded-2xl border border-amber-300 bg-amber-50/80 p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-amber-900">
                <FlaskConical className="h-4 w-4 text-amber-600" />
                <span className="text-xs font-extrabold">
                  Mode Demo Juri (Simulasi Scan QR)
                </span>
              </div>
              <label className="flex cursor-pointer items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={demoBypassGps}
                  onChange={(e) => setDemoBypassGps(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-amber-600"
                />
                <span className="text-[11px] font-bold text-amber-800">
                  Bypass Radius GPS
                </span>
              </label>
            </div>

            <select
              value={selectedDemoSpotId}
              onChange={(e) => setSelectedDemoSpotId(e.target.value)}
              className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              {locations.map((loc) => {
                const dist = calculateHaversineMeters(userCoords, {
                  lat: loc.lat,
                  lng: loc.lng,
                });
                return (
                  <option key={loc.id} value={loc.id}>
                    {loc.name} ({formatDistance(dist)} • Radius ≤{loc.radiusMeters}m)
                  </option>
                );
              })}
            </select>

            {selectedSpot && (
              <div className="rounded-xl border border-amber-300 bg-white p-3 space-y-2.5">
                <div className="flex items-start gap-3">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1">
                    {previewQrUrl ? (
                      <img
                        src={previewQrUrl}
                        alt={selectedSpot.qrCode}
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <QrCode className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <span className="rounded-md bg-[#071A3E] px-2 py-0.5 font-mono text-[10px] font-extrabold text-amber-300">
                        {selectedSpot.qrCode}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-slate-800">
                        <MapPin className="h-3 w-3 text-blue-700" />
                        Jarak:{' '}
                        {formatDistance(
                          calculateHaversineMeters(userCoords, {
                            lat: selectedSpot.lat,
                            lng: selectedSpot.lng,
                          })
                        )}
                      </span>
                    </div>
                    <p className="mt-1 text-xs font-extrabold text-slate-900">
                      QR Lokasi: {selectedSpot.name}
                    </p>
                    <p className="mt-0.5 text-[11px] font-medium leading-relaxed text-slate-700">
                      {selectedSpot.shortDescription}
                    </p>
                  </div>
                </div>

                {/* Deskripsi Tiap Misi QR dari Lokasi Ini */}
                <div className="border-t border-slate-100 pt-2 space-y-1.5">
                  <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-700">
                    Deskripsi Tiap Misi QR di Lokasi Ini ({selectedSpot.missions.length} Misi):
                  </p>
                  {selectedSpot.missions.map((m, idx) => (
                    <div
                      key={m.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-slate-900">
                          {idx + 1}. {m.title}
                        </span>
                        <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[9.5px] font-extrabold text-amber-950">
                          +{m.xpReward} Poin
                        </span>
                      </div>
                      <p className="mt-0.5 text-[10.5px] font-medium text-slate-700">
                        {m.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  if (!selectedSpot) return;
                  handleQrScanPayload(selectedSpot.qrCode);
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-amber-400 bg-white px-3 py-2 text-xs font-bold text-amber-900 shadow-sm hover:bg-amber-100"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Uji Scan (Cek Radius)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!selectedSpot) return;
                  setDemoBypassGps(true);
                  // Defer 1 tick or pass bypass immediately
                  window.setTimeout(() => {
                    handleQrScanPayload(selectedSpot.qrCode);
                  }, 30);
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Bypass & Unlock!</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

