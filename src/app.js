require('dotenv').config(); // Muat variabel dari .env di baris paling atas

const express = require('express');
const scrapperRoutes = require('./api/scraper');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rute Sambutan
// app.get('/', (req, res) => {
//   res.send('Selamat datang di API Scraper eBay dengan AI! Gunakan endpoint /api/scrape?keyword=... untuk memulai.');
// });

app.use(express.static('public'));  

// Gunakan rute untuk scraper
app.use('/api', scrapperRoutes);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});