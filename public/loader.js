/**
 * Global Loader and Notification System
 * Handles page loading states and error/success notifications.
 */

const UI = {
    init() {
        this.injectStyles();
        this.createLoader();
        this.createNotificationContainer();

        // Show loader on initial load
        this.showLoader();

        // Hide loader when page is fully loaded
        window.addEventListener('load', () => {
            // Small delay for smooth experience
            setTimeout(() => this.hideLoader(), 500);
        });

        // Intercept navigation for loader
        this.interceptNavigation();
    },

    injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Loader Styles */
            #global-loader {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(255, 255, 255, 0.9);
                z-index: 9999;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                transition: opacity 0.3s ease, visibility 0.3s ease;
            }
            .dark #global-loader {
                background-color: rgba(17, 24, 39, 0.95);
            }
            #global-loader.hidden {
                opacity: 0;
                visibility: hidden;
            }
            .spinner {
                width: 50px;
                height: 50px;
                border: 4px solid #3B82F6; /* Blue-500 */
                border-top: 4px solid transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            /* Notification Styles */
            #notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .toast {
                min-width: 300px;
                background: white;
                color: #1F2937;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                display: flex;
                align-items: center;
                animation: slideIn 0.3s ease-out forwards;
                border-left: 4px solid;
            }
            .dark .toast {
                background: #1F2937;
                color: white;
            }
            .toast.error { border-left-color: #EF4444; }
            .toast.success { border-left-color: #10B981; }
            .toast.warning { border-left-color: #F59E0B; }
            
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    },

    createLoader() {
        if (document.getElementById('global-loader')) return;

        const loader = document.createElement('div');
        loader.id = 'global-loader';
        loader.innerHTML = `
            <div class="spinner mb-4"></div>
            <p class="text-blue-600 dark:text-blue-400 font-bold text-lg animate-pulse">Yuklanmoqda...</p>
        `;
        document.body.prepend(loader);
    },

    showLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) loader.classList.remove('hidden');
    },

    hideLoader() {
        const loader = document.getElementById('global-loader');
        if (loader) {
            loader.classList.add('hidden');
            setTimeout(() => {
                document.body.classList.add('loaded');
            }, 100); // Slight delay to ensure loader fade starts
        }
    },

    createNotificationContainer() {
        if (document.getElementById('notification-container')) return;
        const container = document.createElement('div');
        container.id = 'notification-container';
        document.body.appendChild(container);
    },

    /**
     * Show a toast notification
     * @param {string} message - Message to display
     * @param {'success'|'error'|'warning'} type - Type of notification
     */
    showToast(message, type = 'success') {
        const container = document.getElementById('notification-container');
        const toast = document.createElement('div');

        let icon = '';
        if (type === 'success') icon = '<svg class="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
        if (type === 'error') icon = '<svg class="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>';
        if (type === 'warning') icon = '<svg class="w-6 h-6 text-yellow-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>';

        toast.className = `toast ${type}`;
        toast.innerHTML = `
            ${icon}
            <div class="flex-1">
                <p class="font-medium">${message}</p>
            </div>
            <button class="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" onclick="this.parentElement.remove()">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        `;

        container.appendChild(toast);

        // Auto remove
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    },

    interceptNavigation() {
        document.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:') && link.target !== '_blank') {
                    // Only show loader for internal navigation
                    this.showLoader();
                }
            });
        });
    }
};

// Initialize asap
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => UI.init());
} else {
    UI.init();
}
