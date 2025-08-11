
# eBay AI Scraper 🤖

Selamat datang di eBay AI Scraper, aplikasi web yang dirancang untuk mengekstrak data produk dari situs eBay. Proyek ini menggunakan Cheerio untuk navigasi struktur dan kecerdasan AI untuk ekstraksi data yang akurat dari konten HTML.

Aplikasi ini memungkinkan pengguna untuk memasukkan kata kunci, melihat proses scraping secara langsung, dan menampilkan hasilnya dalam format visual  atau format JSON.


## ✨ Fitur Utama

- Scraping Berbasis Kata Kunci: Cari produk apa pun di eBay hanya dengan memasukkan kata kunci.

- Ekstraksi Data : Menggunakan AI untuk mengekstrak atribut penting seperti nama produk, harga, URL, deskripsi dan gambar.

- Pemrosesan Batch yang Efisien: Menghemat penggunaan token AI dengan memproses beberapa produk dalam satu permintaan API.

- Tampilan Hasil Ganda: Beralih dengan mudah antara Preview dan Tampilan JSON untuk melihat data mentah.

- Manajemen Paginasi: Secara otomatis menavigasi beberapa halaman hasil pencarian hingga batas yang ditentukan.


## 🛠️ Tech Stack


**Backend**: Node.js, Express.js

**HTTP Client**: Axios

**Scraping & Parsing**: Cheerio

**Integrasi AI**: OpenRouter API (dengan model seperti Mistral/Deepseek)

**Frontend**: HTML5, CSS3, JavaScript (Vanilla)

**UI Framework**: Bootstrap 5


## ⚙️ Prasyarat

Sebelum memulai, pastikan telah menginstal perangkat lunak berikut:

- Node.js (v18.x atau lebih baru direkomendasikan)

- npm (biasanya terinstal bersama Node.js)
## Installation

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di lokal.

1. Clone repositori ini:
```bash
  git clone https://github.com/faislrmd08/ecommerce.git
```
2. Masuk ke direktori proyek:
```bash
  cd ecommerce
```
3. Install semua dependensi yang dibutuhkan:
```bash
  npm install
```
4. Buat file ```.env```:
```bash
# Ganti dengan API Key Anda dari OpenRouter
DEEPSEEK_API_KEY='sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
DEEPSEEK_BASE_URL='https://openrouter.ai/api/v1'

# Port untuk server (opsional, default 3000)
PORT=3000
```
5. Buat API Key
- Masuk ke halaman website [openrouter.ai](https://openrouter.ai/)
- Cari ```DeepSeek: R1 0528```
- Masuk ke bagian API, Create API Key

## Run Project
Setelah proses pengaturan selesai, jalankan server dengan perintah berikut:
```bash
npm run dev
```
Server akan aktif dan berjalan. akan melihat pesan di terminal:
```
Server berjalan di http://localhost:3000
UI dapat diakses di http://localhost:3000
```
## 📖 Cara Menggunakan

- Buka browser web dan kunjungi http://localhost:3000.

- Akan melihat halaman utama dengan sebuah form pencarian.

- Masukkan kata kunci produk yang ingin dicari (misalnya, nike).

- Tekan tombol "Scrape".

- Sebuah indikator loading akan muncul, menandakan proses scraping sedang berjalan di backend. Proses ini mungkin memakan waktu beberapa saat.

- Setelah selesai, hasilnya akan muncul dalam dua tab:

- Preview: Menampilkan produk dalam kartu-kartu visual yang mudah dilihat.

- Tampilan JSON: Menampilkan data mentah dalam format JSON yang terstruktur.

