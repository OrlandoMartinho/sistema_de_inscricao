// Função para enviar o formulário
async function enviarFormulario(id_curso) {
    console.log('[DEBUG] Iniciando envio do formulário...');
    
    if (!validarPagina1() || !validarPagina2()) {
        console.log('[DEBUG] Validação falhou. Corrija os campos destacados.');
        return false;
    }


    
    
    const formData = new FormData(document.getElementById('form-matricula'));
    formData.append('id_calendario', id_curso);
    // Simulação de envio (substituir por fetch real)
    console.log('Dados do formulário:', Object.fromEntries(formData));
    formData.append('action', 'post'); // Adiciona a ação ao FormData
    await getNumberProcess(id_curso)
    const numberProcess = localStorage.getItem('numero_processo');
    formData.append('numero_do_processo', numberProcess);
    fetch(document.getElementById('form-matricula').action, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        showErrorMessage('Não foi possível enviar o contacto.', 'Erro na Rede', 3000);
        if (!response.ok) throw new Error('Erro na rede');
        return response.json();
    })
    .then(data => {
        if (data.success) {
            
            showSuccessMessage(
                'Incrição confirmada com sucesso!',
                'Inscrição enviado',
                'success',
                'ENJOY YOUR STAY',
                3000 // auto-close after 3 seconds
            );

            closeModal();
        } else {
            showErrorMessage('Não foi possível enviar a sua inscrição.', 'Ocorreu um erro', 3000);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        showErrorMessage('Não foi possível enviar a sua inscrição.', 'Ocorreu um erro', 3000);
    });
}
