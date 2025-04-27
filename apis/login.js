// message-modal.js
class MessageModal {
    constructor() {
        this.initModal();
    }

    initModal() {
        if (!document.getElementById('messageModal')) {
            const modalHTML = `
                <div class="message-modal-overlay" id="messageModalOverlay"></div>
                <div class="message-modal" id="messageModal">
                    <div class="message-modal-header" id="messageModalHeader">
                        <i class="fas message-modal-icon" id="messageModalIcon"></i>
                        <h3 class="message-modal-title" id="messageModalTitle"></h3>
                    </div>
                    <div class="message-modal-body" id="messageModalBody"></div>
                    <div class="message-modal-footer">
                        <button class="message-modal-button" id="messageModalButton">OK</button>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Event listeners
            document.getElementById('messageModalButton').addEventListener('click', () => this.close());
            document.getElementById('messageModalOverlay').addEventListener('click', () => this.close());
        }
    }

    show({ type = 'info', title = '', message = '', duration = 0 }) {
        const header = document.getElementById('messageModalHeader');
        const icon = document.getElementById('messageModalIcon');
        
        // Reset classes
        header.className = 'message-modal-header';
        header.classList.add(type);
        
        // Set icon based on type
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-times-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-circle'
        };
        icon.className = `fas message-modal-icon ${icons[type] || icons.info}`;
        
        // Set content
        document.getElementById('messageModalTitle').textContent = title;
        document.getElementById('messageModalBody').textContent = message;
        
        // Show modal
        document.getElementById('messageModal').classList.add('active');
        document.getElementById('messageModalOverlay').classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Auto close if duration is set
        if (duration > 0) {
            setTimeout(() => this.close(), duration);
        }
    }

    close() {
        document.getElementById('messageModal').classList.remove('active');
        document.getElementById('messageModalOverlay').classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Cria uma instância global
const messageModal = new MessageModal();

// Funções globais para fácil acesso
window.showSuccessMessage = (message, title = 'Sucesso', duration = 0) => {
    messageModal.show({ type: 'success', title, message, duration });
};

window.showErrorMessage = (message, title = 'Erro', duration = 0) => {
    messageModal.show({ type: 'error', title, message, duration });
};

window.showInfoMessage = (message, title = 'Informação', duration = 0) => {
    messageModal.show({ type: 'info', title, message, duration });
};

window.showWarningMessage = (message, title = 'Aviso', duration = 0) => {
    messageModal.show({ type: 'warning', title, message, duration });
};

window.hideMessage = () => messageModal.close();


const form = document.getElementById('loginForm');

form.addEventListener('submit', async function(e) {
  e.preventDefault();

  const formData = new FormData(form);

  // Exibir os dados que serão enviados
  console.log("🔄 Enviando os seguintes dados:");
  for (let pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }

  try {
    const response = await fetch('../controllers/autenticacao.php', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    console.log("📡 Resposta do servidor:", data);

    localStorage.setItem('user_data', JSON.stringify(data.userData)); // Armazena os dados do usuário no localStorage  
   
    if (data.status === 'success') {
      
      await showSuccessMessage(
        data.mensagem,
        'Logon efectuado com sucesso',
        'success',
        'ENJOY YOUR STAY',
        3000 // auto-close after 3 seconds
    );
      window.location.href = 'home.html';
    } else {
       await showErrorMessage(data.mensagem, 'Credenciais inválidas', 3000);
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error);
 
    showErrorMessage('Erro ao tentar fazer login. Tente novamente.', 'Erro no servidor', 3000);
  }
});
