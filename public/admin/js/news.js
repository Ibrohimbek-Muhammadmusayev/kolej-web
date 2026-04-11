let currentNewsId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadNews();

    // Set today for new entries
    document.getElementById('news-date').valueAsDate = new Date();

    document.getElementById('news-form').addEventListener('submit', handleSave);
});

async function loadNews() {
    const tbody = document.getElementById('news-table-body');
    tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-500 font-medium">Yuklanmoqda...</td></tr>';

    try {
        const res = await admin.fetch('/news');
        if (!res) {
            tbody.innerHTML = admin.getEmptyStateHtml("Ma'lumotlarni yuklash xatosi", 5);
            return;
        }
        const data = await res.json();
        const news = data.rows || data;

        if (news.length === 0) {
            tbody.innerHTML = admin.getEmptyStateHtml("Yangiliklar hali qo'shilmagan", 5);
            return;
        }

        tbody.innerHTML = news.map((item, index) => `
            <tr class="hover:bg-blue-50/50 transition-colors group cursor-pointer" onclick="editNews(${item.id})">
                <td class="p-5 text-center font-medium text-gray-500">${index + 1}</td>
                <td class="p-5 text-center">
                    <div class="w-16 h-12 rounded-lg bg-gray-100 mx-auto overflow-hidden shadow-sm border border-gray-200">
                        ${item.image ? `<img src="../${item.image}" class="w-full h-full object-cover">` : '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">Rasm yo\'q</div>'}
                    </div>
                </td>
                <td class="p-5 font-medium text-gray-800">${item.title_uz}</td>
                <td class="p-5 text-center text-gray-500 text-sm whitespace-nowrap">${new Date(item.date).toLocaleDateString('uz-UZ')}</td>
                <td class="p-5 text-right space-x-2">
                    <button onclick="event.stopPropagation(); editNews(${item.id})" class="w-8 h-8 inline-flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:scale-110 transition-all">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button onclick="event.stopPropagation(); deleteNews(${item.id})" class="w-8 h-8 inline-flex items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (e) {
        console.error(e);
        tbody.innerHTML = admin.getEmptyStateHtml("Tizimda xatolik yuz berdi", 5);
    }
}

// --- MODAL & TABS ---
async function openModal(newsId = null) {
    const isEdit = newsId !== null;
    currentNewsId = newsId;
    document.getElementById('news-form').reset();
    document.getElementById('news-id').value = '';
    document.getElementById('modal-title').textContent = "Yangilik qo'shish";

    if (isEdit) {
        try {
            const res = await admin.fetch(`/news/${newsId}`);
            if (!res.ok) throw new Error('Failed to fetch news item');
            const news = await res.json();

            document.getElementById('modal-title').textContent = "Yangilikni tahrirlash";
            document.getElementById('news-id').value = news.id;

            document.getElementById('title_uz').value = news.title_uz || '';
            document.getElementById('description_uz').value = news.description_uz || '';
            document.getElementById('content_uz').value = news.content_uz || '';

            document.getElementById('title_ru').value = news.title_ru || '';
            document.getElementById('description_ru').value = news.description_ru || '';
            document.getElementById('content_ru').value = news.content_ru || '';

            document.getElementById('title_en').value = news.title_en || '';
            document.getElementById('description_en').value = news.description_en || '';
            document.getElementById('content_en').value = news.content_en || '';

            document.getElementById('news-category').value = news.category || '';
            if (news.date) {
                document.getElementById('news-date').value = news.date.split('T')[0];
            }
        } catch (error) {
            console.error("Error loading news for edit:", error);
            // Optionally, show an error message to the user
            return; // Prevent modal from opening if data fetch fails
        }
    } else {
        document.getElementById('news-date').valueAsDate = new Date();
    }

    switchTab('uz');

    // UI Transitions
    const modal = document.getElementById('modal');
    modal.classList.remove('hidden');
    setTimeout(() => {
        const content = document.getElementById('modal-content');
        content.classList.remove('scale-95', 'opacity-0');
        content.classList.add('scale-100', 'opacity-100');
    }, 10);
}

function editNews(id) {
    openModal(id);
}

function closeModal() {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modal-content');

    // Reverse UI Transitions
    content.classList.remove('scale-100', 'opacity-100');
    content.classList.add('scale-95', 'opacity-0');

    setTimeout(() => {
        modal.classList.add('hidden');
        document.getElementById('news-form').reset();
    }, 300);
}

function switchTab(lang) {
    ['uz', 'ru', 'en'].forEach(l => {
        document.getElementById(`tab-${l}`).classList.add('hidden');
        const btn = document.getElementById(`tab-btn-${l}`);

        // Reset tab styling to inactive state
        btn.classList.remove('bg-white', 'text-blue-600', 'shadow-sm', 'font-bold');
        btn.classList.add('text-gray-500', 'hover:text-gray-700', 'hover:bg-gray-200/50', 'font-medium');
    });

    // Apply active styling
    document.getElementById(`tab-${lang}`).classList.remove('hidden');
    const activeBtn = document.getElementById(`tab-btn-${lang}`);
    activeBtn.classList.remove('text-gray-500', 'hover:text-gray-700', 'hover:bg-gray-200/50', 'font-medium');
    activeBtn.classList.add('bg-white', 'text-blue-600', 'shadow-sm', 'font-bold');
}

// --- CRUD ---
async function handleSave(e) {
    e.preventDefault();

    const formData = new FormData();

    // Append Text Fields
    ['uz', 'ru', 'en'].forEach(lang => {
        formData.append(`title_${lang}`, document.getElementById(`title_${lang}`).value);
        formData.append(`description_${lang}`, document.getElementById(`description_${lang}`).value);
        formData.append(`content_${lang}`, document.getElementById(`content_${lang}`).value);
    });

    formData.append('date', document.getElementById('news-date').value);
    formData.append('category', document.getElementById('news-category').value);

    // Append File
    const fileInput = document.getElementById('news-image');
    if (fileInput.files[0]) {
        formData.append('files', fileInput.files[0]); // Controller expects 'files' array but single file works usually if middleware handles
        // Wait, routes/index.js uses upload.array('files', 5)
        // So this is correct.
    }

    const url = currentNewsId ? `/news/${currentNewsId}` : '/news';
    const method = currentNewsId ? 'PUT' : 'POST';

    try {
        const res = await admin.fetch(url, {
            method: method,
            body: formData
        });

        if (res && res.ok) {
            closeModal();
            loadNews();
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteNews(id) {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    try {
        const res = await admin.fetch(`/news/${id}`, { method: 'DELETE' });
        if (res && res.ok) loadNews();
    } catch (e) { console.error(e); }
}
