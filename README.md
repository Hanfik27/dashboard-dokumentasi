# 📋 Dashboard Dokumentasi

Aplikasi web internal untuk manajemen dan verifikasi dokumentasi kegiatan. Dibangun dengan **Laravel 12**, **Inertia.js**, dan **React 19** (TypeScript).

---

## ⚙️ Requirement

### Server

| Kebutuhan | Versi Minimum |
|---|---|
| PHP | **8.2** atau lebih tinggi |
| Composer | **2.x** |
| Node.js | **18.x** atau lebih tinggi |
| npm | **9.x** atau lebih tinggi |
| MySQL | **8.0** atau lebih tinggi |

### PHP Extensions (wajib aktif)

- `pdo_mysql`
- `mbstring`
- `openssl`
- `tokenizer`
- `xml`
- `ctype`
- `json`
- `fileinfo`
- `gd` *(untuk preview gambar)*
- `zip` *(untuk fitur download ZIP)*

---

## 🚀 Cara Install

### 1. Clone / Extract Project

```bash
git clone <url-repo> dashboard_dokumentasi
cd dashboard_dokumentasi
```

### 2. Install Dependensi PHP

```bash
composer install
```

### 3. Salin file `.env`

```bash
cp .env.example .env
```

### 4. Generate Application Key

```bash
php artisan key:generate
```

### 5. Konfigurasi Database

Edit file `.env`, sesuaikan bagian ini:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_dashboard_dokumentasi
DB_USERNAME=root
DB_PASSWORD=
```

> Buat database `db_dashboard_dokumentasi` di MySQL terlebih dahulu sebelum migrasi.

### 6. Jalankan Migrasi Database

```bash
php artisan migrate
```

### 7. Buat Symbolic Link Storage

```bash
php artisan storage:link
```

### 8. Install Dependensi JavaScript

```bash
npm install
```

### 9. Build Assets (Produksi) atau Jalankan Dev Server

```bash
# Development
npm run dev

