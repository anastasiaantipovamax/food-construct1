// order.js

// Глобальный объект заказа
let selectedOrder = {
    soup: null,
    main: null,
    starter: null,
    drink: null,
    dessert: null
};

// === РАБОТА С localStorage ===

function getSelectedKeywords() {
    const data = localStorage.getItem('selectedDishes');
    return data ? JSON.parse(data) : [];
}

function saveSelectedKeywords() {
    const keys = Object.values(selectedOrder)
        .filter(dish => dish !== null)
        .map(dish => dish.keyword);
    localStorage.setItem('selectedDishes', JSON.stringify(keys));
}

// === РАБОТА С ЗАКАЗОМ ===

function addToOrder(keyword) {
    const dish = window.dishes.find(d => d.keyword === keyword);
    if (!dish) {
        console.error('❌ Блюдо не найдено:', keyword);
        return;
    }

    console.log('✅ Добавляем блюдо:', dish.name, '→ category:', dish.category);

    // 🔥 ОПРЕДЕЛЯЕМ КАТЕГОРИЮ ПО ПОЗИЦИИ В МАССИВЕ ИЛИ ПО НАЗВАНИЮ
    let cat;
    
    // Вариант 1: по ключевым словам в названии
    if (dish.name.includes('суп') || dish.name.includes('Суп')) cat = 'soup';
    else if (dish.name.includes('лазанья') || dish.name.includes('стейк') || dish.name.includes('котлет') || dish.name.includes('рыб') || dish.name.includes('паст') || dish.name.includes('пицц')) cat = 'main';
    else if (dish.name.includes('салат') || dish.name.includes('стартер') || dish.name.includes('фри') || dish.name.includes('Цезарь')) cat = 'starter';
    else if (dish.name.includes('сок') || dish.name.includes('чай') || dish.name.includes('кофе')) cat = 'drink';
    else if (dish.name.includes('десерт') || dish.name.includes('пончик') || dish.name.includes('торт') || dish.name.includes('чизкейк')) cat = 'dessert';
    
    // Вариант 2: если всё ещё не определилось — смотрим на порядок в массиве
    if (!cat) {
        const index = window.dishes.findIndex(d => d.keyword === keyword);
        if (index < 6) cat = 'soup';
        else if (index < 12) cat = 'main';
        else if (index < 18) cat = 'starter';
        else if (index < 24) cat = 'drink';
        else cat = 'dessert';
    }

    console.log('→ Определена категория:', cat);

    // Добавляем в заказ
    if (['soup', 'main', 'starter', 'drink', 'dessert'].includes(cat)) {
        selectedOrder[cat] = dish;
        saveSelectedKeywords();
        updateOrderDisplay();
        if (typeof updateCheckoutPanel === 'function') {
            updateCheckoutPanel();
        }
    } else {
        console.error('❌ Не удалось определить категорию для:', dish.name);
    }
}

function removeFromOrder(keyword) {
    for (const cat of ['soup', 'main', 'starter', 'drink', 'dessert']) {
        if (selectedOrder[cat]?.keyword === keyword) {
            selectedOrder[cat] = null;
            break;
        }
    }
    saveSelectedKeywords();
    updateOrderDisplay();
    if (typeof updateCheckoutPanel === 'function') {
        updateCheckoutPanel();
    }
}

// === ПРОВЕРКА КОМБО (для валидации) ===

function isValidCombo() {
    const hasSoup = !!selectedOrder.soup;
    const hasMain = !!selectedOrder.main;
    const hasStarter = !!selectedOrder.starter;
    const hasDrink = !!selectedOrder.drink;
    const hasDessert = !!selectedOrder.dessert;

    const mainItems = (hasSoup ? 1 : 0) + (hasMain ? 1 : 0) + (hasStarter ? 1 : 0);

    if (mainItems === 0 && !hasDrink && !hasDessert) return false; // ничего не выбрано
    if (hasSoup && !hasMain && !hasStarter) return false; // суп, но нет главного/салата
    if ((hasMain || hasStarter) && !hasSoup && !hasMain) return false; // салат/стартер без супа/главного
    if (hasDrink && mainItems === 0) return false; // только напиток
    if (mainItems > 0 && !hasDrink) return false; // нет напитка

    return true;
}

// === ОТОБРАЖЕНИЕ ЗАКАЗА ===

