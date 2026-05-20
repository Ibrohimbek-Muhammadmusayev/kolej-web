document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api';

    // 1. News Details Logic
    const newsContainer = document.getElementById('news-detail-container');
    if (newsContainer) {
        const urlParams = new URLSearchParams(window.location.search);
        const newsId = urlParams.get('id');

        if (newsId) {
            fetchNewsDetails(newsId);
        } else {
            showError(newsContainer, "Yangilik ID topilmadi.");
        }
    }

    // 2. News List Logic
    const newsListContainer = document.getElementById('news-list-container');
    if (newsListContainer) {
        fetchNewsList();
    }

    // --- Functions ---

    async function fetchNewsDetails(id) {
        try {
            const res = await fetch(`${API_URL}/news/${id}`);
            if (!res.ok) throw new Error('Yangilik topilmadi');
            const item = await res.json();
            renderNewsDetails(item);
        } catch (error) {
            console.error(error);
            showError(newsContainer, "Yangilikni yuklashda xatolik yuz berdi yoki u mavjud emas.");
        }
    }

    async function fetchNewsList() {
        try {
            // Show loading state?
            newsListContainer.innerHTML = '<div class="col-span-full text-center py-12">Yuklanmoqda...</div>';

            const res = await fetch(`${API_URL}/news`);
            if (!res.ok) throw new Error('Server xatosi');
            const news = await res.json();

            renderNewsList(news);
        } catch (error) {
            console.error(error);
            newsListContainer.innerHTML = '<div class="col-span-full text-center py-12 text-red-500">Yangiliklarni yuklashning imkoni bo\'lmadi.</div>';
        }
    }

    function renderNewsDetails(item) {
        // Handle Media logic
        let mediaHtml = '';
        if (item.media && item.media.length > 0) {
            // Carousel Logic
            const slidesHtml = item.media.map((m, index) => {
                let content = '';
                // Check if absolute URL or relative path
                const src = m.src.startsWith('http') ? m.src : m.src;

                if (m.type === 'video') {
                    content = `
                        <video controls class="w-full h-full object-contain max-h-[500px]">
                            <source src="${src}" type="video/mp4">
                            Your browser does not support the video tag.
                        </video>
                    `;
                } else {
                    content = `<img src="${src}" alt="${item.title}" class="w-full h-full object-cover">`;
                }
                return `
                    <div class="news-carousel-slide absolute inset-0 transition-opacity duration-500 ${index === 0 ? 'opacity-100' : 'opacity-0'}" data-index="${index}">
                        ${content}
                    </div>
                `;
            }).join('');

            const arrowsHtml = item.media.length > 1 ? `
                <button id="news-prev" class="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <button id="news-next" class="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
            ` : '';

            const indicatorsHtml = item.media.length > 1 ? `
                <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                    ${item.media.map((_, index) => `
                        <button class="news-indicator w-2 h-2 rounded-full transition-all ${index === 0 ? 'bg-white w-4' : 'bg-white/50'}" data-index="${index}"></button>
                    `).join('')}
                </div>
            ` : '';

            mediaHtml = `
                <div class="relative h-64 md:h-[500px] w-full bg-black overflow-hidden group rounded-t-lg">
                    ${slidesHtml}
                    ${arrowsHtml}
                    ${indicatorsHtml}
                </div>
            `;
        }

        newsContainer.innerHTML = `
            ${mediaHtml}
            <div class="p-6 md:p-12">
                <div class="max-w-4xl mx-auto">
                    <div class="mb-6 flex items-center text-sm text-gray-500 dark:text-gray-400">
                         <span class="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">Yangiliklar</span>
                         <span class="mx-2">•</span>
                         <span>${new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">${item.title}</h1>
                    <div class="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                        ${item.content}
                    </div>
                    
                    <div class="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                        <div class="flex items-center justify-between">
                            <span class="text-gray-500 dark:text-gray-400 text-sm">Ushbu yangilikni ulashing:</span>
                            <div class="flex space-x-3">
                                <button id="share-telegram" class="text-blue-500 hover:text-blue-600 transition-colors" title="Telegramda ulashish">
                                    <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.944 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                                </button>
                                <button id="share-copy" class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors" title="Nusxa olish">
                                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Initialize Carousel & Share
        initCarousel(newsContainer, item);
        initShare(item);

        // Related News
        if (item.related && item.related.length > 0) {
            renderRelatedNews(item.related);
        } else {
            const relatedSection = document.querySelector('.container.mx-auto.px-4 > div.mt-16');
            if (relatedSection) relatedSection.style.display = 'none';
        }
    }

    function renderNewsList(newsList) {
        newsListContainer.innerHTML = '';
        if (newsList.length === 0) {
            newsListContainer.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500">Hozircha yangiliklar yo\'q.</div>';
            return;
        }

        newsList.forEach((item, index) => {
            const firstMedia = item.media && item.media.length > 0 ? item.media[0] : null;
            const thumbSrc = firstMedia ? firstMedia.src : 'https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM='; // Default placeholder

            const html = `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                    <div class="relative overflow-hidden h-48 shrink-0">
                        <img src="${thumbSrc}" alt="${item.title}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                        <div class="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-4 rounded-full text-xs font-bold">${new Date(item.date).toLocaleDateString()}</div>
                        ${firstMedia && firstMedia.type === 'video' ? '<div class="absolute inset-0 flex items-center justify-center bg-black/30"><svg class="w-12 h-12 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>' : ''}
                    </div>
                    <div class="p-6 flex flex-col flex-grow">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">${item.title}</h3>
                        <div class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 prose dark:prose-invert text-sm">
                            ${item.content.replace(/<[^>]*>?/gm, '')} 
                        </div>
                        <div class="mt-auto">
                             <a href="news-details.html?id=${item.id}" class="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                                Batafsil
                                <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                            </a>
                        </div>
                    </div>
                </div>
             `;
            newsListContainer.insertAdjacentHTML('beforeend', html);
        });
    }

    function renderRelatedNews(relatedItems) {
        const relatedContainer = document.getElementById('related-news-container');
        if (!relatedContainer) return;
        relatedContainer.innerHTML = '';

        relatedItems.forEach(rItem => {
            const firstMedia = rItem.media && rItem.media.length > 0 ? rItem.media[0] : null;
            const thumbSrc = firstMedia ? firstMedia.src : 'https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM=';

            const html = `
                <a href="news-details.html?id=${rItem.id}" class="block bg-white dark:bg-gray-700 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all group h-full flex flex-col">
                    <div class="relative h-48 overflow-hidden shrink-0">
                         <img src="${thumbSrc}" alt="${rItem.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500">
                         ${firstMedia && firstMedia.type === 'video' ? '<div class="absolute inset-0 flex items-center justify-center bg-black/30"><svg class="w-12 h-12 text-white opacity-80" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></div>' : ''}
                    </div>
                    <div class="p-6 flex flex-col flex-grow">
                        <span class="text-xs text-blue-500 font-bold mb-2 block">${new Date(rItem.date).toLocaleDateString()}</span>
                        <h4 class="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-500 transition-colors">${rItem.title}</h4>
                    </div>
                </a>
             `;
            relatedContainer.insertAdjacentHTML('beforeend', html);
        });
    }

    function initCarousel(container, item) {
        if (!item.media || item.media.length <= 1) return;

        let currentSlide = 0;
        const slides = container.querySelectorAll('.news-carousel-slide');
        const indicators = container.querySelectorAll('.news-indicator');
        const prevBtn = document.getElementById('news-prev');
        const nextBtn = document.getElementById('news-next');

        const updateCarousel = (index) => {
            slides.forEach((slide, i) => {
                const vid = slide.querySelector('video');
                if (i === index) {
                    slide.classList.remove('opacity-0');
                    slide.classList.add('opacity-100');
                } else {
                    slide.classList.remove('opacity-100');
                    slide.classList.add('opacity-0');
                    if (vid) vid.pause();
                }
            });

            indicators.forEach((ind, i) => {
                if (i === index) {
                    ind.classList.remove('bg-white/50', 'w-2');
                    ind.classList.add('bg-white', 'w-4');
                } else {
                    ind.classList.remove('bg-white', 'w-4');
                    ind.classList.add('bg-white/50', 'w-2');
                }
            });
            currentSlide = index;
        };

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                const newIndex = (currentSlide - 1 + slides.length) % slides.length;
                updateCarousel(newIndex);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const newIndex = (currentSlide + 1) % slides.length;
                updateCarousel(newIndex);
            });
        }

        indicators.forEach((ind) => {
            ind.addEventListener('click', () => {
                const index = parseInt(ind.getAttribute('data-index'));
                updateCarousel(index);
            });
        });
    }

    function initShare(item) {
        const telegramBtn = document.getElementById('share-telegram');
        const copyBtn = document.getElementById('share-copy');

        if (telegramBtn) {
            telegramBtn.addEventListener('click', () => {
                const url = encodeURIComponent(window.location.href);
                const text = encodeURIComponent(item.title);
                window.open(`https://t.me/share/url?url=${url}&text=${text}`, '_blank');
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText(window.location.href).then(() => {
                    const originalContent = copyBtn.innerHTML;
                    copyBtn.innerHTML = `<svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>`;
                    setTimeout(() => {
                        copyBtn.innerHTML = originalContent;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy: ', err);
                });
            });
        }
    }

    function showError(container, message) {
        container.innerHTML = `
            <div class="p-12 text-center">
                <h2 class="text-2xl font-bold text-red-500 mb-4">Xatolik</h2>
                <p class="text-gray-700 dark:text-gray-300">${message}</p>
                <a href="news.html" class="inline-block mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Ortga qaytish</a>
            </div>
        `;
        const relatedSection = document.querySelector('.container.mx-auto.px-4 > div.mt-16');
        if (relatedSection) relatedSection.style.display = 'none';
    }
});
