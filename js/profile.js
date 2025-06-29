// Управление личным кабинетом
class ProfileManager {
  constructor() {
    this.auth = window.auth;
    this.currentUser = this.auth.getCurrentUser();
    this.init();
  }

  init() {
    if (!this.currentUser) {
      window.location.href = 'registr.html';
      return;
    }

    this.initNavigation();
    this.initLogout();
    this.loadUserData();
    this.initForms();
    this.initAvatarUpload();
    this.loadBookings();
  }

  initNavigation() {
    const navLinks = document.querySelectorAll('.account-nav-link');
    const sections = document.querySelectorAll('.account-content-section');

    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetSection = link.dataset.section;
        
        // Убираем активный класс со всех ссылок и секций
        navLinks.forEach(l => l.classList.remove('active'));
        sections.forEach(s => s.classList.remove('active'));
        
        // Добавляем активный класс к выбранной ссылке
        link.classList.add('active');
        
        // Показываем соответствующую секцию
        const targetElement = document.getElementById(`${targetSection}-content`);
        if (targetElement) {
          targetElement.classList.add('active');
        }

        // Загружаем данные для секции
        this.loadSectionData(targetSection);
      });
    });
  }

  initLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    const mobileLogoutBtn = document.getElementById('mobile-logout-btn');

    [logoutBtn, mobileLogoutBtn].forEach(btn => {
      if (btn) {
        btn.addEventListener('click', () => {
          if (confirm('Вы уверены, что хотите выйти?')) {
            this.auth.logout();
          }
        });
      }
    });
  }

  loadUserData() {
    // Обновляем информацию в шапке профиля
    const accountName = document.getElementById('account-name');
    const accountEmail = document.getElementById('account-email');
    const accountAvatar = document.getElementById('account-avatar');

    if (accountName) {
      accountName.textContent = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    
    if (accountEmail) {
      accountEmail.textContent = this.currentUser.email;
    }

    if (accountAvatar && this.currentUser.avatar) {
      accountAvatar.innerHTML = `<img src="${this.currentUser.avatar}" alt="Avatar">`;
    }

    // Заполняем форму профиля
    this.fillProfileForm();
  }

  fillProfileForm() {
    const fields = {
      'profile-firstname': this.currentUser.firstName,
      'profile-lastname': this.currentUser.lastName,
      'profile-email': this.currentUser.email,
      'profile-phone': this.currentUser.phone
    };

    Object.entries(fields).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.value = value || '';
      }
    });

    // Загружаем аватар в превью
    const avatarPreview = document.getElementById('avatar-preview');
    if (avatarPreview && this.currentUser.avatar) {
      avatarPreview.innerHTML = `<img src="${this.currentUser.avatar}" alt="Avatar">`;
    }
  }

  initForms() {
    // Форма профиля
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveProfile();
      });
    }

    // Форма настроек
    const settingsForm = document.getElementById('settings-form');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveSettings();
      });
    }

    // Смена пароля
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
      changePasswordBtn.addEventListener('click', () => {
        this.changePassword();
      });
    }

    // Инициализация маски телефона
    this.initPhoneMask();
  }

  initPhoneMask() {
    const phoneInput = document.getElementById('profile-phone');
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

  initAvatarUpload() {
    const avatarUpload = document.getElementById('avatar-upload');
    if (avatarUpload) {
      avatarUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          this.handleAvatarUpload(file);
        }
      });
    }
  }

  handleAvatarUpload(file) {
    // Проверяем размер файла (максимум 5MB)
    if (file.size > 5 * 1024 * 1024) {
      this.auth.showNotification('Размер файла не должен превышать 5MB', 'error');
      return;
    }

    // Проверяем тип файла
    if (!file.type.startsWith('image/')) {
      this.auth.showNotification('Пожалуйста, выберите изображение', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const avatarData = e.target.result;
      
      // Обновляем превью
      const avatarPreview = document.getElementById('avatar-preview');
      const accountAvatar = document.getElementById('account-avatar');
      
      if (avatarPreview) {
        avatarPreview.innerHTML = `<img src="${avatarData}" alt="Avatar">`;
      }
      
      if (accountAvatar) {
        accountAvatar.innerHTML = `<img src="${avatarData}" alt="Avatar">`;
      }

      // Сохраняем в профиле пользователя
      this.auth.updateUser({ avatar: avatarData });
      this.auth.showNotification('Аватар успешно обновлен', 'success');
    };

    reader.readAsDataURL(file);
  }

  saveProfile() {
    const firstName = document.getElementById('profile-firstname').value;
    const lastName = document.getElementById('profile-lastname').value;
    const email = document.getElementById('profile-email').value;
    const phone = document.getElementById('profile-phone').value;

    // Валидация
    if (!firstName || !lastName || !email) {
      this.auth.showNotification('Пожалуйста, заполните все обязательные поля', 'error');
      return;
    }

    if (!this.validateEmail(email)) {
      this.auth.showNotification('Введите корректный email', 'error');
      return;
    }

    // Обновляем данные пользователя
    const success = this.auth.updateUser({
      firstName,
      lastName,
      email,
      phone
    });

    if (success) {
      this.currentUser = this.auth.getCurrentUser();
      this.loadUserData();
      this.auth.showNotification('Профиль успешно обновлен', 'success');
    } else {
      this.auth.showNotification('Ошибка при сохранении профиля', 'error');
    }
  }

  saveSettings() {
    const notificationsEmail = document.getElementById('notifications-email').checked;
    const notificationsSms = document.getElementById('notifications-sms').checked;

    const success = this.auth.updateUser({
      settings: {
        ...this.currentUser.settings,
        notificationsEmail,
        notificationsSms
      }
    });

    if (success) {
      this.auth.showNotification('Настройки сохранены', 'success');
    } else {
      this.auth.showNotification('Ошибка при сохранении настроек', 'error');
    }
  }

  changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmNewPassword = document.getElementById('confirm-new-password').value;

    // Валидация
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      this.auth.showNotification('Заполните все поля для смены пароля', 'error');
      return;
    }

    if (currentPassword !== this.currentUser.password) {
      this.auth.showNotification('Неверный текущий пароль', 'error');
      return;
    }

    if (newPassword.length < 6) {
      this.auth.showNotification('Новый пароль должен содержать минимум 6 символов', 'error');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      this.auth.showNotification('Новые пароли не совпадают', 'error');
      return;
    }

    // Обновляем пароль
    const success = this.auth.updateUser({ password: newPassword });

    if (success) {
      // Очищаем поля
      document.getElementById('current-password').value = '';
      document.getElementById('new-password').value = '';
      document.getElementById('confirm-new-password').value = '';
      
      this.auth.showNotification('Пароль успешно изменен', 'success');
    } else {
      this.auth.showNotification('Ошибка при смене пароля', 'error');
    }
  }

  loadSectionData(section) {
    switch (section) {
      case 'bookings':
        this.loadBookings();
        break;
      case 'history':
        this.loadHistory();
        break;
      case 'settings':
        this.loadSettings();
        break;
    }
  }

  loadBookings() {
    const bookingsList = document.getElementById('bookings-list');
    if (!bookingsList) return;

    const bookings = this.auth.getUserBookings().filter(b => b.status !== 'completed' && b.status !== 'cancelled');

    if (bookings.length === 0) {
      bookingsList.innerHTML = `
        <div class="empty-state">
          <i class="ti ti-calendar-off"></i>
          <h3>У вас пока нет активных бронирований</h3>
          <p>Забронируйте студию для записи вашего подкаста</p>
          <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
            <a href="services.html" class="btn btn-primary">Выбрать услугу</a>
            <button class="btn btn-outline" onclick="profileManager.createTestBooking()">Создать тестовое бронирование</button>
          </div>
        </div>
      `;
      return;
    }

    bookingsList.innerHTML = bookings.map(booking => this.createBookingCard(booking)).join('');
  }

  loadHistory() {
    const historyList = document.getElementById('history-list');
    if (!historyList) return;

    const history = this.auth.getUserBookings().filter(b => b.status === 'completed' || b.status === 'cancelled');

    if (history.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <i class="ti ti-history"></i>
          <h3>История заказов пуста</h3>
          <p>Здесь будут отображаться ваши завершенные заказы</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = history.map(booking => this.createBookingCard(booking, true)).join('');
  }

  loadSettings() {
    // Загружаем настройки пользователя
    if (this.currentUser.settings) {
      const notificationsEmail = document.getElementById('notifications-email');
      const notificationsSms = document.getElementById('notifications-sms');

      if (notificationsEmail) {
        notificationsEmail.checked = this.currentUser.settings.notificationsEmail !== false;
      }
      
      if (notificationsSms) {
        notificationsSms.checked = this.currentUser.settings.notificationsSms === true;
      }
    }
  }

  createBookingCard(booking, isHistory = false) {
    const statusClass = this.getStatusClass(booking.status);
    const statusText = this.getStatusText(booking.status);
    const date = new Date(booking.createdAt).toLocaleDateString('ru-RU');
    
    return `
      <div class="booking-card">
        <div class="booking-header">
          <h4 class="booking-title">${booking.service || 'Бронирование студии'}</h4>
          <span class="booking-status ${statusClass}">${statusText}</span>
        </div>
        <div class="booking-details">
          <div class="booking-detail">
            <div class="booking-detail-label">Дата создания</div>
            <div class="booking-detail-value">${date}</div>
          </div>
          <div class="booking-detail">
            <div class="booking-detail-label">Дата съемки</div>
            <div class="booking-detail-value">${booking.date || 'Не указана'}</div>
          </div>
          <div class="booking-detail">
            <div class="booking-detail-label">Время</div>
            <div class="booking-detail-value">${booking.time || 'Не указано'}</div>
          </div>
          <div class="booking-detail">
            <div class="booking-detail-label">Стоимость</div>
            <div class="booking-detail-value">${booking.price || 'По договоренности'}</div>
          </div>
        </div>
        ${!isHistory ? this.createBookingActions(booking) : ''}
      </div>
    `;
  }

  createBookingActions(booking) {
    const actions = [];
    
    if (booking.status === 'pending') {
      actions.push(`<button class="btn btn-small btn-danger" onclick="profileManager.cancelBooking(${booking.id})">Отменить</button>`);
    }
    
    actions.push(`<button class="btn btn-small btn-outline" onclick="profileManager.contactSupport(${booking.id})">Связаться с нами</button>`);
    
    return `<div class="booking-actions">${actions.join('')}</div>`;
  }

  getStatusClass(status) {
    const statusClasses = {
      'pending': 'pending',
      'confirmed': 'confirmed',
      'completed': 'completed',
      'cancelled': 'cancelled'
    };
    return statusClasses[status] || 'pending';
  }

  getStatusText(status) {
    const statusTexts = {
      'pending': 'Ожидает подтверждения',
      'confirmed': 'Подтверждено',
      'completed': 'Завершено',
      'cancelled': 'Отменено'
    };
    return statusTexts[status] || 'Неизвестно';
  }

  cancelBooking(bookingId) {
    if (!confirm('Вы уверены, что хотите отменить бронирование?')) {
      return;
    }

    const bookings = this.currentUser.bookings.map(booking => {
      if (booking.id === bookingId) {
        return { ...booking, status: 'cancelled' };
      }
      return booking;
    });

    const success = this.auth.updateUser({ bookings });
    
    if (success) {
      this.currentUser = this.auth.getCurrentUser();
      this.loadBookings();
      this.auth.showNotification('Бронирование отменено', 'info');
    }
  }

  contactSupport(bookingId) {
    const booking = this.currentUser.bookings.find(b => b.id === bookingId);
    const message = `Здравствуйте! У меня вопрос по бронированию #${bookingId} от ${new Date(booking.createdAt).toLocaleDateString('ru-RU')}.`;
    const phoneNumber = '+79878510846';
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  }

  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  createTestBooking() {
    const services = [
      'Съемка подкаста',
      'Аренда студии',
      'Монтаж видео',
      'Звукозапись',
      'Интервью'
    ];
    
    const randomService = services[Math.floor(Math.random() * services.length)];
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + Math.floor(Math.random() * 30) + 1);
    
    const hours = Math.floor(Math.random() * 10) + 9; // 9-18
    const minutes = Math.random() > 0.5 ? '00' : '30';
    
    const testBooking = {
      service: randomService,
      date: futureDate.toISOString().split('T')[0],
      time: `${hours}:${minutes}`,
      price: `${(Math.floor(Math.random() * 20) + 5) * 1000} ₽`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    const booking = this.auth.addBooking(testBooking);
    
    if (booking) {
      this.currentUser = this.auth.getCurrentUser();
      this.loadBookings();
      this.auth.showNotification('Тестовое бронирование создано!', 'success');
    }
  }
}

// Инициализируем менеджер профиля после загрузки DOM
document.addEventListener('DOMContentLoaded', () => {
  window.profileManager = new ProfileManager();
});