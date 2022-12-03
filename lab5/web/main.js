function createPageBtn(page, classes = []) {
    let btn = document.createElement('button');
    classes.push('btn');
    for (cls of classes) {
        btn.classList.add(cls);
    }
    btn.dataset.page = page;
    btn.innerHTML = page;
    return btn;
}

function renderPaginationElement(info) {
    let btn;
    let paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = '';

    btn = createPageBtn(1, ['first-page-btn']);
    btn.innerHTML = 'Первая страница';
    if (info.current_page == 1) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);

    let buttonsContainer = document.createElement('div');
    buttonsContainer.classList.add('pages-btns');
    paginationContainer.append(buttonsContainer);

    let start = Math.max(info.current_page - 2, 1);
    let end = Math.min(info.current_page + 2, info.total_pages);
    for (let i = start; i <= end; i++) {
        buttonsContainer.append(createPageBtn(i, i == info.current_page ? ['active'] : []));
    }

    btn = createPageBtn(info.total_pages, ['last-page-btn']);
    btn.innerHTML = 'Последняя страница';
    if (info.current_page == info.total_pages) {
        btn.style.visibility = 'hidden';
    }
    paginationContainer.append(btn);
}

function perPageBtnHandler(event) {
    downloadData(1);
}

function setPaginationInfo(info) {
    document.querySelector('.total-count').innerHTML = info.total_count;
    let start = info.total_count > 0 ? (info.current_page - 1) * info.per_page + 1 : 0;
    document.querySelector('.current-interval-start').innerHTML = start;
    let end = Math.min(info.total_count, start + info.per_page - 1)
    document.querySelector('.current-interval-end').innerHTML = end;
}

function pageBtnHandler(event) {
    if (event.target.dataset.page) {
        downloadData(event.target.dataset.page);
        window.scrollTo(0, 0);
    }
}

function createAuthorElement(record) {
    let user = record.user || { 'name': { 'first': '', 'last': '' } };
    let authorElement = document.createElement('div');
    authorElement.classList.add('author-name');
    authorElement.innerHTML = user.name.first + ' ' + user.name.last;
    return authorElement;
}

function createUpvotesElement(record) {
    let upvotesElement = document.createElement('div');
    upvotesElement.classList.add('upvotes');
    upvotesElement.innerHTML = record.upvotes;
    return upvotesElement;
}

function createFooterElement(record) {
    let footerElement = document.createElement('div');
    footerElement.classList.add('item-footer');
    footerElement.append(createAuthorElement(record));
    footerElement.append(createUpvotesElement(record));
    return footerElement;
}

function createContentElement(record) {
    let contentElement = document.createElement('div');
    contentElement.classList.add('item-content');
    contentElement.innerHTML = record.text;
    return contentElement;
}

function createListItemElement(record) {
    let itemElement = document.createElement('div');
    itemElement.classList.add('facts-list-item');
    itemElement.append(createContentElement(record));
    itemElement.append(createFooterElement(record));
    return itemElement;
}


function renderRecords(records) {
    let factsList = document.querySelector('.facts-list');
    //  делаем блок пустым 
    factsList.innerHTML = '';
    // по всему масиву записей 
    for (let i = 0; i < records.length; i++) {
        factsList.append(createListItemElement(records[i]));
    }
}
// Может принимать параметры 

function downloadData(param, page = 1) {
    // хранит ссылка на блок 48 строка 
    let factsList = document.querySelector('.facts-list');
    // получаем строку из html с url 48
    let url = new URL(factsList.dataset.url);
    // Если параметры не пустые меняем url (что вводим в поиск)
    !!param ? url = new URL(`${factsList.dataset.url}?q=${param}`) : null   
    let perPage = document.querySelector('.per-page-btn').value;
    url.searchParams.append('page', page);
    url.searchParams.append('per-page', perPage);
    // создание запроса
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    //  формат ответа
    xhr.responseType = 'json';
    // обработка ответа запроса
    xhr.onload = function () {
        // с сервера пришёл json и отправляем в функцию
        renderRecords(this.response.records);
        setPaginationInfo(this.response['_pagination']);
        renderPaginationElement(this.response['_pagination']);
    }
    xhr.send();
}
// 
window.onload = function () {
    downloadData();
    document.querySelector('.pagination').onclick = pageBtnHandler;
    document.querySelector('.per-page-btn').onchange = perPageBtnHandler;
}

// выбираем кнопку поиска
let searchButton = document.querySelector('.search-btn')
// берем поле ввода
var field = document.querySelector('.search-field')

// обработка событий нажатия на кнопку 
searchButton.onclick = () => {
    // вызываем функцию загрузки данных с параметром = введенном в поле значения
    downloadData(field.value)
}

// Автоподстановка на каждый символ
field.oninput = function autocomplete() {
    deleteArray()
    // url c параметром с равнным хначению полю ввода
    let url = `http://cat-facts-api.std-900.ist.mospolytech.ru/autocomplete?q=${field.value}`
    // получем ответ с сервера и приводи к json, и возвращаем из функции, и вызываем функцию создания подстановки
    fetch(url).then(response => { return response.json() }).then(data => renderAutocompleat(data))
}
// Список вариантов
var ul = document.getElementById('list')

// пока есть дочерний элементы удаляем их
function deleteArray() {
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }
}

// функция создание списка подстановки 
function renderAutocompleat(list) {
    let fragment = new DocumentFragment();
    for (let i = 0; i <= list.length - 1; i++) {
        let li = document.createElement('li');
        li.innerHTML = `${list[i]}`
        // обработка нажатия 
        li.onclick = function () {
            field.value = list[i]
            deleteArray()
        }
        fragment.append(li);
    }
    ul.append(fragment)
}