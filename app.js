// URL серверного API
const apiUrl = 'http://localhost:5000/postings';

// Резервний локальний масив
let mockPostings = [
    { from: 'Рівне', to: 'Луцьк', content: 'подарунок', deliveryType: 0, weight: 6, width: 10, height: 10, depth: 10, value: 100, price: 1000 },
    { from: 'Київ', to: 'Львів', content: 'документи', deliveryType: 1, weight: 1, width: 30, height: 5, depth: 20, value: 50, price: 120 },
    { from: 'Одеса', to: 'Харків', content: 'посилка', deliveryType: 0, weight: 3, width: 25, height: 15, depth: 15, value: 300, price: 180 }
];

// 1. Отримання списку відправлень із сервера
async function loadData() {
    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Помилка сервера: ' + response.status);
        }
        return await response.json();
    } catch (err) {
        console.warn('Сервер недоступний, завантажуємо тестовий набір:', err.message);
        return mockPostings;
    }
}

// 2. Створення окремої комірки таблиці
function createCell(fieldName, model) {
    const td = document.createElement('td');
    td.textContent = model[fieldName] !== undefined ? model[fieldName] : '';
    return td;
}

// 3. Відмальовування таблиці за атрибутами заголовка x-column
function renderTable(data) {
    const tbody = document.getElementById('postings');
    const thead = document.getElementById('table-header');
    tbody.innerHTML = '';

    const cols = thead.querySelectorAll('th');

    for (const item of data) {
        const tr = document.createElement('tr');
        for (const col of cols) {
            const field = col.getAttribute('x-column');
            if (field) {
                const cell = createCell(field, item);
                if (col.classList.contains('number')) {
                    cell.classList.add('number');
                }
                tr.appendChild(cell);
            }
        }
        tbody.appendChild(tr);
    }
}

// 4. Оновлення інтерфейсу
async function refresh() {
    const statusMsg = document.getElementById('status');
    statusMsg.textContent = 'Завантаження відправлень…';

    try {
        const list = await loadData();
        renderTable(list);
        statusMsg.textContent = `Успішно завантажено записів: ${list.length}`;
    } catch (err) {
        statusMsg.textContent = 'Не вдалося завантажити дані: ' + err.message;
    }
}

// 5. Відправка POST-запиту
async function createPosting(posting) {
    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(posting)
        });
        if (!response.ok) {
            throw new Error('Помилка створення: ' + response.status);
        }
        return await response.json();
    } catch (err) {
        console.warn('POST локально:', err.message);
        mockPostings.push(posting);
        return posting;
    }
}

// 6. Відправка PUT-запиту
async function updatePosting(id, posting) {
    const response = await fetch(apiUrl + '/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(posting)
    });
    if (!response.ok) {
        throw new Error('Помилка оновлення: ' + response.status);
    }
    return await response.json();
}

// 7. Відправка DELETE-запиту
async function deletePosting(id) {
    const response = await fetch(apiUrl + '/' + id, {
        method: 'DELETE'
    });
    if (!response.ok) {
        throw new Error('Помилка видалення: ' + response.status);
    }
}

// Слухачі подій
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('btn-reload').addEventListener('click', refresh);

    document.getElementById('btn-create-test').addEventListener('click', async () => {
        const newPkg = {
            from: 'Чернівці',
            to: 'Вінниця',
            content: 'запчастини',
            deliveryType: 0,
            weight: 4.5,
            width: 30,
            height: 20,
            depth: 20,
            value: 450,
            price: 130
        };
        await createPosting(newPkg);
        await refresh();
    });

    refresh();
});
