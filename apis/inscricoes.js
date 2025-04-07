// Adiciona estilos para campos inválidos
const style = document.createElement('style');
style.textContent = `
    .campo-invalido {
        border-color: #ff4444 !important;
        box-shadow: 0 0 0 1px #ff4444;
    }
    .campo-invalido:focus {
        box-shadow: 0 0 0 2px #ff4444;
    }
`;
document.head.appendChild(style);

// Controle das páginas do formulário
document.getElementById('btn-avancar').addEventListener('click', function() {
    if (validarPagina(1)) {
        document.getElementById('page1').classList.remove('active');
        document.getElementById('page2').classList.add('active');
        document.getElementById('btn-voltar').style.display = 'inline-block';
        document.getElementById('btn-avancar').style.display = 'none';
        document.getElementById('btn-confirmar').style.display = 'inline-block';
        
        // Preenche os dados de confirmação
        document.getElementById('classe_confirmacao').textContent = 
            document.getElementById('classe').options[document.getElementById('classe').selectedIndex].text;
        document.getElementById('turno_confirmacao').textContent = 
            document.getElementById('turno').options[document.getElementById('turno').selectedIndex].text;
        document.getElementById('curso_confirmacao').textContent = 
            document.getElementById('curso').options[document.getElementById('curso').selectedIndex].text;
        
        const hoje = new Date();
        document.getElementById('data_confirmacao').textContent = hoje.toLocaleDateString('pt-PT');
    }
});

document.getElementById('btn-voltar').addEventListener('click', function() {
    document.getElementById('page1').classList.add('active');
    document.getElementById('page2').classList.remove('active');
    document.getElementById('btn-voltar').style.display = 'none';
    document.getElementById('btn-avancar').style.display = 'inline-block';
    document.getElementById('btn-confirmar').style.display = 'none';
});

// Validação e envio do formulário
document.getElementById('form-matricula').addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (validarPagina(2)) {
        enviarFormulario();
    }
});

function validarPagina(pagina) {
    let valido = true;
    const campos = document.querySelectorAll(`#page${pagina} .validate`);
    
    campos.forEach(campo => {
        if (!campo.checkValidity()) {
            // Mostra mensagem de validação
            campo.reportValidity();
            valido = false;
            
            // Destaca o campo inválido
            campo.classList.add('campo-invalido');
            
            // Remove o destaque quando o usuário começar a corrigir
            campo.addEventListener('input', function() {
                this.classList.remove('campo-invalido');
            }, {once: true});
        }
    });
    
    return valido;
}

function enviarFormulario() {
    const formData = new FormData(document.getElementById('form-matricula'));
    alert('Aguarde, estamos a processar a sua inscrição...');
    fetch(document.getElementById('form-matricula').action, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Inscrição confirmada com sucesso!');
            closeModal();
        } else {
            alert('Erro: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Ocorreu um erro ao enviar a inscrição. Por favor, tente novamente.');
    });
}

function closeModal() {
    document.getElementById('matriculaModal').style.display = 'none';
    document.getElementById('form-matricula').reset();
    document.getElementById('page1').classList.add('active');
    document.getElementById('page2').classList.remove('active');
    document.getElementById('btn-voltar').style.display = 'none';
    document.getElementById('btn-avancar').style.display = 'inline-block';
    document.getElementById('btn-confirmar').style.display = 'none';
}