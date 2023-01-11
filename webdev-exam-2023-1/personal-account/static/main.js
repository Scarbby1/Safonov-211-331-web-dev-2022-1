const DEFAULT_URL = 'http://exam-2023-1-api.std-900.ist.mospolytech.ru/api';
const API_KEY = '1ed7f369-aa16-4a70-8482-545ccc38802e';
const PER_PAGE = 3;
const MAX_TEXT_SELECT_SIZE = 30;
// время "жизни" уведомления
const alertRemoveTime = 5000;
const linkPersonalAccount = '<a href="#">Личный кабинет</a>';
const rubleSymbol = '\u20bd';

// определение основных конструкций
// контейнер для уведомлений
let alertContainer = document.querySelector('.alert-container');
// уведомление-шаблон
let tempAlert = document.querySelector('#alert-template');
// уведомление об успешной операции
let successAlert = document.querySelector('#alert-success');
let dangerAlert = document.querySelector('#alert-danger');
let idRequestDelModal =
    document.querySelector('#delete-request').querySelector('.id-request');
let modalShowRequest = document.querySelector('#show-request');
let modalEditRequest = document.querySelector('#edit-request');
let hiddenIdValue = document.querySelector('#request-id');
let delRequestBtn = document.querySelector('.del-request-btn');

let itemOfAvailableRequests =
    document.querySelector('#item-of-available-requests');
let availableRequests = document.querySelector('.table-of-available-requests');
let controlItems = document.querySelector('#control-items');

let tempGuides = document.querySelector('#table-of-guides');
let tableGuides = document.querySelector('.table-guides');
let paginationContainer = document.querySelector('.pagination-bar');
// модальное окно
// кнопка для создания заявки
let buttonCreateRequest = document.querySelector('#buttonSendRequest');

/**
 * Функция для взаимодействия с сервером
 * @param {string} method - метод запроса (get, post, put, delete)
 * @param {string} type - тип запрашиваемого ресурса 
 * (routes, orders, guide, route);
 * type = guide, route используются для получения данных о 
 * конкретном гиде или маршруте
 * @param {object} params - параметры, передаваемые серверу
 * @param {number} id - идентификатор маршрута или заявки
 * @returns {object} - объект json, содержащий ответ сервера
 */
async function dataExchangeWithTheServer(method, type, params, id) {
    let error = false;
    let data = {};
    let url;
    if (method != undefined && type != undefined) {
        if (method == 'get') {
            if (type == 'routes') {
                if (id != undefined) {
                    // получить список гидов
                    url = new URL(`${DEFAULT_URL}/routes/${id}/guides`);
                } else {
                    // получить список маршрутов
                    url = new URL(`${DEFAULT_URL}/routes`);
                }
            };
            if (type == 'orders') {
                if (id != undefined) {
                    // посмотреть заявку
                    url = new URL(`${DEFAULT_URL}/orders/${id}`);
                } else {
                    // получить спсок заявок
                    url = new URL(`${DEFAULT_URL}/orders`);
                }
            }
            // если нужно получить информацию о конкретном гиде
            if (type == 'guide') {
                if (id != undefined) {
                    url = new URL(`${DEFAULT_URL}/guides/${id}`);
                } else {
                    error = true;
                }
            }
            // если нужно получить информацию о конкретном маршруте
            if (type == 'route') {
                if (id != undefined) {
                    url = new URL(`${DEFAULT_URL}/routes/${id}`);
                } else {
                    error = true;
                }
            }
        }
        if (method == 'post' && type == 'orders') {
            // добавить заявку
            url = new URL(`${DEFAULT_URL}/orders`);
        }
        if ((method == 'put' || method == 'delete')
            && type == 'orders' && id != undefined) {
            // редактировать или удалить заявку
            url = new URL(`${DEFAULT_URL}/orders/${id}`);
        }
    } else {
        error = true;
    }
    let bodyParams;
    if (params && Object.keys(params).length > 0) {
        bodyParams = new URLSearchParams();
        for (let i = 0; i < Object.keys(params).length; i++) {
            bodyParams.set(Object.keys(params)[i],
                params[Object.keys(params)[i]]);
        }
    }
    if (url != undefined) {
        url.searchParams.append('api_key', API_KEY);
        // отправка запросов
        data = await fetch(url, {
            method: method.toUpperCase(),
            body: bodyParams,
        }).then(response => response.json()).then(answer => {
            return answer;
        });
    } else {
        error = true;
    }
    if (error) console.log("Произошла ошибка при обмене данными с сервером");
    return data;
}

