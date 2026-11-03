/**
 * Mengompres file foto (kamera / galeri) menjadi Data URL hemat ukuran
 * agar penyimpanan lokal maupun server JSON tetap cepat dan ringan.
 */
export function compressImageFile(
  file: File,
  maxWidth = 920,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file gambar.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Format gambar tidak didukung.'));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const mime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mime, quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Menghasilkan ilustrasi SVG kartu pos estetik sebagai data URI
 * untuk seed galeri komunitas & tombol foto sampel saat Mode Demo Juri.
 */
export function createPostcardDataUrl(opts: {
  title: string;
  subtitle: string;
  bgStart: string;
  bgEnd: string;
  accent: string;
  motif?: 'mangrove' | 'heritage' | 'park' | 'harbor' | 'culinary';
}): string {
  const safeTitle = opts.title.replace(/[<>&"]/g, '');
  const safeSub = opts.subtitle.replace(/[<>&"]/g, '');

  let illustration = '';
  switch (opts.motif) {
    case 'mangrove':
      illustration = `
        <circle cx="510" cy="110" r="46" fill="${opts.accent}" opacity="0.85"/>
        <path d="M0 300 Q160 250 320 290 T640 280 L640 420 L0 420 Z" fill="#064e3b" opacity="0.65"/>
        <path d="M110 290 Q320 195 530 290" fill="none" stroke="#fde68a" stroke-width="10" stroke-linecap="round"/>
        <path d="M130 290 L130 350 M220 252 L220 350 M320 242 L320 350 M420 252 L420 350 M510 290 L510 350" stroke="#fcd34d" stroke-width="5"/>
        <circle cx="95" cy="215" r="48" fill="#10b981" opacity="0.75"/>
        <circle cx="545" cy="220" r="54" fill="#059669" opacity="0.8"/>
      `;
      break;
    case 'heritage':
      illustration = `
        <rect x="140" y="155" width="360" height="175" rx="8" fill="#fffbeb" opacity="0.92"/>
        <polygon points="120,160 320,82 520,160" fill="${opts.accent}"/>
        <rect x="180" y="205" width="44" height="125" rx="22" fill="#92400e"/>
        <rect x="255" y="205" width="44" height="125" rx="22" fill="#92400e"/>
        <rect x="340" y="205" width="44" height="125" rx="22" fill="#92400e"/>
        <rect x="415" y="205" width="44" height="125" rx="22" fill="#92400e"/>
        <rect x="0" y="330" width="640" height="90" fill="#451a03" opacity="0.45"/>
      `;
      break;
    case 'park':
      illustration = `
        <circle cx="130" cy="95" r="38" fill="#fef08a" opacity="0.9"/>
        <ellipse cx="320" cy="340" rx="290" ry="70" fill="#14532d" opacity="0.7"/>
        <ellipse cx="320" cy="345" rx="170" ry="36" fill="#38bdf8" opacity="0.75"/>
        <circle cx="170" cy="210" r="56" fill="#22c55e" opacity="0.85"/>
        <rect x="163" y="250" width="14" height="65" fill="#78350f"/>
        <circle cx="470" cy="195" r="64" fill="#16a34a" opacity="0.85"/>
        <rect x="462" y="245" width="16" height="72" fill="#78350f"/>
      `;
      break;
    case 'harbor':
      illustration = `
        <circle cx="320" cy="150" r="62" fill="#fb923c" opacity="0.9"/>
        <rect x="0" y="255" width="640" height="165" fill="#0369a1" opacity="0.75"/>
        <polygon points="180,245 450,245 415,288 215,288" fill="#0f172a"/>
        <rect x="275" y="195" width="75" height="50" rx="6" fill="#f8fafc"/>
        <path d="M70 325 Q180 310 290 325 T550 325" stroke="#bae6fd" stroke-width="4" fill="none"/>
      `;
      break;
    case 'culinary':
    default:
      illustration = `
        <circle cx="320" cy="225" r="105" fill="#fff7ed" opacity="0.94"/>
        <circle cx="320" cy="225" r="82" fill="${opts.accent}" opacity="0.88"/>
        <circle cx="295" cy="210" r="24" fill="#7c2d12"/>
        <circle cx="348" cy="222" r="28" fill="#9a3412"/>
        <circle cx="315" cy="252" r="20" fill="#15803d"/>
      `;
      break;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 420" width="640" height="420">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${opts.bgStart}"/>
        <stop offset="100%" stop-color="${opts.bgEnd}"/>
      </linearGradient>
    </defs>
    <rect width="640" height="420" fill="url(#bg)"/>
    ${illustration}
    <rect x="24" y="24" width="180" height="32" rx="16" fill="rgba(15,23,42,0.55)"/>
    <text x="42" y="45" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="700">MISI KOMUNITAS</text>
    <rect x="0" y="328" width="640" height="92" fill="rgba(15,23,42,0.68)"/>
    <text x="28" y="364" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="800">${safeTitle}</text>
    <text x="28" y="392" fill="#e2e8f0" font-family="sans-serif" font-size="14" font-weight="500">${safeSub}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

