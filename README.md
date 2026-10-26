# QC Mobile Operator — Handheld Quality Control & Production Monitoring

[![React Native](https://img.shields.io/badge/React%20Native-0.86.3-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2058-000020?logo=expo&logoColor=white)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Design System](https://img.shields.io/badge/Design%20System-Modern%20Industrial%20Slate-3B82F6)](./DESIGN.md)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Aplikasi seluler genggam (*handheld mobile app*) berbasis **React Native & Expo** yang dirancang khusus untuk operasional pencatatan mutu (*Quality Control*) dan keluaran lini mesin produksi (*Production Output*) di **PT Galaxy Mandiri Perkasa** (pabrik manufaktur *metal stamping* dan komponen presisi).

Dirancang dengan standar ergonomi industri lantai pabrik (*shop floor*): **ramah sarung tangan (*glove-friendly touch targets*)**, **ramah presbiopia (tipografi $\ge 12\text{px}$, KPI $28\text{px}$)**, dan **tata letak Bento Grid modular** dengan tema ganda (*Dark & Light Mode*).

---

## 📸 Fitur Utama

### 1. Role-Based Access Control (RBAC) 3-Tingkat
Navigasi bilah bawah (*dock bottom tab*) secara dinamis beradaptasi sesuai hak akses pengguna:
- **OPERATOR PRODUKSI (4 Tab)**: `Dashboard`, `Input Prod`, `Riwayat`, `AI Mesin`.
- **STAFF QC (5 Tab)**: `Dashboard`, `Catat NG`, `Riwayat`, `Komplain`, `AI Kualitas`.
- **ADMIN (6 Tab)**: Akses menyeluruh (`Dashboard`, `Input Prod`, `Catat NG`, `Riwayat`, `Komplain`, `Tanya AI`).

### 2. Statistical Process Control (SPC p-Chart ISO 7870-2)
- Menghitung batas kendali statistik 3-Sigma riil: **UCL (*Upper Control Limit*)**, **CL (*Center Line / $\bar{p}$*)**, dan **LCL (*Lower Control Limit*)**.
- Deteksi anomali otomatis (*Out-of-Control spikes* & aturan 7-titik tren berurutan).
- **Horizontal Scrollable Canvas** ($\ge 5$ mesin) dengan jarak antar-titik $76\text{px}$ dan label horizontal anti-tumpuk (*zero text collision*).
- Inspeksi titik sentuh ramah sarung tangan (*glove tap area* radius $22\text{px}$) dengan kartu ringkasan sampel mesin terpilih.

### 3. Filter Stratifikasi Top 5 Pareto Defect
- Chip filter horizontal interaktif untuk melakukan *drill-down* jenis cacat dominan.
- Menampilkan data mesin yang terdampak langsung secara spesifik (tidak menumpuk seluruh 59 lini mesin).

### 4. Input Produksi & Inspeksi Defect NG
- **Input Produksi**: Pencatatan kuantitas *gross output*, mesin cetak, proses (*Stamping, Blank, Bending, Spot Welding*), dan shift kerja.
- **Catat Defect NG**: Dokumentasi cacat produk dengan bukti foto kamera / galeri, kategori cacat, dan tingkat keparahan (*Minor, Major, Critical*).
- **Dialog Konfirmasi Pengaman**: Mencegah salah tekan tombol (*fat-finger proof*) sebelum data dikirim ke backend.

### 5. Riwayat Inspeksi & Toggle Dual-View Admin
- Tampilan riwayat pencatatan lengkap dengan filter rentang tanggal.
- Khusus user **Admin**, disediakan tombol toggle terpadu: **`Produksi`** dan **`Cacat NG`** dengan visualisasi yang konsisten.

### 6. Pemantauan Komplain Pelanggan
- Modul pelacakan tiket komplain dari customer berdasarkan tingkat urgensi (*High Priority*, *In Investigation*, *Closed*).

### 7. Asisten AI Interaktif (Tanya AI Mesin & Kualitas)
- Chatbot cerdas terintegrasi untuk diagnosis *troubleshooting* parameter mesin press dan rekomendasi tindakan perbaikan mutu berbasis AI (*Random Forest root-cause mitigation*).

### 8. Desain "Modern Industrial Slate & Steel Blue"
- **Bebas dari teks dan border warna-warni acak**: Permukaan kartu dan border menggunakan warna netral terpadu (*slate neutral*).
- Indikator semantik (Merah, Biru, Hijau) difokuskan murni pada titik indikator (*status dots*) dan batas statistik grafik.
- Dukungan **Dark Mode (Obsidian Slate `#090D16`)** dan **Light Mode (Clean Slate `#F8FAFC`)**.

---

## 📂 Struktur Direktori

```text
qc-mobile-operator/
├── assets/                     # Aset gambar, ikon app, dan splash screen
│   ├── images/logo_gmp.png
│   ├── icon.png
│   └── splash.png
├── figma-export/               # Token desain dan artboard HTML Figma
├── presentation/               # Slide presentasi interaktif proyek
├── src/
│   ├── api/                    # Konfigurasi Axios & layanan REST API
│   │   ├── services/           # authService, productionService, defectService, dll.
│   │   ├── client.js           # Axios client dengan JWT Bearer interceptor
│   │   └── endpoints.js        # Pemetaan URL backend
│   ├── components/             # Komponen UI modular
│   │   ├── chat/               # ChatBubble, TypingIndicator
│   │   ├── common/             # AppHeader, Modal Tanggal, Dialog Konfirmasi
│   │   ├── dashboard/          # KpiCard Bento, SpcControlChart, ParetoBar
│   │   └── production/         # AchievementMeter
│   ├── context/                # AuthContext (RBAC) & ThemeContext (Dark/Light)
│   ├── data/                   # masterData.js (Katalog mesin & part cadangan)
│   ├── navigation/             # AppNavigator, BottomTabNavigator, CustomTabBar
│   ├── screens/                # Layar utama (Auth, Dashboard, Produksi, Defect, dll.)
│   ├── theme/                  # colors.js (Slate & Steel Blue) & typography.js
│   └── utils/                  # spcCalculator, productionDefectMatcher, dateFormatter
├── .env.example                # Template konfigurasi environment variable
├── .gitignore                  # Filter pengecualian file Git
├── App.js                      # Root component aplikasi
├── app.json                    # Konfigurasi aplikasi Expo
├── babel.config.js             # Konfigurasi Babel transpiler
├── DESIGN.md                   # Dokumen spesifikasi sistem desain & ergonomi
├── eas.json                    # Konfigurasi Expo Application Services (EAS Build)
└── package.json                # Dependensi pustaka npm
```

---

## 🛠️ Prasyarat Sistem

Sebelum menjalankan aplikasi, pastikan komputer Anda telah terinstal:
- **Node.js** versi `18.x` atau lebih baru ([Download Node.js](https://nodejs.org/))
- **npm** (bawaan Node.js) atau **yarn**
- **Expo Go** pada perangkat smartphone fisik (Android / iOS) atau **Android Studio Emulator**

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### 1. Kloning Repositori
```bash
git clone https://github.com/username-anda/qc-mobile-operator.git
cd qc-mobile-operator
```

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Menjalankan Server Pengembangan Expo
```bash
npx expo start
```
- Pindai (*scan*) QR Code yang muncul di terminal menggunakan aplikasi **Expo Go** di Android, atau kamera di iOS.
- Tekan tombol `a` di terminal untuk membuka di Android Emulator.
- Tekan tombol `w` di terminal untuk membuka di Web Browser.

---

## 👤 Autentikasi & Hak Akses Pengguna (Database-Driven)

Aplikasi terhubung langsung ke database sistem (*PostgreSQL / MySQL*) melalui REST API backend Spring Boot (`POST /api/auth/login`). Seluruh proses autentikasi diverifikasi secara real-time terhadap tabel user di database tanpa akun pengujian demo atau kredensial statis.

Akses fitur pada terminal disesuaikan secara dinamis berdasarkan **Role** pengguna yang terdaftar di database:

| Role Pengguna | Keterangan Akses & Tanggung Jawab | Fitur Tab Terminal yang Aktif |
| :--- | :--- | :--- |
| **Admin** | Pengawas & administrator sistem pabrik dengan otorisasi lintas divisi | Dashboard, Input Prod, Catat NG, Riwayat (Toggle Dual-View), View Komplain, Tanya AI |
| **Operator Produksi** | Personel lini mesin perakitan, stamping, bending, dan drawing | Dashboard Produksi, Input Prod, Riwayat Produksi, Tanya AI Kendala Mesin |
| **Staff QC / Inspector** | Personel penjaminan mutu dan inspeksi part visual di lantai produksi | Dashboard Kualitas (SPC p-Chart), Catat NG (Foto Bukti), Riwayat Cacat, View Komplain, Tanya AI Analisis Mutu |

> **Catatan:** Akun pengguna (username dan kata sandi) didaftarkan dan dikelola secara terpusat oleh administrator melalui modul manajemen pengguna database backend. Sesi login tersimpan aman secara terenkripsi menggunakan `expo-secure-store`.

---
