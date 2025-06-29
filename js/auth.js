// Система аутентификации
class AuthSystem {
  constructor() {
    this.users = JSON.parse(localStorage.getItem('users') || '[]');
    this.currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    this.initDemoData();
    this.init();
  }

  initDemoData() {
    // Создаем демонстрационного пользователя, если пользователей нет
    if (this.users.length === 0) {
      const demoUser = {
        id: 1,
        firstName: 'Иван',
        lastName: 'Петров',
        email: 'demo@example.com',
        phone: '+7 (987) 654-32-10',
        password: '123456',
        registrationDate: new Date().toISOString(),
        avatar: null,
        bookings: [
          {
            id: 1,
            service: 'Съемка подкаста',
            date: '2025-01-20',
            time: '14:00',
            price: '15 000 ₽',
            status: 'confirmed',
            createdAt: new Date(Date.now() - 86400000).toISOString(), // вчера
            userId: 1
          },
          {
            id: 2,
            service: 'Аренда студии',
            date: '2025-01-15',
            time: '10:00',
            price: '8 000 ₽',
            status: 'completed',
            createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), // неделю назад
            userId: 1
          },
          {
            id: 3,
            service: 'Монтаж видео',
            date: '2025-01-25',
            time: '16:00',
            price: '12 000 ₽',
            status: 'pending',
            createdAt: new Date().toISOString(),
            userId: 1
          }
        ],
        settings: {
          notificationsEmail: true,
          notificationsSms: false,
          theme: 'light'
        }
      };
      
      this.users.push(demoUser);
      localStorage.setItem('users', JSON.stringify(this.users));
    }
  }

  init() {
    // Инициализация переключения табов
    this.initTabs();
    
    // Инициализация форм
    this.initForms();
    
    // Проверка авторизации при загрузке страницы
    this.checkAuth();
    
    // Инициализация маски телефона
    this.initPhoneMask();
  }

  initTabs() {
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.dataset.tab;
        
        // Убираем активный класс со всех табов и форм
        tabs.forEach(t => t.classList.remove('active'));
        forms.forEach(f => f.classList.remove('active'));
        
        // Добавляем активный класс к выбранному табу
        tab.classList.add('active');
        
        // Показываем соответствующую форму
        const targetForm = document.getElementById(`${targetTab}-form`);
        if (targetForm) {
          targetForm.classList.add('active');
        }
      });
    });
  }

  initForms() {
    // Форма входа
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin();
      });
    }

    // Форма регистрации
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister();
      });
    }

    // Забыли пароль
    const forgotPassword = document.getElementById('forgot-password');
    if (forgotPassword) {
      forgotPassword.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleForgotPassword();
      });
    }

    // Демо-вход
    const demoLogin = document.getElementById('demo-login');
    if (demoLogin) {
      demoLogin.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleDemoLogin();
      });
    }
  }

  initPhoneMask() {
    const phoneInput = document.getElementById('register-phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.startsWith('8')) {
          value = '7' + value.slice(1);
        }
        if (value.startsWith('7')) {
          value = value.slice(1);
        }
        
        let formattedValue = '+7';
        if (value.length > 0) {
          formattedValue += ' (' + value.slice(0, 3);
        }
        if (value.length >= 4) {
          formattedValue += ') ' + value.slice(3, 6);
        }
        if (value.length >= 7) {
          formattedValue += '-' + value.slice(6, 8);
        }
        if (value.length >= 9) {
          formattedValue += '-' + value.slice(8, 10);
        }
        
        e.target.value = formattedValue;
      });
    }
  }

  handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const submitBtn = document.querySelector('#login-form button[type="submit"]');

    // Показываем индикатор загрузки
    submitBtn.classList.add('loading');

    // Имитируем задержку для демонстрации
    setTimeout(() => {
      // Проверяем существование пользователя
      const user = this.users.find(u => u.email === email && u.password === password);
      
      submitBtn.classList.remove('loading');
      
      if (user) {
        this.currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        this.showNotification('Добро пожаловать!', 'success');
        
        // Перенаправляем в личный кабинет
        setTimeout(() => {
          window.location.href = 'profile.html';
        }, 1000);
      } else {
        this.showNotification('Неверный email или пароль', 'error');
      }
    }, 800);
  }

  handleRegister() {
    const firstName = document.getElementById('register-firstname').value;
    const lastName = document.getElementById('register-lastname').value;
    const email = document.getElementById('register-email').value;
    const phone = document.getElementById('register-phone').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    const submitBtn = document.querySelector('#register-form button[type="submit"]');

    // Расширенная валидация
    if (!this.validateName(firstName)) {
      this.showNotification('Имя должно содержать минимум 2 символа', 'error');
      return;
    }

    if (!this.validateName(lastName)) {
      this.showNotification('Фамилия должна содержать минимум 2 символа', 'error');
      return;
    }

    if (!this.validateEmail(email)) {
      this.showNotification('Введите корректный email', 'error');
      return;
    }

    if (!this.validatePhone(phone)) {
      this.showNotification('Введите корректный номер телефона', 'error');
      return;
    }

    if (!this.validatePassword(password)) {
      this.showNotification('Пароль должен содержать минимум 6 символов', 'error');
      return;
    }

    if (password !== confirmPassword) {
      this.showNotification('Пароли не совпадают', 'error');
      return;
    }

    // Показываем индикатор загрузки
    submitBtn.classList.add('loading');

    // Имитируем задержку для демонстрации
    setTimeout(() => {
      // Проверяем, не существует ли уже пользователь с таким email
      if (this.users.find(u => u.email === email)) {
        submitBtn.classList.remove('loading');
        this.showNotification('Пользователь с таким email уже существует', 'error');
        return;
      }

      // Создаем нового пользователя
      const newUser = {
        id: Date.now(),
        firstName,
        lastName,
        email,
        phone,
        password,
        registrationDate: new Date().toISOString(),
        avatar: null,
        bookings: [],
        settings: {
          notifications: true,
          theme: 'light'
        }
      };

      this.users.push(newUser);
      localStorage.setItem('users', JSON.stringify(this.users));
      
      submitBtn.classList.remove('loading');
      this.showNotification('Регистрация успешна! Теперь вы можете войти в систему', 'success');
      
      // Переключаемся на форму входа
      setTimeout(() => {
        document.querySelector('[data-tab="login"]').click();
        document.getElementById('login-email').value = email;
      }, 1500);
    }, 1000);
  }

  handleForgotPassword() {
    const email = prompt('Введите ваш email для восстановления пароля:');
    if (email && this.validateEmail(email)) {
      const user = this.users.find(u => u.email === email);
      if (user) {
        this.showNotification('Инструкции по восстановлению пароля отправлены на ваш email', 'info');
      } else {
        this.showNotification('Пользователь с таким email не найден', 'error');
      }
    }
  }

  handleDemoLogin() {
    // Автоматически заполняем поля демо-данными
    document.getElementById('login-email').value = 'demo@example.com';
    document.getElementById('login-password').value = '123456';
    
    // Выполняем вход
    this.handleLogin();
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('currentUser');
    this.showNotification('Вы успешно вышли из системы', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  }

  checkAuth() {
    // Если мы на странице профиля, но пользователь не авторизован
    if (window.location.pathname.includes('profile.html') && !this.currentUser) {
      window.location.href = 'registr.html';
      return;
    }

    // Если пользователь авторизован и находится на странице регистрации
    if (window.location.pathname.includes('registr.html') && this.currentUser) {
      window.location.href = 'profile.html';
      return;
    }
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Дополнительные методы валидации
  validatePassword(password) {
    return password && password.length >= 6;
  }

  validatePhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    return cleanPhone.length === 11 && cleanPhone.startsWith('7');
  }

  validateName(name) {
    return name && name.trim().length >= 2;
  }

  showNotification(message, type = 'info') {
    // Удаляем существующие уведомления
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Показываем уведомление
    setTimeout(() => {
      notification.classList.add('show');
    }, 100);
    
    // Скрываем уведомление через 4 секунды
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 4000);
  }

  // Получить текущего пользователя
  getCurrentUser() {
    return this.currentUser;
  }

  // Обновить данные пользователя
  updateUser(userData) {
    if (!this.currentUser) return false;

    // Обновляем данные в массиве пользователей
    const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...userData };
      this.currentUser = this.users[userIndex];
      
      // Сохраняем в localStorage
      localStorage.setItem('users', JSON.stringify(this.users));
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      
      return true;
    }
    return false;
  }

  // Добавить бронирование
  addBooking(bookingData) {
    if (!this.currentUser) return false;

    const booking = {
      id: Date.now(),
      ...bookingData,
      userId: this.currentUser.id,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    this.currentUser.bookings.push(booking);
    this.updateUser({ bookings: this.currentUser.bookings });
    
    return booking;
  }

  // Получить бронирования пользователя
  getUserBookings() {
    return this.currentUser ? this.currentUser.bookings : [];
  }
}

// Инициализируем систему аутентификации
const auth = new AuthSystem();

// Делаем доступным глобально
window.auth = auth;