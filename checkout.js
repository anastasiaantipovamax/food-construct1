// checkout.js

document.addEventListener('DOMContentLoaded', function() {
    // Ждём, пока window.dishes загрузятся
    const checkDishes = setInterval(() => {
        if (window.dishes && window.dishes.length > 0) {
            clearInterval(checkDishes);
            loadOrderSummary();
        }
    }, 100);

    // Обработчик отправки формы
    const form = document.getElementById('checkout-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// === ЗАГРУЗКА СОСТАВА ЗАКАЗА ===
function loadOrderSummary() {
    const container = document.getElementById('order-items');
    const emptyMsg = document.getElementById('empty-order-message');

    const keys = JSON.parse(localStorage.getItem('selectedDishes') || '[]');

    if (keys.length === 0) {
        container.style.display = 'none';
        emptyMsg.style.display = 'block';
        updateOrderDisplay();
        return;
    }

    container.style.display = 'grid';
    emptyMsg.style.display = 'none';
    container.innerHTML = '';

    keys.forEach(key => {
        const dish = window.dishes.find(d => d.keyword === key);
        if (!dish) return;

        const card = document.createElement('div');
        card.className = 'dish-card';
        card.innerHTML = `
            <img src="${dish.image}" alt="${dish.name}">
            <p class="price">${dish.price} ₽</p>
            <p class="name">${dish.name}</p>
            <p class="weight">${dish.count}</p>
            <button class="remove-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Удалить
            </button>
        `;
        card.querySelector('.remove-btn').addEventListener('click', () => {
            removeFromOrder(key);
        });
        container.appendChild(card);
    });

    updateOrderDisplay();
}

// === УДАЛЕНИЕ БЛЮДА ===
function removeFromOrder(keyword) {
    let keys = JSON.parse(localStorage.getItem('selectedDishes') || '[]');
    keys = keys.filter(k => k !== keyword);
    localStorage.setItem('selectedDishes', JSON.stringify(keys));
    loadOrderSummary();
}

// === ПРОВЕРКА КОМБО (ТОЧНАЯ) ===
function isValidCombo() {
    const keys = JSON.parse(localStorage.getItem('selectedDishes') || '[]');
    if (keys.length === 0) return false;

    // Получаем категории
    const cats = keys.map(k => {
        const d = window.dishes.find(dd => dd.keyword === k);
        return d ? normalizeCategory(d.category) : null;
    }).filter(Boolean);

    const hasSoup = cats.includes('soup');
    const hasMain = cats.includes('main');
    const hasStarter = cats.includes('starter');
    const hasDrink = cats.includes('drink');

    const mainItems = (hasSoup ? 1 : 0) + (hasMain ? 1 : 0) + (hasStarter ? 1 : 0);

    // ✅ 5 разрешённых комбо:
    return (
        // 1. Суп + главное + салат + напиток
        (hasSoup && hasMain && hasStarter && hasDrink) ||
        // 2. Суп + главное + напиток
        (hasSoup && hasMain && hasDrink) ||
        // 3. Суп + салат + напиток
        (hasSoup && hasStarter && hasDrink) ||
        // 4. Главное + салат + напиток
        (hasMain && hasStarter && hasDrink) ||
        // 5. Главное + напиток
        (hasMain && hasDrink)
    );
}

function normalizeCategory(cat) {
    if (!cat) return null;
    cat = cat.toLowerCase();
    if (cat.includes('soup')) return 'soup';
    if (cat.includes('main') || cat.includes('course')) return 'main';
    if (cat.includes('salad') || cat.includes('starter') || cat.includes('appetizer')) return 'starter';
    if (cat.includes('drink')) return 'drink';
    if (cat.includes('dessert')) return 'dessert';
    return null;
}

// === ОТПРАВКА ФОРМЫ ===
async function handleFormSubmit(e) {
    e.preventDefault();

    // Принудительно обновляем заказ из localStorage
    loadOrderSummary();

    if (!isValidCombo()) {
        alert('⚠️ Выберите блюда, соответствующие одному из доступных комбо.\n\nНапример: Суп + Главное блюдо + Напиток');
        return;
    }

    // Собираем данные формы
    const formData = new FormData(e.target);
    const deliveryType = formData.get('delivery_time_option');

    // Получаем ID блюд (предполагаем, что у блюд есть поле `id`)
    const getDishId = (keyword) => {
        const d = window.dishes.find(dd => dd.keyword === keyword);
        return d ? d.id || d.keyword : null;
    };

    const keys = JSON.parse(localStorage.getItem('selectedDishes') || '[]');
    const dishMap = {};
    keys.forEach(k => {
        const d = window.dishes.find(dd => dd.keyword === k);
        if (d) dishMap[normalizeCategory(d.category)] = getDishId(k);
    });

    // Формируем тело запроса
    const payload = {
        full_name: formData.get('name'),
        email: formData.get('email'),
        subscribe: formData.get('subscribe') ? 1 : 0,
        phone: formData.get('phone'),
        delivery_address: formData.get('address'),
        delivery_type: deliveryType === 'asap' ? 'now' : 'by_time',
        delivery_time: deliveryType === 'specific' ? formData.get('delivery_time') : null,
        comment: formData.get('comment') || '',
        soup_id: dishMap.soup || null,
        main_course_id: dishMap.main || null,
        salad_id: dishMap.starter || null,
        drink_id: dishMap.drink || null,
        dessert_id: dishMap.dessert || null
    };

    // 🔑 ВАШ API KEY — ЗАМЕНИТЕ НА СВОЙ!
    const API_KEY = '123e4567-e89b-12d3-a456-426655440000';
    const url = `https://edu.std-900.ist.mospolytech.ru/labs/api/orders?api_key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            alert('🎉 Заказ успешно оформлен!');
            localStorage.removeItem('selectedDishes');
            window.location.href = 'lunch.html';
        } else {
            const msg = result.error || 'Неизвестная ошибка сервера';
            alert(`❌ Ошибка: ${msg}`);
        }
    } catch (err) {
        alert('🚫 Ошибка подключения. Проверьте интернет и попробуйте позже.');
        console.error('Ошибка отправки:', err);
    }
}

// === СТИЛИ ДЛЯ КНОПКИ "УДАЛИТЬ" (встраиваем через JS) ===
(function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .remove-btn {
            padding: 8px 16px;
            background-color: #f8f9fa;
            color: #e74c3c;
            border: 1px solid #e74c3c;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s ease;
            margin-top: 8px;
        }
        .remove-btn:hover {
            background-color: #e74c3c;
            color: white;
            transform: translateY(-1px);
            box-shadow: 0 2px 6px rgba(231, 76, 60, 0.3);
        }
        .remove-btn svg {
            width: 14px;
            height: 14px;
        }
    `;
    document.head.appendChild(style);
})();
