let currentApp = null;

document.addEventListener('DOMContentLoaded', () => {
    loadApplications();
});

async function loadApplications() {
    const tbody = document.getElementById('app-table-body');
    const filter = document.getElementById('status-filter').value;
    tbody.innerHTML = '<tr><td colspan="7" class="p-8 text-center text-gray-500 font-medium bg-white">Yuklanmoqda...</td></tr>';

    try {
        const res = await admin.fetch('/applications');
        if (!res) {
            tbody.innerHTML = admin.getEmptyStateHtml("Ma'lumotlarni yuklash xatosi", 7);
            return;
        }
        let apps = await res.json();

        if (filter) {
            apps = apps.filter(a => a.status === filter);
        }

        // Sort by newest
        apps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        tbody.innerHTML = apps.map(item => `
            <tr class="hover:bg-blue-50/50 transition-colors border-b border-gray-50 cursor-pointer group" onclick='viewDetails(${JSON.stringify(item).replace(/'/g, "&#39;")})'>
                <td class="p-5 text-center font-mono text-xs text-gray-500">#${item.id}</td>
                <td class="p-5 font-bold text-gray-800">${item.fullName}</td>
                <td class="p-5">
                    <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ${item.phone}
                    </span>
                </td>
                <td class="p-5 text-center font-medium text-blue-600">${item.fieldId || '-'}</td>
                <td class="p-5 text-center text-sm text-gray-500">${new Date(item.createdAt).toLocaleDateString()}</td>
                <td class="p-5 text-center">
                    <span class="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${getStatusColor(item.status)} shadow-sm">
                        ${item.status}
                    </span>
                </td>
                <td class="p-5 text-right space-x-2 w-32">
                    <button class="w-8 h-8 rounded-full bg-white text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm transition-all border border-gray-100 flex items-center justify-center transform group-hover:scale-110">👁️</button>
                </td>
            </tr>
        `).join('');

        if (apps.length === 0) tbody.innerHTML = admin.getEmptyStateHtml("Arizalar hali mavjud emas", 7);

    } catch (e) {
        console.error(e);
        tbody.innerHTML = admin.getEmptyStateHtml("Tizimda xatolik yuz berdi", 7);
    }
}

function getStatusColor(status) {
    if (status === 'new') return 'bg-blue-100 text-blue-700 border border-blue-200';
    if (status === 'contacted') return 'bg-yellow-100 text-yellow-700 border border-yellow-200';
    if (status === 'archived') return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    return 'bg-gray-100 text-gray-700 border border-gray-200';
}

function viewDetails(item) {
    currentApp = item;
    const content = document.getElementById('modal-content');
    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100/50">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Ism-Familiya</p>
                <p class="font-bold text-xl text-gray-800">${item.fullName}</p>
            </div>
            <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100/50">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Telefon</p>
                <p class="font-bold text-lg text-blue-600">${item.phone}</p>
            </div>
            <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100/50">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Tug'ilgan sana</p>
                <p class="font-bold text-gray-800">${item.dob || '-'}</p>
            </div>
            <div class="bg-gray-50 p-5 rounded-2xl border border-gray-100/50">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Pasport</p>
                <p class="font-bold font-mono text-gray-800">${item.passport || '-'}</p>
            </div>
            <div class="md:col-span-2 bg-gray-50 p-5 rounded-2xl border border-gray-100/50">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Manzil</p>
                <p class="font-bold text-gray-800 leading-relaxed">${item.address || '-'}</p>
            </div>
            <div class="md:col-span-2 bg-gray-50 p-5 rounded-2xl border border-gray-100/50">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Oldingi ta'lim</p>
                <p class="font-bold text-gray-800 leading-relaxed">${item.education || '-'}</p>
            </div>
        </div>
    `;
    openModal();
}

function openModal() {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-container');

    modal.classList.remove('hidden');
    void modal.offsetWidth;

    modalContent.classList.remove('opacity-0', 'scale-95');
    modalContent.classList.add('opacity-100', 'scale-100');
}

function closeModal() {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-container');

    modalContent.classList.remove('opacity-100', 'scale-100');
    modalContent.classList.add('opacity-0', 'scale-95');

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

async function updateStatus(status) {
    if (!currentApp) return;
    try {
        const res = await admin.fetch(`/applications/${currentApp.id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });

        if (res && res.ok) {
            closeModal();
            loadApplications();
        }
    } catch (e) { console.error(e); }
}
