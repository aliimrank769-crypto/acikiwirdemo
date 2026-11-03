import fs from 'node:fs';
import path from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import nodemailer from 'nodemailer';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let size = 0;
    const MAX_BYTES = 50 * 1024 * 1024; // 50MB limit for base64 photos

    req.on('data', (chunk: Buffer) => {
      size += chunk.length;
      if (size > MAX_BYTES) {
        reject(new Error('Payload terlalu besar (maks 50MB)'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf-8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });

    req.on('error', reject);
  });
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function attachApiMiddleware(middlewares: {
  use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void;
}) {
  middlewares.use(async (req, res, next) => {
    const url = req.url?.split('?')[0];
    if (!url || !url.startsWith('/api/')) {
      next();
      return;
    }

    try {
      // 1. GET /api/db - Load persistent local JSON database
      if (url === '/api/db' && req.method === 'GET') {
        if (!fs.existsSync(DB_FILE)) {
          sendJson(res, 200, { ok: true, data: null });
          return;
        }
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        sendJson(res, 200, { ok: true, data: parsed });
        return;
      }

      // 2. POST /api/db - Save persistent local JSON database
      if (url === '/api/db' && req.method === 'POST') {
        const body = await readJsonBody(req);
        if (!fs.existsSync(DATA_DIR)) {
          fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        const tmpFile = `${DB_FILE}.tmp`;
        fs.writeFileSync(tmpFile, JSON.stringify(body.data ?? body, null, 2), 'utf-8');
        fs.renameSync(tmpFile, DB_FILE);
        sendJson(res, 200, { ok: true, savedAt: new Date().toISOString() });
        return;
      }

      // 3. POST /api/reset-db - Reset local database file
      if (url === '/api/reset-db' && req.method === 'POST') {
        if (fs.existsSync(DB_FILE)) {
          fs.unlinkSync(DB_FILE);
        }
        sendJson(res, 200, { ok: true });
        return;
      }

      // 4. POST /api/auth/send-otp - Send 6-digit OTP via Gmail/SMTP if configured
      if (url === '/api/auth/send-otp' && req.method === 'POST') {
        const body = await readJsonBody(req);
        const email = String(body.email || '').trim().toLowerCase();
        const otp = String(body.otp || '').trim();
        const appName = String(body.appName || 'ACIKIWIR');
        const isNewUser = Boolean(body.isNewUser);

        if (!email.endsWith('@gmail.com') || otp.length !== 6) {
          sendJson(res, 400, { ok: false, error: 'Alamat Gmail atau format OTP tidak valid.' });
          return;
        }

        const smtpHost = process.env.SMTP_HOST;
        const smtpUser = process.env.SMTP_USER;
        const smtpPass = process.env.SMTP_PASS;
        const smtpPort = Number(process.env.SMTP_PORT || 587);
        const smtpFrom = process.env.SMTP_FROM || `"${appName}" <${smtpUser}>`;

        if (smtpHost && smtpUser && smtpPass) {
          try {
            const transporter = nodemailer.createTransport({
              host: smtpHost,
              port: smtpPort,
              secure: smtpPort === 465,
              auth: {
                user: smtpUser,
                pass: smtpPass,
              },
            });

            await transporter.sendMail({
              from: smtpFrom,
              to: email,
              subject: `[${appName}] Kode OTP Verifikasi Akun Anda: ${otp}`,
              html: `
                <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:16px;">
                  <h2 style="margin:0 0 8px;color:#0f172a;">${appName}</h2>
                  <p style="color:#475569;font-size:14px;margin:0 0 16px;">
                    ${isNewUser ? 'Selamat datang! Gunakan kode OTP berikut untuk mendaftarkan akun baru Anda:' : 'Gunakan kode OTP berikut untuk masuk ke akun Anda:'}
                  </p>
                  <div style="background:#eff6ff;padding:16px;border-radius:12px;text-align:center;letter-spacing:8px;font-size:28px;font-weight:800;color:#0052CC;border:1px solid #bfdbfe;">
                    ${otp}
                  </div>
                  <p style="color:#64748b;font-size:12px;margin:16px 0 0;">
                    Kode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun.
                  </p>
                </div>
              `,
            });

            sendJson(res, 200, {
              ok: true,
              emailSent: true,
              mode: 'smtp',
              message: `Kode OTP terkirim ke inbox ${email}`,
            });
            return;
          } catch (smtpError) {
            console.warn('[OTP SMTP Fallback]', smtpError);
          }
        }

        // Instant fallback mode when SMTP is not configured (Hackathon Demo Ready)
        sendJson(res, 200, {
          ok: true,
          emailSent: false,
          mode: 'demo-toast',
          message: 'SMTP belum dikonfigurasi — Kode OTP ditampilkan instan melalui Toast layar.',
        });
        return;
      }

      next();
    } catch (error) {
      console.error('[API Plugin Error]', error);
      sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : 'Internal Server Error',
      });
    }
  });
}

export function localTourismApiPlugin(): Plugin {
  return {
    name: 'local-tourism-api-plugin',
    configureServer(server) {
      attachApiMiddleware(server.middlewares);
    },
    configurePreviewServer(server) {
      attachApiMiddleware(server.middlewares);
    },
  };
}

