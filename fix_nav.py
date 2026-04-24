import os
import re

html_files = [
    'index.html', 'about.html', 'contact.html', 'news.html',
    'news-details.html', 'sohalar.html', 'field-details.html', 'students.html', '404.html'
]

template = """    <header>
        <nav class="fixed top-0 left-0 right-0 bg-blue-900/80 backdrop-blur-md dark:bg-gray-800/80 p-6 z-30 transition-all duration-300">
            <div class="container mx-auto flex justify-between items-center">
                <a href="/" class="text-white text-xl font-bold flex items-center">
                    <img id="site-logo" src="images/logo.png" alt="Quva tumani Politexnikumi Logo" class="h-10 mr-3">
                    <span class="text-white font-bold text-lg" data-i18n="hero-title">Quva tumani Politexnikumi</span>
                </a>
                <div class="flex items-center gap-4">
                    <!-- Menu for desktop -->
                    <div class="hidden md:flex items-center space-x-6">
                        <ul class="hidden lg:flex items-center space-x-6">
                            <li><a href="/" class="__CLASS_HOME__" data-i18n="nav-home">Bosh sahifa</a></li>
                            <li><a href="sohalar.html" class="__CLASS_SOHALAR__" data-i18n="nav-fields">Yo'nalishlar</a></li>
                            <li><a href="about.html" class="__CLASS_ABOUT__" data-i18n="nav-about">Biz haqimizda</a></li>
                            <li><a href="students.html" class="__CLASS_STUDENTS__" data-i18n="nav-students">O'quvchilar uchun</a></li>
                            <li><a href="news.html" class="__CLASS_NEWS__" data-i18n="nav-news">Yangiliklar</a></li>
                            <li><a href="contact.html" class="__CLASS_CONTACT__" data-i18n="nav-contact">Aloqa</a></li>
                        </ul>
                        <!-- Controls -->
                        <div class="flex items-center space-x-4">
                            <button id="theme-toggle" class="text-white">
                                <svg id="theme-toggle-dark-icon" class="w-6 h-6 hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(255,255,255,1)"><path d="M11.3807 2.01886C9.91573 3.38768 9 5.3369 9 7.49999C9 11.6421 12.3579 15 16.5 15C18.6631 15 20.6123 14.0843 21.9811 12.6193C21.6613 17.8537 17.3149 22 12 22C6.47715 22 2 17.5228 2 12C2 6.68514 6.14629 2.33869 11.3807 2.01886Z"></path></svg>
                                <svg id="theme-toggle-light-icon" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(255,255,255,1)"><path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"></path></svg>
                            </button>
                            <div class="relative">
                                <button id="lang-btn" class="text-white flex items-center">
                                    <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(255,255,255,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM9.71002 19.6674C8.74743 17.6259 8.15732 15.3742 8.02731 13H4.06189C4.458 16.1765 6.71639 18.7747 9.71002 19.6674ZM10.0307 13C10.1811 15.4388 10.8778 17.7297 12 19.752C13.1222 17.7297 13.8189 15.4388 13.9693 13H10.0307ZM19.9381 13H15.9727C15.8427 15.3742 15.2526 17.6259 14.29 19.6674C17.2836 18.7747 19.542 16.1765 19.9381 13ZM4.06189 11H8.02731C8.15732 8.62577 8.74743 6.37407 9.71002 4.33256C6.71639 5.22533 4.458 7.8235 4.06189 11ZM10.0307 11H13.9693C13.8189 8.56122 13.1222 6.27025 12 4.24799C10.8778 6.27025 10.1811 8.56122 10.0307 11ZM14.29 4.33256C15.2526 6.37407 15.8427 8.62577 15.9727 11H19.9381C19.542 7.8235 17.2836 5.22533 14.29 4.33256Z"></path></svg>
                                </button>
                                <ul id="lang-menu" class="absolute right-0 hidden bg-white dark:bg-gray-700 text-gray-800 dark:text-white mt-2 py-1 rounded-md shadow-lg">
                                    <li><a href="#" data-lang="uz" class="lang-option flex items-center px-4 py-2 text-sm">UZ <svg class="lang-check w-4 h-4 ml-2 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></a></li>
                                    <li><a href="#" data-lang="ru" class="lang-option flex items-center px-4 py-2 text-sm">RU <svg class="lang-check w-4 h-4 ml-2 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></a></li>
                                    <li><a href="#" data-lang="en" class="lang-option flex items-center px-4 py-2 text-sm">EN <svg class="lang-check w-4 h-4 ml-2 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <!-- Hamburger button -->
                    <div class="lg:hidden flex items-center">
                        <button id="menu-btn" class="text-white focus:outline-none">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            <!-- Mobile menu -->
            <div id="mobile-menu" class="hidden lg:hidden">
                <ul class="mt-4 space-y-2">
                    <li><a href="/" class="__CLASS_HOME_MOBILE__" data-i18n="nav-home">Bosh sahifa</a></li>
                    <li><a href="sohalar.html" class="__CLASS_SOHALAR_MOBILE__" data-i18n="nav-fields">Yo'nalishlar</a></li>
                    <li><a href="about.html" class="__CLASS_ABOUT_MOBILE__" data-i18n="nav-about">Biz haqimizda</a></li>
                    <li><a href="students.html" class="__CLASS_STUDENTS_MOBILE__" data-i18n="nav-students">O'quvchilar uchun</a></li>
                    <li><a href="news.html" class="__CLASS_NEWS_MOBILE__" data-i18n="nav-news">Yangiliklar</a></li>
                    <li><a href="contact.html" class="__CLASS_CONTACT_MOBILE__" data-i18n="nav-contact">Aloqa</a></li>
                </ul>
                <!-- Controls for mobile -->
                <div class="flex items-center space-x-4 mt-4 md:hidden">
                    <button id="theme-toggle-mobile" class="text-white">
                        <svg id="theme-toggle-dark-icon-mobile" class="w-6 h-6 hidden" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(255,255,255,1)"><path d="M11.3807 2.01886C9.91573 3.38768 9 5.3369 9 7.49999C9 11.6421 12.3579 15 16.5 15C18.6631 15 20.6123 14.0843 21.9811 12.6193C21.6613 17.8537 17.3149 22 12 22C6.47715 22 2 17.5228 2 12C2 6.68514 6.14629 2.33869 11.3807 2.01886Z"></path></svg>
                        <svg id="theme-toggle-light-icon-mobile" class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(255,255,255,1)"><path d="M12 18C8.68629 18 6 15.3137 6 12C6 8.68629 8.68629 6 12 6C15.3137 6 18 8.68629 18 12C18 15.3137 15.3137 18 12 18ZM12 16C14.2091 16 16 14.2091 16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12C8 14.2091 9.79086 16 12 16ZM11 1H13V4H11V1ZM11 20H13V23H11V20ZM3.51472 4.92893L4.92893 3.51472L7.05025 5.63604L5.63604 7.05025L3.51472 4.92893ZM16.9497 18.364L18.364 16.9497L20.4853 19.0711L19.0711 20.4853L16.9497 18.364ZM19.0711 3.51472L20.4853 4.92893L18.364 7.05025L16.9497 5.63604L19.0711 3.51472ZM5.63604 16.9497L7.05025 18.364L4.92893 20.4853L3.51472 19.0711L5.63604 16.9497ZM23 11V13H20V11H23ZM4 11V13H1V11H4Z"></path></svg>
                    </button>
                    <div class="relative">
                        <button id="lang-btn-mobile" class="text-white flex items-center">
                            <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="rgba(255,255,255,1)"><path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM9.71002 19.6674C8.74743 17.6259 8.15732 15.3742 8.02731 13H4.06189C4.458 16.1765 6.71639 18.7747 9.71002 19.6674ZM10.0307 13C10.1811 15.4388 10.8778 17.7297 12 19.752C13.1222 17.7297 13.8189 15.4388 13.9693 13H10.0307ZM19.9381 13H15.9727C15.8427 15.3742 15.2526 17.6259 14.29 19.6674C17.2836 18.7747 19.542 16.1765 19.9381 13ZM4.06189 11H8.02731C8.15732 8.62577 8.74743 6.37407 9.71002 4.33256C6.71639 5.22533 4.458 7.8235 4.06189 11ZM10.0307 11H13.9693C13.8189 8.56122 13.1222 6.27025 12 4.24799C10.8778 6.27025 10.1811 8.56122 10.0307 11ZM14.29 4.33256C15.2526 6.37407 15.8427 8.62577 15.9727 11H19.9381C19.542 7.8235 17.2836 5.22533 14.29 4.33256Z"></path></svg>
                        </button>
                        <ul id="lang-menu-mobile" class="absolute right-0 hidden bg-white dark:bg-gray-700 text-gray-800 dark:text-white mt-2 py-1 rounded-md shadow-lg">
                            <li><a href="#" data-lang="uz" class="lang-option-mobile flex items-center px-4 py-2 text-sm">UZ <svg class="lang-check-mobile w-4 h-4 ml-2 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></a></li>
                            <li><a href="#" data-lang="ru" class="lang-option-mobile flex items-center px-4 py-2 text-sm">RU <svg class="lang-check-mobile w-4 h-4 ml-2 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></a></li>
                            <li><a href="#" data-lang="en" class="lang-option-mobile flex items-center px-4 py-2 text-sm">EN <svg class="lang-check-mobile w-4 h-4 ml-2 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg></a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </nav>
    </header>"""

