# Dokumentasi Teknis & Panduan Penggunaan Aplikasi ACIKIWIR

**ACIKIWIR** (*Interactive Gamified Tourism & White-Label CMS — Studi Kasus Pariwisata Kreatif Kota Langsa*) adalah aplikasi web interaktif *multi-device* (Mobile, Tablet, dan Desktop) berbasis peta geospasial yang menggabungkan eksplorasi wisata, *geofencing* pemindaian QR Code, penyelesaian misi ringan (*micro-missions*), pengumpulan Poin Wisata, penukaran (*redeem*) voucher UMKM lokal, serta panel manajemen mandiri untuk **Owner UMKM** dan **Admin (White-Label CMS)**.

---

## 2. Teknologi yang Digunakan

### a. Bahasa Pemrograman
- **TypeScript (`^5.6.3`)**: Bahasa pemrograman utama untuk seluruh *source code* frontend dan middleware backend dengan *static type-checking* yang ketat (interface data lokasi, misi, transaksi poin, voucher UMKM, dan sesi pengguna).
- **JavaScript (ESNext / ES2022)**: Digunakan pada modul konfigurasi bundler, *service worker* PWA, serta skrip *runtime* Node.js.
- **HTML5 & CSS3**: Struktur dokumen semantik, *Canvas API* (untuk dekode kamera QR *real-time* dan pembuatan poster QR cetak), serta *CSS Custom Variables* untuk fitur *Dynamic Theme Engine* (perubahan warna tema secara instan oleh Admin).

### b. Framework & Library Utama
- **React 18 (`^18.3.1`)**: Library UI deklaratif berbasis komponen dengan pengelolaan *state* terpusat menggunakan **React Context API** (`AppContext`).
- **Vite 5 (`^5.4.11`)**: *Build tool* dan *development server* modern berkecepatan tinggi yang dilengkapi *custom Node.js HTTP API middleware* (`server/apiPlugin.ts`).
- **Tailwind CSS 3 (`^3.4.15`)**: *Utility-first CSS framework* untuk merancang antarmuka *responsive multi-device* (*Bottom Sheet* & *Bottom Bar* pada layar ponsel, *Floating Dock* pada tablet, serta *Collapsible Sidebar* & *Split-Panel Explorer* pada desktop).
- **Leaflet.js (`^1.9.4`) & Leaflet Routing Machine (`^3.2.12`)**: Framework peta interaktif *open-source* untuk menampilkan *custom pin marker* wisata, radius *geofencing*, radar posisi GPS pengguna, serta kalkulasi rute jalan raya beserta estimasi jarak dan waktu tempuh.

### c. Database & Penyimpanan State
- **Hybrid Local JSON File Database (`data/db.json`)**: Penyimpanan persisten berbasis file JSON di sisi server lokal yang dilayani secara *real-time* melalui *REST API Middleware* Vite (`/api/db`, `/api/reset-db`). Setiap perubahan dari Admin Panel, Owner UMKM, maupun aktivitas Wisatawan langsung tersimpan ke dalam file `data/db.json`.
- **Browser `localStorage` Synchronizer (`acikiwir_cms_db_v4` & `acikiwir_session_email_v2`)**: Penyimpanan *fallback* dan *cache* instan di sisi *client* (browser) yang menjamin aplikasi tetap berjalan 100% secara mandiri (*offline-capable* / *static hosting*) serta menjaga sesi login pengguna tidak hilang saat halaman dimuat ulang (*refresh*).

