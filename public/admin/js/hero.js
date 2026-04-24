let currentSlideId = null;

document.addEventListener('DOMContentLoaded', () => {
    loadSlides();
    document.getElementById('slide-form').addEventListener('submit', handleSave);
});

async function loadSlides() {
    const tbody = document.getElementById('slides-table-body');
    tbody.innerHTML = '<tr><td colspan="5" class="p-8 text-center text-gray-500 font-medium bg-white">Yuklanmoqda...</td></tr>';

    try {
        const res = await admin.fetch('/hero');
        if (!res) {
            tbody.innerHTML = admin.getEmptyStateHtml("Ma'lumotlarni yuklash xatosi", 5);
            return;
        }
        const slides = await res.json();

        if (slides.length === 0) {
            tbody.innerHTML = admin.getEmptyStateHtml("Slaydlar hali qo'shilmagan", 5);
            return;
        }

        tbody.innerHTML = slides.map(item => `
            <tr class="hover:bg-blue-50/50 transition-colors border-b border-gray-50 cursor-pointer group" onclick='editSlide(${JSON.stringify(item).replace(/'/g, "&#39;")})'>
                <td class="p-5 text-center">
                    <div class="w-24 h-16 rounded-lg overflow-hidden shadow-sm inline-block border-2 border-white group-hover:border-blue-100 transition-all">
                        ${item.media_type === 'video'
                ? `<video src="${item.media_url}" class="w-full h-full object-cover bg-black" muted></video>`
                : `<img src="${item.media_url}" class="w-full h-full object-cover bg-gray-200">`
            }
                    </div>
                </td>
                <td class="p-5 font-bold text-gray-800">${item.title_uz || '<span class="text-gray-400 font-normal italic">Kiritilmagan</span>'}</td>
                <td class="p-5 text-sm font-medium text-gray-500 max-w-xs truncate">${item.description_uz || '-'}</td>
                <td class="p-5 text-center text-gray-400 font-semibold">${item.order}</td>
                <td class="p-5 text-right space-x-2 w-32">
                    <button class="w-8 h-8 rounded-full bg-white text-blue-600 hover:bg-blue-600 hover:text-white shadow-sm transition-all border border-gray-100 flex items-center justify-center transform group-hover:scale-110" onclick="event.stopPropagation(); editSlide(${JSON.stringify(item).replace(/'/g, "&#39;")})">✏️</button>
                    <button class="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-500 hover:text-white shadow-sm transition-all border border-gray-100 flex items-center justify-center transform group-hover:scale-110" onclick="event.stopPropagation(); deleteSlide(${item.id})">🗑️</button>
                </td>
            </tr>
        `).join('');

    } catch (e) {
        console.error(e);
        tbody.innerHTML = admin.getEmptyStateHtml("Tizimda xatolik yuz berdi", 5);
    }
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

function openModal() {
    currentSlideId = null;
    document.getElementById('modal-title').textContent = "Slayd qo'shish";
    document.getElementById('slide-form').reset();
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
    }, 300);
}

function editSlide(item) {
    if (typeof item === 'number') return; // protection against string fallback
    currentSlideId = item.id;
    document.getElementById('modal-title').textContent = "Slaydni tahrirlash";

    ['uz', 'ru', 'en'].forEach(lang => {
        document.getElementById(`title_${lang}`).value = item[`title_${lang}`] || '';
        document.getElementById(`description_${lang}`).value = item[`description_${lang}`] || '';
    });

    document.getElementById('order').value = item.order;
    switchTab('uz');

    const modal = document.getElementById('modal');
    const modalContent = document.getElementById('modal-content');

    modal.classList.remove('hidden');
    void modal.offsetWidth; // Trigger reflow

    modalContent.classList.remove('opacity-0', 'scale-95');
    modalContent.classList.add('opacity-100', 'scale-100');
}

async function handleSave(e) {
    e.preventDefault();
    const formData = new FormData();

    ['uz', 'ru', 'en'].forEach(lang => {
        formData.append(`title_${lang}`, document.getElementById(`title_${lang}`).value);
        formData.append(`description_${lang}`, document.getElementById(`description_${lang}`).value);
    });

    formData.append('order', document.getElementById('order').value);

    const mediaFile = document.getElementById('media').files[0];
    if (mediaFile) {
        formData.append('media', mediaFile);
    }

    const url = currentSlideId ? `/hero/${currentSlideId}` : '/hero';
    const method = currentSlideId ? 'PUT' : 'POST';

    try {
        const res = await admin.fetch(url, {
            method: method,
            body: formData
        });

        if (res && res.ok) {
            closeModal();
            loadSlides();
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteSlide(id) {
    if (!confirm("Haqiqatan ham o'chirmoqchimisiz?")) return;
    try {
        const res = await admin.fetch(`/hero/${id}`, { method: 'DELETE' });
        if (res && res.ok) loadSlides();
    } catch (e) { console.error(e); }
}
