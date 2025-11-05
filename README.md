# Sistem Monitoring Kesehatan Sapi (Cow Health Monitoring)

Sebuah aplikasi web *full-stack* berbasis IoT yang dirancang untuk pemantauan parameter kesehatan sapi secara *real-time*. Proyek ini bertujuan untuk menyediakan dasbor analitik bagi peternak untuk melacak dan mengelola kesehatan ternak secara proaktif.

-----

## STATUS PENGEMBANGAN

Proyek ini sedang dalam **tahap pengembangan aktif**.

Visi jangka panjangnya adalah untuk memantau tiga parameter kesehatan utama: **Suhu**, **Aktivitas Fisik**, dan **Detak Jantung**.

**Saat ini (Current Stage):**

  * ✅ Fungsionalitas penuh untuk monitoring **Suhu Tubuh**.
  * ✅ Fungsionalitas penuh untuk monitoring **Aktivitas/Gerakan**.
  * ⏳ Modul dan *endpoint* untuk **Detak Jantung** sedang dalam pengembangan dan akan diintegrasikan pada rilis berikutnya.

## Fitur Utama

  * **Autentikasi Pengguna:** Sistem registrasi dan login yang aman menggunakan JSON Web Tokens (JWT) dengan *password hashing* (Bcrypt).
  * **Manajemen Data Master:** Operasi CRUD (Create, Read, Update, Delete) penuh untuk data ternak (Sapi).
  * **Dasbor Suhu Real-time:** Visualisasi data suhu menggunakan grafik (Recharts), dilengkapi dengan riwayat data, nilai rata-rata, dan status sensor.
  * **Dasbor Gerakan Real-time:** Visualisasi data aktivitas fisik (misal: berdiri dan berbaring) beserta riwayat dan analisis dasarnya.
  * **(Roadmap) Dasbor Detak Jantung:** Modul yang sedang disiapkan untuk memantau BPM (*beats per minute*) ternak.
  * **Manajemen Data Sensor:** Fitur untuk mengelola (edit/hapus) data riwayat sensor jika terjadi anomali atau kesalahan input.

## Arsitektur Sistem

Sistem ini dibagi menjadi tiga komponen utama:

1.  **Frontend (Client-side):**

      * Dibangun menggunakan **React 19** dan **Vite** sebagai *build tool*.
      * Bertanggung jawab untuk menyajikan dasbor visualisasi data dan antarmuka manajemen.
      * Menggunakan **Zustand** untuk manajemen state global (seperti status autentikasi).
      * Menggunakan **TailwindCSS** & **Flowbite** untuk UI yang modern dan responsif.

2.  **Backend (Server-side):**

      * Dibangun menggunakan **Node.js** dengan *framework* **Express.js**.
      * Menyediakan RESTful API untuk semua operasi data.
      * Menggunakan **Sequelize** sebagai ORM untuk berinteraksi dengan database **MySQL**.
      * Menangani logika bisnis, autentikasi, dan validasi.

3.  **Hardware (IoT):**

      * Kode purwarupa (`.ino`) disediakan dalam folder `arduino/`.
      * Dirancang untuk mikrokontroler (seperti ESP32/ESP8266) yang dilengkapi sensor untuk membaca data dan mengirimkannya ke *endpoint* backend.

## Tumpukan Teknologi (Tech Stack)

| Kategori | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Frontend** | React (v19) | Library utama untuk membangun *User Interface*. |
| | Vite | *Build tool* modern yang sangat cepat. |
| | React Router DOM | Untuk navigasi dan *routing* sisi klien. |
| | Zustand | Solusi manajemen state yang ringan. |
| | Recharts | Library grafik/chart untuk visualisasi data. |
| | Axios | HTTP Client untuk komunikasi dengan API Backend. |
| | TailwindCSS | *Utility-first* CSS framework. |
| | Flowbite | Komponen UI berbasis Tailwind. |
| **Backend** | Node.js | Lingkungan eksekusi JavaScript sisi server. |
| | Express.js | Framework web minimalis untuk membangun API. |
| | Sequelize | ORM (Object-Relational Mapper) untuk Node.js. |
| | MySQL (`mysql2`) | Database relasional untuk menyimpan data. |
| | JWT & Bcrypt | Untuk autentikasi token dan *hashing password*. |
| | CORS | Middleware untuk mengaktifkan *Cross-Origin Resource Sharing*. |
| **Hardware** | C++/Arduino | Bahasa pemrograman untuk logika mikrokontroler/sensor. |

