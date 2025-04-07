document.getElementById('form-contato').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Formulário enviado!');
    // Validação básica do cliente
    const nome = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const assunto = document.getElementById('subject').value.trim();
    const mensagem = document.getElementById('message').value.trim();
    
    if (!nome || !email || !mensagem) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Por favor, insira um email válido.');
        return;
    }
    
    // Envio via AJAX
    const formData = new FormData(this);
    
    fetch(this.action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
         
            showSuccessMessage(
                'O seu contacto foi enviado com sucesso!',
                'Contacto enviado',
                'success',
                'ENJOY YOUR STAY',
                3000 // auto-close after 3 seconds
            );

            this.reset();
        } else {
           console.log('Erro: ' + data.message);
           showErrorMessage('Não foi possível enviar o contacto.', 'Erro de Envio', 3000);

        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao enviar a mensagem.');
    });
});