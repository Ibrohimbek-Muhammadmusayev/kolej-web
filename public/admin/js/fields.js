let currentFieldId = null;
let fieldsData = [];

document.addEventListener('DOMContentLoaded', () => {
    loadFields();
    document.getElementById('field-form').addEventListener('submit', handleSave);
});

async function loadFields() {
    const tbody = document.getElementById('fields-table-body');
    tbody.innerHTML = '<tr><td colspan="6" class="p-8 text-center text-gray-500 font-medium">Yuklanmoqda...</td></tr>';

    try {
        const res = await admin.fetch('/fields');
        if (!res) {
            tbody.innerHTML = admin.getEmptyStateHtml("Ma'lumotlarni yuklash xatosi", 6);
            return;
        }
        const fields = await res.json();

        fieldsData = fields;

        if (fields.length === 0) {
            tbody.innerHTML = admin.getEmptyStateHtml("Yo'nalishlar hali qo'shilmagan", 6);
            return;
        }

        tbody.innerHTML = fields.map((item, index) => `
            <tr class="hover:bg-blue-50/50 transition-colors border-b group cursor-pointer" onclick="editField(${item.id})">
                <td class="p-5 text-center text-gray-500 font-medium">${index + 1}</td>
                <td class="p-5 font-bold flex items-center">
                    <img src="${item.icon_url ? (item.icon_url.startsWith('http') ? item.icon_url : item.icon_url) : ''}" class="w-8 h-8 mr-3 rounded-lg bg-gray-100 shadow-sm object-cover border border-gray-200">
                    ${item.title_uz}
                </td>
                <td class="p-5 font-mono text-sm text-blue-600">${item.slug}</td>
                <td class="p-5 text-center font-medium">${item.order}</td>
                <td class="p-5 text-center">
                    ${item.is_new ? '<span class="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold uppercase tracking-wider">Ha</span>' : '<span class="px-3 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold uppercase tracking-wider">Yo\'q</span>'}
                </td>
                <td class="p-5 text-right space-x-2">
                    <button onclick="event.stopPropagation(); editField(${item.id})" class="w-8 h-8 inline-flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onclick="event.stopPropagation(); deleteField(${item.id})" class="w-8 h-8 inline-flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
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
function generateSlug(text) {
    const slug = text.toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
    document.getElementById('slug').value = slug;
}

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

function openModal(field = null) {
    const isEdit = field !== null && field.id !== undefined;
    currentFieldId = isEdit ? field.id : null;
    document.getElementById('modal-title').textContent = isEdit ? "Yo'nalishni tahrirlash" : "Yo'nalish qo'shish";
    document.getElementById('field-id').value = isEdit ? field.id : '';

    if (isEdit) {
        ['uz', 'ru', 'en'].forEach(lang => {
            document.getElementById(`title_${lang}`).value = field[`title_${lang}`] || '';
            document.getElementById(`description_${lang}`).value = field[`description_${lang}`] || '';
        });
        document.getElementById('slug').value = field.slug;
        document.getElementById('apply_url').value = field.apply_url || '';
        document.getElementById('order').value = field.order;
        document.getElementById('is_new').checked = field.is_new;
    } else {
        document.getElementById('field-form').reset();
        document.getElementById('apply_url').value = '';
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
        document.getElementById('field-form').reset();
    }, 300);
}

function editField(id) {
    const item = fieldsData.find(f => f.id === id);
    if (item) {
        openModal(item);
    }
}

async function handleSave(e) {
    e.preventDefault();
    const formData = new FormData();

    ['uz', 'ru', 'en'].forEach(lang => {
        formData.append(`title_${lang}`, document.getElementById(`title_${lang}`).value);
        formData.append(`description_${lang}`, document.getElementById(`description_${lang}`).value);
    });

    formData.append('apply_url', document.getElementById('apply_url').value);
    formData.append('slug', document.getElementById('slug').value);
    formData.append('order', document.getElementById('order').value);
    formData.append('is_new', document.getElementById('is_new').checked);

    const imageFile = document.getElementById('image').files[0];
    const iconFile = document.getElementById('icon').files[0];

    if (imageFile) formData.append('image', imageFile);
    if (iconFile) formData.append('icon', iconFile);

    const url = currentFieldId ? `/fields/${currentFieldId}` : '/fields';
    const method = currentFieldId ? 'PUT' : 'POST';

    try {
        const res = await admin.fetch(url, {
            method: method,
            body: formData
        });

        if (res && res.ok) {
            closeModal();
            loadFields();
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteField(id) {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    try {
        const res = await admin.fetch(`/fields/${id}`, { method: 'DELETE' });
        if (res && res.ok) loadFields();
    } catch (e) { console.error(e); }
}
