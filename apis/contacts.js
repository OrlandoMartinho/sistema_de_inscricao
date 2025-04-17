document.getElementById('form-contato').addEventListener('submit', function(e) {
    e.preventDefault();
 
    // Validação básica do cliente
    const nome = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const assunto = document.getElementById('subject').value.trim();
    const mensagem = document.getElementById('message').value.trim();
    
    if (!nome || !email || !mensagem) {
        showErrorMessage('Complete bem os campos', 'Erro de digitação', 3000);
        return;
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showErrorMessage('Insira bem o seu email', 'Erro de digitação', 3000);
        return;
    }
    
    // Envio via AJAX
    const formData = new FormData(this);
    console.log(formData)
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
        showErrorMessage('Não foi possível enviar o contacto.', 'Erro de Envio', 3000);
    });
});