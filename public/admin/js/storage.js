let currentOrphanFiles = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchStorageStats();
});

function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

async function fetchStorageStats() {
    const btn = document.getElementById('btn-clean');
    const btnText = document.getElementById('clean-btn-text');
    const tbody = document.getElementById('orphan-files-list');
    
    // Show loading state
    btn.disabled = true;
    btn.classList.add('bg-red-50', 'text-red-400', 'cursor-not-allowed');
    btn.classList.remove('bg-red-600', 'text-white', 'hover:bg-red-700', 'shadow-md', 'hover:shadow-lg', 'transform', 'hover:-translate-y-0.5');
    btnText.textContent = 'Yuklanmoqda...';
    tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500">Yuklanmoqda...</td></tr>`;
    
    try {
        const res = await admin.fetch('/storage/stats');
        if (res) {
            const data = await res.json();
            currentOrphanFiles = data.orphanedFilesList || [];
            
            document.getElementById('stat-total-size').textContent = formatBytes(data.totalSize);
            document.getElementById('stat-total-files').textContent = `${data.totalFiles} ta`;
            document.getElementById('stat-orphan-size').textContent = formatBytes(data.orphanedSize);
            document.getElementById('stat-orphan-count').textContent = `(${data.orphanedCount} ta)`;
            
            renderFilesTable();

            // Enable button only if there are orphaned files
            if (data.orphanedCount > 0) {
                btn.disabled = false;
                btn.classList.remove('bg-red-50', 'text-red-400', 'cursor-not-allowed');
                btn.classList.add('bg-red-600', 'text-white', 'hover:bg-red-700', 'shadow-md', 'hover:shadow-lg', 'transform', 'hover:-translate-y-0.5');
                btnText.textContent = 'Barchasini tozalash';
            } else {
                btnText.textContent = 'Tozalash shart emas';
            }
        }
    } catch (e) {
        console.error("Failed to fetch storage stats", e);
        btnText.textContent = 'Xatolik';
        tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-red-500">Xatolik yuz berdi</td></tr>`;
    }
}

