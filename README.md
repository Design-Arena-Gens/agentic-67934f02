# TabunganKu SD

Sistem tabungan digital sederhana untuk sekolah dasar.

## 🎯 Fitur Utama

- **Login Guru** - Autentikasi dengan Firebase Auth
- **Dashboard Tabungan** - Tabel daftar siswa dengan nama, kelas, dan saldo
- **Tambah Siswa** - Form untuk menambah siswa baru dengan saldo awal
- **Transaksi** - Setor dan tarik tabungan siswa
- **Riwayat** - Otomatis menyimpan semua transaksi ke Firestore

## 🚀 Teknologi

- **Next.js 14** - Framework React dengan App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Styling responsif dan modern
- **Firebase Auth** - Autentikasi guru
- **Firestore** - Database real-time tanpa server

## 📦 Instalasi

```bash
# Install dependencies
npm install

# Setup Firebase
# 1. Buat project di Firebase Console (https://console.firebase.google.com)
# 2. Enable Authentication (Email/Password)
# 3. Enable Firestore Database
# 4. Copy Firebase config ke .env.local

cp .env.example .env.local
# Edit .env.local dengan credentials Firebase Anda

# Run development server
npm run dev

# Build for production
npm run build
npm start
```

## 🔧 Konfigurasi Firebase

1. Buat project baru di [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → Sign-in method → Email/Password
3. Enable **Firestore Database** → Create database → Start in production mode
4. Buat user guru di Authentication → Users → Add user
5. Copy configuration dari Project Settings → General → Your apps
6. Paste ke `.env.local`

### Firestore Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/{student} {
      allow read, write: if request.auth != null;
    }
    match /transactions/{transaction} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🌐 Deploy

Aplikasi ini sudah dideploy di:
**https://agentic-67934f02.vercel.app**

### Deploy Sendiri

```bash
# Deploy ke Vercel
vercel deploy --prod

# Atau deploy ke Firebase Hosting
npm install -g firebase-tools
firebase login
firebase init hosting
npm run build
firebase deploy
```

## 📱 Screenshot

### Login Page
- Simple login form untuk guru
- Validasi email dan password

### Dashboard
- Tabel daftar siswa
- Informasi saldo real-time
- Tombol setor dan tarik per siswa
- Ringkasan total saldo

### Form Transaksi
- Input jumlah uang
- Preview saldo setelah transaksi
- Keterangan opsional
- Validasi saldo untuk penarikan

## 🔐 Keamanan

- Semua halaman dilindungi autentikasi
- Data hanya bisa diakses oleh guru yang login
- Firestore rules melindungi data di server
- Environment variables untuk credentials

## 📝 Struktur Data

### Collection: students
```typescript
{
  nama: string,
  kelas: string,
  saldo: number,
  createdAt: timestamp
}
```

### Collection: transactions
```typescript
{
  studentId: string,
  studentName: string,
  kelas: string,
  type: 'setor' | 'tarik',
  amount: number,
  keterangan: string,
  saldoBefore: number,
  saldoAfter: number,
  timestamp: timestamp
}
```

## 🎨 Desain UI

- **Ringan & Cepat** - Optimized untuk laptop/HP guru
- **Responsif** - Mobile-first design
- **Intuitif** - Interface sederhana dan mudah digunakan
- **Modern** - TailwindCSS dengan color scheme profesional

## 💰 Gratis

- ✅ Firebase Free Tier: 50K read, 20K write/day
- ✅ Vercel Free Tier: Unlimited deployments
- ✅ Tidak ada biaya hosting
- ✅ Cocok untuk sekolah kecil-menengah

## 🤝 Kontribusi

Untuk menambah fitur atau memperbaiki bug:

1. Fork repository
2. Buat branch baru (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

Open source - bebas digunakan untuk keperluan pendidikan
