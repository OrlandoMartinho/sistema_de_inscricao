async function fazerLogout() {
    try {
        console.log('Iniciando o processo de logout...');

        const response = await fetch('../controllers/token_check.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'action=logout',
            credentials: 'include'
        });

        console.log('Resposta do servidor recebida:', response);

        const data = await response.json();
        console.log('Dados recebidos da resposta:', data);

        if (data.status === 'success' && data.redirect) {
            // Redireciona para a página de login
            console.log('Logout bem-sucedido. Redirecionando para:', data.redirect);
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