### d. Tools & API Pendukung
- **OpenStreetMap (OSM) Tile Server**: Penyedia peta dasar gratis tanpa kunci API berbayar dengan 3 mode lapisan peta (*OSM Standard*, *OSM Humanitarian HOT*, dan *OpenTopoMap*).
- **Nominatim OpenStreetMap Geocoding API**: Pencarian alamat, jalan, dan tempat publik secara langsung dari bilah pencarian peta.
- **OSRM (Open Source Routing Machine)**: Layanan penghitung rute navigasi jalan raya dari titik koordinat pengguna ke titik wisata tujuan.
- **`jsqr` (`^1.4.0`)**: Library pemindaian dan pembacaan matriks QR Code langsung dari *stream* kamera perangkat (*WebRTC `getUserMedia`*) maupun dari unggahan gambar galeri.
- **`qrcode` (`^1.5.4`)**: Generator gambar QR Code resolusi tinggi untuk setiap titik lokasi wisata dan QR bukti *redeem* voucher wisatawan.
- **Lucide React (`^0.460.0`)**: Koleksi ikon vektor modern yang konsisten di seluruh antarmuka aplikasi.
- **Nodemailer (`^6.9.16`)**: Modul pengiriman email *6-digit Kode OTP* melalui protokol SMTP Gmail (`/api/auth/send-otp`), dilengkapi dengan **On-Screen Toast OTP Fallback** agar pengujian dan demo aplikasi tetap berjalan instan tanpa wajib mengatur kredensial SMTP.

---

## 3. Fitur Aplikasi

### a. Daftar Fitur Utama & Penjelasan Fungsinya

#### 1) Peta Interaktif OpenStreetMap & Navigasi Rute (*Multi-Device*)
- **Fungsi**: Menampilkan seluruh titik lokasi wisata beserta status wilayah (*Terkunci* atau *Wilayah Terbuka*) di atas peta interaktif tanpa memaksa pengguna login di awal (*lazy authentication*).
- **Detail Kemampuan**:
  - Menampilkan **ikon posisi GPS pengguna secara real-time** (*pulsing blue dot*) beserta tombol **Posisi Saya**.
  - Menggambar **garis rute perjalanan**, instruksi belokan, serta estimasi jarak (km/m) dan waktu tempuh (menit) menuju lokasi wisata yang dipilih.
  - Mendukung pencarian tempat via **Nominatim OSM**, filter kategori wisata (*Ekowisata, Sejarah & Budaya, Ruang Terbuka, Bahari, Kuliner & UMKM*), dan pergantian 3 gaya peta OSM.
  - Tata letak adaptif yang menyesuaikan perangkat: *Swipeable Bottom Sheet* yang otomatis menyembunyikan *navbar* saat diperbesar penuh di ponsel, serta *Sidebar* & *Panel Jelajah* yang dapat dibuka-tutup (*collapsible*) di layar desktop.

#### 2) Detail Lokasi Wisata, Galeri Komunitas, & Ulasan Pengunjung
- **Fungsi**: Menyajikan informasi lengkap setiap destinasi wisata ketika *pin marker* ditekan pada peta.
- **Detail Kemampuan**:
  - Menampilkan deskripsi edukasi/sejarah, jam operasional, kisaran harga tiket/produk UMKM, koordinat lokasi, tombol **Rute ke Lokasi**, dan tombol **Hubungi Pengelola (WhatsApp/Telepon)**.
  - **Tab QR & Misi**: Menampilkan daftar misi ringan di lokasi tersebut beserta rincian deskripsi tugas QR dan hadiah Poin Wisata.
  - **Tab Galeri Foto Komunitas (*User-Generated Content*)**: Menampilkan foto-foto hasil penyelesaian misi dari berbagai wisatawan lengkap dengan nama pengunggah, label misi, dan waktu unggah.
  - **Tab Sistem Rating & Ulasan**: Menampilkan rata-rata bintang (1–5) dan daftar ulasan nyata dari pengunjung.

#### 3) Pemindaian QR Code Berbasis Radius (*Geofencing Haversine Formula*)
- **Fungsi**: Memvalidasi kehadiran fisik wisatawan di lokasi wisata sebelum membuka kunci wilayah (*Area Unlock*).
- **Detail Kemampuan**:
  - Menghitung jarak akurat antara koordinat GPS pengguna dan titik wisata menggunakan rumus **Haversine Formula**.
  - Jika pengguna berada di luar radius (misal `> 100 meter`), sistem menolak klaim dan menampilkan jarak aktual beserta tombol navigasi rute untuk mendekati lokasi.
  - Jika pengguna memindai QR saat belum login, sistem menyimpan kode QR sementara, memunculkan **Modal Login Gmail OTP**, lalu otomatis melanjutkan validasi QR begitu login selesai.
  - Mendukung 3 metode pemindaian: **Kamera Live**, **Upload Gambar QR dari Galeri**, atau **Input/Simulasi Kode QR**.

