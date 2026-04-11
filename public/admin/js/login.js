const API_URL = '/api';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMessage');

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('admin_token', data.token);
            localStorage.setItem('admin_user', JSON.stringify(data.user));
            window.location.href = 'index.html';
        } else {
            errorMsg.textContent = data.message || 'Kirishda xatolik';
            errorMsg.classList.remove('hidden');
        }
    } catch (err) {
        errorMsg.textContent = 'Server bilan aloqa yo\'q';
        errorMsg.classList.remove('hidden');
        console.error(err);
    }
});

// Check if already logged in
if (localStorage.getItem('admin_token')) {
    window.location.href = 'index.html';
}
