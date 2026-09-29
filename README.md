# Roomly — Hotel Booking & Operations System

Roomly adalah sistem reservasi dan operasional hotel untuk properti tunggal (_single-property_). Project ini dibangun dalam struktur monorepo yang mencakup API backend, web frontend Next.js, serta shared packages.

---

## 🏗️ Struktur Project (Monorepo)

Project ini dikelola menggunakan **Turborepo** dan **Bun** min. v1.4:

```text
roomly/
├── apps/
│   ├── api/          # Backend REST API (Express.js + Bun + LibSQL)
│   └── web/          # Frontend Web Application (Next.js 16 + React 19)
├── packages/
│   ├── ui/                   # Shared React UI Components (@repo/ui)
│   ├── eslint-config/        # Konfigurasi ESLint terpusat
│   └── typescript-config/    # Konfigurasi tsconfig terpusat
├── BRD-Hotel-Booking-System.md # Business Requirements Document
├── turbo.json                # Turborepo task pipeline configuration
└── package.json              # Root monorepo configuration
```

---

## 🛠️ Tech Stack

### Backend (`apps/api`)

- **Runtime & Package Manager:** Bun
- **Framework:** Express 5
- **Database:** LibSQL / SQLite (`@libsql/client`)
- **Auth & Security:** JWT (`jose`), Password Hashing (`bcryptjs`), RBAC Middleware
- **Validation:** Zod

### Frontend (`apps/web`)

- **Framework:** Next.js 16 (App Router) + React 19
- **Authentication:** NextAuth.js v5 (Beta)
- **Styling & UI:** Tailwind CSS v4, Base UI, Tabler Icons
- **State Management & Fetching:** TanStack React Query, Zustand, Axios

### Monorepo & Tooling

- **Orchestration:** Turborepo
- **Formatter & Linter:** Prettier, ESLint
- **Language:** TypeScript 5.7+

---

## 🔑 Fitur Utama & RBAC

Sistem ini menerapkan Role-Based Access Control (RBAC) ketat di level API dan UI middleware:

1. **Autentikasi & Otorisasi:** Login JWT, manajemen session NextAuth, serta pengecekan permission berbasis endpoint.
2. **Manajemen User & Role:** CRUD Pengguna, Role, dan Hak Akses (Permissions).
3. **Manajemen Room Type & Kamar:** Pengelolaan jenis kamar, kapasitas, harga dasar, serta fasilitas.
4. **Availability Engine:** Pencarian ketersediaan kamar berdasarkan tanggal check-in/check-out dan pencegahan overbooking.

---

## 🚀 Panduan Memulai (Getting Started)

### Prasyarat

- **Node.js**: `>= 24`
- **Bun**: `>= 1.4.2`

### 1. Instalasi Dependensi

Jalankan di root folder project:

```bash
bun install
```

### 2. Konfigurasi Environment Variables

#### Backend (`apps/api/.env`)

Buat file `apps/api/.env`:

```env
PORT=3001
JWT_SECRET=your-secret-key-at-least-32-chars-long
TURSO_DATABASE_URL=file:local.db
TURSO_AUTH_TOKEN=
CLIENT_ORIGIN=http://localhost:3000
```

#### Frontend (`apps/web/.env.local`)

Buat file `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
AUTH_SECRET=your-nextauth-secret-key
```

### 3. Inisialisasi Database & Seeding

Jalankan migrasi database SQLite/LibSQL dan data awal (Admin, Roles, Permissions, Rooms):

```bash
cd apps/api
bun run db:setup
```

### 4. Menjalankan Mode Pengembangan (Development)

Dari root monorepo, jalankan server pengembangan untuk seluruh aplikasi (`api` & `web`):

```bash
bun run dev
```

Aplikasi akan berjalan pada:

- **Frontend (`web`):** [http://localhost:3000](http://localhost:3000)
- **Backend API (`api`):** [http://localhost:3001](http://localhost:3001)

---

## 📜 Script Utama (Commands)

| Command               | Keterangan                                                                   |
| --------------------- | ---------------------------------------------------------------------------- |
| `bun run dev`         | Menjalankan seluruh aplikasi (`api` & `web`) dalam mode dev secara bersamaan |
| `bun run build`       | Melakukan kompilasi/build untuk seluruh aplikasi & package                   |
| `bun run lint`        | Menjalankan audit linter ESLint                                              |
| `bun run check-types` | Mengecek validasi tipe TypeScript di seluruh monorepo                        |
| `bun run format`      | Memformat kode menggunakan Prettier                                          |

---

## 🌐 Endpoints API Ringkas

| Method         | Endpoint            | Deskripsi                              |
| -------------- | ------------------- | -------------------------------------- |
| `POST`         | `/api/auth/login`   | Login user & dapatkan token JWT        |
| `GET`          | `/api/auth/me`      | Dapatkan profil user yang sedang login |
| `GET` / `POST` | `/api/users`        | Pengelolaan data user                  |
| `GET` / `POST` | `/api/roles`        | Pengelolaan role & hak akses           |
| `GET`          | `/api/permissions`  | Daftar permission sistem               |
| `GET` / `POST` | `/api/room-types`   | Pengelolaan jenis/tipe kamar           |
| `GET`          | `/api/availability` | Cek ketersediaan kamar                 |

---

## 📄 Dokumen Terkait

- [Business Requirements Document (BRD)](./BRD-Hotel-Booking-System.md)
