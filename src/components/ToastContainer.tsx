import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Info,
  KeyRound,
  X,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast, pushToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[980] mx-auto flex max-w-[450px] flex-col gap-2 px-3">
      {toasts.map((toast) => {
        if (toast.type === 'otp' && toast.otpCode) {
          return (
            <div
              key={toast.id}
              className="pointer-events-auto rounded-2xl border-2 border-amber-400 bg-slate-900/95 p-3.5 text-white shadow-2xl backdrop-blur-md animate-pop-in"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-slate-950">
                    <KeyRound className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-amber-300">{toast.title}</p>
                    <p className="text-[11px] text-slate-300">{toast.message}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  className="rounded-lg p-1 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-2.5 flex items-center justify-between rounded-xl bg-white/10 px-3 py-2">
                <span className="font-mono text-xl font-extrabold tracking-[0.35em] text-amber-300">
                  {toast.otpCode}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard?.writeText(toast.otpCode || '');
                    pushToast({
                      type: 'success',
                      title: 'Kode OTP Disalin',
                      message: `Kode ${toast.otpCode} disalin ke clipboard.`,
                      durationMs: 2200,
                    });
                  }}
                  className="flex items-center gap-1 rounded-lg bg-amber-400 px-2.5 py-1 text-[11px] font-extrabold text-slate-950 hover:bg-amber-300"
                >
                  <Copy className="h-3 w-3" />
                  <span>Salin</span>
                </button>
              </div>
            </div>
          );
        }

        const iconMap = {
          success: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
          error: <XCircle className="h-4 w-4 text-rose-500" />,
          warning: <AlertTriangle className="h-4 w-4 text-amber-500" />,
          info: <Info className="h-4 w-4 text-sky-500" />,
          otp: <KeyRound className="h-4 w-4 text-amber-500" />,
        };

        return (
          <div
            key={toast.id}
            className="pointer-events-auto flex items-start justify-between gap-2.5 rounded-2xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 shadow-floating backdrop-blur-md animate-pop-in"
          >
            <div className="flex items-start gap-2.5 min-w-0">
              <div className="mt-0.5 shrink-0">{iconMap[toast.type]}</div>
              <div className="min-w-0">
                <p className="text-xs font-extrabold text-slate-900">{toast.title}</p>
                <p className="text-[11px] font-medium text-slate-600">{toast.message}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

