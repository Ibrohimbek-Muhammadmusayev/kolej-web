let currentId = null;
let teamData = [];

document.addEventListener('DOMContentLoaded', () => {
    loadTeam();
    document.getElementById('team-form').addEventListener('submit', handleSave);
});

async function loadTeam() {
    const tbody = document.getElementById('team-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-500 font-medium bg-white">Yuklanmoqda...</td></tr>';

    try {
        const res = await admin.fetch('/team');
        if (!res) {
            tbody.innerHTML = admin.getEmptyStateHtml("Ma'lumotlarni yuklash xatosi", 6);
            return;
        }
        const team = await res.json();
        teamData = team;

        if (team.length === 0) {
            tbody.innerHTML = admin.getEmptyStateHtml("Jamoa a'zolari hali qo'shilmagan", 6);
            return;
        }

        tbody.innerHTML = team.map(item => `
            <tr class="hover:bg-blue-50/50 transition-colors border-b border-gray-50 cursor-pointer group" onclick="editTeam(${item.id})">
                <td class="p-5 text-center font-mono text-xs text-gray-500">#${item.id}</td>
                <td class="p-5 text-center">
                    ${item.image_url ?
                `<img src="${item.image_url}" class="w-12 h-12 object-cover rounded-full shadow-sm border-2 border-white group-hover:border-blue-100 transition-all inline-block">`
                :
                `<div class="w-12 h-12 rounded-full bg-gray-100 text-gray-400 shadow-sm border-2 border-white group-hover:border-blue-100 transition-all inline-flex items-center justify-center" title="Rasm yo'q">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                        </div>`
            }
                </td>
                <td class="p-5 font-bold text-gray-800">${item.full_name_uz}</td>
                <td class="p-5 font-medium text-gray-500">${item.role_uz}</td>
                <td class="p-5 text-center text-gray-400 font-semibold">${item.order}</td>
                <td class="p-5 text-right space-x-2">
                    <button onclick="event.stopPropagation(); editTeam(${item.id})" class="w-8 h-8 inline-flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onclick="event.stopPropagation(); deleteTeam(${item.id})" class="w-8 h-8 inline-flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (e) {
        console.error(e);
        tbody.innerHTML = admin.getEmptyStateHtml("Tizimda xatolik yuz berdi", 6);
    }
}

// --- UTILS ---
function switchTab(lang) {
    ['uz', 'ru', 'en'].forEach(l => {
        document.getElementById(`tab-${l}`).classList.add('hidden');
        const btn = document.getElementById(`tab-btn-${l}`);
        btn.classList.remove('bg-white', 'text-blue-600', 'shadow-sm', 'font-bold');
        btn.classList.add('text-gray-500', 'font-medium');
    });

    document.getElementById(`tab-${lang}`).classList.remove('hidden');
    const activeBtn = document.getElementById(`tab-btn-${lang}`);
    activeBtn.classList.remove('text-gray-500', 'font-medium');
    activeBtn.classList.add('bg-white', 'text-blue-600', 'shadow-sm', 'font-bold');
}

function openModal(item = null) {
    const isEdit = item !== null && item.id !== undefined;
    currentId = isEdit ? item.id : null;
    document.getElementById('modal-title').textContent = isEdit ? "Xodimni tahrirlash" : "Xodim qo'shish";
    document.getElementById('team-id').value = isEdit ? item.id : '';

    if (isEdit) {
        ['uz', 'ru', 'en'].forEach(lang => {
            document.getElementById(`full_name_${lang}`).value = item[`full_name_${lang}`] || '';
            document.getElementById(`role_${lang}`).value = item[`role_${lang}`] || '';
        });
        document.getElementById('order').value = item.order;
    } else {
        document.getElementById('team-form').reset();
        document.getElementById('order').value = "0";
    }

    switchTab('uz');

    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    modal.classList.remove('hidden');
    void modal.offsetWidth; // Trigger reflow

    modalContent.classList.remove('opacity-0', 'scale-95');
    modalContent.classList.add('opacity-100', 'scale-100');
}

function closeModal() {
    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    modalContent.classList.remove('opacity-100', 'scale-100');
    modalContent.classList.add('opacity-0', 'scale-95');

    setTimeout(() => {
        modal.classList.add('hidden');
        document.getElementById('team-form').reset();
    }, 300);
}

function editTeam(id) {
    const item = teamData.find(t => t.id === id);
    if (item) {
        openModal(item);
    } else {
        console.error("Missing object item data for id: " + id);
    }
}

async function handleSave(e) {
    e.preventDefault();
    const formData = new FormData();

    ['uz', 'ru', 'en'].forEach(lang => {
        formData.append(`full_name_${lang}`, document.getElementById(`full_name_${lang}`).value);
        formData.append(`role_${lang}`, document.getElementById(`role_${lang}`).value);
    });

    formData.append('order', document.getElementById('order').value);

    const imageFile = document.getElementById('image').files[0];
    if (imageFile) formData.append('image', imageFile);

    const url = currentId ? `/team/${currentId}` : '/team';
    const method = currentId ? 'PUT' : 'POST';

    try {
        const res = await admin.fetch(url, {
            method: method,
            body: formData
        });

        if (res && res.ok) {
            closeModal();
            loadTeam();
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteTeam(id) {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    try {
        const res = await admin.fetch(`/team/${id}`, { method: 'DELETE' });
        if (res && res.ok) loadTeam();
    } catch (e) { console.error(e); }
}
