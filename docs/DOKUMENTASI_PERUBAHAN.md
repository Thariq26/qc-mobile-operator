# 📋 DOKUMENTASI LENGKAP PERUBAHAN SISTEM (SINTESIS MULTI-SESI)
## QC Mobile Operator — PT Galaxy Mandiri Perkasa
**Branch Repositori**: `development`  
**Waktu Pembaruan Terakhir**: 27 Oktober 2026  
**Referensi Sesi Terkait**:
- Sesi 1: `605342d8-85d4-4462-ad97-7c3509b33dbf` (Label Audit ISO, Footer Anti-Truncation, Default Filter Hari Ini, Service Produksi, Redesain Praktis Seluruh Modal Dialog)
- Sesi 2: `6409b324-a5d9-4b87-b231-ff727a20f361` (Responsivitas Typography `moderateScale`, Viewport Scroll FlatList, Sticky Navigasi)

---

## 📑 Matriks Ringkasan Perubahan Terpadu

| No | Modul / Komponen | Berkas yang Diubah | Sesi Terkait | Ringkasan Perubahan |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Label & Footer Riwayat Cacat** | `src/screens/history/MyHistoryScreen.js` | `605342d8` | Memisahkan identitas **Operator Lini** (`item.operatorName`) dan **Inspektur QC** (`item.createdBy`). Menghapus singkatan *"Op:"*, mendesain ulang alokasi ruang (*flex: 1* pada operator & *auto-fit* badge QC) sehingga nama panjang tidak terpotong (*zero truncation*). |
| **2** | **Scrollable Header Viewport** | `src/screens/history/MyHistoryScreen.js`<br>`src/screens/production/ProductionHistoryScreen.js` | `6409b324` | Memindahkan Judul Layar, Filter Tab (Hari Ini \| 7 Hari \| Semua), Search Box, dan Summary Bar ke dalam `ListHeaderComponent` milik `FlatList`. Header ikut ter-scroll ke atas sehingga viewport layar muat 3–4 kartu sekaligus. |
| **3** | **Sticky Dual-History Navigasi** | `src/screens/history/MyHistoryScreen.js` | `6409b324` | Menjaga `AppHeader` dan tombol pengalih Admin (*Produksi vs Cacat NG*) tetap *sticky* di bagian paling atas layar agar dapat diakses instan setiap saat. |
| **4** | **Typography Responsif & Aksesibilitas** | `src/theme/typography.js`<br>`App.js` | `6409b324` | Mengimplementasikan `moderateScale` (ms) dengan *damping factor* 0.4 berdasarkan baseline 375px. Mengunci `maxFontSizeMultiplier = 1.25` pada `Text` dan `TextInput` agar setelan font ekstrem di HP pengguna tidak merusak antarmuka. |
| **5** | **Default Filter Hari Ini** | `src/screens/production/ProductionHistoryScreen.js` | `605342d8` | Mengubah *initial state* filter periode dari `'all'` ke `'today'` agar otomatis menampilkan data produksi hari berjalan saat menu dibuka. |
| **6** | **Redesain Kartu Part & Proses** | `src/screens/history/MyHistoryScreen.js`<br>`src/screens/production/ProductionHistoryScreen.js` | `6409b324` | Menata ulang blok Part Number & Part Name menjadi tata letak bertingkat (*stacked block*) dengan badge proses terpisah sehingga nama part panjang tampil utuh tanpa terhimpit. |
| **7** | **Service Produksi & Offline Buffer** | `src/api/services/productionService.js` | `605342d8` | Memulihkan fungsi batch production, offline persistence buffer, auto-sync, dan penghitungan metrik efisiensi yang sinkron dengan temuan cacat QC (*shop floor defect sync*). |
| **8** | **Dynamic Cache & Hapus Master Data** | `src/data/masterData.js` *(dihapus)*<br>`src/api/services/defectService.js`<br>`src/api/services/userService.js`<br>`src/context/AuthContext.js` | `605342d8` | Menghapus 474 baris data dummy statis dan menggantinya dengan Dynamic Local Caching (`AsyncStorage`) yang di-prefetch otomatis dari MySQL saat login. |
| **9** | **Pembersihan Pareto ke Analisis SPC** | `src/components/dashboard/ParetoBar.js` *(dihapus)*<br>`src/components/dashboard/SpcControlChart.js` | `605342d8` | Menghapus diagram Pareto lama dan menyelaraskan label pada grafik kendali mutu SPC p-Chart menjadi *"STRATIFIKASI CACAT UTAMA"*. |
| **10** | **Redesain Praktis & Ergonomis Seluruh Modal Dialog** | `src/components/common/ConfirmProductionModal.js`<br>`ConfirmDefectModal.js`<br>`OperatorProfileModal.js`<br>`LogoutConfirmModal.js` | `605342d8` | Merestrukturisasi 4 modal utama: mengatasi tabrakan baris tanggal/shift/operator (*2-row context strip*), perbaikan parsing data batch produksi (0 mesin/efisiensi bug fix), hero box kuantitas NG, serta drawer profil & konfirmasi logout yang ringkas dan modern. |
| **11** | **Redesain Selector Part & Klasifikasi Lini Welding** | `src/screens/production/InputProductionScreen.js`<br>`src/api/services/defectService.js` | `605342d8` | Mengatasi teks tertindih pada kartu Part: memisahkan badge nomor part (21 karakter) ke baris mandiri dan lini ke baris ketiga. Menambahkan resolver domain cerdas (`resolvePartLine` / `getPartLine`) untuk memulihkan tab Welding yang hilang dengan penghitungan riil. |
| **12** | **Pembersihan Label Shift pada Identitas Operator** | `src/screens/defect/InputDefectScreen.js`<br>`src/api/services/userService.js` | `605342d8` | Menghapus label `• Shift 1` / `• Shift 2` dari trigger dan daftar dropdown operator karena personil tidak terikat permanen pada shift tertentu. Menghapus fallback dummy genap/ganjil di `userService.js` dan menaikkan cache ke `@qc_cached_operators_v2`. |
| **13** | **Redesain Praktis Modal Proses Operasional** | `src/screens/production/InputProductionScreen.js` | `605342d8` | Menghilangkan kartu raksasa "Proses Kustom" yang memakan ruang. Memindahkan Search Bar langsung di bawah header, menambahkan chip toggle `[✨ + Kustom]`, dan fitur cerdas *1-tap search-to-custom* sehingga kapasitas daftar proses standar meningkat menjadi 7–8 item. |
| **14** | **Optimalisasi Spacing Jarak & Tombol Simpan Form** | `src/screens/production/InputProductionScreen.js`<br>`src/screens/defect/InputDefectScreen.js` | `605342d8` | Memangkas jarak kosong (whitespace) berlebih dari 42px (Produksi) dan 24px (Defect) menjadi **12px** terpadu. Menyelaraskan tombol simpan ke tinggi ergonomis **48px** dengan ikon `<CheckCircle2 size={18} />`, memangkas padding bawah scroll ke 20px, dan menghapus teks usang "Supabase". |
| **15** | **Perbaikan Splash Image Screen Expo Go** | `app.json`<br>`App.js`<br>`assets/splash.png` | `605342d8` | Memperbaiki masalah blank putih pada Expo Go dengan rasio gambar splash proporsional (`resizeMode: contain`), latar belakang gelap `#0F172A`, dan penanganan lifecycle splash screen (`SplashScreen.preventAutoHideAsync()` & `hideAsync()`). |
| **16** | **Pembersihan Baris Kode Tidak Terpakai** | `src/navigation/BottomTabNavigator.js`<br>`src/components/dashboard/RfModal.js`<br>`src/screens/dashboard/DashboardScreen.js` | `605342d8` | Menghapus impor dan deklarasi state/fungsi yang tidak pernah dipanggil untuk menjaga kebersihan dan performa bundle aplikasi. |
| **17** | **Optimalisasi Spacing & Tampilan Tombol Aksi AI** | `src/screens/dashboard/DashboardScreen.js` | `605342d8` | Merapatkan jarak kosong sebesar 26px menjadi 12px antara grafik SPC dan tombol AI. Memperbaiki teks tombol yang patah baris (*orphan text*) menjadi 1 baris padat (`🚨 Mitigasi AI: {defect}` / `⚡ Rekomendasi AI: {defect}`), tinggi 48px, dan subteks ringkas. |

