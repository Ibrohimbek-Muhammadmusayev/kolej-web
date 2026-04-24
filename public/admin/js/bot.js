document.addEventListener('DOMContentLoaded', () => {
    loadBotStatus();
    loadRegistrations();
    document.getElementById('bot-form').addEventListener('submit', handleBotSave);
});

async function loadBotStatus() {
    try {
        const res = await admin.fetch('/bot/status');
        if (res) {
            const data = await res.json();
            document.getElementById('bot_token').value = data.token || '';
            document.getElementById('bot_address_example').value = data.addressExample || '';
            updateStatusIndicator(data.isRunning);
        }
    } catch (e) {
        console.error("Failed to load bot status", e);
    }
}

function updateStatusIndicator(isRunning) {
    const textEl = document.getElementById('bot-status-text');
    const container = document.getElementById('bot-status-indicator');
    
    container.innerHTML = '';
    if (isRunning) {
        container.innerHTML = `
            <span class="relative flex h-3 w-3 mr-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span class="text-sm font-bold text-emerald-600">Ishlayapti</span>
        `;
    } else {
        container.innerHTML = `
            <span class="relative flex h-3 w-3 mr-2">
                <span class="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span class="text-sm font-bold text-red-600">To'xtatilgan</span>
        `;
    }
}

async function handleBotSave(e) {
    e.preventDefault();
    const token = document.getElementById('bot_token').value;
    const addressExample = document.getElementById('bot_address_example').value;
    const btn = document.getElementById('btn-save-bot');
    const msg = document.getElementById('bot-message');
    
    btn.disabled = true;
    btn.textContent = 'Saqlanmoqda...';
    
    try {
        const res = await admin.fetch('/bot/token', {
            method: 'POST',
            body: JSON.stringify({ token, addressExample })
        });
        
        if (res) {
            const data = await res.json();
            msg.textContent = data.message;
            msg.classList.remove('hidden', 'text-red-600');
            msg.classList.add('text-emerald-600');
            updateStatusIndicator(data.isRunning);
            setTimeout(() => msg.classList.add('hidden'), 3000);
        }
    } catch (error) {
        console.error(error);
        msg.textContent = "Xatolik yuz berdi.";
        msg.classList.remove('hidden', 'text-emerald-600');
        msg.classList.add('text-red-600');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Saqlash va Ishga tushirish';
    }
}

async function loadRegistrations() {
    const tbody = document.getElementById('registrations-tbody');
    tbody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-gray-500">Yuklanmoqda...</td></tr>`;
    
    try {
        const res = await admin.fetch('/bot/registrations');
        if (res) {
            const data = await res.json();
            
            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-gray-500">Hech kim ro'yxatdan o'tmagan</td></tr>`;
                return;
            }
            
            tbody.innerHTML = data.map((reg, index) => {
                const date = new Date(reg.createdAt).toLocaleString('uz-UZ', {
                    year: 'numeric', month: '2-digit', day: '2-digit', 
                    hour: '2-digit', minute: '2-digit'
                });
                
                const statusBadge = reg.status === 'COMPLETED' 
                    ? `<span class="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-md font-bold">Yakunlangan</span>`
                    : `<span class="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-md font-bold">Jarayonda (${reg.step})</span>`;
                
                const usernameDisplay = reg.username ? `<a href="https://t.me/${reg.username}" target="_blank" class="text-blue-500 hover:underline">@${reg.username}</a>` : `<span class="text-gray-400 text-xs">yo'q</span>`;

                return `
                <tr class="hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                    <td class="p-4 text-sm font-medium text-gray-500">${index + 1}</td>
                    <td class="p-4">
                        <p class="font-bold text-gray-900">${reg.full_name || '-'}</p>
                        <p class="text-sm mt-0.5">${usernameDisplay}</p>
                        <p class="mt-1">${statusBadge}</p>
                    </td>
                    <td class="p-4 text-sm font-medium text-gray-800">${reg.age || '-'}</td>
                    <td class="p-4 text-sm font-medium text-gray-800">${reg.phone_number || '-'}</td>
                    <td class="p-4 text-sm text-gray-600">${reg.interest || '-'}</td>
                    <td class="p-4">
                        <p class="text-sm text-gray-800"><span class="text-gray-400 text-xs">Yashash:</span> ${reg.address || '-'}</p>
                        <p class="text-sm text-gray-800 mt-1"><span class="text-gray-400 text-xs">O'qish:</span> ${reg.school || '-'}</p>
                    </td>
                    <td class="p-4 text-sm text-gray-500">${date}</td>
                    <td class="p-4 text-right">
                        <button onclick="deleteRegistration('${reg.id}')" class="text-red-500 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50" title="O'chirish">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                        </button>
                    </td>
                </tr>
                `;
            }).join('');
        }
    } catch (e) {
        console.error("Failed to load registrations", e);
        tbody.innerHTML = `<tr><td colspan="8" class="p-8 text-center text-red-500">Xatolik yuz berdi</td></tr>`;
    }
}

async function deleteRegistration(id) {
    if (!confirm("Haqiqatan ham bu yozuvni o'chirmoqchimisiz?")) return;
    
    try {
        const res = await admin.fetch(`/bot/registrations/${id}`, { method: 'DELETE' });
        if (res) {
            admin.showGlobalSuccess("O'chirildi!");
            loadRegistrations();
        }
    } catch (e) {
        admin.showGlobalError("O'chirishda xatolik yuz berdi.");
    }
}
