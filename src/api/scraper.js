const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const {
  extractDataWithAI
} = require('../services/deepseekService');

const router = express.Router();

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

router.get('/scrape', async (req, res) => {
  const {
    keyword
  } = req.query;
  if (!keyword) {
    return res.status(400).json({
      error: 'Parameter "keyword" dibutuhkan.'
    });
  }

  // Limit data yang diambil
  const TOTAL_PRODUCT_LIMIT = 20;
  const BATCH_SIZE = 5; // Jumlah item per satu panggilan AI

  try {
    let allProducts = [];
    let currentPage = 1;
    let hasNextPage = true;

    console.log(`Memulai scraping batch untuk keyword: "${keyword}" dengan target ${TOTAL_PRODUCT_LIMIT} produk.`);

    //  Scrape daftar produk  
    while (hasNextPage && allProducts.length < TOTAL_PRODUCT_LIMIT) {
      const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(keyword)}&_pgn=${currentPage}`;
      console.log(`Mengambil data dari halaman: ${currentPage} (Produk terkumpul: ${allProducts.length})`);

      const {
        data: html
      } = await axios.get(searchUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      const $ = cheerio.load(html);

      const items = $('.s-item').toArray(); // Ubah ke array agar mudah di-slice
      console.log(`Ditemukan ${items.length} item di halaman ${currentPage}. Memproses dalam batch...`);

      //  BATCHING 
      const pagePromises = [];
      for (let i = 0; i < items.length; i += BATCH_SIZE) {
        const batchItems = items.slice(i, i + BATCH_SIZE);

        // Gabungkan HTML dari semua item dalam satu batch
        const batchHtml = batchItems.map(item => $(item).html()).join('<hr class="product-separator">');

        const instruction = `
          From this HTML containing multiple product items separated by "<hr class="product-separator">", extract an array of products. 
          The JSON response should be structured as: {"products": [{"name": "...", "price": "...", "url": "...", "imageUrl": "..."}]}.
          For each item, extract its:
          1. 'name': from the 'h3' tag.
          2. 'price': from the element with class 's-item__price'.
          3. 'url': the href from the 'a' tag.
          4. 'imageUrl': the 'src' attribute from the 'img' tag with class 's-card__image'.
          If any field is missing, use "-".
        `;

        // Tambahkan promise untuk setiap batch ke dalam array
        pagePromises.push(extractDataWithAI(batchHtml, instruction));
      }

      // Jalankan semua permintaan batch untuk halaman ini secara paralel
      const batchResults = await Promise.all(pagePromises);

      // Ratakan hasil dari semua batch menjadi satu array produk
      const productsFromPage = batchResults.flatMap(result => (result && result.products) ? result.products : []);
      const validProducts = productsFromPage.filter(p => p && p.name && p.url && !p.url.includes('ebay.com/itm/123456'));

      if (validProducts.length > 0) {
        allProducts.push(...validProducts);
        console.log(`Berhasil mengekstrak ${validProducts.length} produk dari halaman ini. Total: ${allProducts.length}`);
      }

      const nextButton = $('.pagination__next');
      hasNextPage = nextButton.length > 0 && nextButton.attr('href');


      if (currentPage >= 2) {
          console.log("Mencapai batas 2 halaman, scraping daftar produk dihentikan.");
          hasNextPage = false;
      }
      currentPage++;
      await sleep(1000);
    }

    // Membatasi scraping
    const limitedProducts = allProducts.slice(0, TOTAL_PRODUCT_LIMIT);
    console.log(`Pengambilan daftar produk selesai. Total produk yang akan diproses: ${limitedProducts.length}.`);

    // src/api/scrapper.js

    // --- Langkah 2: Mengambil deskripsi untuk 20 produk ---
    for (const product of limitedProducts) {
      if (!product.url || product.url === '-' || !product.url.startsWith('http')) {
        product.description = '-';
        continue;
      }
      try {
        console.log(`  -> Mengambil deskripsi untuk: ${product.name.substring(0, 40)}...`);
        const {
          data: detailHtml
        } = await axios.get(product.url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          }
        });
        const $detail = cheerio.load(detailHtml);
        const iframeSrc = $detail('#desc_ifr').attr('src');
        if (iframeSrc) {
          const {
            data: iframeHtml
          } = await axios.get(iframeSrc);
          const $iframe = cheerio.load(iframeHtml);
          const descriptionHtml = $iframe('#ds_div').html() || $iframe('body').html();
          if (descriptionHtml) {
            const shortHtml = descriptionHtml.substring(0, 15000);

            // PERBAIKAN 1: Instruksi AI yang jauh lebih jelas dan spesifik
            const descriptionInstruction = `
          From the provided HTML snippet of a product description, extract the plain text content.
          The JSON response MUST be in the format: { "description": "..." }.
          The value of the "description" key MUST be a single string.
        `;
            const extractedDescription = await extractDataWithAI(shortHtml, descriptionInstruction);

            // PERBAIKAN 2: Validasi tipe data sebelum di-assign
            if (extractedDescription && typeof extractedDescription.description === 'string') {
              product.description = extractedDescription.description;
            } else {
              product.description = '-';
            }
          } else {
            product.description = '-';
          }
        } else {
          product.description = '-';
        }
      } catch (detailError) {
        product.description = '-';
      }
      await sleep(500);
    }

    console.log("Scraping selesai.");
    res.status(200).json({
      total_products: limitedProducts.length,
      keyword: keyword,
      products: limitedProducts
    });

  } catch (error) {
    console.error('Terjadi error fatal pada proses scraping:', error);
    res.status(500).json({
      error: 'Terjadi kegagalan internal pada server.'
    });
  }
});

module.exports = router;