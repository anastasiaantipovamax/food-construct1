// validateOrder.js

document.addEventListener('DOMContentLoaded', function() {
    // Получаем форму
    const orderForm = document.querySelector('form');

    // Обработчик отправки формы
    orderForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Останавливаем отправку

        // Проверяем, есть ли выбранные блюда
        const hasSoup = selectedOrder.soup !== null;
        const hasMain = selectedOrder.main !== null;
        const hasStarter = selectedOrder.starter !== null;
        const hasDrink = selectedOrder.drink !== null;
        const hasDessert = selectedOrder.dessert !== null;

        // Считаем количество основных блюд (суп + главное + салат)
        const mainItemsCount = (hasSoup ? 1 : 0) + (hasMain ? 1 : 0) + (hasStarter ? 1 : 0);

        // Проверяем условия
        if (!hasSoup && !hasMain && !hasStarter && !hasDrink && !hasDessert) {
            showNotification("Ничего не выбрано. Выберите блюда для заказа");
            return;
        }

        if (hasSoup && !hasMain && !hasStarter) {
            showNotification("Выберите главное блюдо/салат/стартер");
            return;
        }

        if ((hasStarter || hasMain) && !hasSoup && !hasMain) {
            showNotification("Выберите суп или главное блюдо");
            return;
        }

        if (hasDrink && !hasMain && !hasSoup && !hasStarter) {
            showNotification("Выберите главное блюдо");
            return;
        }

        if (mainItemsCount > 0 && !hasDrink) {
            showNotification("Выберите напиток");
            return;
        }

        // Если всё ок — отправляем форму
        orderForm.submit();
    });
});

// Функция показа уведомления
function showNotification(message) {
    // Удаляем предыдущее уведомление, если есть
    const existingNotification = document.getElementById('notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Создаём новое уведомление
    const notification = document.createElement('div');
    notification.id = 'notification';
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-content">
            <p>${message}</p>
            <button class="notification-btn">Окей 👌</button>
        </div>
    `;

    // Добавляем в body
    document.body.appendChild(notification);

    // Добавляем обработчик клика на кнопку
    const btn = notification.querySelector('.notification-btn');
    btn.addEventListener('click', function() {
        notification.remove();
    });

    // При наведении меняется цвет
    btn.addEventListener('mouseenter', function() {
        this.style.backgroundColor = 'tomato';
        this.style.color = 'white';
    });

    btn.addEventListener('mouseleave', function() {
        this.style.backgroundColor = '#f1eee9';
        this.style.color = '#000';
    });
}