/**
 * Функция для вывода уведомления на экран
 * @param {String} type - тип уведомления: success, warning or danger
 * @param {String} text - текст, который необходимо вывести в уведомлении
 */
function showAlert(type, text) {
    // клонирование шаблона уведомления
    let alertItem = tempAlert.content.firstElementChild.cloneNode(true);
    let alertSetStyle = alertItem.querySelector('#alertSetStyle');
    alertSetStyle.classList.remove('alert-warning');
    alertSetStyle.classList.remove('alert-success');
    alertSetStyle.classList.remove('alert-danger');
    if (type == 'warning') {
        alertSetStyle.classList.add('alert-warning');
        alertItem.querySelector('.text-alert-item').innerHTML = text;
    }
    if (type == 'success') {
        alertSetStyle.classList.add('alert-success');
        alertItem.querySelector('.text-alert-item').innerHTML = text;
    }
    if (type == 'danger') {
        alertSetStyle.classList.add('alert-danger');
        alertItem.querySelector('.text-alert-item').innerHTML = text;

    }
    // добавление в контейнер для уведомлений
    alertContainer.append(alertItem);
    // задание удаления уведомления по таймеру 
    setTimeout(() => alertItem.remove(), alertRemoveTime);
}

async function controlItemsHandler(event) {
    let action = event.target.dataset.action;
    if (action) {
        let clickOnRow = event.target.closest('.row');
        let idRequest = clickOnRow.querySelector('.id').innerHTML;
        if (action == 'delete') {
            idRequestDelModal.innerHTML = `№ ${idRequest}`;
            hiddenIdValue.value = idRequest;
        }
        // остальные функции находятся в разработке
    }
}


/**
 * Функция для создания кнопки для навигации по страницам
 * @param {number} page - страница
 * @param {object} classes - назначенные классы
 * @returns {button} - кнопка
 */
function createPageBtn(page, classes = []) {
    // создание кнопки-ссылки
    // сслыка используется для того, 
    // чтобы при нажатии возвращаться в начало выдачи результатов
    let btn = document.createElement('a');
    // в цикле кнопке назначаются классы 
    for (cls of classes) {
        btn.classList.add(cls);
    }
    // добавление стилей bootstrap
    btn.classList.add('page-link');
    btn.classList.add('d-flex');
    btn.classList.add('align-items-center');
    // установка данных внутрь кода кнопки 
    btn.dataset.page = page;
    // присвоение номера страницы кнопке 
    btn.innerHTML = page;
    // назначение якоря на начало выдачи результатов
    btn.href = '#label-search-field';
    return btn;
}




/**
 * Функция для загрузки на страницу данных о доступных маршрутах
 * @param {object} data - данные о доступных заявках
 * 
 */
async function renderAvailableRoutes(data, routes) {
    // очистка прошлых данных
    availableRequests.innerHTML = '';
    // формирование шапки таблицы путем клонирования шаблона
    let itemOfAvailableRequest =
        itemOfAvailableRequests.content.firstElementChild.cloneNode(true);
    // добавление шапки таблицы в таблицу
    availableRequests.append(itemOfAvailableRequest);
    // перебор и вывод строк таблицы
    for (let i = 0; i < data.length; i++) {
        // формирование элемента путем клонирования шаблона
        itemOfAvailableRequest =
            itemOfAvailableRequests.content.firstElementChild.cloneNode(true);
        // назначение номера заявки
        itemOfAvailableRequest.querySelector('.id').innerHTML =
            data[i]['id'];
        // назначение описания маршрута
        let nameRoute = await dataExchangeWithTheServer('get',
            'route', {}, data[i]['route_id']);
        itemOfAvailableRequest.querySelector('.name').innerHTML =
            nameRoute.name;
        // назначение даты экскурсии
        itemOfAvailableRequest.querySelector('.date').innerHTML =
            data[i]['date'];
        // назначение цены экскурсии
        itemOfAvailableRequest.querySelector('.cost').innerHTML =
            data[i]['price'];
        // выбор области кнопки для выбора маршрута
        let choose = itemOfAvailableRequest.querySelector('.control');
        choose.innerHTML = '';
        choose.onclick = controlItemsHandler;
        itemControl = controlItems.content.firstElementChild.cloneNode(true);
        choose.append(itemControl);
        // добавление строки таблицы в таблицу
        availableRequests.append(itemOfAvailableRequest);
    }
}

