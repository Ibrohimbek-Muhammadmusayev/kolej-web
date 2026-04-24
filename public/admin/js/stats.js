document.addEventListener('DOMContentLoaded', () => {
    loadStats();
    document.getElementById('stat-form').addEventListener('submit', handleSave);
});

let statsData = [];

// Section Labels mapping
const SECTION_TITLES = {
    'home_top': '🔝 Asosiy Ko\'rsatkichlar (Hero Stats)',
    'home_achievements': '🏆 "Raqamli Yutuqlarimiz" Bo\'limi',
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

        renderStats(statsData);

    } catch (e) {
        console.error(e);
        container.innerHTML = admin.getEmptyStateHtml("Tizimda xatolik yuz berdi", null, false);
    }
}

function renderStats(stats) {
    const container = document.getElementById('stats-container');
    container.innerHTML = '';

    // Sections in specific order
    const sectionOrder = ['home_top', 'home_achievements', 'other'];
    
    // Group by section
    const groups = {};
    stats.forEach(stat => {
        const section = stat.section || 'other';
        if (!groups[section]) groups[section] = [];
        groups[section].push(stat);
    });

    sectionOrder.forEach(section => {
        if (!groups[section]) return;

        const sectionTitle = SECTION_TITLES[section] || section;
        const items = groups[section];
        const isHero = section === 'home_top';

        const sectionHtml = `
            <div class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-10">
                <div class="bg-gray-50 px-8 py-5 border-b border-gray-100 flex justify-between items-center">
                    <h2 class="text-xl font-bold text-gray-800">${sectionTitle}</h2>
                    ${isHero ? `
                        <span class="text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">Faqat tahrirlash</span>
                    ` : `
                        <span class="text-xs font-bold text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-wider">To'liq boshqarish</span>
                    `}
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="text-xs uppercase text-gray-400 font-bold border-b border-gray-50 bg-gray-50/30">
                                <th class="px-8 py-4 w-20 text-center">T/r</th>
                                <th class="px-8 py-4">Nomi (UZ)</th>
                                <th class="px-8 py-4">Qiymat</th>
                                ${!isHero ? `<th class="px-8 py-4">Holati</th>` : ''}
                                <th class="px-8 py-4 text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-50">
                            ${items.sort((a,b) => a.order - b.order).map((item, index) => `
                                <tr class="hover:bg-gray-50/50 transition-colors">
                                    <td class="px-8 py-6 text-center font-mono text-sm text-gray-400">${item.order || (index+1)}</td>
                                    <td class="px-8 py-6">
                                        <div class="font-bold text-gray-800">${item.label_uz}</div>
                                        ${!isHero ? `<div class="text-xs text-gray-400 mt-1">${item.key}</div>` : ''}
                                    </td>
                                    <td class="px-8 py-6">
                                        <span class="px-4 py-2 rounded-xl font-black text-blue-700 bg-blue-50 border border-blue-100 shadow-sm">
                                            ${item.value}
                                        </span>
                                    </td>
                                    ${!isHero ? `
                                    <td class="px-8 py-6">
                                        <div class="flex items-center">
                                            <div class="w-2 h-2 rounded-full mr-2 ${item.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-300'}"></div>
                                            <span class="text-sm font-bold ${item.isActive ? 'text-emerald-600' : 'text-gray-400'}">
                                                ${item.isActive ? 'Faol' : 'Nofaol'}
                                            </span>
                                        </div>
                                    </td>
                                    ` : ''}
                                    <td class="px-8 py-6 text-right">
                                        <div class="flex justify-end items-center space-x-2">
                                            <button onclick="editStat(${item.id})" class="p-2.5 text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-transparent hover:border-blue-100 shadow-sm hover:shadow group" title="Tahrirlash">
                                                <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                            ${!isHero ? `
                                                <button onclick="deleteStat(${item.id})" class="p-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-100 shadow-sm hover:shadow group" title="O'chirish">
                                                    <svg class="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                                </button>
                                            ` : ''}
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        container.innerHTML += sectionHtml;
    });
}

function openModal(isEdit = false) {
    const modal = document.getElementById('stat-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('stat-form');

    if (!isEdit) {
        form.reset();
        document.getElementById('stat-id').value = '';
        document.getElementById('stat-section').value = 'home_achievements';
        document.getElementById('stat-key').disabled = false;
        document.getElementById('stat-section').disabled = false;
        title.innerText = 'Yangi Statistika Qo\'shish';
    } else {
        title.innerText = 'Statistikani Tahrirlash';
    }

    modal.classList.remove('hidden');

    // Toggle fields based on section
    const section = document.getElementById('stat-section').value;
    const isHero = section === 'home_top';
    const fieldsToHide = document.querySelectorAll('.hero-hide');
    fieldsToHide.forEach(f => {
        if (isHero) f.classList.add('hidden');
        else f.classList.remove('hidden');
    });

    if (isHero) {
        title.innerText = 'Qiymatni Ozgartirish';
    }
}

function closeModal() {
    document.getElementById('stat-modal').classList.add('hidden');
}

function editStat(id) {
    const stat = statsData.find(s => s.id === id);
    if (!stat) return;

    document.getElementById('stat-id').value = stat.id;
    document.getElementById('stat-key').value = stat.key;
    document.getElementById('stat-value').value = stat.value;
    document.getElementById('stat-label-uz').value = stat.label_uz;
    document.getElementById('stat-label-ru').value = stat.label_ru;
    document.getElementById('stat-label-en').value = stat.label_en;
    document.getElementById('stat-desc-uz').value = stat.description_uz || '';
    document.getElementById('stat-desc-ru').value = stat.description_ru || '';
    document.getElementById('stat-desc-en').value = stat.description_en || '';
    document.getElementById('stat-section').value = stat.section || 'home_achievements';
    document.getElementById('stat-order').value = stat.order || 0;
    document.getElementById('stat-active').checked = stat.isActive;

    // Fixed stats shouldn't change key or section
    const isHero = stat.section === 'home_top';
    document.getElementById('stat-key').disabled = isHero;
    document.getElementById('stat-section').disabled = isHero;

    openModal(true);
}

async function handleSave(e) {
    e.preventDefault();
    const id = document.getElementById('stat-id').value;
    const isEdit = id !== '';

    const data = {
        key: document.getElementById('stat-key').value,
        value: document.getElementById('stat-value').value,
        label_uz: document.getElementById('stat-label-uz').value,
        label_ru: document.getElementById('stat-label-ru').value,
        label_en: document.getElementById('stat-label-en').value,
        description_uz: document.getElementById('stat-desc-uz').value,
        description_ru: document.getElementById('stat-desc-ru').value,
        description_en: document.getElementById('stat-desc-en').value,
        section: document.getElementById('stat-section').value,
        order: parseInt(document.getElementById('stat-order').value) || 0,
        isActive: document.getElementById('stat-active').checked
    };

    try {
        let res;
        if (isEdit) {
            data.id = id;
            res = await admin.fetch('/stats', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        } else {
            res = await admin.fetch('/stats', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
        }

        if (res && res.ok) {
            closeModal();
            loadStats();
        }
    } catch (e) {
        console.error(e);
        alert('Xatolik yuz berdi');
    }
}

async function deleteStat(id) {
    if (!confirm('Ushbu statistikani o\'chirib tashlamoqchimisiz?')) return;

    try {
        const res = await admin.fetch(`/stats/${id}`, {
            method: 'DELETE'
        });

        if (res && res.ok) {
            loadStats();
        }
    } catch (e) {
        console.error(e);
        alert('O\'chirishda xatolik yuz berdi');
    }
}
