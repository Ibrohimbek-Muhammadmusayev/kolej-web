let currentApp = null;

document.addEventListener('DOMContentLoaded', () => {
    loadApplications();
});

async function loadApplications() {
    const tbody = document.getElementById('app-table-body');
    const filter = document.getElementById('status-filter').value;
    tbody.innerHTML = '<tr><td colspan="4" class="p-8 text-center text-gray-500 font-medium bg-white">Yuklanmoqda...</td></tr>';

    try {
        const res = await admin.fetch('/applications');
        if (!res) {
            tbody.innerHTML = admin.getEmptyStateHtml("Ma'lumotlarni yuklash xatosi", 4);
            return;
        }
        let apps = await res.json();

        if (filter) {
            apps = apps.filter(a => a.status === filter);
        }

        // Sort by newest
        apps.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        tbody.innerHTML = apps.map(item => `
            <tr class="hover:bg-blue-50/50 transition-colors border-b border-gray-100 cursor-pointer group" onclick='viewDetails(${JSON.stringify(item).replace(/'/g, "&#39;")})'>
                <td class="p-5 font-bold text-gray-800">
                    <div class="flex flex-col">
                        <span>${item.fullName}</span>
                        <span class="text-xs font-medium text-blue-600 mt-1">${item.phone}</span>
                    </div>
                </td>
                <td class="p-5">
                    <div class="text-sm text-gray-600 line-clamp-2 max-w-md italic">
                        ${item.message || '<span class="text-gray-300">Xabar matni yo\'q</span>'}
                    </div>
                </td>
                <td class="p-5 text-center">
                    <div class="flex flex-col items-center space-y-2">
                        <span class="text-[10px] text-gray-400 font-mono">${new Date(item.createdAt).toLocaleDateString()}</span>
                        <span class="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase ${getStatusColor(item.status)} shadow-sm">
                            ${item.status}
                        </span>
                    </div>
                </td>
                <td class="p-5 text-right w-20">
                    <button class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm transition-all border border-blue-100 flex items-center justify-center transform group-hover:scale-110">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                </td>
            </tr>
        `).join('');

        if (apps.length === 0) tbody.innerHTML = admin.getEmptyStateHtml("Xabarlar hali mavjud emas", 4);

    } catch (e) {
        console.error(e);
        tbody.innerHTML = admin.getEmptyStateHtml("Tizimda xatolik yuz berdi", 4);
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
    
    // Helper to generate a field only if it has a value
    const getFieldHtml = (label, value, isLong = false, isMono = false) => {
        if (!value || value === '-') return '';
        return `
            <div class="${isLong ? 'md:col-span-2' : ''} bg-gray-50 p-5 rounded-2xl border border-gray-100/50">
                <p class="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">${label}</p>
                <p class="font-bold text-gray-800 ${isMono ? 'font-mono' : ''} ${isLong ? 'leading-relaxed' : 'text-lg'}">${value}</p>
            </div>
        `;
    };

    content.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            ${getFieldHtml('Ism-Familiya', item.fullName)}
            ${getFieldHtml('Telefon', item.phone)}
            ${getFieldHtml('Tug\'ilgan sana', item.dob)}
            ${getFieldHtml('Pasport', item.passport, false, true)}
            ${getFieldHtml('Manzil', item.address, true)}
            ${getFieldHtml('Oldingi ta\'lim', item.education, true)}
            ${item.fieldId ? `
                <div class="md:col-span-2 bg-blue-50 p-5 rounded-2xl border border-blue-100/50">
                    <p class="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">Yo'nalish ID</p>
                    <p class="font-bold text-blue-700 text-lg">#${item.fieldId}</p>
                </div>
            ` : ''}
            ${item.message ? `
            <div class="md:col-span-2 bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-inner">
                <p class="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-2 flex items-center">
                    <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"></path></svg>
                    Xabar Mazmuni
                </p>
                <p class="text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">${item.message}</p>
            </div>
            ` : ''}
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
async function deleteApp() {
    if (!currentApp) return;
    if (!confirm("Haqiqatan ham ushbu xabarni o'chirmoqchimisiz?")) return;

    try {
        const res = await admin.fetch(`/applications/${currentApp.id}`, {
            method: 'DELETE'
        });

        if (res && res.ok) {
            closeModal();
            loadApplications();
        }
    } catch (e) {
        console.error(e);
        alert("O'chirishda xatolik yuz berdi");
    }
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
