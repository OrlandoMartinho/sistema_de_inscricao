// tokenVerifier.js

/**
 * Verifica o status do token periodicamente
 * @param {number} checkInterval Intervalo de verificação em milissegundos (padrão: 1 minuto)
 */
function initTokenVerifier(checkInterval = 60000) {
    console.log('Iniciando verificação do token...');
    
    // Verifica imediatamente ao carregar
    checkTokenStatus();
    
    // Configura verificação periódica
    setInterval(() => {
        console.log('Verificando status do token...');
        checkTokenStatus();
    }, checkInterval);
}


async function checkTokenStatus() {
    try {
        console.log('Iniciando a verificação do status do token...');
        
        const response = await fetch('../controllers/token_check.php', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache'
            },
            credentials: 'include' // Importante para enviar cookies de sessão
        });

        const data = await response.json();
        console.log('Resposta do servidor recebidaaaaa:', data);

        if (!response.ok || data.status === 'error') {
            // Token inválido ou expirado
            console.warn('Token inválido ou expirado:', data.message);
            if (data.redirect) {
                redirectToLogin(data.message);
            }
            return;
        }

        if (data.status === 'success' && data.message === 'Sessão encerrada com sucesso') {
            // Caso a sessão tenha sido encerrada com sucesso, redireciona para a página de login
            console.log('Sessão encerrada com sucesso. Redirecionando para login...');
            if (data.redirect && !sessionStorage.getItem('redirected')) {
                // Marca que o redirecionamento foi feito
                sessionStorage.setItem('redirected', 'true');
                window.location.href = data.redirect;
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
    console.log('Redirecionando para login...');
    
    // Verifica se o redirecionamento já foi feito para evitar redirecionamento contínuo
    if (!sessionStorage.getItem('redirected')) {
        // Armazena a página atual para possível redirecionamento após login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        
        // Codifica a mensagem para URL
        const encodedMessage = encodeURIComponent(message || 'Sessão expirada');
        console.log('Mensagem de erro codificada:', encodedMessage);
        
        // Marca que o redirecionamento foi feito
        sessionStorage.setItem('redirected', 'true');
        
        // Redireciona para login
        window.location.href = `/login.php?error=${encodedMessage}`;
    }
}

// Inicia o verificador quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM carregado. Iniciando verificador de token...');
    
    // Verifica a cada 1 minuto (60000 ms)
    initTokenVerifier(60000);
    
    // Opcional: Verificar token antes de ações importantes
    document.querySelectorAll('[data-requires-auth]').forEach(element => {
        element.addEventListener('click', async (e) => {
            console.log('Verificando token antes de ação importante...');
            const response = await fetch('../controllers/token_check.php');
            const data = await response.json();
            
            if (!response.ok || data.status === 'error') {
                e.preventDefault();
                console.warn('Token inválido ou expirado antes da ação:', data.message);
                redirectToLogin(data.message);
            }
        });
    });
});
