import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Mail,
  MessageCircle,
  Phone,
  QrCode,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DynamicIcon } from '../utils/icons';

export const AuthOtpModal: React.FC = () => {
  const {
    branding,
    users,
    locations,
    isAuthModalOpen,
    closeAuthModal,
    pendingQrAction,
    activeOtpChallenge,
    requestEmailOtp,
    verifyEmailOtp,
    quickSwitchDemoRole,
    submitBusinessInquiry,
  } = useApp();

  const [authTab, setAuthTab] = useState<'login' | 'umkm-partner'>('login');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  // Business Chat / UMKM Inquiry Form State
  const [bizOwnerName, setBizOwnerName] = useState('');
  const [bizName, setBizName] = useState('');
  const [bizEmail, setBizEmail] = useState('');
  const [bizPhone, setBizPhone] = useState('');
  const [bizLocationId, setBizLocationId] = useState('');
  const [bizMessage, setBizMessage] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setStep('email');
      setOtpInput('');
      setErrorMsg(null);
      setInquirySubmitted(false);
      if (locations.length > 0 && !bizLocationId) {
        setBizLocationId(locations[0].id);
      }
    }
  }, [bizLocationId, isAuthModalOpen, locations]);

  if (!isAuthModalOpen) return null;

  const cleanEmail = email.trim().toLowerCase();
  const isGmailFormat = /^[a-z0-9._%+-]+@gmail\.com$/.test(cleanEmail);
  const existingAccount = isGmailFormat
    ? users.find((u) => u.email.toLowerCase() === cleanEmail)
    : undefined;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSending(true);
    const res = await requestEmailOtp(cleanEmail, customName);
    setIsSending(false);
    if (!res.ok) {
      setErrorMsg(res.error ?? 'Gagal mengirim kode OTP.');
      return;
    }
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const res = verifyEmailOtp(cleanEmail, otpInput);
    if (!res.ok) {
      setErrorMsg(res.error ?? 'Kode OTP salah.');
    }
  };

  const selectedBizSpot = locations.find((l) => l.id === bizLocationId);

  const handleSendBusinessInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanBizEmail = bizEmail.trim().toLowerCase();
    if (!/^[a-z0-9._%+-]+@gmail\.com$/.test(cleanBizEmail)) {
      setErrorMsg('Gunakan alamat @gmail.com yang akan didaftarkan oleh Admin sebagai akun UMKM.');
      return;
    }
    setErrorMsg(null);
    submitBusinessInquiry({
      ownerName: bizOwnerName.trim() || 'Pemilik Usaha UMKM',
      businessName: bizName.trim() || 'Mitra UMKM Wisata',
      email: cleanBizEmail,
      phone: bizPhone.trim() || '628120000000',
      targetLocationId: bizLocationId || locations[0]?.id || '',
      newLocationName: selectedBizSpot?.name || 'Titik Wisata',
      message:
        bizMessage.trim() ||
        `Halo Admin ${branding.appName}, saya ingin mengajukan pembuatan akun Owner UMKM untuk mengelola usaha dan promosi di ${selectedBizSpot?.name || 'lokasi wisata'}.`,
    });
    setInquirySubmitted(true);
  };

  const handleDirectWhatsAppAdmin = () => {
    const spotName = selectedBizSpot?.name || 'Tempat Wisata';
    const text = encodeURIComponent(
      `Halo Admin ${branding.appName}, saya ingin Chat Bisnis untuk pendaftaran Akun Owner UMKM / Pengelola Wisata.\n\n` +
        `• Nama Pemilik: ${bizOwnerName || '-'}\n` +
        `• Nama Usaha UMKM: ${bizName || '-'}\n` +
        `• Email Gmail Usaha: ${bizEmail || '-'}\n` +
        `• Lokasi Wisata: ${spotName}\n\n` +
        `Mohon dibantu pembuatan akun UMKM kami. Terima kasih!`
    );
    window.open(`https://wa.me/628116700999?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[800] flex items-end sm:items-center justify-center bg-slate-950/75 p-0 sm:p-4 backdrop-blur-sm">
      <div className="w-full max-w-[460px] max-h-[93dvh] flex flex-col overflow-hidden rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl animate-pop-in">
        {/* Branded Header */}
        <div
          className="relative px-5 pb-4 pt-5 text-white shrink-0"
          style={{ backgroundColor: branding.primaryColor }}
        >
          <button
            type="button"
            onClick={closeAuthModal}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl shadow-md ${
                branding.logoType === 'image' && branding.logoImageUrl
                  ? 'bg-white p-1'
                  : 'bg-white/20 backdrop-blur-sm'
              }`}
            >
              {branding.logoType === 'image' && branding.logoImageUrl ? (
                <img
                  src={branding.logoImageUrl}
                  alt={branding.appName}
                  className="h-full w-full object-contain"
                />
              ) : (
                <DynamicIcon name={branding.logoIcon} className="h-6 w-6 text-white" />
              )}
            </div>
            <div>
              <span className="inline-block rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                1 Gmail = 1 Akun Terintegrasi
              </span>
              <h3 className="mt-0.5 text-lg font-extrabold leading-tight">
                Akses Akun {branding.appName}
              </h3>
              <p className="text-xs text-white/85">{branding.tagline}</p>
            </div>
          </div>

          {/* Pending QR Auto-Resume Banner */}
          {pendingQrAction && (
            <div className="mt-3 flex items-center gap-2 rounded-2xl bg-slate-950/30 px-3 py-2 text-xs font-semibold text-white">
              <QrCode className="h-4 w-4 shrink-0 text-amber-300" />
              <span>
                {pendingQrAction.type === 'validate-qr'
                  ? 'Validasi QR Lokasi tertunda — otomatis dilanjutkan begitu OTP terverifikasi!'
                  : 'Pemindai QR Lokasi akan terbuka otomatis setelah login OTP berhasil.'}
              </span>
            </div>
          )}

          {/* Switcher: Login OTP vs Mitra UMKM Chat Bisnis */}
          <div className="mt-4 grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-950/30 p-1 border border-white/15">
            <button
              type="button"
              onClick={() => {
                setAuthTab('login');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-extrabold transition ${
                authTab === 'login'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-white/85 hover:bg-white/10'
              }`}
            >
              <Mail className="h-3.5 w-3.5 text-blue-600" />
              <span>Login / Daftar User</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthTab('umkm-partner');
                setErrorMsg(null);
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-extrabold transition ${
                authTab === 'umkm-partner'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-amber-200 hover:bg-white/10'
              }`}
            >
              <Store className="h-3.5 w-3.5" />
              <span>Mitra UMKM / Wisata</span>
            </button>
          </div>
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {authTab === 'umkm-partner' ? (
            /* ================= TAB MITRA UMKM / PENGELOLA WISATA (CHAT BISNIS ADMIN) ================= */
            <div className="space-y-4">
              {/* Strict Rule Explanation Box */}
              <div className="rounded-2xl border border-amber-300 bg-amber-50/90 p-3.5 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-extrabold text-amber-950">
                  <Store className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Khusus Owner UMKM & Pengelola Tempat Wisata</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  Pemilik UMKM atau pengelola wisata <strong>tidak dapat membuat akun usaha sendiri</strong>. Anda wajib melakukan <strong>Chat Bisnis dengan Admin</strong> terlebih dahulu, lalu <strong>Admin yang akan membuatkan & mengaktifkan akun usaha Anda</strong>.
                </p>
              </div>

              {inquirySubmitted ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-center space-y-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                  <div>
                    <h4 className="text-sm font-extrabold text-emerald-950">
                      Permohonan Akun UMKM Terkirim ke Admin!
                    </h4>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      Data pengajuan bisnis Anda sudah masuk ke <strong>Kotak Masuk Admin Panel</strong>. Admin akan memverifikasi dan mengaktifkan akun <strong>{bizEmail}</strong> sebagai Role Owner UMKM.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleDirectWhatsAppAdmin}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center justify-center gap-1.5"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Lanjut Chat WhatsApp Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthTab('login')}
                      className="py-2.5 px-3 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-bold"
                    >
                      Ke Halaman Login OTP
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendBusinessInquiry} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                        Nama Pemilik Usaha *
                      </label>
                      <input
                        type="text"
                        required
                        value={bizOwnerName}
                        onChange={(e) => setBizOwnerName(e.target.value)}
                        placeholder="Misal: Pak Suryadi"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                        Nama UMKM / Toko / Usaha *
                      </label>
                      <input
                        type="text"
                        required
                        value={bizName}
                        onChange={(e) => setBizName(e.target.value)}
                        placeholder="Misal: Kopi & Kerajinan Langsa"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                        Gmail untuk Akun UMKM *
                      </label>
                      <input
                        type="email"
                        required
                        value={bizEmail}
                        onChange={(e) => setBizEmail(e.target.value)}
                        placeholder="usaha.anda@gmail.com"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                        Nomor WhatsApp Aktif *
                      </label>
                      <div className="relative">
                        <Phone className="h-3.5 w-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={bizPhone}
                          onChange={(e) => setBizPhone(e.target.value)}
                          placeholder="62812..."
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-2 text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                      Pilih Lokasi Tempat Wisata Tempat Usaha Berada *
                    </label>
                    <select
                      value={bizLocationId}
                      onChange={(e) => setBizLocationId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900"
                    >
                      {locations.map((loc) => (
                        <option key={loc.id} value={loc.id}>
                          {loc.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-[11px] font-extrabold text-slate-700">
                      Pesan Bisnis / Jenis Produk UMKM
                    </label>
                    <textarea
                      rows={2}
                      value={bizMessage}
                      onChange={(e) => setBizMessage(e.target.value)}
                      placeholder="Ceritakan produk unggulan/usaha Anda untuk diverifikasi dan dibuatkan akun oleh Admin..."
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                    />
                  </div>

                  {errorMsg && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                      {errorMsg}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 px-3 text-xs font-extrabold text-white shadow-sm transition"
                      style={{ backgroundColor: branding.buttonColor }}
                    >
                      <Send className="h-3.5 w-3.5" />
                      <span>Kirim ke Kotak Masuk Admin</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleDirectWhatsAppAdmin}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 px-3 text-xs font-extrabold text-white shadow-sm transition"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Chat Bisnis WA Admin</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Already have an Admin-created UMKM account? */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs flex items-center justify-between gap-2">
                <span className="text-slate-600 font-medium">
                  Akun UMKM sudah dibuatkan Admin?
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setEmail('umkm.mangrove@gmail.com');
                  }}
                  className="text-blue-700 font-extrabold hover:underline"
                >
                  Login OTP Sekarang →
                </button>
              </div>
            </div>
          ) : step === 'email' ? (
            /* ================= TAB LOGIN / DAFTAR WISATAWAN & AKUN TERDAFTAR ================= */
            <form onSubmit={handleRequestOtp} className="space-y-3.5">
              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                  Alamat Gmail (@gmail.com)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMsg(null);
                    }}
                    placeholder="nama.anda@gmail.com"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3.5 text-sm font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Live Account Check Indicator */}
                {isGmailFormat && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold">
                    {existingAccount ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Akun Terdaftar: {existingAccount.name} (Role:{' '}
                        {existingAccount.role.toUpperCase()})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-blue-700">
                        <Sparkles className="h-3.5 w-3.5" />
                        Gmail baru — Otomatis terdaftar sebagai Wisatawan (User)
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Optional Name input for Brand New Gmail */}
              {isGmailFormat && !existingAccount && (
                <div>
                  <label className="mb-1 block text-xs font-extrabold text-slate-700">
                    Nama Tampilan Wisatawan (Opsional)
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Misal: Rina Safitri"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSending}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-extrabold text-white shadow-md transition active:scale-95 disabled:opacity-60"
                style={{ backgroundColor: branding.buttonColor }}
              >
                <span>{isSending ? 'Mengirim Kode OTP...' : 'Kirim 6-Digit Kode OTP'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              {/* Quick Fill Preset Accounts for Demo Convenience */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                <p className="text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500">
                  Pintas Akun Demo Hackathon (User, UMKM, Admin)
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEmail('cut.nadia@gmail.com')}
                    className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10.5px] font-bold text-slate-800 hover:bg-slate-100"
                  >
                    <User className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">Wisatawan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmail('umkm.mangrove@gmail.com')}
                    className="flex items-center justify-center gap-1 rounded-xl border border-amber-200 bg-amber-50/70 px-2 py-2 text-[10.5px] font-bold text-amber-900 hover:bg-amber-100"
                  >
                    <Store className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                    <span className="truncate">Owner UMKM</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmail('admin@gmail.com')}
                    className="flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-2 text-[10.5px] font-bold text-slate-800 hover:bg-slate-100"
                  >
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Admin</span>
                  </button>
                </div>

                {!pendingQrAction && (
                  <div className="grid grid-cols-2 gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        closeAuthModal();
                        quickSwitchDemoRole('umkm');
                      }}
                      className="rounded-xl bg-amber-100 py-1.5 px-2 text-[10.5px] font-extrabold text-amber-950 hover:bg-amber-200/80"
                    >
                      ⚡ Demo Instan UMKM
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        closeAuthModal();
                        quickSwitchDemoRole('admin');
                      }}
                      className="rounded-xl bg-blue-100 py-1.5 px-2 text-[10.5px] font-extrabold text-blue-950 hover:bg-blue-200/80"
                    >
                      ⚡ Demo Instan Admin
                    </button>
                  </div>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3.5">
              <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600 border border-slate-100">
                Kode 6-digit OTP telah dikirim untuk{' '}
                <strong className="text-slate-900">{cleanEmail}</strong> dan ditampilkan pada
                notifikasi atas layar.
              </div>

              {activeOtpChallenge && (
                <div className="flex items-center justify-between rounded-2xl border border-amber-300 bg-amber-50 px-3.5 py-2.5">
                  <div>
                    <p className="text-[10px] font-bold uppercase text-amber-700">
                      Kode OTP Demo Tersedia
                    </p>
                    <p className="font-mono text-lg font-extrabold tracking-widest text-amber-950">
                      {activeOtpChallenge.code}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOtpInput(activeOtpChallenge.code)}
                    className="rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-amber-700"
                  >
                    Isi Otomatis
                  </button>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-extrabold text-slate-700">
                  Masukkan 6-Digit Kode OTP
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otpInput}
                    onChange={(e) => {
                      setOtpInput(e.target.value.replace(/[^\d]/g, '').slice(0, 6));
                      setErrorMsg(null);
                    }}
                    placeholder="••••••"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 font-mono text-lg font-extrabold tracking-[0.4em] text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-xs font-extrabold text-white shadow-md transition active:scale-95"
                style={{ backgroundColor: branding.buttonColor }}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>Verifikasi OTP & Masuk</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setErrorMsg(null);
                }}
                className="w-full py-1.5 text-center text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                ← Ganti Alamat Gmail
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