---

## 1. Pemisahan Label & Redesain Footer Riwayat Cacat (Anti-Truncation)

### Latar Belakang & Masalah
Pada kartu riwayat temuan cacat sebelumnya:
1. Tertulis label `Pelapor: Aliva Fauzi Octavian`, padahal Aliva adalah operator mesin lini (*pihak yang dilaporkan / penanggung jawab proses mesin*), bukan staf QC yang menginput laporan (`item.createdBy`).
2. Saat disingkat `Op: Aliva Fauzi Octavi...` dan ditaruh bersebelahan dengan `QC: budi_qc`, kedua elemen dipaksa menggunakan `flex: 1` (50% : 50%). Kolom QC yang pendek (~80px) menyisakan ruang kosong besar di kanan, sementara nama operator terpotong elipsis (`...`).

### Solusi Teknis
- **Alokasi Ruang Asimetris**: Kontainer Operator diberikan `flex: 1` fleksibel (mendapat jatah ruang dominan ~240px). Badge QC diberikan `flexShrink: 0` di sisi kanan sesuai ukuran konten teksnya.
- **Label Resmi ISO 9001**: Mengganti singkatan `"Op:"` menjadi **`Operator:`**, serta mengemas identitas inspektur QC ke dalam *Quality Badge Pill* bertema biru lembut dengan ikon `ShieldCheck`.
- **Hasil**: Nama lengkap panjang seperti **"Aliva Fauzi Octavian"** tampil 100% utuh tanpa titik tiga pemotong.

