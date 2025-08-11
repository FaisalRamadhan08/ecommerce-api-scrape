

document.addEventListener('DOMContentLoaded', () => {
    // Referensi Elemen DOM
    const searchForm = document.getElementById('search-form');
    const keywordInput = document.getElementById('keyword-input');
    const searchButton = document.getElementById('search-button');
    const statusContainer = document.getElementById('status-container');
    const outputContainer = document.getElementById('output-container');
    const cardResultsContainer = document.getElementById('card-results-container');
    const jsonViewerCode = document.querySelector('#json-view-pane code');

    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const keyword = keywordInput.value.trim();
        if (!keyword) return;

        let hasError = false;
        searchButton.disabled = true;
        outputContainer.classList.add('d-none'); // Sembunyikan hasil lama
        statusContainer.innerHTML = `
            <div class="status-card">
                <div class="spinner"></div>
                <span>Scraping data untuk <strong>"${keyword}"</strong>... Ini mungkin butuh waktu.</span>
            </div>
        `;

        try {
            const response = await fetch(`/api/scrape?keyword=${encodeURIComponent(keyword)}`);
            if (!response.ok) {
                hasError = true;
                const errorData = await response.json();
                throw new Error(errorData.error || 'Terjadi kesalahan pada server.');
            }
            
            const data = await response.json();
            renderCardView(data.products);
            renderJsonView(data);
            outputContainer.classList.remove('d-none');

        } catch (error) {
            hasError = true;
            console.error('Error:', error);
            statusContainer.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
        } finally {
            if (!hasError) {
                statusContainer.innerHTML = ''; 
            }
            searchButton.disabled = false;
        }
    });

    function renderCardView(products) {
        cardResultsContainer.innerHTML = '';
        if (!products || products.length === 0) {
            cardResultsContainer.innerHTML = '<div class="col-12"><p class="text-center text-muted mt-4">Tidak ada produk yang ditemukan.</p></div>';
            return;
        }

        products.forEach(product => {
            const col = document.createElement('div');
            col.className = 'col';

            const imageHtml = (product.imageUrl && product.imageUrl !== '-')
                ? `<img src="${product.imageUrl}" alt="${product.name}" class="card-img-top product-image">`
                : `<div class="card-img-top product-image-placeholder d-flex align-items-center justify-content-center text-muted">Tidak Ada Gambar</div>`;
            
            let displayDescription = 'Tidak tersedia';
            if (product.description && typeof product.description === 'string' && product.description !== '-') {
                displayDescription = product.description;
            }

            col.innerHTML = `
                <div class="card h-100 shadow-sm product-card">
                    ${imageHtml}
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title product-name">${product.name}</h5>
                        <p class="card-text fw-bold text-success mb-2 product-price">${product.price}</p>
                        <p class="card-text text-muted small product-description mt-auto">${displayDescription}</p>
                        <a href="${product.url}" target="_blank" class="btn btn-outline-primary btn-sm mt-3">Lihat di eBay</a>
                    </div>
                </div>
            `;
            cardResultsContainer.appendChild(col);
        });
    }

    function renderJsonView(data) {
        jsonViewerCode.textContent = JSON.stringify(data, null, 2);
    }
});