#### 4) Jendela "Wilayah Terbuka" (*Area Unlocked*) & Misi Ringan (*Micro-Missions*)
- **Fungsi**: Memberikan pengalaman gamifikasi setelah wisatawan berhasil memindai QR lokasi di dalam radius.
- **Detail Kemampuan**:
  - Menampilkan animasi perayaan wilayah terbuka dan memberikan **Bonus Poin Pembuka Wilayah (+50 Poin Wisata)**.
  - Menyajikan daftar **Misi Ringan** spesifik lokasi (contoh: *Misi Foto Pemandangan Ikonik*, *Misi Foto Kuliner/Produk UMKM*, dan *Misi Rating & Kesan Singkat*).
  - Setiap foto dan ulasan yang dikirim dari misi ringan **otomatis tersinkronisasi** ke Galeri Foto publik dan daftar Ulasan titik lokasi terkait, serta langsung menambah saldo Poin Wisata pengguna.

#### 5) Paspor Wisatawan & Tukar (*Redeem*) Voucher UMKM Bebas Pilih
- **Fungsi**: Mengelola perolehan Poin Wisata, lencana (*badge*), riwayat penjelajahan, serta penukaran poin menjadi voucher belanja/diskon di gerai UMKM lokal.
- **Detail Kemampuan**:
  - **Khusus Role Wisatawan (`user`)**: Poin dikumpulkan murni sebagai mata uang penukaran (*bukan sekadar level*).
  - **Bebas Pilih Voucher UMKM**: Wisatawan dapat menukarkan poin yang terkumpul dengan kupon/voucher apa pun dari daftar UMKM mitra lintas lokasi wisata selama saldo poin mencukupi.
  - Menghasilkan **Tiket Voucher Digital ber-QR Code unik** (contoh: `VC-KOPIMANGROVE-9012`) yang siap ditunjukkan atau dipindai oleh kasir UMKM.

#### 6) Dashboard Owner UMKM & Kasir Pemindai QR Voucher
- **Fungsi**: Panel khusus bagi pemilik usaha lokal (`role: umkm`) untuk mengelola profil usaha, membuat promosi voucher, dan memvalidasi penukaran voucher milik wisatawan.
- **Detail Kemampuan**:
  - **Tab Kasir Redeem Voucher (Kamera QR & Input Manual)**: Pemilik UMKM dapat memvalidasi kode voucher wisatawan dengan **memindai langsung QR Code voucher menggunakan kamera/galeri** atau mengetik kode voucher untuk memverifikasi keaslian dan menandai voucher sebagai *Sudah Digunakan*.
  - **Tab Kelola Voucher & Promo**: Menambah, mengaktifkan/menonaktifkan, mengubah kuota, dan mengatur harga poin untuk setiap katalog voucher promo UMKM.
  - **Tab Profil Usaha**: Mengubah nama usaha, kategori produk, kisaran harga, nomor WhatsApp bisnis, dan titik lokasi wisata tempat UMKM bernaung.
  - **Pendaftaran Mitra via Chat Bisnis Admin**: Akun Owner UMKM tidak dapat mendaftar sembarangan sendiri, melainkan harus melalui kurasi/chat bisnis dengan Admin agar ekosistem UMKM tetap terverifikasi.

