// displayDishes.js

window.dishes = [];

async function loadDishes() {
    const apiUrl = 'https://edu.std-900.ist.mospolytech.ru/labs/api/dishes';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error(`Ошибка ${response.status}`);
        window.dishes = await response.json();
        console.log('✅ Блюда загружены:', window.dishes.length, 'шт.');

        // Debug: показать все категории
        console.log('Все категории:', [...new Set(window.dishes.map(d => d.category))]);

        renderAllSections();
    } catch (err) {
        console.error('❌ Ошибка загрузки:', err);
    }
}

function renderAllSections() {
    const sections = Array.from(document.querySelectorAll('.menu-section'));
    sections.forEach((section, index) => {
        const categories = ['soup', 'main-course', 'salad', 'drink', 'dessert'];
        const categoryKey = categories[index];
        if (!categoryKey) return;

        const catDishes = window.dishes.filter(d => d.category === categoryKey);
        catDishes.sort((a, b) => a.name.localeCompare(b.name));
        renderDishes(catDishes, section.querySelector('.dishes-grid'));

        const filters = section.querySelector('.filters');
        if (filters) {
            const btns = filters.querySelectorAll('button');
            btns.forEach(btn => {
                btn.addEventListener('click', function () {
                    const kind = this.dataset.kind;
                    btns.forEach(b => b.classList.remove('active'));
                    if (this.classList.contains('active')) {
                        this.classList.remove('active');
                        renderDishes(catDishes, section.querySelector('.dishes-grid'));
                    } else {
                        this.classList.add('active');
                        const f = catDishes.filter(d => d.kind === kind);
                        renderDishes(f, section.querySelector('.dishes-grid'));
                    }
                });
            });
        }
    });
}

function renderDishes(list, container) {
    container.innerHTML = '';
    list.forEach(d => {
        const card = document.createElement('div');
        card.className = 'dish-card';
        card.dataset.dish = d.keyword;
        card.innerHTML = `
            <img src="${d.image}" alt="${d.name}">
            <p class="price">${d.price} ₽</p>
            <p class="name">${d.name}</p>
            <p class="weight">${d.count}</p>
            <button class="add-btn">Добавить</button>
        `;
        
        // ✅ ВАЖНО: добавляем обработчик клика НА ВСЮ КАРТОЧКУ
        card.addEventListener('click', () => {
            if (typeof addToOrder === 'function') {
                addToOrder(d.keyword);
            } else {
                console.error('Функция addToOrder не найдена!');
            }
        });

        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', loadDishes);
