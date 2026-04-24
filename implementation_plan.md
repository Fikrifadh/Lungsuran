# Rencana Pembangunan Lungsuran (Katalog Online)

Lungsuran adalah platform katalog jual beli barang yang dikelola sepenuhnya oleh Admin Badr untuk calon pembeli tanpa perlu login.

## 1. Arsitektur Sistem (Admin-Only CMS)

Sistem menggunakan pendekatan **SSG/ISR (Incremental Static Regeneration)** untuk performa maksimal di sisi pembeli:

- **Frontend**: Next.js (App Router) - Halaman publik statis & Admin dashboard.
- **Backend**: Next.js Route Handlers / Server Actions - Eksklusif untuk Admin.
- **Database**: PostgreSQL (Prisma) - Menyimpan Produk, Kategori, dan Konfigurasi Admin.
- **Auth**: NextAuth.js (Hanya untuk 1 peran: Admin).
- **Integrasi**: WhatsApp API (Direct link) untuk transaksi.

## 2. Database Schema (Simplified)

### Tabel `admins`
- `id` (UUID, PK)
- `username`
- `password_hash`
- `wa_number` (Nomor tujuan default)

### Tabel `categories`
- `id` (PK)
- `name`
- `slug`
- `is_active` (Boolean)

### Tabel `products`
- `id` (PK)
- `category_id` (FK -> categories)
- `name`
- `description`
- `price`
- `status` (Enum: AVAILABLE, SOLD)
- `images` (List of strings/URLs)
- `created_at`

### Tabel `settings`
- `key` (PK)
- `value` (Branding warna, logo, nomor WA)

## 3. Utama API Endpoints (Eksklusif Admin)

| Method | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| **GET** | `/api/public/products` | Mendapatkan data produk untuk katalog (Public) |
| **POST** | `/api/admin/products` | Menambah produk baru (Auth Admin) |
| **PATCH** | `/api/admin/products/:id` | Update produk & status SOLD (Auth Admin) |
| **GET** | `/api/admin/dashboard` | ringkasan statistik produk |

## 4. Alur Pengguna (User Flow)

### Pembeli (Guest)
1. Buka Homepage -> Filter Kategori -> Klik Produk.
2. Lihat Detail -> Klik tombol "Chat via WhatsApp".
3. Redirect ke WhatsApp dengan template pesan otomatis.

### Admin (Badr)
1. Login -> Dashboard.
2. Kelola Produk (Tambah/Edit/Sold).
3. Atur Kategori.
4. Update nomor WhatsApp di menu Pengaturan.

## 5. Struktur Folder

```text
/src
  /app
    /(public)          # Landing page & Detail
    /admin             # Dashboard, Login Admin
    /api/admin         # Proteksi khusus Admin
  /components
    /public            # Katalog, Card, WhatsAppButton
    /admin             # Form CRUD, Stats Card
```

## 6. Security (Admin Panel)
- **Middleware Protection**: Semua rute `/admin` harus melewati pengecekan session NextAuth.
- **Rate Limiting**: Membatasi percobaan login untuk mencegah brute force.
- **Input Sanitization**: Memastikan deskripsi produk aman dari XSS.