#### 7) Admin Panel & *White-Label CMS* (4 Modul Pengelolaan)
- **Fungsi**: Dashboard kendali penuh bagi pengelola aplikasi (`role: admin`) yang berefek secara *real-time* tanpa mengubah kode program:
  1. **Tab Lokasi & Peta (*Interactive Map Pinning & CRUD*)**: Menambah titik lokasi baru langsung dengan mengklik peta (*Tap-on-Map Picker*), mengatur koordinat, radius *geofencing*, mengelola daftar misi ringan per lokasi, serta mengunduh **Poster Cetak QR Code (PNG)** lengkap dengan panduan misi.
  2. **Tab Identitas & Tema (*White-Label Branding*)**: Mengubah nama aplikasi, *tagline*, logo/ikon aplikasi (unggah gambar kustom), serta palet warna utama dan aksen aplikasi secara langsung.
  3. **Tab Data User (Wisatawan)**: Halaman terpisah khusus untuk memantau statistik wisatawan, jumlah poin, wilayah terbuka, mengubah role, atau menambah akun pengguna.
  4. **Tab Mitra UMKM**: Halaman khusus untuk mendaftarkan akun **Owner UMKM** baru setelah proses *Chat Bisnis*, menghubungkan UMKM ke lokasi wisata, dan memantau katalog voucher mereka.

#### 8) Panduan Penggunaan Interaktif (*How to Use*) & Mode Demo Juri Hackathon
- **Panduan Aplikasi (`HowToUseModal`)**: Jendela bantuan langkah demi langkah yang menjelaskan alur pemakaian untuk Wisatawan, alur kemitraan untuk Owner UMKM, dan fungsi pengelolaan untuk Admin.
- **Mode Demo Juri (`DemoJudgeWidget`)**: Panel penguji khusus untuk presentasi/penjurian di dalam ruangan yang memungkinkan:
  - **Quick Switch 3 Role (1-Klik)**: Berpindah instan antara akun **Wisatawan**, **Owner UMKM**, dan **Admin** tanpa perlu mengetik ulang email/OTP.
  - **Bypass Radius GPS**: Mengizinkan pemindaian QR Code dari jarak jauh tanpa harus berada secara fisik di lokasi wisata.
  - **Teleportasi GPS & Simulasi Scan QR 1-Klik**: Memindahkan titik GPS pengguna langsung ke salah satu dari 5 titik wisata Kota Langsa dan memicu pembukaan wilayah seketika.

---

## 4. Petunjuk Penggunaan

### a. Cara Mengakses atau Menjalankan Aplikasi Secara Lokal

#### Prasyarat Sistem
- **Node.js** versi `18.x` atau lebih baru (disertai `npm`).
- Browser modern (Google Chrome, Microsoft Edge, Mozilla Firefox, atau Safari).

#### Langkah-Langkah Menjalankan Aplikasi
1. **Buka terminal** dan arahkan ke direktori proyek aplikasi:
   ```bash
   cd c:\xampp\htdocs\acikiwir
   ```
2. **Instal seluruh dependensi paket** (cukup dilakukan sekali di awal):
   ```bash
   npm install
   ```
3. **Jalankan server pengembangan (*Development Server*)**:
   ```bash
   npm run dev
   ```
4. **Akses aplikasi di browser**:
   - Buka alamat URL lokal yang muncul di terminal, umumnya:
     ```
     http://localhost:5173
     ```
5. *(Opsional)* **Membuat Build Produksi & Menjalankan Preview**:
   ```bash
   npm run build
   npm run preview
   ```

---

### b. Daftar Akun Demo (Autentikasi 1 Gmail = 1 Akun dengan Kode OTP)

Aplikasi **ACIKIWIR** menggunakan sistem autentikasi modern **Passwordless Gmail OTP (6-Digit Kode OTP)** dengan prinsip **1 Alamat `@gmail.com` = 1 Akun Unik** (tidak memerlukan *password* statis).

> **Catatan Penting untuk Pengujian / Demo Tanpa Konfigurasi SMTP**:
> - Saat Anda memasukkan alamat `@gmail.com` dan menekan tombol **Kirim Kode OTP (6 Digit)**, sistem secara otomatis menampilkan **6-digit Kode OTP langsung di pojok atas layar (Toast Notification)** serta menyediakan tombol **"Isi Otomatis Kode OTP Demo"** sehingga Anda dapat login seketika.
> - Anda juga dapat menekan tombol **"Demo" (ikon labu laboratorium berwarna oranye di Header atas)** untuk langsung berpindah antar akun (**Wisatawan**, **Owner UMKM**, atau **Admin**) hanya dengan **1 kali klik**.

