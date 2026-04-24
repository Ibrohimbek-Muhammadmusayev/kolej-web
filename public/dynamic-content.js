const API_URL = '/api';
const DEFAULT_LANG = 'uz';
const NO_IMAGE_PLACEHOLDER = "https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM=";

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

    getImageUrl(url) {
        if (!url || 
            (typeof url === 'string' && (
                url.includes('picsum.photos') || 
                url.includes('randomuser.me') || 
                url.includes('via.placeholder.com') ||
                url.includes('placeholder.com')
            ))
        ) {
            return NO_IMAGE_PLACEHOLDER;
        }
        if (!url.startsWith('http') && !url.startsWith('/')) {
            return `${API_URL.replace('/api', '')}/uploads/${url}`;
        }
        return url;
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
        const footerAddr = document.querySelectorAll('[data-i18n="footer-address"]');
        footerAddr.forEach(el => {
            el.innerHTML = this.get(this.settings, 'contact_address');
        });

        const footerPhone = document.querySelectorAll('[data-i18n="footer-phone"], [data-i18n="contact-phone"]');
        footerPhone.forEach(el => {
            if (this.settings.contact_phone) el.textContent = this.settings.contact_phone;
        });

        const footerEmail = document.querySelectorAll('[data-i18n="footer-email"], [data-i18n="contact-email"]');
        footerEmail.forEach(el => {
            if (this.settings.contact_email) el.textContent = this.settings.contact_email;
        });

        // Social Links
        const facebookLink = document.getElementById('social-facebook');
        if (facebookLink && this.settings.facebook_url) facebookLink.href = this.settings.facebook_url;

        const instagramLink = document.getElementById('social-instagram');
        if (instagramLink && this.settings.instagram_url) instagramLink.href = this.settings.instagram_url;

        const telegramLink = document.getElementById('social-telegram');
        if (telegramLink && this.settings.telegram_url) telegramLink.href = this.settings.telegram_url;
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
                        style="background-image: url('${NO_IMAGE_PLACEHOLDER}')"></div>
                `;
                return;
            }

            container.innerHTML = slides.map((slide, index) => {
                const isActive = index === 0;
                let mediaHtml = '';

                if (slide.media_type === 'video') {
                    mediaHtml = `
                        <video class="w-full h-full object-cover" ${isActive ? 'autoplay' : ''} muted loop playsinline>
                            <source src="${this.getImageUrl(slide.media_url)}" type="video/mp4">
                        </video>
                    `;
                } else {
                    mediaHtml = `<img src="${this.getImageUrl(slide.media_url)}" class="w-full h-full object-cover">`;
                }

                const title = this.get(slide, 'title');
                const description = this.get(slide, 'description');
                const hasContent = !!title || !!description;
                const contentHtml = hasContent ? `
                        <div class="absolute inset-0 bg-blue-900/40 z-10"></div>
                        <div class="absolute inset-0 flex items-center justify-center z-20">
                            <div class="container mx-auto px-4 text-center">
                                <div class="max-w-4xl mx-auto space-y-6">
                                    <h2 class="text-4xl md:text-7xl font-bold text-white leading-tight animate-slideUp">
                                        ${title}
                                    </h2>
                                    ${description ? `
                                    <p class="text-xl md:text-2xl text-blue-50 animate-slideUp delay-100 line-clamp-3">
                                        ${description}
                                    </p>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                ` : '';

                return `
                    <div class="carousel-slide absolute inset-0 transition-all duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}">
                        <div class="absolute inset-0 bg-black/20 z-0"></div>
                        ${mediaHtml}
                        ${contentHtml}
                    </div>
                `;
            }).join('');

            const hasAnyText = slides.some(s => !!this.get(s, 'title') || !!this.get(s, 'description'));
            this.initHeroCarousel(container, hasAnyText);

        } catch (error) {
            console.error('Hero Load Error:', error);
            // Fallback
            container.innerHTML = `
                    <div class="carousel-slide absolute w-full h-full bg-cover bg-center"
                        style="background-image: url('images/hero-bg.jpg')"></div>
                `;
        }
    }

    initHeroCarousel(container, hasAnyText) {
        const slides = container.querySelectorAll('.carousel-slide');
        if (slides.length < 1) return;

        let currentSlide = 0;
        const totalSlides = slides.length;
        let timer;

        const progressEl = document.getElementById('carousel-progress');
        const counterEl = document.getElementById('carousel-counter');

        const updateIndicators = (index) => {
            if (progressEl) {
                const percent = ((index + 1) / totalSlides) * 100;
                progressEl.style.width = `${percent}%`;
            }
            if (counterEl) {
                counterEl.textContent = `${(index + 1).toString().padStart(2, '0')}/${totalSlides.toString().padStart(2, '0')}`;
            }
        };

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
            updateIndicators(index);
        };

        const nextSlide = () => {
            currentSlide = (currentSlide + 1) % totalSlides;
            showSlide(currentSlide);
        };

        const prevSlide = () => {
            currentSlide = (currentSlide - 1 + totalSlides) % totalSlides;
            showSlide(currentSlide);
        };

        // Initial indicators
        updateIndicators(0);

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

        // Hide controls if only 1 slide
        if (totalSlides <= 1) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (prevBtn) prevBtn.style.display = 'none';
            const indicators = document.getElementById('carousel-indicators');
            if (indicators) indicators.style.display = 'none';
        }

        const resetTimer = () => {
            if (totalSlides > 1 && hasAnyText) {
                clearInterval(timer);
                timer = setInterval(nextSlide, 7000);
            }
        };

        // Start Auto Play only if more than 1 slide and at least one has text
        if (totalSlides > 1 && hasAnyText) {
            timer = setInterval(nextSlide, 7000);
        }
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
                const imgUrl = this.getImageUrl(item.image_url);

                return `
                <div class="news-slide absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-900 transition-opacity duration-500 ease-in-out ${index === 0 ? 'opacity-100 z-10' : 'opacity-0 z-0'}">
                    <img src="${imgUrl}" onerror="this.src='${NO_IMAGE_PLACEHOLDER}'" class="absolute w-full h-full object-cover opacity-60">
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
                const imgUrl = this.getImageUrl(field.image_url || field.icon_url);
                const iconUrl = this.getImageUrl(field.icon_url);

                return `
                 <div class="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden hover:-translate-y-2 transition-all duration-300">
                    <div class="h-48 overflow-hidden">
                        <img src="${imgUrl}" onerror="this.src='${NO_IMAGE_PLACEHOLDER}'" alt="${this.get(field, 'title')}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500">
                    </div>
                    <div class="p-8">
                        <div class="absolute top-4 right-4 bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
                           <img src="${iconUrl}" onerror="this.src='${NO_IMAGE_PLACEHOLDER}'" class="w-8 h-8 rounded-full"> 
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
        const container = document.getElementById('home-achievements-container');
        try {
            const stats = await this.safeFetch(`${API_URL}/stats`);
            
            // 1. Update Small Stats at the top (if they exist)
            const smallStatsMapping = {
                'stat_total': 'stat-students',
                'fields_count': 'stat-fields',
                'stat_uni_top': 'stat-uni'
            };

            stats.forEach(s => {
                const targetId = smallStatsMapping[s.key];
                if (targetId) {
                    const el = document.getElementById(targetId);
                    if (el) {
                        const numeric = parseFloat(String(s.value).replace(/[^0-9.]/g, '')) || 0;
                        el.setAttribute('data-target', numeric);
                        
                        // If already started/finished by script.js, force update the text
                        if (el.classList.contains('started') || el.classList.contains('finished')) {
                            el.textContent = numeric;
                        }
                        
                        // Also update the label text if available in DB
                        const labelEl = el.closest('div').querySelector('[data-i18n]');
                        if (labelEl) {
                            labelEl.textContent = this.get(s, 'label');
                            // Remove data-i18n to prevent script.js from overwriting it later
                            labelEl.removeAttribute('data-i18n');
                        }
                    }
                }
            });

            // 2. Render Main Achievements Section
            if (container) {
                const activeAchievements = stats
                    .filter(s => s.section === 'home_achievements' && s.isActive)
                    .sort((a, b) => (a.order || 0) - (b.order || 0));

                if (activeAchievements.length === 0) {
                    container.innerHTML = '';
                    return;
                }

                container.innerHTML = activeAchievements.map(s => {
                    const numericValue = parseFloat(String(s.value).replace(/[^0-9.]/g, '')) || 0;
                    const isPercentage = String(s.value).includes('%');
                    const suffix = isPercentage ? '%' : (String(s.value).includes('+') ? '+' : '');
                    
                    // Logic for bar width: if it's percentage use value, else use 100 or custom
                    const barWidth = isPercentage ? numericValue : 100;

                    return `
                        <div class="mb-8">
                            <div class="flex justify-between items-end mb-2">
                                <span class="text-xl font-bold text-blue-200">${this.get(s, 'label')}</span>
                                <span class="text-2xl font-bold"><span class="count-up" data-target="${numericValue}">0</span>${suffix}</span>
                            </div>
                            <div class="w-full bg-blue-900/50 rounded-full h-4 border border-blue-500/30 overflow-hidden">
                                <div class="bg-gradient-to-r from-blue-400 to-blue-600 h-4 rounded-full bar-chart-fill transition-all duration-1000 ease-out w-0"
                                    style="width: 0%" data-width="${barWidth}%"></div>
                            </div>
                            <p class="text-sm text-blue-200/70 mt-2 text-left">${this.get(s, 'description')}</p>
                        </div>
                    `;
                }).join('');
            }

            // Trigger animations (from script.js observer)
            if (typeof window.statsObserver !== 'undefined') {
                document.querySelectorAll('.count-up').forEach(el => window.statsObserver.observe(el.closest('section') || el.parentElement));
            } else {
                // Fallback: trigger manually if observer not ready
                setTimeout(() => {
                    document.querySelectorAll('.count-up:not(.started)').forEach(el => {
                        const target = +el.getAttribute('data-target');
                        if (target > 0) {
                            // Simple animation
                            let curr = 0;
                            const step = target / 50;
                            const iter = setInterval(() => {
                                curr += step;
                                if (curr >= target) {
                                    el.textContent = target;
                                    clearInterval(iter);
                                } else {
                                    el.textContent = Math.ceil(curr);
                                }
                            }, 30);
                        }
                    });
                    document.querySelectorAll('.bar-chart-fill:not(.started)').forEach(bar => {
                        bar.style.width = bar.getAttribute('data-width');
                    });
                }, 500);
            }

        } catch (e) {
            console.error('Stats loading failed:', e);
            if (container) container.innerHTML = '';
        }
    }

    async fetchActiveStudents() {
        const container = document.getElementById('students-scroll');
        if (!container) return;
        try {
            const students = await this.safeFetch(`${API_URL}/students`);

            container.innerHTML = students.map(s => `
                <div class="min-w-[300px] md:min-w-[350px] bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 shadow-lg snap-center text-center transform hover:-translate-y-2 transition-transform duration-300 border border-gray-100 dark:border-gray-600">
                    <img src="${this.getImageUrl(s.image_url)}" onerror="this.src='${NO_IMAGE_PLACEHOLDER}'" alt="${this.get(s, 'full_name')}" class="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500 object-cover">
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
            container.innerHTML = fields.map(field => {
                const imgUrl = this.getImageUrl(field.image_url || field.icon_url);

                return `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 transition-transform duration-300 relative h-full flex flex-col"
                    onclick="window.location.href='field-details.html?slug=${field.slug}'">
                    ${field.is_new ? '<span class="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">YANGI</span>' : ''}
                    <img src="${imgUrl}" onerror="this.src='${NO_IMAGE_PLACEHOLDER}'" alt="${this.get(field, 'title')}" class="w-full h-48 object-cover">
                    <div class="p-6 flex-grow flex flex-col">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">${this.get(field, 'title')}</h3>
                        <p class="text-gray-700 dark:text-gray-300 line-clamp-3 mb-4 flex-grow">${this.get(field, 'description')}</p>
                        <a href="field-details.html?slug=${field.slug}" class="text-blue-600 hover:text-blue-800 font-bold mt-auto inline-block">Batafsil &rarr;</a>
                    </div>
                </div>
            `;
            }).join('');
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

            const imgUrl = this.getImageUrl(field.image_url || field.icon_url);

            container.innerHTML = `
                <div class="relative h-64 md:h-96">
                    <img src="${imgUrl}" onerror="this.src='${NO_IMAGE_PLACEHOLDER}'" alt="${this.get(field, 'title')}" class="w-full h-full object-cover">
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

            container.innerHTML = news.map(item => {
                const imgUrl = this.getImageUrl(item.image_url);

                return `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden group hover:shadow-2xl transition-all duration-300">
                    <div class="relative overflow-hidden h-48">
                        <img src="${imgUrl}" onerror="this.src='${NO_IMAGE_PLACEHOLDER}'" alt="${this.get(item, 'title')}"
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
            `;
            }).join('');
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
                const imgUrl = this.getImageUrl(member.image_url);
                return `
                <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden text-center group flex flex-col items-center">
                    <div class="w-full h-64 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                        <img src="${imgUrl}" onerror="this.src='${NO_IMAGE_PLACEHOLDER}'" alt="${this.get(member, 'full_name')}"
                            class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300">
                    </div>
                    <div class="p-6 w-full">
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-1">
                            ${this.get(member, 'full_name')}
                        </h3>
                        <p class="text-blue-600 dark:text-blue-400 font-medium">${this.get(member, 'role')}</p>
                    </div>
                </div>
            `;
            }).join('');
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

        // Setup form submission
        const form = document.getElementById('contact-form');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const submitBtn = form.querySelector('button[type="submit"]');
                const originalBtnText = submitBtn.innerHTML;
                
                try {
                    submitBtn.disabled = true;
                    submitBtn.innerHTML = 'Yuborilmoqda...';

                    const data = {
                        fullName: document.getElementById('contact-name').value,
                        phone: document.getElementById('contact-phone').value,
                        message: document.getElementById('contact-message').value
                    };

                    await this.safeFetch(`${API_URL}/applications`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    // Success
                    const successMsg = this.lang === 'uz' ? 'Rahmat! Xabaringiz qabul qilindi.' : 
                                      this.lang === 'ru' ? 'Спасибо! Ваше сообщение принято.' : 
                                      'Thank you! Your message has been received.';
                    
                    alert(successMsg); // Using alert for simplicity as UI.showToast might vary in implementation
                    form.reset();

                } catch (e) {
                    console.error(e);
                    const errorMsg = this.lang === 'uz' ? 'Xatolik yuz berdi. Iltimos qayta urinib ko\'ring.' : 
                                    this.lang === 'ru' ? 'Произошла ошибка. Пожалуйста, попробуйте еще раз.' : 
                                    'An error occurred. Please try again.';
                    alert(errorMsg);
                } finally {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            });
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.cms = new CMS();
});
