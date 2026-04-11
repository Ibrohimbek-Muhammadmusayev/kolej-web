const API_URL = '/api';
const DEFAULT_LANG = 'uz';

class CMS {
    constructor() {
        this.lang = localStorage.getItem('site_lang') || DEFAULT_LANG;
        this.settings = {};
        this.translations = {};
        this.init();
    }

    async init() {
        this.setupLanguageSwitcher();
        await this.fetchSettings();
        this.updateStaticContent();

        // Ensure loader is hidden if it wasn't hidden by the load event (e.g. SPA navigation logic)
        // But UI.init handles the initial load event.

        const path = window.location.pathname;
        try {
            if (path === '/' || path.endsWith('index.html')) {
                await this.loadHomePage();
            } else if (path.includes('sohalar')) {
                await this.loadFieldsPage();
            } else if (path.includes('field-details')) {
                await this.loadFieldDetails();
            } else if (path.includes('news')) {
                await this.loadNewsPage();
            } else if (path.includes('about')) {
                await this.loadAboutPage();
            } else if (path.includes('contact')) {
                await this.loadContactPage();
            }
        } catch (error) {
            console.error("Page load error:", error);
            UI.showToast("Sahifani yuklashda xatolik yuz berdi. Iltimos qayta urinib ko'ring.", 'error');
        }

        this.translateUI();
    }

    // --- UTILS ---
    get(obj, key) {
        if (!obj) return '';
        return obj[`${key}_${this.lang}`] || obj[`${key}_uz`] || obj[key] || '';
    }

    // Helper for safe fetching
    async safeFetch(url, options = {}) {
        try {
            const res = await fetch(url, options);
            if (!res.ok) {
                if (res.status === 404) throw new Error('Not Found');
                throw new Error(`Server xatosi: ${res.status}`);
            }
            return await res.json();
        } catch (e) {
            console.error(`Fetch error for ${url}:`, e);
            throw e; // Re-throw to be handled by caller if specific logic needed, or generic catch
        }
    }