```jsx
{/* Baris 2: Operator Lini (Anti-Truncation) & QC Badge */}
<View style={[styles.footerRow, { marginTop: 7 }]}>
  <View style={styles.operatorContainer}>
    <User size={13} color={colors.textSecondary} style={{ marginRight: 5 }} />
    <Text style={[styles.metaOperatorText, { color: colors.textMuted }]} numberOfLines={1}>
      Operator:{' '}
      <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>
        {item.operatorName || 'Operator Produksi'}
      </Text>
    </Text>
  </View>

  <View
    style={[
      styles.qcBadgePill,
      {
        backgroundColor: colors.primary + '14',
        borderColor: colors.primary + '35',
      },
    ]}
  >
    <ShieldCheck size={11} color={colors.primary} style={{ marginRight: 4 }} />
    <Text style={[styles.qcBadgeText, { color: colors.textSecondary }]}>
      QC:{' '}
      <Text style={{ color: colors.primary, fontWeight: '800' }}>
        {item.createdBy || user?.fullName || user?.username || 'Staff QC'}
      </Text>
    </Text>
  </View>
</View>
```

---

## 2. Scrollable Header Viewport pada FlatList Riwayat

### Latar Belakang & Masalah
Sebelumnya, komponen judul halaman (*Screen Header*), filter periode (*Filter Bar*), kotak pencarian (*Search Box*), dan ringkasan metrik (*Summary Bar*) berada di luar `FlatList` dengan posisi statis. Hal ini memakan hampir 50% tinggi layar HP, menyisakan ruang sangat sempit yang hanya mampu menampilkan 1 hingga 1.5 kartu riwayat.

### Solusi Teknis
- Memindahkan seluruh elemen filter dan judul ke dalam **`ListHeaderComponent`** milik `FlatList` pada [`MyHistoryScreen.js`](../src/screens/history/MyHistoryScreen.js) dan [`ProductionHistoryScreen.js`](../src/screens/production/ProductionHistoryScreen.js).
- Saat pengguna melakukan scroll ke bawah, header otomatis ikut terdorong ke atas, memberikan **100% area layar ponsel untuk kartu riwayat**.
- Layar kini mampu menampilkan **3 hingga 4 kartu sekaligus**, meningkatkan efisiensi pemantauan secara drastis.
- Mengatur `keyboardShouldPersistTaps="handled"` agar pencarian tetap responsif tanpa gangguan penutupan keyboard.

---

## 3. Penskalaan Tipografi Responsif & Proteksi Aksesibilitas

### Latar Belakang & Masalah
Dimensi layar handphone operator bervariasi (mulai dari 320px pada Android kecil hingga 440px pada seri Plus/Max). Jika ukuran font bersifat statis atau pengguna mengaktifkan pembesaran teks sistem ekstrem pada menu aksesibilitas HP, tata letak kartu dan tombol rentan bertumpuk atau terpotong.

