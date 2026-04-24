const API_URL = '/api';

// Auth Guard
if (!localStorage.getItem('admin_token')) {
    window.location.href = 'login.html';
}

// Common Utils
const admin = {
    getToken: () => localStorage.getItem('admin_token'),

    logout: () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        window.location.href = 'login.html';
    },

    showAuthError: () => {
        const modal = document.getElementById('global-auth-modal');
        if (modal) {
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.querySelector('div').classList.remove('scale-95', 'opacity-0');
                modal.querySelector('div').classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    },

    showGlobalError: (message = "Tizimda xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.") => {
        const modal = document.getElementById('global-error-modal');
        const msgEl = document.getElementById('global-error-message');
        if (modal && msgEl) {
            msgEl.textContent = message;
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.querySelector('div').classList.remove('scale-95', 'opacity-0');
                modal.querySelector('div').classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    },

    closeGlobalError: () => {
        const modal = document.getElementById('global-error-modal');
        if (modal) {
            modal.querySelector('div').classList.remove('scale-100', 'opacity-100');
            modal.querySelector('div').classList.add('scale-95', 'opacity-0');
            setTimeout(() => modal.classList.add('hidden'), 300);
        }
    },

    getEmptyStateHtml: (message = "Ma'lumotlar topilmadi", colSpan = 5, isTable = true) => {
        const innerContent = `
            <div class="flex flex-col items-center justify-center space-y-4 py-8">
                <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                    <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                </div>
                <h3 class="text-gray-500 font-medium text-sm tracking-wide">${message}</h3>
            </div>
        `;
        return isTable
            ? `<tr><td colspan="${colSpan}" class="p-4 text-center bg-white">${innerContent}</td></tr>`
            : `<div class="w-full col-span-full bg-white rounded-2xl border border-gray-100 shadow-sm">${innerContent}</div>`;
    },

    // Authorized Fetch
    fetch: async (url, options = {}) => {
        const token = admin.getToken();
        const headers = {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        // Don't set Content-Type if body is FormData (browser handles it)
        if (!(options.body instanceof FormData) && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        try {
            const res = await fetch(`${API_URL}${url}`, {
                ...options,
                headers
            });

            if (res.status === 401 || res.status === 403) {
                admin.showAuthError(); // Token expired or invalid
                return null;
            }

            if (!res.ok && res.status >= 500) {
                admin.showGlobalError("Serverda xatolik yuz berdi. Iltimos kuting.");
                return null;
            }

            return res;
        } catch (error) {
            console.error("Tarmoq xatosi:", error);
            admin.showGlobalError("Tarmoq yoki server bilan aloqa uqildi. Internetni tekshiring.");
            return null;
        }
    }
};

// Sidebar Layout Injector (to keep pages clean)
// Sidebar Layout Injector (to keep pages clean)
const style = document.createElement('style');
style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    
    body {
        font-family: 'Inter', sans-serif;
        background-color: #f3f4f6; /* Tailwind gray-100 */
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .fade-in {
        animation: fadeIn 0.4s ease-out forwards;
    }
    
    /* Modern Scrollbar */
    ::-webkit-scrollbar {
        width: 6px;
        height: 6px;
    }
    ::-webkit-scrollbar-track {
        background: transparent;
    }
    ::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }
    ::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }

    .sidebar {
        width: 280px;
        background: linear-gradient(180deg, #1e1e2d 0%, #151521 100%);
    }

    .sidebar-link {
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
        overflow: hidden;
    }
    .sidebar-link::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 3px;
        background: #3b82f6; /* blue-500 */
        transform: scaleY(0);
        transition: transform 0.3s ease;
        transform-origin: left;
    }
    .sidebar-link:hover::before, .sidebar-link.active::before {
        transform: scaleY(1);
    }
    .sidebar-link:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #ffffff;
    }
    .sidebar-link.active {
        background: rgba(59, 130, 246, 0.15); /* blue-500 with opacity */
        color: #60a5fa; /* blue-400 */
        font-weight: 600;
    }

    .main-content {
        margin-left: 280px;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    .top-navbar {
        height: 70px;
        background: rgba(255, 255, 255, 0.8);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(229, 231, 235, 0.5);
        z-index: 40;
        position: sticky;
        top: 0;
    }
`;
document.head.appendChild(style);

const navHtml = `
    <!-- Sidebar -->
    <aside class="sidebar fixed left-0 top-0 h-full text-gray-300 flex flex-col shadow-2xl z-50 transition-all duration-300">
        <!-- Brand -->
        <div class="h-[70px] flex items-center px-6 border-b border-gray-800/50 bg-black/20">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/30 mr-3">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>
                <h2 class="text-white font-bold text-lg tracking-wide">Quva Politex</h2>
                <p class="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Boshqaruv Paneli</p>
            </div>
        </div>

        <!-- Navigation Menu -->
        <nav class="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            <p class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Asosiy</p>
            <a href="index.html" class="sidebar-link flex items-center px-3 py-3 rounded-lg text-sm ${window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/admin/') ? 'active' : ''}">
                <svg class="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                Dashboard
            </a>
            <a href="stats.html" class="sidebar-link flex items-center px-3 py-3 rounded-lg text-sm ${window.location.pathname.includes('stats') ? 'active' : ''}">
                <svg class="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                Statistika
            </a>
            
            <p class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Tarkib (Content)</p>
            <a href="news.html" class="sidebar-link flex items-center px-3 py-3 rounded-lg text-sm ${window.location.pathname.includes('news') ? 'active' : ''}">
                <svg class="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2.5 2.5 0 00-2.5-2.5H15"></path></svg>
                Yangiliklar
            </a>
            <a href="hero.html" class="sidebar-link flex items-center px-3 py-3 rounded-lg text-sm ${window.location.pathname.includes('hero') ? 'active' : ''}">
                <svg class="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Hero Slider
            </a>
            <a href="fields.html" class="sidebar-link flex items-center px-3 py-3 rounded-lg text-sm ${window.location.pathname.includes('fields') ? 'active' : ''}">
                <svg class="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                Yo'nalishlar
            </a>
            <a href="team.html" class="sidebar-link flex items-center px-3 py-3 rounded-lg text-sm ${window.location.pathname.includes('team') ? 'active' : ''}">
                <svg class="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                Jamoa
            </a>
            <a href="students.html" class="sidebar-link flex items-center px-3 py-3 rounded-lg text-sm ${window.location.pathname.endsWith('students.html') ? 'active' : ''}">
                <svg class="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                Faol O'quvchilar
            </a>

            <p class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Boshqaruv</p>
            <a href="applications.html" class="sidebar-link flex items-center px-3 py-3 rounded-lg text-sm ${window.location.pathname.includes('applications') ? 'active' : ''}">
                <svg class="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                Xabarlar
            </a>
            
            <p class="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2">Tizim</p>
            <a href="settings.html" class="sidebar-link flex items-center px-3 py-3 rounded-lg text-sm ${window.location.pathname.includes('settings') ? 'active' : ''}">
                <svg class="w-5 h-5 mr-3 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                Sozlamalar
            </a>
        </nav>

        <!-- Footer / Logout -->
        <div class="p-4 bg-gray-900/40 border-t border-gray-800/50">
            <button onclick="admin.logout()" class="w-full flex items-center justify-center space-x-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 py-2.5 rounded-lg transition-colors font-medium text-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                <span>Tizimdan Chiqish</span>
            </button>
        </div>
    </aside>

    <!-- UI Core Wrapper -->
    <div class="main-content">
        <!-- Top Navbar -->
        <header class="top-navbar flex items-center justify-between px-8 shadow-sm">
            <div class="flex items-center space-x-4">
                <a href="/" target="_blank" class="text-gray-500 hover:text-blue-600 transition-colors flex items-center text-sm font-medium bg-gray-100 hover:bg-blue-50 px-3 py-1.5 rounded-md">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                    Saytni ko'rish
                </a>
            </div>
            
            <div class="flex items-center space-x-5">
                <!-- Notifications (Visual) -->
                <button id="nav-notifications" onclick="window.location.href='applications.html'" class="relative text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    <span id="nav-notif-badge" class="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white hidden flex items-center justify-center text-[7px] text-white font-bold"></span>
                </button>
                
                <!-- Divider -->
                <div class="h-8 w-px bg-gray-200"></div>

                <!-- Admin Profile Dropdown (Visual) -->
                <div class="flex items-center space-x-3 cursor-pointer group">
                    <div class="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold border border-blue-200 shadow-sm">
                        A
                    </div>
                    <div class="hidden md:block">
                        <p class="text-sm font-bold text-gray-700 leading-none">Super Admin</p>
                        <p class="text-xs text-gray-500 mt-1">Administrator</p>
                    </div>
                    <svg class="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
            </div>
        </header>

        <!-- Page Content Wrapper -->
        <div id="page-wrapper" class="p-8 flex-1 fade-in">
        </div>
    </div>

    <!-- Global Auth Error Modal -->
    <div id="global-auth-modal" class="fixed inset-0 bg-gray-900/80 hidden z-[100] flex items-center justify-center backdrop-blur-sm transition-opacity">
        <div class="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col transform transition-all scale-95 opacity-0 text-center p-8 border border-red-100">
            <div class="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <h2 class="text-xl font-bold text-gray-800 mb-2">Sessiya Yakunlandi</h2>
            <p class="text-sm text-gray-500 mb-6">Xavfsizlik maqsadida tizimga qayta kirishingiz kerak. Sessiyangiz tugagan yoki yaroqsiz.</p>
            <button onclick="admin.logout()" class="w-full bg-red-600 text-white font-bold py-3 rounded-xl hover:bg-red-700 shadow-md transition-all">Qayta Kirish</button>
        </div>
    </div>

    <!-- Global Generic Error Modal -->
    <div id="global-error-modal" class="fixed inset-0 bg-gray-900/60 hidden z-[90] flex items-center justify-center backdrop-blur-sm transition-opacity">
        <div class="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col transform transition-all scale-95 opacity-0">
            <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50">
                <div class="flex items-center space-x-3 text-red-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <h2 class="text-lg font-bold">Xatolik Yuz Berdi</h2>
                </div>
                <button onclick="admin.closeGlobalError()" class="w-8 h-8 flex items-center justify-center rounded-full bg-red-100 hover:bg-red-200 text-red-600 transition-colors">
                    &times;
                </button>
            </div>
            <div class="p-6">
                <p id="global-error-message" class="text-gray-600 mb-6 font-medium text-sm leading-relaxed">Noma'lum xatolik.</p>
                <div class="flex justify-end">
                    <button onclick="admin.closeGlobalError()" class="px-6 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-colors">Tushunarli</button>
                </div>
            </div>
        </div>
    </div>
`;

// Insert the layout structure
const wrapperDiv = document.createElement('div');
wrapperDiv.innerHTML = navHtml;
const newElements = Array.from(wrapperDiv.children);

// Prepend all the elements in the correct order to the body
newElements.reverse().forEach(el => document.body.prepend(el));

// Move original main tag into new wrapper robustly
function injectMainContent() {
    const oldMain = document.querySelector('body > main');
    const newWrapper = document.getElementById('page-wrapper');
    if (oldMain && newWrapper) {
        newWrapper.appendChild(oldMain);

        // Ensure styling doesn't conflict
        oldMain.classList.remove('ml-64');
        if (!oldMain.classList.contains('fade-in')) {
            oldMain.classList.add('fade-in');
        }
    }
}

// Ensure the injection happens regardless of script load timing
if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', () => {
        injectMainContent();
        updateNotificationBadge();
        setInterval(updateNotificationBadge, 30000); // Check every 30 seconds
    });
} else {
    injectMainContent();
    updateNotificationBadge();
    setInterval(updateNotificationBadge, 30000);
}

async function updateNotificationBadge() {
    try {
        const res = await admin.fetch('/applications');
        if (!res) return;
        const apps = await res.json();
        const newCount = apps.filter(a => a.status === 'new').length;
        
        const badge = document.getElementById('nav-notif-badge');
        if (badge) {
            if (newCount > 0) {
                badge.classList.remove('hidden');
                badge.textContent = newCount > 9 ? '9+' : newCount;
                // Add a small pulse animation if it's new
                badge.classList.add('animate-pulse');
            } else {
                badge.classList.add('hidden');
                badge.classList.remove('animate-pulse');
            }
        }
    } catch (e) { console.error("Notif fetch error:", e); }
}