function updateOrderDisplay() {
    // Ищем контейнер — может быть на lunch.html или order.html
    const container = document.querySelector('.order-column');
    if (!container) return;

    const soupEl = container.querySelector('#soup-display');
    const mainEl = container.querySelector('#main-display');
    const starterEl = container.querySelector('#starter-display');
    const drinkEl = container.querySelector('#drink-display');
    const dessertEl = container.querySelector('#dessert-display');
    const totalEl = container.querySelector('#total-display');

    // Обновляем текст
    soupEl.textContent = selectedOrder.soup ? `${selectedOrder.soup.name} ${selectedOrder.soup.price}₽` : 'Блюдо не выбрано';
    mainEl.textContent = selectedOrder.main ? `${selectedOrder.main.name} ${selectedOrder.main.price}₽` : 'Блюдо не выбрано';
    starterEl.textContent = selectedOrder.starter ? `${selectedOrder.starter.name} ${selectedOrder.starter.price}₽` : 'Блюдо не выбрано';
    drinkEl.textContent = selectedOrder.drink ? `${selectedOrder.drink.name} ${selectedOrder.drink.price}₽` : 'Напиток не выбран';
    dessertEl.textContent = selectedOrder.dessert ? `${selectedOrder.dessert.name} ${selectedOrder.dessert.price}₽` : 'Десерт не выбран';

    // Подсчёт итога
    let total = 0;
    if (selectedOrder.soup) total += selectedOrder.soup.price;
    if (selectedOrder.main) total += selectedOrder.main.price;
    if (selectedOrder.starter) total += selectedOrder.starter.price;
    if (selectedOrder.drink) total += selectedOrder.drink.price;
    if (selectedOrder.dessert) total += selectedOrder.dessert.price;

    // Показываем/скрываем блоки
    const visible = total > 0;
    const headers = [
        '#soup-header', '#main-header', '#starter-header',
        '#drink-header', '#dessert-header', '#total-header'
    ];
    headers.forEach(sel => {
        const el = container.querySelector(sel);
        if (el) el.style.display = visible ? 'block' : 'none';
    });

    totalEl.textContent = `${total}₽`;
}

// === ВОССТАНОВЛЕНИЕ ЗАКАЗА ПРИ ЗАГРУЗКЕ ===

document.addEventListener('DOMContentLoaded', function () {
    if (!window.dishes || window.dishes.length === 0) return;

    const savedKeywords = getSelectedKeywords();
    if (savedKeywords.length === 0) return;

    // Очищаем текущий заказ
    selectedOrder = { soup: null, main: null, starter: null, drink: null, dessert: null };

    // Восстанавливаем по ключам
    savedKeywords.forEach(key => {
        const dish = window.dishes.find(d => d.keyword === key);
        if (dish && ['soup', 'main', 'starter', 'drink', 'dessert'].includes(dish.category)) {
            selectedOrder[dish.category] = dish;
        }
    });

    updateOrderDisplay();
    if (typeof updateCheckoutPanel === 'function') {
        updateCheckoutPanel();
    }
});
// Обновление панели на lunch.html
function updateCheckoutPanel() {
    const panel = document.getElementById('checkout-panel');
    const totalSpan = document.getElementById('total-cost');
    const link = document.getElementById('checkout-link');

    if (!panel || !totalSpan || !link) return;

    // Считаем итог
    let total = 0;
    if (selectedOrder.soup) total += selectedOrder.soup.price;
    if (selectedOrder.main) total += selectedOrder.main.price;
    if (selectedOrder.starter) total += selectedOrder.starter.price;
    if (selectedOrder.drink) total += selectedOrder.drink.price;
    if (selectedOrder.dessert) total += selectedOrder.dessert.price;

    // Обновляем отображение
    totalSpan.textContent = `Итого: ${total}₽`;

    if (total > 0) {
        panel.style.display = 'flex';
    } else {
        panel.style.display = 'none';
    }

    // Активна только при корректном комбо
    if (isValidCombo()) {
        link.classList.remove('disabled');
        link.style.opacity = '1';
        link.style.pointerEvents = 'auto';
    } else {
        link.classList.add('disabled');
        link.style.opacity = '0.5';
        link.style.pointerEvents = 'none';
    }
}

// Автоматически вызываем при изменении заказа
const originalUpdate = updateOrderDisplay;
updateOrderDisplay = function() {
    originalUpdate();
    updateCheckoutPanel();
};