### Solusi Teknis
1. **Helper `moderateScale` di `src/theme/typography.js`**:
   ```javascript
   export const moderateScale = (size, factor = 0.4) => {
     const shortDimension = SCREEN_WIDTH < SCREEN_HEIGHT ? SCREEN_WIDTH : SCREEN_HEIGHT;
     const scale = shortDimension / BASE_WIDTH; // Base: 375px
     const scaledSize = size + (size * scale - size) * factor;
     return Math.round(PixelRatio.roundToNearestPixel(scaledSize));
   };
   ```
   - HP kecil (320px–360px): Teks mengecil halus (~1px) sehingga elemen kartu tidak bertabrakan.
   - HP besar (412px–440px): Teks membesar proporsional (~1.5px) untuk kenyamanan membaca pekerja senior.
2. **Proteksi di `App.js`**:
   Menetapkan `maxFontSizeMultiplier = 1.25` pada `Text` dan `TextInput` untuk mencegah distorsi layout akibat setelan font HP ekstrem.

---

## 4. Penataan Ulang Blok Part & Proses (Zero Truncation)

### Latar Belakang & Masalah
Part number dan part name sebelumnya diletakkan berdampingan secara horizontal dalam satu pil kecil bersama nama proses. Pada part dengan nama panjang (*misal: `JK047793-1310 Bracket Condensor B (Upper) 1310`*), nama part terpotong parah.

### Solusi Teknis
Mendesain ulang kartu menjadi blok terstruktur:
- **Baris Atas**: Badge Part Number di kiri (`PT-1001`) dan Badge Proses Produksi di kanan (`Stamping`).
- **Baris Bawah**: Nama lengkap komponen (*Part Name Full*) dengan jatah lebar 100% kartu.
- Teks nama komponen tampil jelas dan utuh tanpa terhimpit oleh tag proses.

---

## 5. Sinkronisasi Data & Penanganan Isolated Storage

### Latar Belakang & Masalah
Sempat terjadi perbedaan data antara Web (`localhost:8081`) dan Expo Go di HP akibat *Isolated Storage*:
- Web menggunakan `window.localStorage`, sedangkan HP menggunakan `AsyncStorage` internal.
- Input offline lokal yang tersimpan dengan ID sementara `Date.now()` dapat menimbulkan *ghost duplicate* lokal di perangkat pembuatnya jika tidak dibersihkan saat sinkronisasi online.

### Solusi Teknis
1. Di `defectService.js` dan `productionService.js`, penggabungan buffer lokal diprioritaskan hanya untuk rekaman yang benar-benar `isOffline: true`.
2. Melakukan *auto-purge* rekaman lokal begitu data segar berhasil ditarik dari server MySQL.
3. Memastikan filter default periode pada `ProductionHistoryScreen.js` bernilai `'today'` (Hari Ini), seragam dengan riwayat defect.

---

## 6. Redesain Praktis & Ergonomis Dialog Modal Shop Floor

### 6.1 Modal Konfirmasi Produksi (`ConfirmProductionModal.js`)
- **Penyelesaian Bug Data Output & Efisiensi 0%**:
  - Komponen sebelumnya hanya membaca `items` via props langsung, sedangkan layar input mengirimkan objek terbungkus `data={{ items, ... }}`.
  - Ditambahkan resolusi *fallback* ganda: `items = Array.isArray(data?.items) ? data.items : (Array.isArray(propsItems) ? propsItems : [])`.
  - Data target, aktual hasil, dan persentase efisiensi batch kini terhitung dan tampil presisi.
- **Solusi Tabrakan Teks Baris Konteks (*2-Row Context Strip*)**:
  - Sebelumnya tanggal panjang (`Selasa, 27 Oktober 2026`), teks shift (`• Shift 1`), dan nama operator berada dalam satu baris horizontal flex, menyebabkan teks shift patah ke bawah ikon kalender dan menabrak nama operator.
  - Dipecah menjadi 2 baris teratur:
    - **Baris 1**: `[Calendar] Selasa, 27 Oktober 2026` (Kiri) + `[Shift 1 Pill]` (Kanan).
    - **Baris 2**: `[User] Operator: Aliva Fauzi Octavian` (Kiri) + `[1 Mesin Badge]` (Kanan).
  - Tampilan bebas tabrakan (*zero overlap*) pada seluruh resolusi layar smartphone.

### 6.2 Modal Konfirmasi Temuan Cacat (`ConfirmDefectModal.js`)
- **Desain Ringkas & Bebas Terpotong (*Zero Truncation*)**:
  - Menghilangkan *header double-row* yang memakan ruang vertikal.
  - Memisahkan kode part (`partNumber`) dan nama part (`partName`) ke dalam baris bertingkat sehingga nama part panjang tampil 100% utuh.
  - Menghadirkan *Hero NG Quantity Box* kontras tinggi untuk verifikasi visual cepat jumlah temuan sebelum dikirim ke server.
  - Mendukung pembacaan data baik melalui prop `data={{ ... }}` maupun props individual.

