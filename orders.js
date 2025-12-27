// orders.js

let currentOrder = null;
let allDishes = [];

// === ЗАГРУЗКА БЛЮД ===
async function loadDishesForOrders() {
    const apiKey = '4e2faac2-923e-48f6-a0ef-b207af91d7e6';
    const url = `https://edu.std-900.ist.mospolytech.ru/labs/api/dishes?api_key=${apiKey}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        allDishes = await res.json();
        console.log('✅ Блюда загружены:', allDishes.length);
    } catch (err) {
        console.error('⚠️ Ошибка загрузки блюд:', err);
    }
}

// === ЗАГРУЗКА ЗАКАЗОВ ===
async function loadOrders() {
    if (allDishes.length === 0) await loadDishesForOrders();

    const apiKey = '4e2faac2-923e-48f6-a0ef-b207af91d7e6';
    const url = `https://edu.std-900.ist.mospolytech.ru/labs/api/orders?api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const orders = await response.json();

        const list = document.getElementById('orders-list');
        list.innerHTML = '';

        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        orders.forEach((order, index) => {
            // Получаем блюда по ID
            const soup = allDishes.find(d => d.id == order.soup_id);
            const main = allDishes.find(d => d.id == order.main_course_id);
            const salad = allDishes.find(d => d.id == order.salad_id);
            const drink = allDishes.find(d => d.id == order.drink_id);
            const dessert = allDishes.find(d => d.id == order.dessert_id);

            // Состав заказа
            const dishNames = [
                soup?.name,
                main?.name,
                salad?.name,
                drink?.name,
                dessert?.name
            ].filter(Boolean).join(', ') || '—';

            // Итоговая стоимость
            const total = [
                soup?.price || 0,
                main?.price || 0,
                salad?.price || 0,
                drink?.price || 0,
                dessert?.price || 0
            ].reduce((a, b) => a + b, 0);

            // Строка таблицы
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${formatDate(order.created_at)}</td>
                <td>${dishNames}</td>
                <td>${total}₽</td>
                <td>${getDeliveryTime(order)}</td>
                <td>
                    <button class="action-btn view-btn" data-id="${order.id}">👁️</button>
                    <button class="action-btn edit-btn" data-id="${order.id}">✏️</button>
                    <button class="action-btn delete-btn" data-id="${order.id}">🗑️</button>
                </td>
            `;
            list.appendChild(row);
        });

        // Обработчики кнопок
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', () => showViewModal(btn.dataset.id));
        });
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => showEditModal(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => showDeleteModal(btn.dataset.id));
        });

    } catch (err) {
        alert('❌ Ошибка загрузки заказов: ' + err.message);
        console.error(err);
    }
}

// === ФОРМАТЫ ===
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getDeliveryTime(order) {
    if (order.delivery_type === 'now') {
        return 'Как можно скорее (07:00–23:00)';
    } else if (order.delivery_time) {
        return `К ${order.delivery_time}`;
    }
    return 'Не указано';
}

function getDishNames(order) {
    const names = [];
    if (order.soup?.name) names.push(order.soup.name);
    if (order.main_course?.name) names.push(order.main_course.name);
    if (order.salad?.name) names.push(order.salad.name);
    if (order.drink?.name) names.push(order.drink.name);
    if (order.dessert?.name) names.push(order.dessert.name);
    return names.join(', ') || '—';
}

function calculateTotal(order) {
    let total = 0;
    if (order.soup?.price) total += order.soup.price;
    if (order.main_course?.price) total += order.main_course.price;
    if (order.salad?.price) total += order.salad.price;
    if (order.drink?.price) total += order.drink.price;
    if (order.dessert?.price) total += order.dessert.price;
    return total;
}

// === ЗАГРУЗКА ОДНОГО ЗАКАЗА (для модалок) ===
function fetchOrder(orderId, callback) {
    const apiKey = '4e2faac2-923e-48f6-a0ef-b207af91d7e6';
    const url = `https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=${apiKey}`;
    fetch(url)
        .then(r => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.json();
        })
        .then(callback)
        .catch(err => {
            alert('❌ Ошибка загрузки заказа: ' + err.message);
        });
}

// === МОДАЛЬНЫЕ ОКНА ===

function showViewModal(orderId) {
    fetchOrder(orderId, (order) => {
        currentOrder = order;

        // 🔥 ДОБАВЛЯЕМ ЭТОТ БЛОК — чтобы подставить имена и цены из allDishes
        const soup = allDishes.find(d => d.id == order.soup_id);
        const main = allDishes.find(d => d.id == order.main_course_id);
        const salad = allDishes.find(d => d.id == order.salad_id);
        const drink = allDishes.find(d => d.id == order.drink_id);
        const dessert = allDishes.find(d => d.id == order.dessert_id);

        // Формируем состав
        const dishNames = [
            soup?.name,
            main?.name,
            salad?.name,
            drink?.name,
            dessert?.name
        ].filter(Boolean).join(', ') || '—';

        // Считаем стоимость
        const total = [
            soup?.price || 0,
            main?.price || 0,
            salad?.price || 0,
            drink?.price || 0,
            dessert?.price || 0
        ].reduce((a, b) => a + b, 0);

        // Формируем HTML
        document.getElementById('view-order-details').innerHTML = `
            <div><strong>Дата оформления:</strong> ${formatDate(order.created_at)}</div>
            <div><strong>Имя:</strong> ${order.full_name || '—'}</div>
            <div><strong>Адрес:</strong> ${order.delivery_address || '—'}</div>
            <div><strong>Телефон:</strong> ${order.phone || '—'}</div>
            <div><strong>Email:</strong> ${order.email || '—'}</div>
            <div><strong>Время доставки:</strong> ${getDeliveryTime(order)}</div>
            <div><strong>Комментарий:</strong> ${order.comment || '—'}</div>
            <hr>
            <div><strong>Состав заказа:</strong> ${dishNames}</div>
            <div><strong>Итого:</strong> ${total}₽</div>
        `;

        document.getElementById('view-modal').style.display = 'block';
        document.getElementById('modal-overlay').style.display = 'block';
    });
}

function showEditModal(orderId) {
    fetchOrder(orderId, (order) => {
        currentOrder = order;

        // 🔥 Подставляем имена и цены из allDishes (как в таблице и просмотре)
        const soup = allDishes.find(d => d.id == order.soup_id);
        const main = allDishes.find(d => d.id == order.main_course_id);
        const salad = allDishes.find(d => d.id == order.salad_id);
        const drink = allDishes.find(d => d.id == order.drink_id);
        const dessert = allDishes.find(d => d.id == order.dessert_id);

        const dishNames = [
            soup?.name,
            main?.name,
            salad?.name,
            drink?.name,
            dessert?.name
        ].filter(Boolean).join(', ') || '—';

        const total = [
            soup?.price || 0,
            main?.price || 0,
            salad?.price || 0,
            drink?.price || 0,
            dessert?.price || 0
        ].reduce((a, b) => a + b, 0);

        // Заполняем форму
        document.getElementById('edit-order-id').value = order.id;
        document.getElementById('edit-created-at').value = formatDate(order.created_at);
        document.getElementById('edit-full_name').value = order.full_name || '';
        document.getElementById('edit-delivery_address').value = order.delivery_address || '';
        document.getElementById('edit-phone').value = order.phone || '';
        document.getElementById('edit-email').value = order.email || '';
        document.getElementById('edit-comment').value = order.comment || '';
        document.getElementById('edit-delivery_type').value = order.delivery_type || 'now';
        document.getElementById('edit-delivery_time').value = order.delivery_time || '07:00';
        toggleDeliveryTimeInput(order.delivery_type);

        // 🔥 ДОБАВЛЯЕМ СОСТАВ И СТОИМОСТЬ В ФОРМУ
        const summaryEl = document.getElementById('edit-order-summary');
        if (summaryEl) {
            summaryEl.innerHTML = `
                <div style="background:#f8f9fa; padding:16px; border-radius:12px; margin-bottom:20px;">
                    <h4 style="margin:0 0 12px; color:#2c3e50;">Состав заказа</h4>
                    <p style="margin:4px 0;"><strong>Блюда:</strong> ${dishNames}</p>
                    <p style="margin:4px 0;"><strong>Итого:</strong> <span style="color:tomato; font-weight:bold;">${total}₽</span></p>
                </div>
            `;
        }

        document.getElementById('edit-modal').style.display = 'block';
        document.getElementById('modal-overlay').style.display = 'block';
    });
}

function showDeleteModal(orderId) {
    document.getElementById('delete-confirm').dataset.orderId = orderId;
    document.getElementById('delete-modal').style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
}

function toggleDeliveryTimeInput(type) {
    const timeInput = document.getElementById('edit-delivery_time');
    const timeLabel = timeInput.previousElementSibling;
    if (type === 'by_time') {
        timeInput.disabled = false;
        timeLabel.style.opacity = '1';
    } else {
        timeInput.disabled = true;
        timeLabel.style.opacity = '0.5';
    }
}

// === ОБРАБОТЧИКИ ===

// Закрытие по крестику или оверлею
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.close, #modal-overlay').forEach(el => {
        el.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
            document.getElementById('modal-overlay').style.display = 'none';
        });
    });

    document.getElementById('view-ok')?.addEventListener('click', () => {
        document.getElementById('view-modal').style.display = 'none';
        document.getElementById('modal-overlay').style.display = 'none';
    });

    document.getElementById('edit-cancel')?.addEventListener('click', () => {
        document.getElementById('edit-modal').style.display = 'none';
        document.getElementById('modal-overlay').style.display = 'none';
    });

    document.getElementById('delete-cancel')?.addEventListener('click', () => {
        document.getElementById('delete-modal').style.display = 'none';
        document.getElementById('modal-overlay').style.display = 'none';
    });

    document.getElementById('edit-delivery_type')?.addEventListener('change', function() {
        toggleDeliveryTimeInput(this.value);
    });

    // Отправка формы редактирования
    document.getElementById('edit-form')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const orderId = document.getElementById('edit-order-id').value;
        const apiKey = '4e2faac2-923e-48f6-a0ef-b207af91d7e6';
        const url = `https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=${apiKey}`;

        const data = {
            full_name: document.getElementById('edit-full_name').value.trim(),
            email: document.getElementById('edit-email').value.trim(),
            phone: document.getElementById('edit-phone').value.trim(),
            delivery_address: document.getElementById('edit-delivery_address').value.trim(),
            delivery_type: document.getElementById('edit-delivery_type').value,
            delivery_time: document.getElementById('edit-delivery_time').value,
            comment: document.getElementById('edit-comment').value.trim()
        };

        if (!data.full_name || !data.phone || !data.delivery_address) {
            alert('⚠️ Заполните обязательные поля');
            return;
        }

        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('✅ Заказ обновлён!');
                document.getElementById('edit-modal').style.display = 'none';
                document.getElementById('modal-overlay').style.display = 'none';
                loadOrders();
            } else {
                const err = await response.json();
                alert(`❌ ${err.error || 'Ошибка сервера'}`);
            }
        } catch (err) {
            alert('🚫 Ошибка сети: ' + err.message);
        }
    });

    // Удаление
    document.getElementById('delete-confirm')?.addEventListener('click', async function() {
        const orderId = this.dataset.orderId;
        const apiKey = '4e2faac2-923e-48f6-a0ef-b207af91d7e6';
        const url = `https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=${apiKey}`;

        try {
            const response = await fetch(url, { method: 'DELETE' });
            if (response.ok) {
                alert('✅ Заказ удалён!');
                document.getElementById('delete-modal').style.display = 'none';
                document.getElementById('modal-overlay').style.display = 'none';
                loadOrders();
            } else {
                const err = await response.json();
                alert(`❌ ${err.error || 'Ошибка сервера'}`);
            }
        } catch (err) {
            alert('🚫 Ошибка сети: ' + err.message);
        }
    });

    // Запуск
    loadDishesForOrders().then(loadOrders);
});

// === СТИЛИ МОДАЛОК (инжектим в head) ===
(function() {
    const style = document.createElement('style');
    style.textContent = `
        /* Оверлей */
        #modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
            display: none;
        }

        /* Модальное окно */
        .modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            border-radius: 16px;
            box-shadow: 0 12px 32px rgba(0,0,0,0.2);
            z-index: 1001;
            max-width: 500px;
            width: 92%;
            max-height: 90vh;
            overflow-y: auto;
            padding: 24px;
            display: none;
        }

        .modal-content { position: relative; }
        .close {
            position: absolute;
            top: 16px;
            right: 16px;
            font-size: 24px;
            cursor: pointer;
            color: #888;
        }
        .close:hover { color: #333; }

        .modal h3 {
            margin: 0 0 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid #f0f0f0;
            color: #2c3e50;
        }

        #edit-form label {
            display: block;
            margin: 16px 0 6px;
            font-weight: 500;
        }

        #edit-form input,
        #edit-form textarea,
        #edit-form select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            font-size: 16px;
        }

        #edit-form input:focus,
        #edit-form select:focus {
            border-color: tomato;
            outline: none;
            box-shadow: 0 0 0 2px rgba(255,99,71,0.2);
        }

        #edit-form input:disabled {
            background: #f9f9f9;
            color: #999;
        }

        #edit-form textarea {
            height: 80px;
            resize: vertical;
        }

        .modal-actions {
            display: flex;
            gap: 12px;
            margin-top: 24px;
        }

        .modal-btn {
            flex: 1;
            padding: 14px;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
        }

        .modal-btn.green { background: #27ae60; color: white; }
        .modal-btn.red { background: #e74c3c; color: white; }
        .modal-btn:hover { opacity: 0.9; }

        .action-btn {
            background: white;
            border: 1px solid #ccc;
            border-radius: 8px;
            width: 36px;
            height: 36px;
            font-size: 16px;
            cursor: pointer;
            margin: 0 4px;
        }
        .action-btn:hover { background: #f8f9fa; }

        /* Таблица */
        #orders-table {
            width: 100%;
            border-collapse: collapse;
            margin: 24px 0;
        }
        #orders-table th,
        #orders-table td {
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
        }
        #orders-table th {
            background: #f8f9fa;
        }
        #orders-table tr:nth-child(even) {
            background: #fafafa;
        }
    `;
    document.head.appendChild(style);
})();
