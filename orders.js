// orders.js

document.addEventListener('DOMContentLoaded', function() {
    loadOrders();
});

let currentOrder = null;

// === ЗАГРУЗКА ЗАКАЗОВ ===
async function loadOrders() {
    const apiKey = '123e4567-e89b-12d3-a456-426655440000'; // ЗАМЕНИТЕ НА ВАШ КЛЮЧ!
    const url = `https://edu.std-900.ist.mospolytech.ru/labs/api/orders?api_key=${apiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Ошибка ${response.status}`);
        const orders = await response.json();

        const list = document.getElementById('orders-list');
        list.innerHTML = '';

        // Сортируем по дате (новые сверху)
        orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        orders.forEach((order, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${formatDate(order.created_at)}</td>
                <td>${getDishNames(order)}</td>
                <td>${order.total_price}₽</td>
                <td>${getDeliveryTime(order)}</td>
                <td>
                    <button class="action-btn view-btn" data-id="${order.id}">👁️</button>
                    <button class="action-btn edit-btn" data-id="${order.id}">✏️</button>
                    <button class="action-btn delete-btn" data-id="${order.id}">🗑️</button>
                </td>
            `;
            list.appendChild(row);
        });

        // Добавляем обработчики
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

// === ФОРМАТИРОВАНИЕ ===
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', { dateStyle: 'short', timeStyle: 'short' });
}

function getDishNames(order) {
    const names = [];
    if (order.soup) names.push(`${order.soup.name} (${order.soup.price}₽)`);
    if (order.main_course) names.push(`${order.main_course.name} (${order.main_course.price}₽)`);
    if (order.salad) names.push(`${order.salad.name} (${order.salad.price}₽)`);
    if (order.drink) names.push(`${order.drink.name} (${order.drink.price}₽)`);
    if (order.dessert) names.push(`${order.dessert.name} (${order.dessert.price}₽)`);
    return names.join(', ');
}

function getDeliveryTime(order) {
    if (order.delivery_type === 'now') {
        return 'В течение дня (с 07:00 до 23:00)';
    } else if (order.delivery_time) {
        return order.delivery_time;
    }
    return 'Не указано';
}

// === МОДАЛЬНЫЕ ОКНА ===

// Просмотр
function showViewModal(orderId) {
    currentOrder = null;
    const modal = document.getElementById('view-modal');
    const details = document.getElementById('view-order-details');

    fetchOrder(orderId, (order) => {
        currentOrder = order;
        details.innerHTML = `
            <div><strong>Дата оформления:</strong> ${formatDate(order.created_at)}</div>
            <h4>Доставка</h4>
            <div><strong>Имя получателя:</strong> ${order.full_name}</div>
            <div><strong>Адрес доставки:</strong> ${order.delivery_address}</div>
            <div><strong>Время доставки:</strong> ${getDeliveryTime(order)}</div>
            <div><strong>Телефон:</strong> ${order.phone}</div>
            <div><strong>Email:</strong> ${order.email}</div>
            <h4>Комментарий</h4>
            <div>${order.comment || 'Нет комментария'}</div>
            <h4>Состав заказа</h4>
            <div>${getDishNames(order)}</div>
            <div><strong>Стоимость:</strong> ${order.total_price}₽</div>
        `;
        modal.style.display = 'block';
    });
}

// Редактирование
function showEditModal(orderId) {
    currentOrder = null;
    const modal = document.getElementById('edit-modal');
    const form = document.getElementById('edit-form');

    fetchOrder(orderId, (order) => {
        currentOrder = order;
        document.getElementById('edit-order-id').value = order.id;
        document.getElementById('edit-created-at').value = formatDate(order.created_at);
        document.getElementById('edit-full_name').value = order.full_name || '';
        document.getElementById('edit-delivery_address').value = order.delivery_address || '';
        document.getElementById('edit-delivery_type').value = order.delivery_type || 'now';
        document.getElementById('edit-delivery_time').value = order.delivery_time || '';
        document.getElementById('edit-phone').value = order.phone || '';
        document.getElementById('edit-email').value = order.email || '';
        document.getElementById('edit-comment').value = order.comment || '';

        // Показываем/скрываем время
        toggleDeliveryTimeInput(order.delivery_type);

        modal.style.display = 'block';
    });
}

// Удаление
function showDeleteModal(orderId) {
    currentOrder = null;
    const modal = document.getElementById('delete-modal');
    document.getElementById('delete-confirm').dataset.orderId = orderId;
    modal.style.display = 'block';
}

// === ОБРАБОТЧИКИ МОДАЛЬНЫХ ОКОН ===

// Закрыть по крестику
document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.modal').style.display = 'none';
    });
});

// Закрыть по клику вне окна
document.getElementById('modal-overlay').addEventListener('click', () => {
    document.querySelector('.modal').style.display = 'none';
});

// Просмотр → OK
document.getElementById('view-ok').addEventListener('click', () => {
    document.getElementById('view-modal').style.display = 'none';
});

// Редактирование → Отмена
document.getElementById('edit-cancel').addEventListener('click', () => {
    document.getElementById('edit-modal').style.display = 'none';
});

// Редактирование → Сохранить
document.getElementById('edit-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const orderId = document.getElementById('edit-order-id').value;

    const data = {
        full_name: document.getElementById('edit-full_name').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        delivery_address: document.getElementById('edit-delivery_address').value,
        delivery_type: document.getElementById('edit-delivery_type').value,
        delivery_time: document.getElementById('edit-delivery_time').value || null,
        comment: document.getElementById('edit-comment').value,
        soup_id: currentOrder.soup?.id || null,
        main_course_id: currentOrder.main_course?.id || null,
        salad_id: currentOrder.salad?.id || null,
        drink_id: currentOrder.drink?.id || null,
        dessert_id: currentOrder.dessert?.id || null
    };

    const apiKey = '123e4567-e89b-12d3-a456-426655440000';
    const url = `https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=${apiKey}`;

    try {
        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('✅ Заказ успешно изменён!');
            document.getElementById('edit-modal').style.display = 'none';
            loadOrders(); // Обновляем список
        } else {
            const err = await response.json();
            alert(`❌ Ошибка: ${err.error || 'Неизвестная ошибка'}`);
        }
    } catch (err) {
        alert('🚫 Ошибка при сохранении: ' + err.message);
    }
});

// Удаление → Отмена
document.getElementById('delete-cancel').addEventListener('click', () => {
    document.getElementById('delete-modal').style.display = 'none';
});

// Удаление → Да
document.getElementById('delete-confirm').addEventListener('click', async function() {
    const orderId = this.dataset.orderId;
    const apiKey = '123e4567-e89b-12d3-a456-426655440000';
    const url = `https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=${apiKey}`;

    try {
        const response = await fetch(url, { method: 'DELETE' });

        if (response.ok) {
            alert('✅ Заказ успешно удалён!');
            document.getElementById('delete-modal').style.display = 'none';
            loadOrders(); // Обновляем список
        } else {
            const err = await response.json();
            alert(`❌ Ошибка: ${err.error || 'Неизвестная ошибка'}`);
        }
    } catch (err) {
        alert('🚫 Ошибка при удалении: ' + err.message);
    }
});

// === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ===

function fetchOrder(orderId, callback) {
    const apiKey = '123e4567-e89b-12d3-a456-426655440000';
    const url = `https://edu.std-900.ist.mospolytech.ru/labs/api/orders/${orderId}?api_key=${apiKey}`;

    fetch(url)
        .then(r => r.json())
        .then(callback)
        .catch(err => alert('❌ Ошибка загрузки заказа: ' + err.message));
}

function toggleDeliveryTimeInput(type) {
    const input = document.getElementById('edit-delivery_time');
    input.disabled = type !== 'by_time';
    if (type !== 'by_time') input.value = '';
}

// === СТИЛИ ДЛЯ МОДАЛЬНЫХ ОКОН ===
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
        }

        .modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 1001;
            max-width: 500px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
        }

        .modal-content {
            position: relative;
        }

        .close {
            position: absolute;
            top: 12px;
            right: 12px;
            font-size: 24px;
            cursor: pointer;
            color: #666;
        }

        .modal h3 {
            margin-top: 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 12px;
            margin-bottom: 24px;
        }

        .modal-btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: background-color 0.2s;
        }

        .modal-btn:hover {
            opacity: 0.9;
        }

        .modal-btn.green {
            background-color: #27ae60;
            color: white;
        }

        .modal-btn.red {
            background-color: #e74c3c;
            color: white;
        }

        .modal-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .modal-actions {
            display: flex;
            justify-content: space-between;
            margin-top: 24px;
        }

        .action-btn {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 18px;
            padding: 4px 8px;
            margin: 0 2px;
        }

        .action-btn:hover {
            opacity: 0.8;
        }
    `;
    document.head.appendChild(style);
})();