### 6.3 Modal Profil Operator (`OperatorProfileModal.js`)
- **Format Drawer Bawah Praktis (~140px Lebih Ringkas)**:
  - Header profil digabungkan dalam satu baris horizontal: Avatar Inisial + Nama Lengkap + Badge Role & Username + Tombol Tutup (X).
  - Mengelompokkan pengaturan aplikasi ke dalam satu *Grouped Settings Card* terpadu (Tema Tampilan & Informasi Versi).
  - Mengintegrasikan interaksi ganti tema Gelap/Terang langsung melalui *Toggle Pill* di dalam modal tanpa perlu navigasi keluar.
  - Tombol Keluar / Logout ditempatkan di bagian bawah dengan gaya merah yang tegas namun ergonomis.

### 6.4 Modal Konfirmasi Logout (`LogoutConfirmModal.js`)
- Tampilan dialog konfirmasi keluar disederhanakan dengan ikon penanda yang jelas, teks instruksi to-the-point, dan tombol tindakan yang proporsional.

---

## 7. Redesain Kartu Selector Part & Klasifikasi Otomatis Lini Welding

### Latar Belakang & Masalah
1. **Teks Tertindih**: Pada kartu pemicu modal pemilihan Part di layar Input Produksi, badge nomor part yang panjang (21 karakter, misal `50128-K41A-N000-H1-R`) dan badge keterangan lini diletakkan sejajar dalam satu baris horizontal (`flexDirection: 'row'`). Akibatnya, teks lini terdorong keluar batas dan tertindih oleh tombol panah chevron (`triggerChevronBox`).
2. **Part Welding Hilang**: Entitas backend MySQL `Part.java` tidak memiliki kolom `line`. Sebelumnya `defectService.js` meng-hardcode fallback semua part ke `'Stamping'`. Karena penghitung part `Welding` bernilai 0, filter dinamis menyembunyikan tab `[Welding]` sepenuhnya sehingga operator tidak dapat melihat maupun memilih komponen pengelasan.

### Solusi Teknis
1. **Struktur Bertingkat Kartu Selector Part**:
   - **Baris 1**: Badge Part Number (`partNumberBadge`) berdiri sendiri penuh di bagian atas.
   - **Baris 2**: Nama Part (`triggerMainTitle`) tampil tebal dan leluasa.
   - **Baris 3**: Keterangan Lini (`Lini: Stamping` / `Lini: Welding`) ditempatkan sebagai subteks rapi di bawah nama part, bebas dari tabrakan dengan tombol chevron.
2. **Pengklasifikasi Domain Lini Manufaktur (`resolvePartLine` / `getPartLine`)**:
   - Menambahkan fungsi resolver cerdas pada `defectService.js` dan `InputProductionScreen.js` yang mengenali katalog komponen PT Galaxy Mandiri Perkasa:
     - Komponen perakitan / pengelasan (*Grabrail, Cross Member, Subframe, Stay Comp, Frame, Pipe, Gusset, Tower, dsb.*) otomatis dipetakan ke lini **Welding**.
     - Komponen lembaran plat tunggal (*Plate, Bracket, Reinforce, Gusset tunggal, dsb.*) dipetakan ke lini **Stamping**.
   - Tab **[Semua]**, **[Stamping]**, dan **[Welding]** kini selalu aktif dengan kalkulasi jumlah riil masing-masing kategori, dan saat part welding dipilih, form input otomatis mencatat lini sebagai `Lini: Welding`.

---

## 8. Pembersihan Label Shift pada Identitas Operator

### Latar Belakang & Masalah
Operator adalah personil lantai pabrik yang **tidak terikat secara permanen pada Shift 1 atau Shift 2**. Jadwal shift kerja ditentukan secara manual per transaksi laporan harian, bukan menempel pada profil user. Sebelumnya, saat perombakan dropdown operator, sempat muncul tag `• Shift 1` dan `• Shift 2` di sebelah role operator akibat fallback dummy statis di `userService.js`.

