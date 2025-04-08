// Função para enviar o formulário
function enviarFormulario(id_curso) {
    console.log('[DEBUG] Iniciando envio do formulário...');
    
    if (!validarPagina1() || !validarPagina2()) {
        console.log('[DEBUG] Validação falhou. Corrija os campos destacados.');
        return false;
    }
    
    const formData = new FormData(document.getElementById('form-matricula'));
    formData.append('id_curso', id_curso);
    // Simulação de envio (substituir por fetch real)
    console.log('Dados do formulário:', Object.fromEntries(formData));
    
    fetch(document.getElementById('form-matricula').action, {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) throw new Error('Erro na rede');
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert('Matrícula confirmada com sucesso!');
            closeModal();
        } else {
            alert('Erro: ' + (data.message || 'Erro desconhecido'));
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao enviar. Por favor, tente novamente.');
    });
}
