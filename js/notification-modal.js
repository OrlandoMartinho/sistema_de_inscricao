class NotificationModal {
    constructor() {
        this.notifications = [];
        this.unreadCount = 0;
        this.apiUrl = '../controllers/notificacoes.php';
        this.currentUserId = null;
        this.isOpen = false;
        
        this.initModal();
        this.initEventListeners();
        this.fetchCurrentUser();
    }

    /**
     * Inicializa a estrutura do modal de notificações
     */
    initModal() {
        if (!document.getElementById('notificationModal')) {
            const modalHTML = `
                <div class="notification-overlay" id="notificationOverlay"></div>
                <div class="notification-modal" id="notificationModal">
                    <div class="notification-header">
                        <h3>Notificações <span class="notification-count">${this.unreadCount}</span></h3>
                        <div class="notification-actions">
                            <button class="mark-all-read" ${this.unreadCount === 0 ? 'disabled' : ''}>
                                Marcar todas como lidas
                            </button>
                            <button class="close-notification" aria-label="Fechar notificações">&times;</button>
                        </div>
                    </div>
                    <div class="notification-body">
                        ${this.notifications.length === 0 
                            ? '<div class="empty-notifications">Nenhuma notificação disponível</div>' 
                            : '<ul class="notification-list" id="notificationList"></ul>'}
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }
    }

    /**
     * Configura os event listeners
     */
    initEventListeners() {
        document.getElementById('notificationOverlay')?.addEventListener('click', () => this.close());
        document.querySelector('.close-notification')?.addEventListener('click', () => this.close());
        
        document.querySelector('.mark-all-read')?.addEventListener('click', () => this.markAllAsRead());
        
        document.querySelectorAll('.notification-icon-container').forEach(container => {
            container.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggle();
            });
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    /**
     * Obtém o ID do usuário atual
     */
    fetchCurrentUser() {
        this.currentUserId = localStorage.getItem('userId') || 1;
        
        if (this.currentUserId) {
            this.fetchNotifications();
            this.setupPolling();
        }
    }

    /**
     * Configura atualização periódica das notificações
     */
    setupPolling() {
        this.pollingInterval = setInterval(() => {
            if (document.visibilityState === 'visible') {
                this.fetchNotifications();
            }
        }, 120000);
        
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.fetchNotifications();
            }
        });
    }

    /**
     * Busca notificações do servidor
     */
    async fetchNotifications() {
        if (!this.currentUserId) return;
        
        try {
            const response = await fetch(`${this.apiUrl}?id_usuario=${this.currentUserId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                this.processNotifications(data.data);
            } else {
                console.error('Erro ao carregar notificações:', data.message);
                this.showError('Falha ao carregar notificações');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            this.showError('Erro de conexão');
        }
    }

    /**
     * Processa as notificações recebidas da API
     */
    processNotifications(apiNotifications) {
        console.log('Notificações recebidas:', apiNotifications);
        this.notifications = apiNotifications.map(notification => ({
            id: notification.id_notificacao,
            title: notification.titulo || this.getNotificationTitle(notification.descricao),
            message: notification.descricao,
            time: notification.data_da_notificacao,
            type: this.detectNotificationType(notification.descricao),
            unread: notification.lido === 0,
            raw: notification
        }));
        
        this.unreadCount = this.notifications.filter(n => n.unread).length;
        this.renderNotifications();
        this.updateBadge();
    }

    /**
     * Renderiza a lista de notificações
     */
    renderNotifications() {
        const listContainer = document.getElementById('notificationList');
        const emptyMessage = document.querySelector('.empty-notifications');
        const bodyContainer = document.querySelector('.notification-body');
        
        if (this.notifications.length === 0) {
            if (!emptyMessage && bodyContainer) {
                bodyContainer.innerHTML = '<div class="empty-notifications">Nenhuma notificação disponível</div>';
            }
            return;
        }
        
        if (emptyMessage) {
            emptyMessage.remove();
        }
        
        if (!listContainer && bodyContainer) {
            bodyContainer.innerHTML = '<ul class="notification-list" id="notificationList"></ul>';
        }
        
        const list = document.getElementById('notificationList');
        if (!list) return;
        
        list.innerHTML = this.notifications.map(notification => `
            <li class="notification-item ${notification.unread ? 'unread' : ''}" 
                data-id="${notification.id}" 
                data-type="${notification.type}">
                <div class="notification-icon-container">
                    <i class="fas ${this.getIcon(notification.type)} notification-icon"></i>
                </div>
                <div class="notification-content">
                    <div class="notification-header">
                        <strong>${notification.title}</strong>
                        <button class="notification-close" data-id="${notification.id}">&times;</button>
                    </div>
                    <p>${notification.message}</p>
                    <div class="notification-footer">
                        <span class="notification-time">${this.formatTime(notification.time)}</span>
                        ${notification.unread ? 
                            '<button class="mark-as-read" data-id="' + notification.id + '">Marcar como lida</button>' : 
                            '<span class="read-status">Lida</span>'}
                    </div>
                </div>
            </li>
        `).join('');
        
        document.querySelectorAll('.notification-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') return;
                const id = item.getAttribute('data-id');
                this.handleNotificationClick(id);
            });
        });
        
        document.querySelectorAll('.mark-as-read').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = button.getAttribute('data-id');
                this.markAsRead(id);
            });
        });
        
        document.querySelectorAll('.notification-close').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = button.getAttribute('data-id');
                this.deleteNotification(id);
            });
        });
        
        const markAllButton = document.querySelector('.mark-all-read');
        if (markAllButton) {
            markAllButton.disabled = this.unreadCount === 0;
        }
        
        const countElement = document.querySelector('.notification-count');
        if (countElement) {
            countElement.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
        }
    }

    /**
     * Atualiza o badge de contagem de não lidas
     */
    updateBadge() {
        document.querySelectorAll('.notify').forEach(badge => {
            badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            badge.style.display = this.unreadCount > 0 ? 'flex' : 'none';
        });
    }

    /**
     * Manipula o clique em uma notificação
     */
    handleNotificationClick(id) {
        console.log('Notificação clicada:', id);
        const notification = this.notifications.find(n => n.id == id);
        if (!notification) return;
        
        if (notification.unread) {
            this.markAsRead(id);
        }
        
        // Implemente ações específicas conforme necessário
        console.log('Notificação clicada:', notification);
    }

    /**
     * Marca uma notificação como lida
     */
    async markAsRead(id) {

        console.log('Marcar como lida:', id);
        const notification = this.notifications.find(n => n.id == id);
        if (!notification || !notification.unread) return;
        
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `marcar_lido=1&id_notificacao=${id}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                notification.unread = false;
                this.unreadCount--;
                this.updateBadge();
                this.renderNotifications();
            } else {
                console.error('Erro ao marcar como lido:', data.message);
                this.showError('Erro ao marcar como lida');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            this.showError('Erro de conexão');
        }
    }

    /**
     * Marca todas as notificações como lidas
     */
    async markAllAsRead() {
        if (this.unreadCount === 0) return;
        
        try {
            this.notifications.forEach(n => n.unread = false);
            this.unreadCount = 0;
            this.updateBadge();
            this.renderNotifications();
            
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `marcar_todos_lidos=1&id_usuario=${this.currentUserId}`
            });
            
            const data = await response.json();
            
            if (!data.success) {
                console.error('Erro ao marcar todas como lidas:', data.message);
                this.showError('Erro ao marcar como lidas');
                this.fetchNotifications();
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            this.showError('Erro de conexão');
            this.fetchNotifications();
        }
    }

    /**
     * Remove uma notificação
     */
    async deleteNotification(id) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `id_notificacao=${id}`
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.notifications = this.notifications.filter(n => n.id != id);
                if (this.notifications.length === 0) {
                    document.querySelector('.notification-body').innerHTML = 
                        '<div class="empty-notifications">Nenhuma notificação disponível</div>';
                } else {
                    this.renderNotifications();
                }
            } else {
                console.error('Erro ao deletar notificação:', data.message);
                this.showError('Erro ao remover');
            }
        } catch (error) {
            console.error('Erro na requisição:', error);
            this.showError('Erro de conexão');
        }
    }

    /**
     * Mostra uma mensagem de erro temporária
     */
    showError(message) {
        const errorElement = document.createElement('div');
        errorElement.className = 'notification-error';
        errorElement.textContent = message;
        
        const header = document.querySelector('.notification-header');
        if (header) {
            header.appendChild(errorElement);
            
            setTimeout(() => {
                errorElement.classList.add('fade-out');
                setTimeout(() => errorElement.remove(), 500);
            }, 3000);
        }
    }

    /**
     * Abre o modal de notificações
     */
    open() {
        document.getElementById('notificationModal')?.classList.add('active');
        document.getElementById('notificationOverlay')?.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;
        this.fetchNotifications();
    }

    /**
     * Fecha o modal de notificações
     */
    close() {
        document.getElementById('notificationModal')?.classList.remove('active');
        document.getElementById('notificationOverlay')?.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.isOpen = false;
    }

    /**
     * Alterna o estado do modal (abre/fecha)
     */
    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    /**
     * Detecta o tipo de notificação baseado no conteúdo
     */
    detectNotificationType(description) {
        const lowerDesc = description.toLowerCase();
        
        if (lowerDesc.includes('usuário') || lowerDesc.includes('user') || lowerDesc.includes('registrou')) {
            return 'user';
        } else if (lowerDesc.includes('curso') || lowerDesc.includes('course') || lowerDesc.includes('aula')) {
            return 'course';
        } else if (lowerDesc.includes('inscrição') || lowerDesc.includes('registration')) {
            return 'registration';
        } else if (lowerDesc.includes('evento') || lowerDesc.includes('event')) {
            return 'event';
        } else if (lowerDesc.includes('alerta') || lowerDesc.includes('alert') || lowerDesc.includes('importante')) {
            return 'alert';
        } else {
            return 'default';
        }
    }

    /**
     * Extrai um título da descrição da notificação
     */
    getNotificationTitle(description) {
        const firstSentence = description.split('.')[0] || description;
        return firstSentence.length > 50 ? firstSentence.substring(0, 50) + '...' : firstSentence;
    }

    /**
     * Obtém o ícone correspondente ao tipo de notificação
     */
    getIcon(type) {
        const icons = {
            'user': 'fa-user',
            'course': 'fa-book',
            'registration': 'fa-file-alt',
            'event': 'fa-calendar',
            'alert': 'fa-exclamation-circle',
            'default': 'fa-bell'
        };
        return icons[type] || icons.default;
    }

    /**
     * Formata a data para exibição amigável
     */
    formatTime(dateString) {
        const now = new Date();
        const notificationDate = new Date(dateString);
        const diffInSeconds = Math.floor((now - notificationDate) / 1000);
        
        if (diffInSeconds < 60) return `Agora mesmo`;
        if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `Há ${minutes} minuto${minutes !== 1 ? 's' : ''}`;
        }
        if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `Há ${hours} hora${hours !== 1 ? 's' : ''}`;
        }
        if (diffInSeconds < 2592000) {
            const days = Math.floor(diffInSeconds / 86400);
            return `Há ${days} dia${days !== 1 ? 's' : ''}`;
        }
        return notificationDate.toLocaleDateString('pt-BR');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.notificationModal = new NotificationModal();
    
    window.openNotificationModal = () => window.notificationModal.open();
    window.closeNotificationModal = () => window.notificationModal.close();
    window.toggleNotificationModal = () => window.notificationModal.toggle();
});