document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('students-scroll');
    if (!container) return;

    try {
        const response = await fetch('/api/active-students');
        if (!response.ok) throw new Error('Failed to fetch students');

        const students = await response.json();

        if (students.length === 0) {
            // container.innerHTML = '<div class="text-center w-full text-gray-500">Hozircha ma\'lumot yo\'q</div>';
            // Keep static content if no dynamic data? Or clear it?
            // Let's clear it to avoid confusion if admin deleted all
            container.innerHTML = '';
            return;
        }

        container.innerHTML = students.map(student => `
            <div class="min-w-[300px] md:min-w-[350px] bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 shadow-lg snap-center text-center transform hover:-translate-y-2 transition-transform duration-300 border border-gray-100 dark:border-gray-600">
                <img src="${student.image_url || 'https://via.placeholder.com/150'}" alt="${student.full_name_uz}"
                    class="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-blue-500 object-cover">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">${student.full_name_uz}</h3>
                <p class="text-blue-600 dark:text-blue-400 mb-2 font-medium">${student.field_uz || ''}</p>
                <p class="text-gray-600 dark:text-gray-300 text-sm italic">"${student.achievement_uz || ''}"</p>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error loading active students:', error);
    }
});
