

async function fazerLogout() {
    try {
        const response = await fetch('../controllers/token_check.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=logout',
            credentials: 'include'
        });

        const data = await response.json();

        if (data.status === 'success' && data.redirect) {
            // Redireciona para a página de login
            window.location.href = data.redirect;
        } else {
            console.error('Erro no logout:', data.message);
            alert('Ocorreu um erro ao tentar sair. Por favor, tente novamente.');
        }
    } catch (error) {
        console.error('Erro na requisição de logout:', error);
        alert('Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    }
}

/**
 * Configura o botão de logout
 */
function configurarLogout() {
    // Configura todos os botões com data-role="logout"
    document.querySelectorAll('[data-role="logout"]').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Tem certeza que deseja sair do sistema?')) {
                fazerLogout();
            }
        });
    });

    // Opcional: Logout automático após inatividade (30 minutos)
    let inactivityTimer;
    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if (confirm('Sua sessão ficou inativa. Deseja continuar?')) {
                resetInactivityTimer();
            } else {
                fazerLogout();
            }
        }, 30 * 60 * 1000); // 30 minutos
    };

    // Eventos que resetam o timer de inatividade
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, resetInactivityTimer, false);
    });

    resetInactivityTimer();
}

// Inicia quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', configurarLogout);