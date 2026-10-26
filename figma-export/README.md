# PANDUAN EKSPOR DESAIN UI/UX KE FIGMA
## QC & Production Monitoring Handheld (`qc-mobile-operator`)
**PT Galaxy Mandiri Perkasa**

---

Berkas ekspor ini memungkinkan Anda mengimpor seluruh 8 layar (*screens*) aplikasi mobile `qc-mobile-operator` langsung ke dalam canvas **Figma** sebagai **Frame, Vektor, Auto-Layout, dan Teks yang dapat diedit penuh (fully editable)**.

---

### STRUKTUR BERKAS EKSPOR:
1. 📱 **`figma_artboards.html`**:
   - Berisi 8 Frame perangkat mobile lengkap beresolusi 390px $\times$ 844px (standar iPhone / modern Android).
   - Menggunakan kode HTML & CSS Auto-Layout yang kompatibel 1:1 dengan struktur *Figma Auto Layout*, *border radius*, *bento cards*, dan kurva SVG.
2. 🎨 **`figma_tokens.json`**:
   - Berisi variabel desain lengkap (Warna Dark/Light, Ukuran Tipografi Presbiopia, Spacing 8pt, Radius, dan Ukuran Target Sentuh Sarung Tangan) yang kompatibel dengan plugin **Tokens Studio for Figma** atau **Figma Variables**.

---

### CARA 1: EKSPOR TAMPILAN SCREEN MENGGUNAKAN PLUGIN "html.to.design" (SANGAT DIREKOMENDASIKAN)

Ini adalah cara paling cepat dan resmi di industri UI/UX untuk mengubah kode web/HTML menjadi layer Figma otomatis:

1. **Buka Figma**:
   - Buka aplikasi desktop Figma atau buka [figma.com](https://figma.com) di peramban.
   - Buat satu berkas desain baru (*New Design File*).

2. **Buka Plugin "html.to.design"**:
   - Di dalam canvas Figma, tekan `Shift + I` (menu *Plugins*).
   - Ketik dan cari plugin bernama **`html.to.design`** (dibuat oleh DivRIOTS, plugin resmi terpopuler dengan jutaan pengguna).
   - Klik **Run**.

3. **Impor Berkas HTML**:
   - Di jendela plugin `html.to.design`, pilih tab **"Import from HTML file"** (atau ikon berkas).
   - Seret (*drag & drop*) berkas:
     `d:\Capstone-Project\Defect-Monitoring\qc-mobile-operator\figma-export\figma_artboards.html`
   - Atau buka berkas `figma_artboards.html` di browser Chrome, salin URL lokalnya, lalu tempel (*paste*) ke plugin.
   - Klik tombol **Import**.

4. **Hasil di Figma**:
   - Figma akan secara otomatis merekonstruksi **8 Artboard Frame mobile** lengkap dengan Auto Layout, teks yang bisa diedit, warna palet asli, kurva grafik SVG, dan tombol-tombol ergonomis.

---

### CARA 2: IMPOR VARIABEL & TOKEN DESAIN (FIGMA VARIABLES)

Jika Anda ingin menyimpan seluruh warna dan tipografi sebagai pustaka gaya (*Design Library / Styles*) di Figma:

1. Pasang plugin **Tokens Studio for Figma** di menu Plugins Figma.
2. Buka plugin, klik **Settings** $\rightarrow$ **Load Token File**.
3. Pilih berkas:
   `d:\Capstone-Project\Defect-Monitoring\qc-mobile-operator\figma-export\figma_tokens.json`
4. Seluruh variabel warna (Dark/Light), skala tipografi (KPI 28px s/d Micro 12px), dan ukuran tombol (52px, 56px) akan langsung tersimpan di panel *Figma Variables* Anda.

---

### DAFTAR 8 SCREEN YANG TERSEDIA DI EKSPOR:
- **Frame 01**: Layar Login & Autentikasi Pengguna (`LoginScreen`)
- **Frame 02**: Dasbor Monitoring Kualitas QC (`DashboardScreen` - Staff QC View dengan p-Chart SPC & Top 5 Defect)
- **Frame 03**: Dasbor Pencapaian Target Operator (`DashboardScreen` - Operator View dengan Gross/NG/Net OK)
- **Frame 04**: Input Hasil Cetak Mesin Produksi (`InputProductionScreen` dengan Dual Input 56px & Achievement Meter)
- **Frame 05**: Input Temuan Cacat NG (`InputDefectScreen` dengan Stepper Taktil 52x52px & Kamera Bukti)
- **Frame 06**: Riwayat Catatan Batch Produksi (`ProductionHistoryScreen` dengan Lencana Cloud/Lokal)
- **Frame 07**: Riwayat Input Cacat QC (`MyHistoryScreen` dengan Rekap Total NG)
- **Frame 08**: Asisten Interaktif AI Chatbot (`AiChatScreen` Konsultasi SOP Mesin)
