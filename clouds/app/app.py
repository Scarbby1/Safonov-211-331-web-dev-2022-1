
from flask import Flask, render_template, session, request, redirect, url_for, flash
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required


app = Flask(__name__)
application = app
# Импортирование конфигурации из файла config.py
app.config.from_pyfile('config.py')
# LoginManager - это класс, через который осуществляетяс настройка
# аутентификации
login_manager = LoginManager()
# Передаем менеджеру экземляр Flask (приложение),
# чтобы иметь возможность проверять учетные данные пользователей.
login_manager.init_app(app)
# Если пользователь не вошел в систему, но пытается получиь доступ
# к странице, для которой установлен декоратор login_required,
# то происходит перенаправление на endpoint указанный в login_view
# в случае остутствия login_view приложение вернет 401 ошибку
login_manager.login_view = 'login'
# Login_message и login_message_category используется flash,
# когда пользователь перенаправляется на страницу аутентификации
# Сообщение выводимое пользователю, при попытке доступа к страницам,
# требующим авторизации
login_manager.login_message = 'Для доступа к этой странице нужно авторизироваться.'
# Категория отображаемого сообщения
login_manager.login_message_category = 'warning'


# Требования Flask login к User Class
# is_authenticated - return True, если пользователь аутентифицирован
# is_active - return True, если это активный пользователь.
# помимо того, что он прошел проверку, пользователь также
# активировал свою учетную запись, не был заблокирован и т.д.
# Неактивные пользователи не могут войти в систему.
# is_anonymous - return True, если текущий пользователь
# не аутентифицирован, то есть выполняется анонимный доступ
# get_id() - этот метод возвращает уникальный идентификатор
# пользователя и может исопльзоваться для загрузки пользователя из
# обратного вызова user_loader. Идентифкатор должен иметь тип str

# Создание класса пользователь с наследованием от UserMixin,
# который предоствляет реализацию определенных методов и свойств
class User(UserMixin):
    def __init__(self, user_id, user_login):
        self.id = user_id
        self.login = user_login


# Главная страница
@app.route('/')
def index():
    return render_template('index.html')


# Страница с подсчетом количества посещений
# session - словарь (ключ-значение)
# Если значение есть, то оно увеличивается на 1 по ключу,
# иначе инициализируется со значением 1
@app.route('/visits')
def visits():
    if 'visits_count' in session:
        session['visits_count'] += 1
    else:
        session['visits_count'] = 1
    return render_template('visits.html', title="Счётчик посещений")


# Используя объект request, извлекаем значения переданные в форме
# login и password и проверяем пользователя на существование в "БД"
# login_user(UserClass, remember) - обновляет данные сессии и при
# необходимости запоминает пользователя
# redirect(url) - используется для перенаправления на страницу
# с url, переданным в качестве параметра
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        login = request.form['login']
        password = request.form['password']
        remember = request.form.get('remember_me') == 'on'
        for user in get_users():
            if user['login'] == login and user['password'] == password:
                login_user(User(user['id'], user['login']), remember=remember)
                flash('Вы успешно прошли аутентификацию!', 'success')
                param_url = request.args.get('next')
                return redirect(param_url or url_for('index'))
        flash('Введён неправильный логин или пароль.', 'danger')
    return render_template('login.html')


# Используется для удаления из сессии данных о текущем пользователе
@app.route('/logout', methods=['GET'])
def logout():
    logout_user()
    return redirect(url_for('index'))


users = []

# "БД"


def get_users():
    print(users)
    return users

# @login_required - декоратор, который блокирует доступ
# не аутентифицированным пользователям к странице


@app.route('/registration', methods=["GET", "POST"])
def registration():
    if request.method == "POST":
        login = request.form['login']
        password = request.form['password']
        id = len(users) + 1
        user = {
            "id": id,
            "login": login,
            "password": password,
        }
        users.append(user)
        flash('Регистрация прошла успешно', 'success')
        return redirect(url_for('index'))
    return render_template('registration.html')


# user_loader - декоратор.
# Внутри объекта login_manager запоминается функция
# Функция позволяет по идентификатору пользователя, который
# хранится в сессии, вернуть объект соответствующий пользователю
# или если такого пользователя нет, то вернуть None
# Функция load_user используется для обработки запроса, в ходе которой
# необходимо проверить наличие пользователя
# При помощи декоратора функция записывается в login_manager и
# вызывается, при получении доступа к current_user
@login_manager.user_loader
def load_user(user_id):
    for user in get_users():
        if user['id'] == int(user_id):
            return User(user['id'], user['login'])
    return None


# Запуск приложения при непосредственном запуске файла
if __name__ == '__main__':
    # port = int(input('Введите порт >>> '))
    # app.run(host='0.0.0.0', port=port)
    app.run(host='0.0.0.0', port=80)