active_cls = "text-blue-400 font-bold transition-colors duration-300"
inactive_cls = "text-white hover:text-blue-300 transition-colors duration-300"
active_mob = "block text-blue-400 font-bold transition-colors duration-300"
inactive_mob = "block text-white hover:text-blue-300 transition-colors duration-300"

page_map = {
    'index.html': 'HOME',
    'sohalar.html': 'SOHALAR',
    'about.html': 'ABOUT',
    'students.html': 'STUDENTS',
    'news.html': 'NEWS',
    'news-details.html': 'NEWS',
    'field-details.html': 'SOHALAR',
    'contact.html': 'CONTACT',
    '404.html': 'HOME'
}

for file in html_files:
    filepath = f"public/{file}"
    if not os.path.exists(filepath):
        continue
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Find all headers. We want to replace from the very first <header> to the very last </header> before <main>
    # Some files might only have one <header>, some might have duplicates.
    # regex to match from <header> to </header> (greedy) but stop before <main>
    # Actually, let's just find the first <header> and the last </header> before <main
    
    first_header_idx = content.find('<header>')
    main_idx = content.find('<main')
    
    if first_header_idx == -1 or main_idx == -1:
        print(f"Skipping {file}: missing header or main tag")
        continue
        
    last_header_end_idx = content.rfind('</header>', 0, main_idx)
    
    if last_header_end_idx == -1:
        print(f"Skipping {file}: missing closing header tag before main")
        continue
        
    last_header_end_idx += len('</header>')
    
    # build the specific header for this file
    page_key = page_map.get(file, 'HOME')
    
    specific_header = template
    for key in ['HOME', 'SOHALAR', 'ABOUT', 'STUDENTS', 'NEWS', 'CONTACT']:
        d_class = active_cls if key == page_key else inactive_cls
        m_class = active_mob if key == page_key else inactive_mob
        specific_header = specific_header.replace(f"__CLASS_{key}__", d_class)
        specific_header = specific_header.replace(f"__CLASS_{key}_MOBILE__", m_class)
        
    new_content = content[:first_header_idx] + specific_header + content[last_header_end_idx:]
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print(f"Fixed {file}")