# Production build
npm run build
```

### 10. Jalankan Aplikasi

```bash
php artisan serve
```

Akses di: **http://localhost:8000**

---

## 🗄️ Skema Database

### Tabel `users`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGINT | Primary key |
| `name` | VARCHAR | Nama lengkap |
| `username` | VARCHAR (unique) | Username untuk login |
| `role` | VARCHAR | `superadmin` / `admin` / `user` |
| `password` | VARCHAR | Bcrypt hash |
| `created_at`, `updated_at` | TIMESTAMP | — |

### Tabel `dokumentasi`

| Kolom | Tipe | Keterangan |
|---|---|---|
| `id` | BIGINT | Primary key |
| `user_id` | BIGINT FK | Relasi ke `users` |
| `tanggal` | DATE | Tanggal kegiatan |
| `rincian` | TEXT | Deskripsi kegiatan |
| `bidang` | ENUM | `PJPA` / `OP` / `PJSA` / `PPID` |
| `file_dokumentasi_path` | JSON | Array path file dokumentasi |
| `file_desain_path` | JSON | Array path file desain grafis |
| `verifikasi_foto` | BOOLEAN | Status verifikasi foto |
| `verifikasi_desain` | BOOLEAN | Status verifikasi desain |
| `verifikasi_caption` | BOOLEAN | Status verifikasi caption |
| `catatan_revisi` | TEXT | Catatan revisi (nullable) |
| `kategori_revisi` | VARCHAR | `foto` / `desain` / `caption` |
| `validasi_kepala` | BOOLEAN | Status validasi kepala |
| `status` | ENUM | `belum` / `terverifikasi` / `revisi` |
| `created_at`, `updated_at` | TIMESTAMP | — |

---

## 👥 Role & Hak Akses

| Fitur | Superadmin | Admin | User |
|---|:---:|:---:|:---:|
| Lihat semua dokumentasi | ✅ | ✅ | ✅ |
| Tambah dokumentasi | ✅ | ✅ | — |
| Edit dokumentasi | ✅ | ✅ | — |
| Hapus dokumentasi | ✅ | — | — |
| Upload file | ✅ | ✅ | — |
| Verifikasi dokumentasi | ✅ | ✅ | — |
| Kirim revisi | ✅ | ✅ | — |
| Validasi Kepala | ✅ | — | ✅ |
| Kelola akun pengguna | ✅ | — | — |

---

## ✨ Fitur Utama

- **Dashboard per Role** — tampilan dan akses berbeda untuk Superadmin, Admin, dan User
- **CRUD Dokumentasi** — tambah, edit, hapus data dokumentasi kegiatan
- **Upload File** — upload file dokumentasi & desain grafis (max 20MB per file)
- **Download File / ZIP** — preview file atau download semua sebagai ZIP
- **Sistem Verifikasi** — verifikasi 3 aspek: foto, desain, caption
- **Status Otomatis** — status `terverifikasi` / `revisi` / `belum` dihitung otomatis
- **Validasi Kepala** — tanda validasi resmi dari kepala unit
- **Real-time Auto Refresh** — data diperbarui otomatis setiap 15 detik via Inertia partial reload
- **Pagination** — tabel terpaginasi 10 item per halaman
- **Dark Mode** — mendukung tema terang dan gelap

---

## 📦 Dependensi Utama

### Backend (PHP / Laravel)

| Package | Versi | Keterangan |
|---|---|---|
| `laravel/framework` | ^12.0 | Core framework |
| `inertiajs/inertia-laravel` | ^2.0 | Adapter Inertia untuk Laravel |
| `laravel/fortify` | ^1.30 | Autentikasi |
| `laravel/wayfinder` | ^0.1.9 | Route helper untuk TypeScript |

### Frontend (Node.js / React)

| Package | Versi | Keterangan |
|---|---|---|
| `react` | ^19.2.0 | UI library |
| `@inertiajs/react` | ^2.3.7 | Adapter Inertia untuk React |
| `typescript` | ^5.7.2 | TypeScript |
| `tailwindcss` | ^4.0.0 | CSS utility framework |
| `vite` | ^7.0.4 | Build tool |
| `lucide-react` | ^0.475.0 | Icon library |
| `@radix-ui/*` | berbagai | Komponen UI headless |

---

## 📁 Struktur Folder Penting

```
dashboard_dokumentasi/
├── app/
│   ├── Http/Controllers/
│   │   ├── DokumentasiController.php   # CRUD + verifikasi + validasi
│   │   └── UserManagementController.php
│   ├── Models/
│   │   ├── Dokumentasi.php
│   │   └── User.php
│   ├── Policies/
│   │   └── DokumentasiPolicy.php       # Otorisasi per role
│   └── Services/
│       └── DokumentasiService.php      # Store/delete file, buat ZIP
├── database/migrations/
├── resources/
│   └── js/
│       ├── hooks/
│       │   └── useAutoRefresh.ts       # Hook polling real-time
│       ├── pages/dashboard/
│       │   ├── admin.tsx
│       │   ├── superadmin.tsx
│       │   └── user.tsx
│       └── components/
│           ├── dokumentasi-table.tsx
│           ├── verification-badge.tsx
│           └── preview-modal.tsx
└── routes/
    └── web.php
```

---

## 🔧 Konfigurasi `.env` Lengkap

```env
APP_NAME=Laravel
APP_ENV=local
APP_KEY=                        # Diisi otomatis oleh php artisan key:generate
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=db_dashboard_dokumentasi
DB_USERNAME=root
DB_PASSWORD=

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
FILESYSTEM_DISK=local

BROADCAST_CONNECTION=log        # Tidak perlu Pusher/WebSocket
```

---

## 🛠️ Perintah Berguna

```bash
# Jalankan semua (server + queue + vite) sekaligus
composer run dev

# Migrasi ulang database (HAPUS semua data)
php artisan migrate:fresh

# Clear cache
php artisan config:clear
php artisan cache:clear

# Lint PHP
composer run lint

# TypeScript check
npx tsc --noEmit
```
