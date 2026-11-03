import React, { useMemo, useState } from 'react';
import {
  Award,
  Camera,
  CheckCircle2,
  FlaskConical,
  ImagePlus,
  Send,
  Sparkles,
  Star,
  Store,
  Ticket,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { compressImageFile, createPostcardDataUrl } from '../utils/image';
import type { MicroMission } from '../types';

const CONFETTI_COLORS = [
  '#10b981',
  '#f59e0b',
  '#3b82f6',
  '#ec4899',
  '#8b5cf6',
  '#fbbf24',
];

export const AreaUnlockedModal: React.FC = () => {
  const {
    branding,
    currentUser,
    vouchers,
    setActiveNavTab,
    unlockedModalState,
    closeUnlockedAreaModal,
    submitMissionPhoto,
    submitLocationReview,
    pushToast,
  } = useApp();

  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);
  const [photoDrafts, setPhotoDrafts] = useState<
    Record<string, { imageUrl: string; caption: string }>
  >({});
  const [ratingValue, setRatingValue] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isProcessingImg, setIsProcessingImg] = useState(false);

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        left: `${(i * 4.5 + 3) % 96}%`,
        delay: `${(i % 7) * 0.12}s`,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      })),
    []
  );

  if (!unlockedModalState) return null;

  const { location, celebrate } = unlockedModalState;
  const completedKeys = new Set(currentUser?.completedMissionKeys ?? []);
  const completedCount = location.missions.filter((m) =>
    completedKeys.has(`${location.id}::${m.id}`)
  ).length;

  const handleFileChange = async (
    mission: MicroMission,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsProcessingImg(true);
    try {
      const dataUrl = await compressImageFile(file, 920, 0.82);
      setPhotoDrafts((prev) => ({
        ...prev,
        [mission.id]: {
          imageUrl: dataUrl,
          caption: prev[mission.id]?.caption ?? '',
        },
      }));
    } catch (err) {
      pushToast({
        type: 'error',
        title: 'Gagal Memuat Foto',
        message: err instanceof Error ? err.message : 'Format file tidak didukung.',
      });
    } finally {
      setIsProcessingImg(false);
      e.target.value = '';
    }
  };

  const handleUseDemoSamplePhoto = (mission: MicroMission) => {
    const sampleUrl = createPostcardDataUrl({
      title: mission.title,
      subtitle: `${location.name} • Oleh ${currentUser?.name ?? 'Wisatawan'}`,
      bgStart: branding.primaryColor,
      bgEnd: '#0f172a',
      accent: branding.accentColor,
      motif:
        location.category === 'alam'
          ? 'mangrove'
          : location.category === 'sejarah'
          ? 'heritage'
          : location.category === 'taman'
          ? 'park'
          : location.category === 'bahari'
          ? 'harbor'
          : 'culinary',
    });

    setPhotoDrafts((prev) => ({
      ...prev,
      [mission.id]: {
        imageUrl: sampleUrl,
        caption:
          prev[mission.id]?.caption ||
          `Seru banget menyelesaikan "${mission.title}" langsung di ${location.name}!`,
      },
    }));
  };

  const handleSubmitPhoto = (mission: MicroMission) => {
    const draft = photoDrafts[mission.id];
    if (!draft?.imageUrl) {
      pushToast({
        type: 'warning',
        title: 'Pilih Foto Terlebih Dahulu',
        message: 'Ambil foto kamera, unggah dari galeri, atau klik Foto Sampel Demo.',
      });
      return;
    }
    submitMissionPhoto(location.id, mission.id, draft.imageUrl, draft.caption);
    setPhotoDrafts((prev) => {
      const copy = { ...prev };
      delete copy[mission.id];
      return copy;
    });
    setExpandedMissionId(null);
  };

  const handleSubmitReview = (mission: MicroMission) => {
    submitLocationReview(location.id, ratingValue, reviewComment, mission.id);
    setReviewComment('');
    setExpandedMissionId(null);
  };

  return (
    <div className="fixed inset-0 z-[760] flex items-end sm:items-center justify-center bg-slate-950/80 p-0 sm:p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[92dvh] w-full max-w-[460px] flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl animate-pop-in">
        {/* Confetti Celebration Overlay */}
        {celebrate && (
          <div className="pointer-events-none absolute inset-x-0 top-0 h-60 overflow-hidden z-20">
            {confettiPieces.map((p) => (
              <span
                key={p.id}
                className="confetti-piece"
                style={{
                  left: p.left,
                  animationDelay: p.delay,
                  backgroundColor: p.color,
                }}
              />
            ))}
          </div>
        )}

        {/* Celebration Header */}
        <div
          className="relative px-5 pb-5 pt-6 text-white"
          style={{
            background: `linear-gradient(135deg, ${branding.primaryColor} 0%, #0f172a 100%)`,
          }}
        >
          <button
            type="button"
            onClick={closeUnlockedAreaModal}
            className="absolute right-4 top-4 z-30 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3.5">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-slate-950 shadow-lg"
              style={{ backgroundColor: branding.accentColor }}
            >
              <Award className="h-8 w-8 text-white" />
            </div>
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/25 px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 border border-emerald-300/30">
                <Sparkles className="h-3 w-3" />
                Wilayah Terbuka • QR: {location.qrCode}
              </span>
              <h3 className="mt-1 truncate text-lg font-extrabold leading-tight">
                {location.name}
              </h3>
              <p className="text-xs text-white/90">
                Selesaikan Misi QR untuk kumpul Poin Wisata &amp; Voucher Bebas UMKM!
              </p>
            </div>
          </div>

          {/* Mission Completion Progress Bar */}
          <div className="mt-4 rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
            <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
              <span>Progres Misi Lokasi Ini</span>
              <span className="text-amber-300">
                {completedCount} / {location.missions.length} Selesai
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${
                    location.missions.length
                      ? Math.round((completedCount / location.missions.length) * 100)
                      : 100
                  }%`,
                  backgroundColor: branding.accentColor,
                }}
              />
            </div>
          </div>
        </div>

        {/* Micro-Missions Interactive List */}
        <div className="thin-scrollbar flex-1 overflow-y-auto p-4 space-y-3">
          {/* Voucher UMKM Reward Callout (Khusus Wisatawan) */}
          {(!currentUser || currentUser.role === 'user') &&
            location.voucherConfig?.enabled !== false && (
              <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-yellow-50 to-orange-50 p-3.5 shadow-sm">
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950 shadow-sm mt-0.5">
                      <Ticket className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="inline-block rounded-full bg-amber-200 px-2 py-0.5 text-[9.5px] font-extrabold uppercase tracking-wider text-amber-950">
                        Reward Misi QR • Bebas Pilih UMKM Redeem
                      </span>
                      <p className="mt-0.5 text-xs font-extrabold text-slate-900">
                        {location.voucherConfig?.discountValue || 'Voucher Diskon UMKM'}
                      </p>
                      <p className="text-[11px] font-bold text-blue-900 flex items-center gap-1 mt-0.5">
                        <Store className="h-3 w-3 shrink-0" />
                        <span>
                          Bebas Redeem di {location.merchantName || `UMKM ${location.name}`} atau Mitra UMKM Lainnya
                        </span>
                      </p>
                    </div>
                  </div>

                  {currentUser?.role === 'user' &&
                    vouchers.some(
                      (v) =>
                        v.userEmail.toLowerCase() === currentUser.email.toLowerCase()
                    ) && (
                      <button
                        type="button"
                        onClick={() => {
                          closeUnlockedAreaModal();
                          setActiveNavTab('passport');
                        }}
                        className="shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1.5 text-[10.5px] font-extrabold text-white shadow-sm"
                      >
                        Lihat Voucher →
                      </button>
                    )}
                </div>
              </div>
            )}

          {location.missions.map((mission, index) => {
            const isCompleted = completedKeys.has(`${location.id}::${mission.id}`);
            const isOpen =
              expandedMissionId === mission.id ||
              (expandedMissionId === null && index === 0 && !isCompleted);
            const draft = photoDrafts[mission.id];

            return (
              <div
                key={mission.id}
                className={`overflow-hidden rounded-2xl border transition ${
                  isCompleted
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-200 bg-white shadow-sm'
                }`}
              >
                {/* Mission Card Header */}
                <button
                  type="button"
                  onClick={() =>
                    setExpandedMissionId(isOpen ? '__none__' : mission.id)
                  }
                  className="flex w-full items-start justify-between gap-3 p-3.5 text-left"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-extrabold text-white ${
                        isCompleted ? 'bg-emerald-600' : ''
                      }`}
                      style={
                        !isCompleted
                          ? { backgroundColor: branding.primaryColor }
                          : undefined
                      }
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="text-xs font-extrabold text-slate-900">
                          Misi QR {index + 1}: {mission.title}
                        </h4>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-950">
                          +{mission.xpReward} Poin Wisata
                        </span>
                      </div>
                      <p className="mt-1 text-[11.5px] font-medium leading-relaxed text-slate-700">
                        {mission.description}
                      </p>
                    </div>
                  </div>
                </button>

                {/* Mission Action Workspace */}
                {isOpen && (
                  <div className="border-t border-slate-100 bg-slate-50/80 p-3.5 space-y-3">
                    {mission.type === 'photo' ? (
                      <>
                        {draft?.imageUrl ? (
                          <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-900">
                            <img
                              src={draft.imageUrl}
                              alt="Preview Foto Misi"
                              className="max-h-48 w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setPhotoDrafts((prev) => {
                                  const next = { ...prev };
                                  delete next[mission.id];
                                  return next;
                                })
                              }
                              className="absolute right-2 top-2 rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-slate-900"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            <label className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-white p-3 text-center transition hover:border-emerald-500">
                              <Camera
                                className="h-5 w-5"
                                style={{ color: branding.primaryColor }}
                              />
                              <span className="text-[11px] font-bold text-slate-700">
                                {isProcessingImg
                                  ? 'Memproses...'
                                  : 'Kamera / Pilih Foto'}
                              </span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(mission, e)}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => handleUseDemoSamplePhoto(mission)}
                              className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-center transition hover:bg-amber-100"
                            >
                              <FlaskConical className="h-5 w-5 text-amber-600" />
                              <span className="text-[11px] font-bold text-amber-900">
                                Gunakan Foto Sampel Demo
                              </span>
                            </button>
                          </div>
                        )}

                        <input
                          type="text"
                          value={draft?.caption ?? ''}
                          onChange={(e) =>
                            setPhotoDrafts((prev) => ({
                              ...prev,
                              [mission.id]: {
                                imageUrl: prev[mission.id]?.imageUrl ?? '',
                                caption: e.target.value,
                              },
                            }))
                          }
                          placeholder="Tulis cerita singkat foto ini (opsional)..."
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none"
                        />

                        <button
                          type="button"
                          onClick={() => handleSubmitPhoto(mission)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold text-white shadow-sm transition active:scale-95"
                          style={{ backgroundColor: branding.buttonColor }}
                        >
                          <ImagePlus className="h-4 w-4" />
                          <span>
                            Unggah ke Galeri {location.name}
                          </span>
                        </button>
                      </>
                    ) : (
                      /* Rating & Review Mission */
                      <div className="space-y-3">
                        <div className="flex flex-col items-center rounded-xl bg-white p-3 border border-slate-200">
                          <p className="mb-1.5 text-[11px] font-bold text-slate-600">
                            Pilih Bintang Penilaian Anda:
                          </p>
                          <div className="flex items-center gap-1.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setRatingValue(star)}
                                className="p-1 transition hover:scale-110 active:scale-95"
                              >
                                <Star
                                  className={`h-7 w-7 ${
                                    star <= ratingValue
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder={`Bagaimana kesan Anda berkunjung ke ${location.name}?`}
                          className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:outline-none"
                        />

                        <button
                          type="button"
                          onClick={() => handleSubmitReview(mission)}
                          className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-extrabold text-white shadow-sm transition active:scale-95"
                          style={{ backgroundColor: branding.buttonColor }}
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>Kirim Rating & Kesan Singkat</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-center">
          <p className="text-[11px] font-medium text-slate-500">
            Seluruh foto & rating otomatis tersinkron ke pin peta{' '}
            <strong className="text-slate-700">{location.name}</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

