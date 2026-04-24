import os

placeholder_url = "https://media.istockphoto.com/id/1147544807/vector/thumbnail-image-vector-graphic.jpg?s=612x612&w=0&k=20&c=rnCKVbdxqkjlcs3xH87-9gocETqpspHFXu5dIGB4wuM="

targets = [
    "https://picsum.photos/300/300?random=10",
    "https://picsum.photos/300/300?random=11",
    "https://picsum.photos/300/300?random=12",
    "https://picsum.photos/300/300?random=13",
    "https://picsum.photos/400/300?random=20",
    "https://picsum.photos/400/300?random=21",
    "https://picsum.photos/400/300?random=22",
    "https://picsum.photos/400/300?random=23",
    "https://randomuser.me/api/portraits/men/32.jpg",
    "https://randomuser.me/api/portraits/women/44.jpg",
    "https://randomuser.me/api/portraits/men/85.jpg",
    "https://randomuser.me/api/portraits/women/65.jpg",
    "https://randomuser.me/api/portraits/men/11.jpg",
    "https://via.placeholder.com/150",
    "https://via.placeholder.com/800x600.png?text=1-Kurslar+Dars+Jadvali",
    "https://via.placeholder.com/800x600.png?text=2-Kurslar+Dars+Jadvali",
    "https://picsum.photos/400/300"
]

files = [
    "public/about.html",
    "public/index.html",
    "public/news.html",
    "public/students.html",
    "public/js/active-students-loader.js",
    "public/news-script.js"
]

for file_path in files:
    full_path = os.path.join("/media/coder/New Volume/loyihalar/kolej-web", file_path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for target in targets:
            content = content.replace(target, placeholder_url)
        
        if content != original_content:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file_path}")