/**
 * Функция для отрисовки элементов навигации
 * @param {*} currentPage - номер текущей страницы
 * @param {*} totalPages - общее количество страниц
 */
function renderPaginationElement(currentPage, totalPages) {
    // страховка, на случай, если будет передана строка, содержащия число
    currentPage = parseInt(currentPage);
    totalPages = parseInt(totalPages);
    // объявление кнопки и инициализация раздела навигации по страницам
    let btn;
    let li;
    // обнуление прошлых значений
    paginationContainer.innerHTML = '';

    // создание контейнера, для хранения кнопок навигации по страницам
    let buttonsContainer = document.createElement('ul');
    // назначаение класса
    buttonsContainer.classList.add('pagination');

    // создание кнопки "Первая страница"
    btn = createPageBtn(1, ['first-page-btn']);
    btn.innerHTML = 'Первая страница';
    // создание элемента списка и назначение необходимых классов
    li = document.createElement('li');
    li.classList.add('page-item');
    // если страница 1, то скрытие кнопки "Первая страница"
    if (currentPage == 1) {
        li.classList.add('disabled');
    }
    li.append(btn);
    // добавление кнопки "Первая страница" в контейнер для кнопок
    buttonsContainer.append(li);

    // вычисление максимального и минимального значения
    let start = Math.max(currentPage - 2, 1);
    let end = Math.min(currentPage + 2, totalPages);
    // в цикле созданются и добавляются кнопки для навигации по страницам
    for (let i = start; i <= end; i++) {
        let li = document.createElement('li');
        li.classList.add('page-item');
        btn = createPageBtn(i, i == currentPage ? ['active'] : []);
        li.append(btn);
        buttonsContainer.append(li);
    }

    // создание кнопки "Последняя страница"
    btn = createPageBtn(totalPages, ['last-page-btn']);
    btn.innerHTML = 'Последняя страница';
    // создание элемента списка и назначение необходимых классов
    li = document.createElement('li');
    li.classList.add('page-item');
    // кнопка скрывается при достижении конца страниц или при их отсутствии
    if (currentPage == totalPages || totalPages == 0) {
        li.classList.add('disabled');
    }
    li.append(btn);
    // добавление кнопки "Последняя страница" в контейнер для кнопок
    buttonsContainer.append(li);

    // добавление всех кнопок в контейнер
    paginationContainer.append(buttonsContainer);
}

/**
 * Функция для вывода ограниченного количества данных о доступных маршрутах
 * @param {number} page - нужная страница
 * @param {number} perPage - количество элементов на странице
 * @param {string} qParam - заменитель параметра "q", 
 * который обычно используется в url
 */
async function generateAvailableRequest(page, perPage, qParam) {
    let data = await dataExchangeWithTheServer('get', 'orders');
    document.querySelector('#availableRequest').innerHTML =
        `Оставленные заявки (количество: ${data.length})`;
    // обнуление данных для отображения на странице
    let dataToRender = [];
    // вычисление колическтва страниц
    let totalPages = Math.ceil(data.length / perPage);
    // если значение страницы выходит за допустимые пределы
    if (page > totalPages && page < 1) {
        availableRequests.innerHTML = 'Ошибка: выход за \
        пределы доступных страниц';
    } else {
        if (Object.keys(data).length == 0) {
            availableRequests.innerHTML = '';
            paginationContainer.innerHTML = '';
            let text = 'Заявки не найдены :(<br>\
                    Чтобы создать заявку, пожалуйста, перейдите на \
                    <a href="../index.html">главную страницу</a>';
            showAlert('warning', text);
            return;
        }
        // иначе добавляются данные для отображения в определнном количестве
        let max = Math.min(page * perPage, data.length);
        for (let i = (page - 1) * perPage; i < max; i++) {
            dataToRender.push(data[i]);
        }
        // вызов функций отображения маршрутов и панели навигации по страницам
        await renderAvailableRoutes(dataToRender);
        renderPaginationElement(page, totalPages);
    }
}