function renderFilesTable() {
    const tbody = document.getElementById('orphan-files-list');
    if (currentOrphanFiles.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-500">Ortiqcha fayllar topilmadi</td></tr>`;
        return;
    }

    tbody.innerHTML = currentOrphanFiles.map((f, i) => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="p-4 text-center">
                <input type="checkbox" value="${f.name}" class="file-checkbox w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer" onchange="updateSelectedCount()">
            </td>
            <td class="p-4">
                <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer" onclick="viewMedia('/uploads/${f.name}', '${f.type}')">
                        ${f.type === 'image' 
                            ? `<img src="/uploads/${f.name}" class="w-full h-full object-cover">`
                            : `<div class="w-full h-full flex items-center justify-center text-gray-400"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg></div>`
                        }
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-900 truncate max-w-xs">${f.name}</p>
                        <p class="text-xs text-gray-500">${new Date(f.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            </td>
            <td class="p-4 text-sm text-gray-600 capitalize">${f.type}</td>
            <td class="p-4 text-sm text-gray-600">${formatBytes(f.size)}</td>
            <td class="p-4 text-right">
                <div class="flex items-center justify-end space-x-2">
                    <button onclick="viewMedia('/uploads/${f.name}', '${f.type}')" class="text-blue-500 hover:text-blue-700 transition-colors" title="Ko'rish">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                    </button>
                    <button onclick="cleanSelectedFiles(['${f.name}'])" class="text-red-500 hover:text-red-700 transition-colors" title="O'chirish">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    document.getElementById('selectAll').checked = false;
    updateSelectedCount();
}

function toggleSelectAll() {
    const selectAll = document.getElementById('selectAll');
    const checkboxes = document.querySelectorAll('.file-checkbox');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
    updateSelectedCount();
}

function updateSelectedCount() {
    const checkboxes = document.querySelectorAll('.file-checkbox:checked');
    const btn = document.getElementById('btn-clean-selected');
    const btnText = document.getElementById('clean-selected-text');
    
    const count = checkboxes.length;
    btnText.textContent = `Tanlanganlarni o'chirish (${count})`;
    
    if (count > 0) {
        btn.disabled = false;
        btn.classList.remove('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
        btn.classList.add('bg-red-500', 'text-white', 'hover:bg-red-600', 'shadow-md');
    } else {
        btn.disabled = true;
        btn.classList.add('bg-gray-100', 'text-gray-400', 'cursor-not-allowed');
        btn.classList.remove('bg-red-500', 'text-white', 'hover:bg-red-600', 'shadow-md');
    }
}

async function cleanSelectedFiles(forceFiles = null) {
    let filesToDelete = forceFiles;
    
    if (!filesToDelete) {
        const checkboxes = document.querySelectorAll('.file-checkbox:checked');
        filesToDelete = Array.from(checkboxes).map(cb => cb.value);
    }
    
    if (filesToDelete.length === 0) return;
    
    if (!confirm(`Haqiqatan ham ${filesToDelete.length} ta faylni o'chirmoqchimisiz?`)) {
        return;
    }
    
    try {
        const res = await admin.fetch('/storage/clean', { 
            method: 'DELETE',
            body: JSON.stringify({ files: filesToDelete })
        });
        if (res) {
            const data = await res.json();
            admin.showGlobalSuccess(`${data.deletedCount} ta fayl o'chirildi. \nBo'shatilgan joy: ${formatBytes(data.freedSpace)}`);
            await fetchStorageStats();
        }
    } catch (e) {
        console.error("Clean error", e);
        admin.showGlobalError("Tozalashda xatolik yuz berdi!");
    }
}

async function cleanStorage() {
    if (!confirm("Haqiqatan ham barcha ortiqcha fayllarni birdaniga o'chirib tashlamoqchimisiz? Bu jarayonni ortga qaytarib bo'lmaydi!")) {
        return;
    }
    
    const btn = document.getElementById('btn-clean');
    const spinner = document.getElementById('clean-spinner');
    const btnText = document.getElementById('clean-btn-text');
    
    btn.disabled = true;
    spinner.classList.remove('hidden');
    btnText.textContent = 'Tozalanmoqda...';
    
    try {
        // Not passing 'files' array will delete all orphaned files (as per backend logic)
        const res = await admin.fetch('/storage/clean', { method: 'DELETE' });
        if (res) {
            const data = await res.json();
            admin.showGlobalSuccess(`Muvaffaqiyatli! ${data.deletedCount} ta fayl o'chirildi. \nBo'shatilgan joy: ${formatBytes(data.freedSpace)}`);
            await fetchStorageStats();
        }
    } catch (e) {
        console.error("Clean all error", e);
        admin.showGlobalError("Tozalashda xatolik yuz berdi!");
    } finally {
        spinner.classList.add('hidden');
    }
}

// Media view Modal
function viewMedia(src, type) {
    const modal = document.getElementById('image-modal');
    const container = document.getElementById('modal-media-container');
    const content = document.getElementById('modal-content');
    
    container.innerHTML = '';
    if (type === 'image') {
        container.innerHTML = `<img src="${src}" class="max-w-full max-h-[80vh] object-contain rounded-lg">`;
    } else {
        container.innerHTML = `<video src="${src}" controls autoplay class="max-w-full max-h-[80vh] rounded-lg"></video>`;
    }
    
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.classList.remove('opacity-0');
        content.classList.remove('scale-95');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('image-modal');
    const content = document.getElementById('modal-content');
    const container = document.getElementById('modal-media-container');
    
    modal.classList.add('opacity-0');
    content.classList.add('scale-95');
    setTimeout(() => {
        modal.classList.add('hidden');
        container.innerHTML = ''; // Stop video if playing
    }, 300);
}