    setupLanguageSwitcher() {
        document.querySelectorAll('a[data-lang]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const newLang = btn.getAttribute('data-lang');
                this.setLanguage(newLang);
            });
        });

        // Active State
        const activeBtn = document.querySelector(`a[data-lang="${this.lang}"]`);
        if (activeBtn) {
            const svg = activeBtn.querySelector('svg');
            if (svg) svg.classList.remove('hidden');
        }
    }

    setLanguage(lang) {
        localStorage.setItem('site_lang', lang);
        this.lang = lang;
        window.location.reload();
    }

    translateUI() {
        // Future: Fetch dictionary and update [data-i18n] keys
    }

    // --- FETCHING ---
    async fetchSettings() {
        try {
            this.settings = await this.safeFetch(`${API_URL}/settings`);
        } catch (e) {
            console.error('Failed to fetch settings', e);
            // Don't show toast for settings as it might be non-critical or silent fail
        }
    }

    updateStaticContent() {
        if (Object.keys(this.settings).length === 0) return;

        // Hero Title
        const heroTitle = document.querySelector('[data-i18n="hero-title"]');
        if (heroTitle) heroTitle.textContent = this.get(this.settings, 'hero_title');

        // Footer Contact Info
        const footerAddr = document.querySelector('[data-i18n="footer-address"]');
        if (footerAddr) footerAddr.innerHTML = this.get(this.settings, 'contact_address');

        const footerPhone = document.querySelector('[data-i18n="footer-phone"]');
        if (footerPhone && this.settings.contact_phone) footerPhone.textContent = this.settings.contact_phone;

        const footerEmail = document.querySelector('[data-i18n="footer-email"]');
        if (footerEmail && this.settings.contact_email) footerEmail.textContent = this.settings.contact_email;
    }

    // --- HOME PAGE ---
    async loadHomePage() {
        await Promise.all([
            this.fetchHeroSlides(),
            this.fetchLatestNews(),
            this.fetchFeaturedFields(),
            this.fetchStats(),
            this.fetchActiveStudents()
        ]);
    }

    async fetchHeroSlides() {
        const container = document.getElementById('hero-carousel-track');
        if (!container) return;

        try {
            const slides = await this.safeFetch(`${API_URL}/hero`);

            if (slides.length === 0) {
                // Fallback to default if no slides
                container.innerHTML = `
                    <div class="carousel-slide absolute w-full h-full bg-cover bg-center transition-all duration-300 opacity-100 filter brightness-75 dark:brightness-50"
                        style="background-image: url('https://picsum.photos/1920/1080?random=1')"></div>
                `;
                return;
            }

            container.innerHTML = slides.map((slide, index) => {
                const isActive = index === 0;
                let mediaHtml = '';

                if (slide.media_type === 'video') {
                    mediaHtml = `
                        <video class="w-full h-full object-cover" ${isActive ? 'autoplay' : ''} muted loop playsinline>
                            <source src="${slide.media_url}" type="video/mp4">
                        </video>
                    `;
                } else {
                    mediaHtml = `<img src="${slide.media_url}" class="w-full h-full object-cover">`;
                }

                return `
                    <div class="carousel-slide absolute w-full h-full transition-all duration-500 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'} filter brightness-75 dark:brightness-50">
                        ${mediaHtml}
                        <div class="absolute bottom-20 left-0 w-full p-8 md:p-16 text-center text-white z-20">
                            <h2 class="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">${slide.title || ''}</h2>
                            <p class="text-lg md:text-2xl drop-shadow-md max-w-3xl mx-auto">${slide.description || ''}</p>
                        </div>
                    </div>
                `;
            }).join('');

            this.initHeroCarousel(container);

        } catch (error) {
            console.error('Hero Load Error:', error);
            // Fallback
            container.innerHTML = `
                    <div class="carousel-slide absolute w-full h-full bg-cover bg-center"
                        style="background-image: url('images/hero-bg.jpg')"></div>
                `;
        }
    }

    initHeroCarousel(container) {
        const slides = container.querySelectorAll('.carousel-slide');
        if (slides.length < 2) return;

        let currentSlide = 0;
        const totalSlides = slides.length;
        let timer;

        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                const video = slide.querySelector('video');
                if (i === index) {
                    slide.classList.remove('opacity-0', 'z-0');
                    slide.classList.add('opacity-100', 'z-10');
                    if (video) video.play().catch(e => console.log("Autoplay blocked", e));
                } else {
                    slide.classList.remove('opacity-100', 'z-10');
                    slide.classList.add('opacity-0', 'z-0');
                    if (video) {
                        video.pause();
                        video.currentTime = 0;
                    }
                }
            });
        };

        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        };

        const prevSlide = () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(currentSlide);
        };

        // Attach controls from index.html (outside the track)
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');

        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.preventDefault();
                nextSlide();
                resetTimer();
            };
        }
        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.preventDefault();
                prevSlide();
                resetTimer();
            };
        }

        const resetTimer = () => {
            clearInterval(timer);
            timer = setInterval(nextSlide, 7000);
        };

        // Start Auto Play
        timer = setInterval(nextSlide, 7000);
    }

    async fetchLatestNews() {
        const container = document.getElementById('home-news-container');
        if (!container) return;

        try {
            const data = await this.safeFetch(`${API_URL}/news?limit=5`);
            const news = data.rows || data;

            if (news.length === 0) {
                container.innerHTML = `<div class="p-10 text-center text-gray-500">Hozircha yangiliklar yo'q.</div>`;
                return;
            }

            // Render Slides
            container.innerHTML = news.map((item, index) => {
                // Determine image URL
                let imgUrl = item.image_url;
                if (!imgUrl) {
                    imgUrl = 'https://picsum.photos/1200/600';
                } else if (!imgUrl.startsWith('http') && !imgUrl.startsWith('/')) {
                    imgUrl = `${API_URL.replace('/api', '')}/uploads/${imgUrl}`;
                }

                return `
                <div class="news-slide absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 transition-opacity duration-500 ease-in-out ${index === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}">
                    <img src="${imgUrl}" class="absolute w-full h-full object-cover opacity-60">
                    <div class="relative z-10 text-center text-white px-4 max-w-4xl">
                        <span class="inline-block px-3 py-1 bg-blue-600 rounded-full text-sm font-semibold mb-4 animate-fadeIn">
                             ${item.category || 'Yangilik'}
                        </span>
                        <h2 class="text-3xl md:text-5xl font-bold mb-4 animate-slideUp">${this.get(item, 'title')}</h2>
                        <a href="news-details.html?id=${item.id}" class="inline-block border-2 border-white px-8 py-3 rounded-full hover:bg-white hover:text-gray-900 transition-all font-bold tracking-wide animate-slideUp delay-100">
                            Batafsil O'qish
                        </a>
                    </div>
                </div>
            `}).join('');

            // Initialize Carousel Logic
            this.initNewsCarousel(container);

        } catch (e) {
            console.error(e);
            container.innerHTML = `<div class="p-10 text-center text-red-500">Yangiliklarni yuklab bo'lmadi.</div>`;
        }
    }

    initNewsCarousel(container) {
        const slides = container.querySelectorAll('.news-slide');
        if (slides.length < 2) return;

        let currentSlide = 0;
        const totalSlides = slides.length;

        const showSlide = (index) => {
            slides.forEach((slide, i) => {
                if (i === index) {
                    slide.classList.remove('opacity-0', 'z-0');
                    slide.classList.add('opacity-100', 'z-10');
                } else {
                    slide.classList.remove('opacity-100', 'z-10');
                    slide.classList.add('opacity-0', 'z-0');
                }
            });
        };

        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        };

        const prevSlide = () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(currentSlide);
        };

        // Controls
        const nextBtn = document.getElementById('info-next');
        const prevBtn = document.getElementById('info-prev');

        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.preventDefault();
                nextSlide();
                resetTimer();
            };
        }
        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.preventDefault();
                prevSlide();
                resetTimer();
            };
        }

        // Auto Play
        let timer = setInterval(nextSlide, 5000);

        const resetTimer = () => {
            clearInterval(timer);
            timer = setInterval(nextSlide, 5000);
        };
    }

    async fetchFeaturedFields() {
        const container = document.getElementById('home-fields-container');
        if (!container) {
            console.error('Home fields container not found');
            return;
        }
        try {
            console.log('Fetching fields for home...');
            let fields = await this.safeFetch(`${API_URL}/fields?random=true`);
            console.log('Fields fetched:', fields);

            if (!Array.isArray(fields)) {
                console.error('Fields is not an array:', fields);
                return;
            }

            fields = fields.slice(0, 3); // Take 3

            container.innerHTML = fields.map(field => {
                let imgUrl = field.image_url || field.icon_url;
                if (!imgUrl) {
                    imgUrl = 'https://picsum.photos/800/600';
                } else if (!imgUrl.startsWith('http') && !imgUrl.startsWith('/')) {
                    imgUrl = `${API_URL.replace('/api', '')}/uploads/${imgUrl}`;
                }

                let iconUrl = field.icon_url;
                if (!iconUrl) {
                    iconUrl = 'https://picsum.photos/400/300';
                } else if (!iconUrl.startsWith('http') && !iconUrl.startsWith('/')) {
                    iconUrl = `${API_URL.replace('/api', '')}/uploads/${iconUrl}`;
                }

                return `
                 <div class="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:-translate-y-2 transition-all duration-300">
                    <div class="h-48 overflow-hidden">
                        <img src="${imgUrl}" alt="${this.get(field, 'title')}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500">
                    </div>
                    <div class="p-8">
                        <div class="absolute top-4 right-4 bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                           <img src="${field.icon_url}" class="w-8 h-8 rounded-full"> 
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 transition-colors">
                            ${this.get(field, 'title')}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-300 line-clamp-3 mb-6">
                            ${this.get(field, 'description')}
                        </p>
                        <a href="field-details.html?slug=${field.slug}" class="inline-flex items-center text-blue-600 dark:text-blue-400 font-bold group-hover:translate-x-2 transition-transform">
                            Batafsil
                            <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </a>
                    </div>
                 </div>
            `;
            }).join('');
        } catch (e) {
            console.error(e);
            container.innerHTML = `<div class="col-span-full text-center text-red-500">Sohalarni yuklashda xatolik.</div>`;
        }
    }

    async fetchStats() {
        try {
            const stats = await this.safeFetch(`${API_URL}/stats`);

            // Map known stats to IDs
            const mapping = {
                'students_count': 'stat-students',
                'fields_count': 'stat-fields',
                'entrants_percent': ['stat-uni', 'stat-uni-achieve'],
                'soft_eng_percent': 'stat-soft',
                'net_percent': 'stat-net',
                'account_percent': 'stat-account'
            };

            stats.forEach(s => {
                const target = mapping[s.key];
                const ids = Array.isArray(target) ? target : (target ? [target] : []);

                ids.forEach(id => {
                    const el = document.getElementById(id);
                    if (el) {
                        const numericValue = parseFloat(String(s.value).replace(/[^0-9.]/g, ''));
                        if (!isNaN(numericValue)) {
                            el.setAttribute('data-target', numericValue);

                            if (el.classList.contains('started') || el.textContent !== '0') {
                                // If the intersection observer already ran, restart it for the new dynamic number
                                el.classList.remove('started', 'finished');
                                el.textContent = '0'; // reset visually

                                // Manually fire animation logic for just this element since observer already fired
                                const duration = 2000;
                                const increment = numericValue / (duration / 16);
                                let current = 0;

                                const updateCounter = () => {
                                    current += increment;
                                    if (current < numericValue) {
                                        el.textContent = Math.ceil(current);
                                        requestAnimationFrame(updateCounter);
                                    } else {
                                        el.textContent = numericValue;
                                        el.classList.add('finished');
                                    }
                                };
                                updateCounter();
                            }
                            const container = el.closest('.mb-8');
                            if (container) {
                                const bar = container.querySelector('.bar-chart-fill');
                                if (bar) {
                                    setTimeout(() => {
                                        bar.setAttribute('data-width', numericValue + '%');
                                        if (bar.classList.contains('started')) {
                                            bar.style.width = numericValue + '%';
                                        }
                                    }, 100);
                                }
                            }
                        }
                    }
                });
            });
        } catch (e) {
            console.error('Stats loading failed:', e);
        }
    }

    async fetchActiveStudents() {
        const container = document.getElementById('students-scroll');
        if (!container) return;
        try {
            const students = await this.safeFetch(`${API_URL}/students`);

            container.innerHTML = students.map(s => `
                <div class="min-w-[300px] md:min-w-[350px] bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 shadow-lg snap-center text-center transform hover:-translate-y-2 transition-transform duration-300 border border-gray-100 dark:border-gray-600">
                    <img src="${s.image_url || 'https://randomuser.me/api/portraits/men/1.jpg'}" alt="${this.get(s, 'full_name')}" class="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500 object-cover">
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white">${this.get(s, 'full_name')}</h3>
                    <p class="text-blue-600 dark:text-blue-400 mb-2 font-medium">${this.get(s, 'field')}</p>
                    <p class="text-gray-600 dark:text-gray-300 text-sm italic">"${this.get(s, 'achievement')}"</p>
                </div>
            `).join('');
        } catch (e) { }
    }

    // --- FIELDS PAGE ---
    async loadFieldsPage() {
        const container = document.getElementById('fields-container');
        if (!container) return;
        try {
            const fields = await this.safeFetch(`${API_URL}/fields?random=true`);
            container.innerHTML = fields.map(field => `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 relative h-full flex flex-col"
                    onclick="window.location.href='field-details.html?slug=${field.slug}'">
                    ${field.is_new ? '<span class="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">YANGI</span>' : ''}
                    <img src="${field.image_url || field.icon_url}" alt="${this.get(field, 'title')}" class="w-full h-48 object-cover">
                    <div class="p-6 flex-grow flex flex-col">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">${this.get(field, 'title')}</h3>
                        <p class="text-gray-700 dark:text-gray-300 line-clamp-3 mb-4 flex-grow">${this.get(field, 'description')}</p>
                        <a href="field-details.html?slug=${field.slug}" class="text-blue-600 hover:text-blue-800 font-bold mt-auto inline-block">Batafsil &rarr;</a>
                    </div>
                </div>
            `).join('');
        } catch (e) {
            UI.showToast("Sohalar ro'yxatini yuklab bo'lmadi", 'error');
        }
    }

    async loadFieldDetails() {
        const container = document.getElementById('detail-container');
        const urlParams = new URLSearchParams(window.location.search);
        const slug = urlParams.get('slug');
        if (!slug || !container) return;

        try {
            const field = await this.safeFetch(`${API_URL}/fields/${slug}`);

            container.innerHTML = `
                <div class="relative h-64 md:h-96">
                    <img src="${field.image_url || field.icon_url}" alt="${this.get(field, 'title')}" class="w-full h-full object-cover">
                    <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div class="text-center">
                            <h1 class="text-4xl md:text-5xl font-bold text-white px-4 mb-4">${this.get(field, 'title')}</h1>
                            ${field.apply_url ? `
                            <a href="${field.apply_url}" target="_blank" rel="noopener noreferrer" class="inline-block px-8 py-3 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all transform hover:-translate-y-1">
                                Hujjat Topshirish
                            </a>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="p-8 md:p-12">
                    <div class="max-w-4xl mx-auto">
                        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Soha haqida</h2>
                        <div class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-8 prose dark:prose-invert max-w-none">
                            ${this.get(field, 'description')}
                        </div>
                         <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-center">
                            <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Davomiyligi</p>
                                <p class="font-bold text-gray-900 dark:text-white">2 yil</p>
                            </div>
                            <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Ta'lim tili</p>
                                <p class="font-bold text-gray-900 dark:text-white">O'zbek / Rus</p>
                            </div>
                            <div class="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Kvota</p>
                                <p class="font-bold text-gray-900 dark:text-white">50 ta</p>
                            </div>
                        </div>
                    </div>
                </div>
             `;

        } catch (e) {
            container.innerHTML = '<div class="text-center text-red-500 p-10">Ma\'lumot topilmadi</div>';
            UI.showToast("Bunday soha topilmadi", 'error');
        }
    }

    async loadNewsPage() {
        const container = document.getElementById('news-list-container');
        if (!container) return;

        try {
            const data = await this.safeFetch(`${API_URL}/news`);
            const news = data.rows || data;

            container.innerHTML = news.map(item => `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div class="relative overflow-hidden h-48">
                        <img src="${item.image_url || 'https://picsum.photos/400/300'}" alt="${this.get(item, 'title')}"
                            class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                        <div class="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-4 rounded-full text-xs font-bold">
                            ${new Date(item.date).toLocaleDateString()}
                        </div>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
                            ${this.get(item, 'title')}
                        </h3>
                        <p class="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                            ${this.get(item, 'description')}
                        </p>
                        <a href="news-details.html?id=${item.id}"
                            class="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-800 dark:hover:text-blue-300 transition-colors">
                            Batafsil
                            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                        </a>
                    </div>
                </div>
            `).join('');
        } catch (e) {
            container.innerHTML = '<div class="col-span-full text-center text-red-500">Yangiliklarni yuklashda xatolik.</div>';
            UI.showToast("Yangiliklarni yuklashda xatolik", 'error');
        }
    }

    async loadAboutPage() {
        const container = document.getElementById('team-container');
        if (!container) return;

        try {
            const team = await this.safeFetch(`${API_URL}/team`);

            container.innerHTML = team.map(member => {
                const defaultImg = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23cbd5e1'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";
                return `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden text-center group flex flex-col items-center">
                    <div class="w-full h-64 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        <img src="${member.image_url || defaultImg}" onerror="this.onerror=null; this.src='${defaultImg}';" alt="${this.get(member, 'full_name')}"
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    </div>
                    <div class="p-6 w-full">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            ${this.get(member, 'full_name')}
                        </h3>
                        <p class="text-blue-600 dark:text-blue-400 font-medium">${this.get(member, 'role')}</p>
                    </div>
                </div>
            `}).join('');
        } catch (e) {
            container.innerHTML = '<div class="col-span-full text-center text-red-500">Ma\'lumotlarni yuklashda xatolik.</div>';
            UI.showToast("Jamoa ma'lumotlarini yuklashda xatolik", 'error');
        }
    }

    async loadContactPage() {
        // Update map from settings
        const mapFrame = document.querySelector('.map-container iframe');
        if (mapFrame && this.settings.map_url) {
            mapFrame.src = this.settings.map_url;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cms = new CMS();
});
