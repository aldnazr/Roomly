# Business Requirements Document (BRD)
## Hotel Booking & Operations System — Single Property

**Versi:** 1.0
**Tanggal:** 24 September 2026
**Status:** Draft

---

## 1. Ringkasan Eksekutif

Sistem reservasi dan operasional hotel untuk properti tunggal (single-property), mencakup pemesanan kamar oleh tamu, operasional front desk, manajemen harga dinamis, dan pelaporan. Project ini dikembangkan sebagai portofolio teknis dengan penekanan pada kedalaman fitur di luar CRUD dasar — khususnya availability engine, pricing engine, dan pencegahan overbooking.

## 2. Latar Belakang & Tujuan

### 2.1 Latar Belakang
Sistem booking hotel yang umum ditemui di tutorial/portofolio biasanya berhenti di level CRUD kamar + form booking sederhana, tanpa menangani kompleksitas nyata seperti konflik jadwal, alokasi kamar dinamis, dan perubahan harga musiman. Project ini dibangun untuk menutup gap tersebut sekaligus menjadi demonstrasi kemampuan fullstack (state management, data fetching strategy, RBAC berlapis).

### 2.2 Tujuan
- Menyediakan sistem pemesanan kamar yang akurat (tidak overbooking) dan mudah digunakan tamu.
- Menyediakan tools operasional bagi staf hotel (check-in/out, status kamar) yang efisien.
- Menyediakan mekanisme harga dinamis berbasis musim/hari untuk mendukung strategi revenue.
- Menjadi portofolio teknis yang menunjukkan kemampuan arsitektur sistem, bukan sekadar implementasi UI.

### 2.3 Non-Tujuan (Out of Scope)
- Multi-property / multi-tenant (hanya 1 hotel/properti).
- Payment gateway terintegrasi penuh (pembayaran dicatat manual/status saja di tahap awal).
- Aplikasi mobile native (web-responsive saja).
- Integrasi channel manager pihak ketiga (Booking.com, Agoda, dll).

## 3. Target Pengguna & Peran (RBAC)

| Role | Deskripsi | Akses Utama |
|---|---|---|
| **Guest** | Tamu yang memesan kamar | Cari ketersediaan, booking, lihat riwayat, cancel (sesuai policy) |
| **Front Desk / Staff** | Petugas operasional harian | Check-in/out, lihat semua booking, update status kamar, booking walk-in |
| **Manager** | Pengelola operasional & harga | Semua akses staff + kelola room type, pricing rules, approve refund, lihat laporan |
| **Admin** | Pemilik sistem | Full access, kelola akun staff & permission |

**Prinsip RBAC:** permission dicek di level API (middleware) dan direfleksikan di UI (guard/hook), bukan hanya disembunyikan secara visual.

## 4. Ruang Lingkup Fitur

### 4.1 Milestone 1 — Core Booking
- Manajemen room type (nama, kapasitas, harga dasar, deskripsi, amenities, foto)
- Pencarian ketersediaan kamar berdasarkan rentang tanggal & jumlah tamu
- Alur booking: pilih tanggal → pilih room type → isi data tamu → konfirmasi
- Dashboard tamu: riwayat booking, detail reservasi, cancel booking

### 4.2 Milestone 2 — Operasional Staff
- Dashboard front desk: daftar check-in & check-out hari berjalan
- Room status board (occupied, vacant, cleaning, maintenance)
- Booking manual oleh staff (walk-in guest)

### 4.3 Milestone 3 — Pricing & Availability Engine
- Aturan harga musiman/akhir pekan (seasonal/weekend pricing)
- Blackout dates & minimum length of stay
- Kalender ketersediaan visual per room type
- Mekanisme pencegahan overbooking (transaction-level locking)

### 4.4 Milestone 4 — Reporting & Penyempurnaan
- Laporan occupancy rate & revenue (visualisasi grafik)
- Notifikasi email (konfirmasi booking, pembatalan)
- Review/rating tamu setelah checkout

## 5. Alur Bisnis Utama

### 5.1 Alur Pemesanan (Guest)
1. Guest mencari ketersediaan berdasarkan tanggal check-in/check-out & jumlah tamu.
2. Sistem menampilkan room type yang tersedia beserta harga (sudah termasuk pricing rule aktif).
3. Guest memilih room type, mengisi data diri, dan mengonfirmasi booking.
4. Sistem melakukan validasi ketersediaan final (mencegah race condition) sebelum menyimpan reservasi.
5. Guest menerima konfirmasi (di dalam sistem, dan email pada Milestone 4).