## Panduan Instalasi & Konfigurasi

Untuk menjalankan proyek ini di lingkungan lokal, Anda perlu menjalankan `backend` dan `frontend` secara terpisah.

### Prasyarat

  * **Node.js** (Rekomendasi v18.x atau lebih baru)
  * **NPM** (Biasanya terinstal bersama Node.js)
  * **Server MySQL** (Contoh: XAMPP, Laragon, WAMP, atau instalasi MySQL Server mandiri)

-----

### 1\. Konfigurasi Backend (API)

Backend akan berjalan secara default di `http://localhost:5000`.

1.  **Navigasi ke folder backend:**

    ```bash
    cd backend
    ```

2.  **Instal dependensi:**

    ```bash
    npm install
    ```

3.  **Siapkan Database:**

      * Pastikan server MySQL Anda berjalan.
      * Buat database baru. Nama database default yang digunakan adalah:
        ```sql
        CREATE DATABASE db_monitoring_sapi;
        ```

4.  **Konfigurasi Koneksi Database:**

      * Salin atau ubah nama file `backend/config/db.js` (jika Anda menggunakan file `.env`, buatlah sekarang).
      * Sesuaikan konfigurasi koneksi di `backend/config/db.js` agar sesuai dengan *credential* MySQL Anda (username, password, host).

    <!-- end list -->

    ```javascript
    // backend/config/db.js
    const db = new Sequelize('db_monitoring_sapi', 'root', '', {
        host: 'localhost',
        dialect: 'mysql',
    });
    ```

    *(Ganti `'root'` dan `''` (password kosong) dengan username dan password Anda)*

5.  **Jalankan Server Backend:**

    ```bash
    npm run dev
    ```

    Server akan berjalan dan Sequelize akan secara otomatis melakukan sinkronisasi tabel (membuat tabel `users`, `cows`, `temperatures`, `activities`) jika belum ada.

-----

### 2\. Konfigurasi Frontend (Dasbor Web)

Frontend akan berjalan secara default di `http://localhost:5173`.

1.  **Buka terminal baru** (biarkan terminal backend tetap berjalan).

2.  **Navigasi ke folder frontend:**

    ```bash
    cd frontend
    ```

3.  **Instal dependensi:**

    ```bash
    npm install
    ```

4.  **Jalankan Server Pengembangan Vite:**

    ```bash
    npm run dev
    ```

5.  **Akses Aplikasi:**

      * Buka browser Anda dan navigasi ke `http://localhost:5173`.
      * Anda dapat memulai dengan mendaftar (register) akun baru.

-----

### 3\. Integrasi Hardware (Perangkat IoT)

Folder `arduino/` berisi kode sampel untuk pembacaan sensor.

  * Kode ini **belum** mencakup logika untuk transmisi data (misalnya, melalui WiFi/HTTP POST).
  * Anda perlu mengadaptasi kode ini untuk perangkat keras spesifik Anda (misal: ESP32, ESP8266, atau Wemos) dan menambahkan fungsionalitas untuk mengirim data ke API backend.

**Endpoint API untuk Perangkat Keras:**

  * **POST** `/api/temperatures`
      * Body (JSON): `{ "cow_id": 1, "temperature": 38.5 }`
  * **POST** `/api/activities`
      * Body (JSON): `{ "cow_id": 1, "activity": "Berjalan" }`

*(Pastikan perangkat IoT Anda terhubung ke jaringan yang sama dengan server backend dan menargetkan IP lokal server Anda, bukan `localhost`)*

## Kontribusi

Kontribusi, *issues*, dan *pull requests* sangat kami hargai untuk pengembangan lebih lanjut.

1.  *Fork* repositori ini.
2.  Buat *branch* fitur baru (`git checkout -b feature/FiturBaru`).
3.  *Commit* perubahan Anda (`git commit -m 'Menambahkan FiturBaru'`).
4.  *Push* ke *branch* Anda (`git push origin feature/FiturBaru`).
5.  Buka *Pull Request*.

-----

*Didistribusikan di bawah Lisensi MIT. Lihat `LICENSE.txt` untuk informasi lebih lanjut.*