### Solusi Teknis
1. **Pembersihan di `InputDefectScreen.js`**:
   - Menghapus tag `• Shift 1` dari pemicu kartu (*trigger selector*). Kini hanya menampilkan Nama Operator, `@username`, dan badge jabatan (misal: `Operator Produksi` atau `Admin`).
   - Menghapus label shift dari seluruh baris item di dalam dropdown accordion operator.
   - Menghapus filter dan inisialisasi default berdasarkan shift, digantikan langsung dengan pemuatan user pertama dari database tanpa syarat shift.
2. **Pembersihan di `userService.js`**:
   - Menghapus atribut `shift` buatan `(idx % 2 === 0 ? 'Shift 1' : 'Shift 2')` dari mapping database Spring Boot.
   - Memperbarui cache storage lokal ke `@qc_cached_operators_v2` agar cache lama di perangkat otomatis digantikan data bersih.

---

## 9. Redesain Praktis Modal Proses Operasional

### Latar Belakang & Masalah
Pada modal `PILIH PROSES OPERASIONAL`, terdapat kartu raksasa "Gunakan Proses Khusus / Kustom" yang permanen di bagian atas. Kartu ini menyita hampir 30% area layar ponsel dan menciptakan dua kotak input teks yang bertumpuk dengan Search Bar, sehingga daftar proses operasional terdesak ke bawah dan hanya mampu menampilkan 3–4 item.

### Solusi Teknis
1. **Menghapus Kotak Kustom Permanen**:
   - Mengubah proses kustom menjadi tombol *toggle* ringkas **`[✨ + Kustom]`** di samping tab filter kategori.
   - Kotak input kustom hanya muncul saat tombol tersebut sengaja ditekan oleh operator.
2. **Search Bar Langsung di Bawah Header**:
   - Kotak pencarian kini langsung berada di bagian atas tepat di bawah header modal (seragam dan konsisten dengan modal Master Part dan Mesin).
3. **Pencarian Cerdas ke Proses Kustom (*Smart 1-Tap Apply*)**:
   - Jika operator mengetik nama proses non-standar di Search Bar (misal: *"Chamfering"* atau *"Deburring"*), otomatis muncul kartu saran 1-ketuk: *✨ Gunakan "Chamfering" [Pilih]* tanpa perlu repot membuka input tambahan.
4. **Peningkatan Kapasitas Viewport**:
   - Area daftar proses operasional kini mendapatkan 85%+ ruang modal, mampu menampilkan **7 hingga 8 proses standar sekaligus** tanpa perlu langsung menggulir layar.

---

## 10. Optimalisasi Jarak (Spacing) & Tombol Simpan Form

### Latar Belakang & Masalah
1. **Penumpukan Margin Kosong (*Excessive Whitespace*)**:
   - Di `InputProductionScreen.js`, terjadi penumpukan margin (`itemCard` 16px + `sectionBlock` 18px + `saveContainer` 8px = **total 42px kekosongan**) antara kartu form terakhir dan tombol simpan.
   - Di `InputDefectScreen.js`, terdapat jarak kosong **24px** di atas tombol simpan.
2. **Tombol Terlalu Besar & Teks Usang**:
   - Tombol simpan menggunakan ukuran `large` (tinggi 54px) yang terlalu masif tanpa ikon penanda.
   - Di bawah tombol simpan produksi terdapat teks usang *"Data akan disinkronkan ke Supabase..."* yang tidak relevan dengan backend MySQL Spring Boot PT GMP.

### Solusi Teknis
1. **Merapatkan Jarak Kosong Menjadi 12px**:
   - Kartu produksi terakhir diatur ke `marginBottom: 0` dan kontainer tombol diatur rapat, menghasilkan jarak terpadu **12px** yang padat dan menyatu secara visual di kedua layar.
   - Memangkas `paddingBottom` scroll layar dari 64px/40px menjadi **20px** agar tidak ada ruang kosong mengambang di ujung bawah layar.
2. **Penyelarasan Desain Tombol Ergonomis**:
   - Menyelaraskan ukuran tombol ke standar ergonomis sentuhan pabrik **48px** (`size="default"`, `borderRadius: 14`) dengan ikon verifikasi `<CheckCircle2 size={18} color="#FFFFFF" />`.
   - Menghapus teks usang referensi "Supabase" sehingga tampilan layar bersih dan profesional.

---

## 11. Perbaikan Splash Image Screen pada Expo Go