### 5.2 Alur Operasional Harian (Staff)
1. Staff membuka dashboard, melihat daftar check-in/check-out hari ini.
2. Saat tamu tiba, staff melakukan check-in dan mengubah status kamar menjadi occupied.
3. Saat tamu keluar, staff melakukan check-out, status kamar berubah menjadi cleaning.
4. Setelah dibersihkan, status kamar diubah manual menjadi vacant/ready.

### 5.3 Alur Pengelolaan Harga (Manager)
1. Manager membuat pricing rule untuk room type tertentu (rentang tanggal + override harga/multiplier).
2. Sistem menerapkan rule tersebut secara otomatis pada hasil pencarian ketersediaan di rentang tanggal terkait.

## 6. Kebutuhan Fungsional (Functional Requirements)

| ID | Kebutuhan |
|---|---|
| FR-01 | Sistem harus mampu menampilkan ketersediaan kamar secara akurat berdasarkan rentang tanggal |
| FR-02 | Sistem harus mencegah dua reservasi tumpang tindih pada kamar yang sama |
| FR-03 | Sistem harus menerapkan aturan harga sesuai tanggal booking secara otomatis |
| FR-04 | Sistem harus membatasi akses fitur berdasarkan role pengguna |
| FR-05 | Sistem harus mencatat log status kamar (perubahan status & waktu) |
| FR-06 | Sistem harus memungkinkan pembatalan booking sesuai kebijakan (mis. batas waktu cancel) |
| FR-07 | Sistem harus menghasilkan laporan occupancy & revenue dalam rentang tanggal tertentu |

## 7. Kebutuhan Non-Fungsional (Non-Functional Requirements)

| ID | Kebutuhan |
|---|---|
| NFR-01 | Response time pencarian ketersediaan < 1 detik untuk data skala single-property |
| NFR-02 | Sistem harus tetap konsisten (tidak overbooking) meskipun ada request booking bersamaan |
| NFR-03 | UI harus responsif (mobile & desktop) |
| NFR-04 | Data sensitif (data tamu, kredensial staff) harus tervalidasi & terlindungi dari akses tidak sah |
| NFR-05 | Sistem harus mudah dikembangkan ke arah multi-property di masa depan (schema tidak menutup kemungkinan tersebut) |

## 8. Entitas Data Utama (High-Level)

- **room_types** — jenis kamar, kapasitas, harga dasar
- **rooms** — unit kamar fisik, terhubung ke room_type, status
- **reservations** — data pemesanan, tanggal, status, total harga
- **guests** — data tamu
- **pricing_rules** — aturan harga berdasarkan rentang tanggal
- **users** — akun staff dengan role

## 9. Asumsi & Batasan

- Sistem digunakan oleh satu properti hotel saja (bukan multi-tenant).
- Pembayaran dicatat sebagai status (belum tentu terintegrasi payment gateway di awal).
- Tidak menangani integrasi dengan OTA (Online Travel Agent) pihak ketiga.
- Pengembangan dilakukan secara bertahap (iteratif per milestone), bukan sekaligus.

## 10. Metrik Keberhasilan

- Tidak ada kasus overbooking pada pengujian concurrent booking.
- Seluruh role dapat mengakses hanya fitur sesuai permission-nya (diuji melalui test case RBAC).
- Waktu proses booking end-to-end (dari pencarian hingga konfirmasi) berjalan lancar tanpa error.
- Dokumentasi & struktur kode cukup jelas untuk ditunjukkan sebagai portofolio teknis.

## 11. Roadmap Milestone (Ringkas)

| Milestone | Fokus | Estimasi |
|---|---|---|
| M1 | Core Booking | 2–3 minggu |
| M2 | Operasional Staff | 1–2 minggu |
| M3 | Pricing & Availability Engine | 2–3 minggu |
| M4 | Reporting & Polish | 1–2 minggu |

*Estimasi bersifat fleksibel, disesuaikan dengan kapasitas pengerjaan solo developer.*

---

**Catatan:** Dokumen ini adalah dokumen hidup (living document) — dapat direvisi seiring berjalannya development, terutama pada bagian scope dan asumsi.
