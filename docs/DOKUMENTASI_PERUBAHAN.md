# 📋 DOKUMENTASI LENGKAP PERUBAHAN SISTEM (SINTESIS MULTI-SESI)
## QC Mobile Operator — PT Galaxy Mandiri Perkasa
**Branch Repositori**: `development`  
**Waktu Pembaruan Terakhir**: 26 Oktober 2026  
**Referensi Sesi Terkait**:
- Sesi 1: `605342d8-85d4-4462-ad97-7c3509b33dbf` (Label Audit ISO, Footer Anti-Truncation, Default Filter Hari Ini, Service Produksi)
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
| **10** | **Modal Konfirmasi & Remember Me** | `src/components/common/ConfirmProductionModal.js`<br>`ConfirmDefectModal.js`<br>`LoginErrorModal.js` | `605342d8` | Menambahkan pop-up konfirmasi pengaman salah tekan (*fat-finger proof*) serta fitur Ingat Saya (`expo-secure-store`) dan modal error login modern. |

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
