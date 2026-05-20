document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    document.getElementById('settings-form').addEventListener('submit', handleSave);
});

async function loadSettings() {
    try {
        const res = await admin.fetch('/settings');
        const data = await res.json(); // key-value object

        // Populate fields by ID matching Key
        Object.keys(data).forEach(key => {
            const el = document.getElementById(key);
            if (el) {
                el.value = data[key];
            }
        });

    } catch (e) { console.error(e); }
}

async function handleSave(e) {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const msg = document.getElementById('message');

    // Remove any previous success/error styles
    msg.classList.remove('bg-emerald-50', 'text-emerald-600', 'bg-red-50', 'text-red-600');
    btn.disabled = true;
    btn.textContent = 'Saqlanmoqda...';

    // Gather all inputs with IDs
    const inputs = document.querySelectorAll('#settings-form input, #settings-form textarea');
    const updates = {};

    inputs.forEach(input => {
        if (input.id) {
            updates[input.id] = input.value;
        }
    });

    try {
        const res = await admin.fetch('/settings', {
            method: 'PUT',
            body: JSON.stringify(updates)
        });

        if (res && res.ok) {
            msg.textContent = "Sozlamalar saqlandi!";
            msg.classList.add('bg-emerald-50', 'text-emerald-600');
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
        } else {
            msg.textContent = "Xatolik yuz berdi.";
            msg.classList.add('bg-red-50', 'text-red-600');
            msg.classList.remove('hidden');
            setTimeout(() => msg.classList.add('hidden'), 3000);
        }
    } catch (e) {
        console.error(e);
        msg.textContent = "Server xatoligi.";
        msg.classList.add('bg-red-50', 'text-red-600');
        msg.classList.remove('hidden');
        setTimeout(() => msg.classList.add('hidden'), 3000);
    } finally {
        btn.disabled = false;
        btn.textContent = 'O\'zgarishlarni Saqlash';
    }
}

// Tabs
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
