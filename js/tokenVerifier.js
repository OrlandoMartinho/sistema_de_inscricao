// tokenVerifier.js

/**
 * Verifica o status do token periodicamente
 * @param {number} checkInterval Intervalo de verificação em milissegundos (padrão: 1 minuto)
 */
function initTokenVerifier(checkInterval = 60000) {
    // Verifica imediatamente ao carregar
    checkTokenStatus();
    
    // Configura verificação periódica
    setInterval(checkTokenStatus, checkInterval);
}


async function checkTokenStatus() {
    try {
        const response = await fetch('../controllers/token_check.php', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            credentials: 'include' // Importante para enviar cookies de sessão
        });

        const data = await response.json();

        if (!response.ok || data.status === 'error') {
            // Token inválido ou expirado
            if (data.redirect) {
                redirectToLogin(data.message);
            }
            return;
        }

        // Opcional: Log do tempo restante (para debug)
        console.log(`Token válido. Expira em: ${data.data.expira_em_formatado} (${Math.round(data.data.tempo_restante/60)} minutos restantes)`);

    } catch (error) {
        console.error('Erro ao verificar token:', error);
        // Em caso de erro na requisição, não fazemos nada para não perturbar o usuário
    }
}

/**
 * Redireciona para a página de login com mensagem
 * @param {string} message Mensagem de erro
 */
function redirectToLogin(message) {
    // Armazena a página atual para possível redirecionamento após login
    sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    
    // Codifica a mensagem para URL
    const encodedMessage = encodeURIComponent(message || 'Sessão expirada');
    
    // Redireciona para login
    window.location.href = `/login.php?error=${encodedMessage}`;
}

// Inicia o verificador quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Verifica a cada 1 minuto (60000 ms)
    initTokenVerifier(60000);
    
    // Opcional: Verificar token antes de ações importantes
    document.querySelectorAll('[data-requires-auth]').forEach(element => {
        element.addEventListener('click', async (e) => {
            const response = await fetch('../api/token_check.php');
            const data = await response.json();
            
            if (!response.ok || data.status === 'error') {
                e.preventDefault();
                redirectToLogin(data.message);
            }
        });
    });
});