Berikut adalah daftar **Akun Demo Bawaan (*Seed Accounts*)** yang sudah terisi data lengkap:

| No | Role Akun | Alamat Email (Username) | Metode Login / Password | Keterangan Data Bawaan |
| :-: | :--- | :--- | :--- | :--- |
| 1 | **Admin** (*Pengelola Aplikasi*) | `admin@gmail.com` | **Kode OTP 6-Digit Otomatis** *(muncul di layar)* atau klik **Switch Role: Admin** di menu Demo | Memiliki akses penuh ke **Admin Panel** (Kelola Titik Wisata, Cetak QR, White-Label Branding, Data User, & Pendaftaran Mitra UMKM). |
| 2 | **Owner UMKM 1** (*Mitra Ekowisata Mangrove*) | `umkm.mangrove@gmail.com` | **Kode OTP 6-Digit Otomatis** *(muncul di layar)* atau klik **Switch Role: Owner UMKM** di menu Demo | Mengelola *Koperasi UMKM Ekowisata Mangrove*, memiliki katalog promo voucher aktif & akses **Kasir Scan QR Voucher**. |
| 3 | **Owner UMKM 2** (*Mitra Sentra Terasi*) | `umkm.terasi@gmail.com` | **Kode OTP 6-Digit Otomatis** *(muncul di layar)* | Mengelola *Koperasi Terasi Udang Rebon Simpang Lhee* di lokasi Sentra Belacan Gampong Simpang Lhee. |
| 4 | **Wisatawan / User 1** (*Pengunjung Aktif*) | `cut.nadia@gmail.com` | **Kode OTP 6-Digit Otomatis** *(muncul di layar)* atau klik **Switch Role: Wisatawan** di menu Demo | Memiliki saldo **600 Poin Wisata**, 2 wilayah terbuka, koleksi misi selesai, dan 1 voucher UMKM aktif (`VC-KOPIMANGROVE-9012`) yang siap di-*scan* pada kasir UMKM. |
| 5 | **Wisatawan / User 2** (*Pengunjung Aktif*) | `teuku.reza@gmail.com` | **Kode OTP 6-Digit Otomatis** *(muncul di layar)* | Memiliki saldo **605 Poin Wisata**, 3 wilayah terbuka, dan 3 lencana penjelajah. |
| 6 | **Wisatawan Baru** (*Pendaftaran Mandiri*) | *Bebas menggunakan alamat `@gmail.com` apa saja* | **Kode OTP 6-Digit Otomatis** *(muncul di layar)* | Otomatis terdaftar sebagai akun `user` (Wisatawan) baru dengan saldo awal 0 poin. |

---

### c. Daftar Kode QR Simulasi Titik Lokasi Wisata (Kota Langsa)

Jika Anda ingin mencoba fitur **Scan QR Lokasi** menggunakan input kode atau simulasi kamera:

| No | Nama Titik Wisata | Koordinat (`Lat, Lng`) | Kode QR Unik |
| :-: | :--- | :--- | :--- |
| 1 | **Hutan Mangrove Kuala Langsa** | `4.521657, 98.016159` | `LANGSA-MANGROVE-QR2025` |
| 2 | **Gedung Balee Juang (Museum Kota Langsa)** | `4.471335, 97.967743` | `LANGSA-BALEEJUANG-QR2025` |
| 3 | **Taman Hutan Kota Langsa (Hutan Lindung)** | `4.490550, 97.946146` | `LANGSA-HUTANKOTA-QR2025` |
| 4 | **Pelabuhan Kuala Langsa & Pulo Teulaga Tujoh** | `4.523400, 98.020778` | `LANGSA-PELABUHAN-QR2025` |
| 5 | **Sentra Belacan Gampong Simpang Lhee** | `4.498879, 97.968931` | `LANGSA-TERASI-QR2025` |