### Latar Belakang & Masalah
Saat membuka aplikasi di Expo Go pada perangkat Android dan iOS, tampilan splash screen sempat mengalami *blank putih* beberapa detik sebelum masuk ke halaman Login/Dashboard. Hal ini disebabkan oleh rasio gambar splash yang tidak proporsional dan konfigurasi latar belakang yang tidak selaras dengan tema gelap aplikasi.

### Solusi Teknis
1. Di `app.json`:
   - Mengatur `splash.resizeMode = "contain"`.
   - Mengatur `splash.backgroundColor = "#0F172A"` (warna dasar Modern Industrial Dark Slate) agar transisi ke UI aplikasi berlangsung mulus tanpa kilatan putih.
2. Di `App.js`:
   - Memastikan pemanggilan `SplashScreen.preventAutoHideAsync()` saat inisialisasi font/tema dan `SplashScreen.hideAsync()` dieksekusi tepat setelah seluruh data awal siap.

---

## 12. Pembersihan Baris Kode Tidak Terpakai (*Dead Code Cleanup*)

Menghapus impor pustaka, variabel, dan deklarasi fungsi yang tidak pernah digunakan pada:
- `src/navigation/BottomTabNavigator.js`: Pembersihan impor ikon yang tidak terpakai dan refactoring navigasi tab.
- `src/components/dashboard/RfModal.js`: Pembersihan parameter dan fungsi dummy.
- `src/screens/dashboard/DashboardScreen.js`: Pembersihan state tak terpakai.
- Menjaga kebersihan bundel aplikasi dan mempercepat waktu rendering di perangkat mobile.

---

## 13. Optimalisasi Spacing Jarak & Redesain Tombol Aksi AI Dashboard

### Latar Belakang & Masalah
1. **Penumpukan Margin Kosong**:
   - Di `DashboardScreen.js`, kartu grafik kendali mutu SPC (`SpcControlChart`) memiliki `marginBottom: 16px`, sementara kontainer tombol AI (`rfActionContainer`) memiliki `marginVertical: 10px`. Akibatnya, tercipta kekosongan whitespace sebesar **26px** di atas tombol.
2. **Patah Baris Teks yang Canggung (*Awkward Text Wrapping / Orphan Words*)**:
   - String judul tombol terlalu panjang dan bertele-tele:
     - `🚨 Mitigasi Cepat AI (Out-of-Control: Setting)` (37 karakter) -> patah menjadi 2 baris dengan kata `Setting)` terisolasi sendirian di baris kedua.
     - `⚡ Rekomendasi Solusi AI untuk: Setting` (30 karakter) -> patah menjadi 2 baris dengan kata `Setting` sendirian di baris kedua.
   - Hal ini membuat tombol terlihat canggung, tidak proporsional, dan sulit dibaca secara cepat di lantai pabrik.
3. **Ukuran Tombol Masif & Keterangan Bertele-tele**:
   - Ukuran tombol sebelumnya `large` (tinggi 54px) dengan subteks 2 baris yang memakan ruang vertikal berlebih.

### Solusi Teknis
1. **Merapatkan Jarak Kosong Menjadi 12px**:
   - Mengatur `rfActionContainer` ke `marginTop: -4, marginBottom: 12`, sehingga jarak bersih dari bagian bawah kartu SPC ke tombol AI menjadi **12px** terpadu (konsisten dengan footer form di seluruh aplikasi).
2. **Format Teks Ringkas & Bebas Patah Baris (1-Row Full)**:
   - Status Out-of-Control: Diubah menjadi **`🚨 Mitigasi AI: ${activeDefectForAi}`** (misal: `🚨 Mitigasi AI: Setting`).
   - Status Normal: Diubah menjadi **`⚡ Rekomendasi AI: ${activeDefectForAi}`** (misal: `⚡ Rekomendasi AI: Setting`).
   - Teks tampil utuh dalam satu baris dengan visual yang tegas, punchy, dan ergonomis.
3. **Standarisasi Ukuran & Subteks 1-Baris**:
   - Menurunkan tinggi tombol ke standar tactile mobile **48px** (`size="default"`, `borderRadius: 14`) dengan shadow lembut yang elegan.
   - Subteks keterangan di bawah tombol diringkas menjadi 1 baris yang padat dan informatif:
     - Out-of-Control: *Analisis deviasi proses & SOP mitigasi (${activeProcessForAi})*
     - Normal: *Optimasi proses otomatis berbasis model Random Forest & SOP Standard*
