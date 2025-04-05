// notification-modal.js
class NotificationModal {
  constructor() {
      this.notifications = [];
      this.unreadCount = 0;
      this.initModal();
  }

  initModal() {
      // Cria a estrutura do modal se não existir
      if (!document.getElementById('notificationModal')) {
          const modalHTML = `
              <div class="notification-overlay" id="notificationOverlay"></div>
              <div class="notification-modal" id="notificationModal">
                  <div class="notification-header">
                      <h3>Notificações</h3>
                      <button class="close-notification">&times;</button>
                  </div>
                  <ul class="notification-list" id="notificationList"></ul>
              </div>
          `;
          document.body.insertAdjacentHTML('beforeend', modalHTML);
          
          // Adiciona event listeners
          document.getElementById('notificationOverlay').addEventListener('click', () => this.close());
          document.querySelector('.close-notification').addEventListener('click', () => this.close());
      }
  }

  loadNotifications(notifications) {
      this.notifications = notifications;
      this.unreadCount = notifications.filter(n => n.unread).length;
      this.renderNotifications();
      this.updateBadge();
  }

  addNotification(notification) {
      notification.unread = true;
      this.notifications.unshift(notification);
      this.unreadCount++;
      this.renderNotifications();
      this.updateBadge();
  }

  markAsRead(id) {
      const notification = this.notifications.find(n => n.id === id);
      if (notification && notification.unread) {
          notification.unread = false;
          this.unreadCount--;
          this.updateBadge();
      }
  }

  markAllAsRead() {
      this.notifications.forEach(n => n.unread = false);
      this.unreadCount = 0;
      this.updateBadge();
  }

  renderNotifications() {
      const list = document.getElementById('notificationList');
      if (!list) return;

      list.innerHTML = this.notifications.map(notification => `
          <li class="notification-item ${notification.unread ? 'unread' : ''}" data-id="${notification.id}">
              <i class="fas ${this.getIcon(notification.type)} notification-icon"></i>
              <div class="notification-content">
                  <strong>${notification.title}</strong>
                  <p>${notification.message}</p>
                  <div class="notification-time">${this.formatTime(notification.time)}</div>
              </div>
          </li>
      `).join('');

      // Adiciona event listeners para cada item
      document.querySelectorAll('.notification-item').forEach(item => {
          item.addEventListener('click', (e) => {
              const id = item.getAttribute('data-id');
              this.markAsRead(id);
              // Aqui você pode adicionar ação ao clicar na notificação
          });
      });
  }

  updateBadge() {
      const badge = document.querySelector('.notification-badge');
      if (badge) {
          badge.textContent = this.unreadCount;
          badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
      }
  }

  getIcon(type) {
      const icons = {
          'user': 'fa-user-plus',
          'course': 'fa-book',
          'registration': 'fa-file-alt',
          'event': 'fa-calendar-check',
          'alert': 'fa-exclamation-circle',
          'default': 'fa-bell'
      };
      return icons[type] || icons.default;
  }

  formatTime(time) {
      // Implemente sua lógica de formatação de tempo aqui
      return time; // Retorna como está por enquanto
  }

  open() {
      document.getElementById('notificationModal').classList.add('active');
      document.getElementById('notificationOverlay').classList.add('active');
      document.body.style.overflow = 'hidden';
  }

  close() {
      document.getElementById('notificationModal').classList.remove('active');
      document.getElementById('notificationOverlay').classList.remove('active');
      document.body.style.overflow = 'auto';
  }
}

// Cria uma instância global
const notificationModal = new NotificationModal();

// Funções globais para chamar de qualquer lugar
window.openNotificationModal = () => notificationModal.open();
window.closeNotificationModal = () => notificationModal.close();
window.addNotification = (notification) => notificationModal.addNotification(notification);

// Exemplo de como carregar notificações (você substituirá por chamadas reais à API)
document.addEventListener('DOMContentLoaded', () => {
  // Simula carregamento de notificações
  const exampleNotifications = [
      {
          id: 1,
          title: 'Novo usuário registado',
          message: 'João Silva acabou de se registrar no sistema',
          time: 'Há 5 minutos',
          type: 'user',
          unread: true
      },
      {
          id: 2,
          title: 'Nova inscrição',
          message: 'Maria Santos inscreveu-se no curso de Informática',
          time: 'Há 1 hora',
          type: 'registration',
          unread: true
      }
  ];
  
  notificationModal.loadNotifications(exampleNotifications);
});