/**
 * Функция обрабатывающая нажатие клавиши в модальном окне,
 * предназначенном для создания заявки
 * @param {object} event - событие 
 */
async function buttonSendRequestHandler(event) {
    let modalWindow = event.target.closest(".modal");
    let form = modalWindow.querySelector("form");
    let formInputs = form.elements;
    if (formInputs['excursion-date'].value != '' &&
        formInputs['start-time'].value) {
        let params = {};
        let dateExcursion = formInputs['excursion-date'];
        let startTime = formInputs['start-time'];
        let duration = formInputs['duration'];
        let numberOfPeople = formInputs['number-of-people'];
        let option1 = formInputs['option-1'];
        let option2 = formInputs['option-2'];
        let totalCost = formInputs['total-cost'];
        if (dateExcursion.value != dateExcursion.dataset.oldDate) {
            params.date = dateExcursion.value;
        }
        if (startTime.value.slice(0, 5) != startTime.dataset.oldTime) {
            params.time = startTime.value.slice(0, 5);
        }
        if (duration.value != duration.dataset.oldDuration) {
            params.duration = duration.value;
        }
        if (numberOfPeople.value != numberOfPeople.dataset.oldPersons) {
            params.persons = numberOfPeople.value;
        }
        if (Number(option1.checked) != option1.dataset.oldOption1) {
            params.optionFirst = Number(option1.checked);
        }
        if (Number(option2.checked) != option2.dataset.oldOption2) {
            params.optionSecond = Number(option2.checked);
        }
        if (totalCost.value.split(' ')[0] != totalCost.dataset.oldTotalCost) {
            params.price = totalCost.value.split(' ')[0];
        }
        let idRequest = modalWindow.querySelector('#id-request-edit').innerHTML;
        data = await dataExchangeWithTheServer('put', 'orders', params,
            idRequest);
        form.reset();
        // первоначальная загрузка доступных маршрутов и селектора
        generateAvailableRequest(1, PER_PAGE);
        if (data.id != undefined) {
            let text = `Заявка успешно отредактирована! :)`;
            showAlert('success', text);
        } else {
            let text = `При редактировании заявки возникла ошибка! :(<br>\
                    Пожалуйста, попробуйте еще раз или зайдите позже.`;
            showAlert('danger', text);
        }
    } else {
        let text = 'Заявка не может быть создана :(<br>\
                Пожалуйста, заполните все необходимые поля.';
        showAlert('warning', text);
    }
}

/**
 * Функция, предназначенная для отображения гидов по выбранному маршруту
 * @param {object} data - массив, содержащий ифнормацию о гидах 
 */
function renderGuides(data) {
    // очистка прошлых данных о гидах
    tableGuides.innerHTML = '';
    // формирование шапки таблицы путем клонирования шаблона
    let itemGuides =
        tempGuides.content.firstElementChild.cloneNode(true);
    // добавление шапки таблицы в таблицу
    tableGuides.append(itemGuides);
    // перебор и вывод строк таблицы
    for (let i = 0; i < data.length; i++) {
        // формирование элемента путем клонирования шаблона
        itemGuides =
            tempGuides.content.firstElementChild.cloneNode(true);
        // назначение скрытого идентификатора
        // используется для поиска информации по гиду
        itemGuides.dataset.idGuide =
            data[i]['id'];
        // добавление иконки
        let imgGuide = document.createElement('img');
        imgGuide.src = 'static/files/guide-icon-1.png';
        imgGuide.classList.add('icon-64');
        let divImg = document.createElement('div');
        divImg.classList.add('white-square-with-rounded-edges');
        divImg.append(imgGuide);
        itemGuides.querySelector('.img').innerHTML = '';
        itemGuides.querySelector('.img').append(divImg);
        // добавление ФИО гида
        itemGuides.querySelector('.name').innerHTML =
            data[i]['name'];
        // добавление языков, которыми владеет гид
        if (data[i]['language'].includes(' ')) {
            let newData = data[i]['language'].split(' ');
            let langContainer = document.createElement('div');
            langContainer.classList.add('lang-container');
            for (let j = 0; j < newData.length; j++) {
                let langItem = document.createElement('div');
                langItem.classList.add('lang-item');
                langItem.innerHTML = newData[j];
                langContainer.append(langItem);
            }
            itemGuides.querySelector('.lang').innerHTML = '';
            itemGuides.querySelector('.lang').append(langContainer);
        } else {
            itemGuides.querySelector('.lang').innerHTML =
                data[i]['language'];
        }

        // добавление опыта работы
        itemGuides.querySelector('.exp').innerHTML =
            data[i]['workExperience'];
        // добавление стоимости услуг гида
        itemGuides.querySelector('.price').innerHTML =
            data[i]['pricePerHour'];
        // выбор области кнопки для выбора гида
        let choose = itemGuides.querySelector('.choose');
        // назначение стилей
        // удаление стандартного стиля
        choose.classList.remove('choose');
        // назначение стиля кнопки
        choose.classList.add('choose-btn');
        // отображение display: flex
        choose.classList.add('d-flex');
        // выравнивание
        choose.classList.add('justify-content-center');
        choose.classList.add('align-items-center');
        // создание элемента кнопки, при помощи которой выбирается маршрут
        let button = document.createElement('button');
        // добавление ссылки стилей кнопки
        button.classList.add('button');
        // добавление атрибутов для работы с модальным окном
        button.dataset.bsToggle = 'modal';
        button.dataset.bsTarget = '#createRequest';
        // добавление содержания кнопке
        button.innerHTML = 'Выбрать';
        // зачистка 
        choose.innerHTML = '';
        // добавление кнопки
        choose.append(button);
        // добавление строки таблицы в таблицу
        tableGuides.append(itemGuides);
    }
}

