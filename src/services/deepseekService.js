const axios = require('axios');

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL;

async function extractDataWithAI(htmlContent, instruction) {
  if (!htmlContent || htmlContent.trim() === '') {
    console.warn("Konten HTML kosong, mengembalikan nilai default.");
    return null;
  }

  try {
    const response = await axios.post(
      `${DEEPSEEK_BASE_URL}/chat/completions`,
      {
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are an expert web scraper. Your task is to extract data from the provided HTML. You MUST ONLY return a raw JSON object without any markdown formatting (like ```json), comments, or explanations.',
          },
          {
            role: 'user',
            content: `${instruction}\n\nHTML:\n${htmlContent}`,
          },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000', 
          'X-Title': 'Ebay Scraper AI Test'
        },
      }
    );

    // PERUBAHAN 2 (PALING PENTING): Validasi respons API sebelum digunakan
    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      console.error('API mengembalikan respons yang tidak valid atau kosong. Isi respons:');
      console.error(JSON.stringify(response.data, null, 2)); // Ini akan menunjukkan error asli dari API
      return null;
    }

    let content = response.data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      content = jsonMatch[0];
    }

    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Gagal mem-parsing JSON dari respons AI:', content);
      return null;
    }

  } catch (error) {
    console.error('Terjadi error saat request ke API. Detail error:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
    return null; 
  }
}

module.exports = { extractDataWithAI };