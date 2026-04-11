document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    document.getElementById('stats-form').addEventListener('submit', handleSave);
});

let statsData = [];

// Section Labels mapping
const SECTION_TITLES = {
    'home_hero': '🏠 Bosh Sahifa: Yuqori qism (Hero)',
    'home_fields': '🎓 Bosh Sahifa: Sohalar',
    'home_achievements': '🏆 Bosh Sahifa: Yutuqlar va Statistika',
    'other': 'Boshqa'
};

async function loadStats() {
    const container = document.getElementById('stats-container');
    container.innerHTML = '<div class="text-center w-full col-span-full font-medium text-gray-500 py-10 bg-white rounded-2xl border border-gray-100 shadow-sm">Yuklanmoqda...</div>';

    try {
        const res = await admin.fetch('/stats');
        if (!res) {
            container.innerHTML = admin.getEmptyStateHtml("Ma'lumotlarni yuklash xatosi", null, false);
            return;
        }
        statsData = await res.json();

        if (statsData.length === 0) {
            container.innerHTML = admin.getEmptyStateHtml("Statistik ko'rsatkichlar topilmadi", null, false);
            return;
        }

        renderStats(statsData);

    } catch (e) {
        console.error(e);
        container.innerHTML = admin.getEmptyStateHtml("Tizimda xatolik yuz berdi", null, false);
    }
}

function renderStats(stats) {
    const container = document.getElementById('stats-container');
    container.innerHTML = '';

    // Group by section
    const groups = {};
    stats.forEach(stat => {
        const section = stat.section || 'other';
        if (!groups[section]) groups[section] = [];
        groups[section].push(stat);
    });

    // Render groups
    Object.keys(groups).forEach(section => {
        const sectionTitle = SECTION_TITLES[section] || section;
        const items = groups[section];

        const sectionHtml = `
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6 hover:shadow-md transition-shadow">
                <div class="bg-gradient-to-r from-gray-50 to-white px-6 py-5 border-b border-gray-100 flex items-center">
                    <h2 class="text-xl font-bold text-gray-800 flex items-center tracking-tight">
                        ${sectionTitle}
                    </h2>
                </div>
                <div class="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    ${items.map(item => `
                        <div class="relative group">
                            <label class="block text-sm font-bold text-gray-700 mb-2 transition-colors group-focus-within:text-blue-600">
                                ${item.label_uz || item.key}
                            </label>
                            <div class="relative">
                                <input type="text" 
                                    data-id="${item.id}" 
                                    data-key="${item.key}"
                                    value="${item.value}" 
                                    ${item.key === 'fields_count' ? 'disabled' : ''}
                                    class="w-full px-4 py-3.5 rounded-xl border-transparent focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all font-medium text-gray-800 ${item.key === 'fields_count' ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-inner' : 'bg-gray-50/80 border border-gray-200 hover:border-gray-300 shadow-sm'}"
                                >
                            </div>
                            <p class="text-xs text-gray-500 mt-2.5 flex items-start leading-relaxed">
                                <span class="mr-1.5 text-blue-400 mt-0.5">
                                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </span> 
                                ${item.description_uz || 'Tavsif qoldirilmagan'}
                            </p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        container.innerHTML += sectionHtml;
    });
}

async function handleSave(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const msg = document.getElementById('message');

    btn.disabled = true;
    btn.innerHTML = `
        <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Saqlanmoqda...
    `;

    const inputs = document.querySelectorAll('#stats-container input:not([disabled])');
    const updates = [];

    inputs.forEach(input => {
        updates.push({
            id: input.getAttribute('data-id'),
            value: input.value
        });
    });

    try {
        const res = await admin.fetch('/stats', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });

        if (res && res.ok) {
            msg.textContent = "Barcha o'zgarishlar saqlandi!";
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
            loadStats();
        }
    } catch (e) {
        console.error(e);
    } finally {
        btn.disabled = false;
        btn.innerHTML = `
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            Saqlash
        `;
    }
}