/**
 * Функция, для обработки полученной информации о гидах
 * @param {object} data - сырой массив, содержащий информацию о гидах
 */
function generateGuides(data) {
    renderGuides(data);
}

/**
 * Функция для обработки выбора маршрута (нажатия кнопки "выбрать")
 * @param {object} event - событие
 */
async function buttonChooseRouteHandler(event) {
    let row = event.target.closest('.row');
    let idRoute = row.dataset.idRoute;
    let data = await dataExchangeWithTheServer('get', 'routes', {}, idRoute);
    let nameRoute = '"' + row.querySelector('.name').innerHTML + '"';
    document.querySelector('.guides-name-of-route').innerHTML = nameRoute;
    generateGuides(data);
}


/**
 * Функция для обработки изменения значения селектора достопримечательностей
 * @param {object} event - событие
 */
function selectorOfAvailableRoutesHandler(event) {
    generateAvailableRequest(1, PER_PAGE,);
}

/**
 * Функция-обработчик для кнопок навигации по странице
 * @param {object} event - событие 
 */
function pageBtnHandler(event) {
    // если нажата не клавиша навигации, то обработчик прекращает работу
    if (!event.target.classList.contains('page-link')) return;
    // если клавиша неактивна, то обработчик прекращает работу
    if (event.target.classList.contains('disabled')) return;
    // иначе, обработчик подгружает данные по нужной странице
    generateAvailableRequest(event.target.dataset.page,
        PER_PAGE,
    );
}

/**
 * Функция-обработчик для поля поиска
 * @param {object} event - событие 
 */
async function searchFieldHandler(event) {
    generateAvailableRequest(1,
        PER_PAGE,
        event.target.value);
}

async function deleteRequestHandler(event) {
    let id = event.target.closest('.modal').querySelector('#request-id').value;
    let response = await dataExchangeWithTheServer('delete', 'orders', {}, id);
    if (response.id == id) {
        let text = `Заявка № ${id} успешно удалена.`;
        showAlert('success', text);
    } else {
        let text = `При удалении заявки возникла ошибка! :(<br>\
            Пожалуйста, попробуйте еще раз или зайдите в личный кабинет позже.`;
        showAlert('danger', text);
    }
    generateAvailableRequest(1, PER_PAGE);
}

window.onload = function () {
    // первоначальная загрузка доступных маршрутов и селектора
    generateAvailableRequest(1, PER_PAGE);
    // назначение обрабтчика на нажатие по панели навигации
    document.querySelector('.pagination-bar').onclick = pageBtnHandler;
    // удаление старых уведомлений
    if (alertContainer.querySelector('.alert-item')) {
        alertContainer.querySelector('.alert-item').remove();
    };
    // назначение обработчика на кнопку удаления заявки
    delRequestBtn.onclick = deleteRequestHandler;
};
