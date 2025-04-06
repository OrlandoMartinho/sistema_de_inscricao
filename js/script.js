// Expressões regulares para validação
const validacoes = {
    nome: /^[a-zA-ZÀ-ÿ\s]{5,}$/, // Min 5 caracteres, apenas letras e espaços
    processo: /^\d{4,10}$/, // 4 a 10 dígitos
    telefone: /^[9][1-9]\d{7}$/, // Telefone angolano (9 seguido de 8 dígitos)
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // Email válido
    bi: /^\d{9}[A-Z]{2}\d{3}$/, // Formato de BI angolano (9 dígitos + 2 letras + 3 dígitos)
    data: /^\d{4}-\d{2}-\d{2}$/, // Formato de data YYYY-MM-DD
    numero: /^\d+$/ // Apenas números
  };
  
  // Mensagens de erro para cada campo
  const mensagensErro = {
    nome: "Nome deve ter pelo menos 5 caracteres (apenas letras)",
    processo: "Nº de processo deve ter entre 4 e 10 dígitos",
    contacto_aluno: "Telefone inválido (ex: 923456789)",
    contacto_encarregado: "Telefone inválido (ex: 923456789)",
    data_nascimento: "Data de nascimento inválida",
    numero_identificacao: "Número de identificação inválido",
    email: "Email inválido (ex: exemplo@dominio.com)"
  };
  
  // Função para mostrar erro no campo
  function mostrarErro(campoId, mensagem) {
    const campo = document.getElementById(campoId);
    if (!campo) return;
    
    campo.style.borderColor = 'red';
    
    // Remove mensagens de erro existentes
    const erroExistente = campo.nextElementSibling;
    if (erroExistente && erroExistente.classList.contains('mensagem-erro')) {
        erroExistente.remove();
    }
    
    // Adiciona nova mensagem de erro
    const mensagemErro = document.createElement('div');
    mensagemErro.textContent = mensagem;
    mensagemErro.classList.add('mensagem-erro');
    mensagemErro.style.color = 'red';
    mensagemErro.style.fontSize = '0.8em';
    mensagemErro.style.marginTop = '5px';
    
    campo.insertAdjacentElement('afterend', mensagemErro);
  }
  
  // Função para limpar erro do campo
  function limparErro(campoId) {
    const campo = document.getElementById(campoId);
    if (!campo) return;
    
    campo.style.borderColor = '';
    
    const mensagemErro = campo.nextElementSibling;
    if (mensagemErro && mensagemErro.classList.contains('mensagem-erro')) {
        mensagemErro.remove();
    }
  }
  
  // Validação individual de campo
  function validarCampo(campoId, regex) {
    const campo = document.getElementById(campoId);
    if (!campo) return false;
    
    const valor = campo.value.trim();
    
    if (!valor) {
        mostrarErro(campoId, "Este campo é obrigatório");
        return false;
    }
    
    if (regex && !regex.test(valor)) {
        mostrarErro(campoId, mensagensErro[campoId] || "Formato inválido");
        return false;
    }
    
    limparErro(campoId);
    return true;
  }
  
  // Função para abrir o modal de matrícula
  function openMatriculaModal(courseName) {
    document.getElementById('matriculaModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Resetar o formulário ao abrir
    document.getElementById('page1').classList.add('active');
    document.getElementById('page2').classList.remove('active');
    document.getElementById('btn-avancar').style.display = 'inline-block';
    document.getElementById('btn-voltar').style.display = 'none';
    document.getElementById('btn-confirmar').style.display = 'none';
    
    // Definir o curso selecionado automaticamente
    if (courseName === 'Informática') {
        document.getElementById('tipo_identificacao').value = 'informatica';
    } else if (courseName === 'Electricidade') {
        document.getElementById('tipo_identificacao').value = 'electricidade';
    }
    
    // Atualizar a confirmação
    atualizarConfirmacao();
  }
  
  // Função para fechar o modal
  function closeModal() {
    document.getElementById('matriculaModal').style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  
  // Função para atualizar os campos de confirmação
  function atualizarConfirmacao() {
    // Obter valores selecionados
    const classe = document.getElementById('classe').value;
    const turno = document.getElementById('turno').value;
    const curso = document.getElementById('tipo_identificacao').value;
    
    // Atualizar texto de confirmação
    document.getElementById('classe_confirmacao').textContent = classe ? classe + 'ª' : '______';
    
    if (turno === 'MANHA') {
        document.getElementById('turno_confirmacao').textContent = 'MANHÃ';
    } else if (turno === 'TARDE') {
        document.getElementById('turno_confirmacao').textContent = 'TARDE';
    } else {
        document.getElementById('turno_confirmacao').textContent = '______';
    }
    
    if (curso === 'electricidade') {
        document.getElementById('curso_confirmacao').textContent = 'TÉCNICO DE ENERGIA E INSTALAÇÕES ELÉCTRICAS';
    } else if (curso === 'informatica') {
        document.getElementById('curso_confirmacao').textContent = 'TÉCNICO DE INFORMÁTICA';
    } else {
        document.getElementById('curso_confirmacao').textContent = '______';
    }
    
    // Atualizar data atual
    const hoje = new Date();
    document.getElementById('data_confirmacao').textContent = hoje.toLocaleDateString('pt-AO');
  }
  
  // Função para validar a página 1
  function validarPagina1() {
    let valido = true;
    
    // Validar cada campo individualmente
    valido &= validarCampo('idade', validacoes.numero);
    valido &= validarCampo('sexo');
    valido &= validarCampo('processo', validacoes.processo);
    valido &= validarCampo('nome', validacoes.nome);
    valido &= validarCampo('filiacao');
    valido &= validarCampo('contacto_aluno', validacoes.telefone);
    valido &= validarCampo('contacto_encarregado', validacoes.telefone);
    valido &= validarCampo('data_nascimento', validacoes.data);
    valido &= validarCampo('natural');
    valido &= validarCampo('provincia');
    valido &= validarCampo('tipo_identificacao');
    valido &= validarCampo('numero_identificacao', validacoes.bi);
    
    // Validar arquivo se for necessário
    const arquivo = document.getElementById('arquivo_identificacao');
    if (arquivo && !arquivo.files[0]) {
        mostrarErro('arquivo_identificacao', 'Por favor, anexe o documento de identificação');
        valido = false;
    } else {
        limparErro('arquivo_identificacao');
    }
    
    return valido;
  }
  
  // Função para validar a página 2
  function validarPagina2() {
    let valido = true;
    
    valido &= validarCampo('ano_lectivo');
    valido &= validarCampo('tipo_identificacao');
    valido &= validarCampo('classe');
    valido &= validarCampo('turno');
    
    return valido;
  }
  
  // Event listeners quando o DOM estiver carregado
  document.addEventListener('DOMContentLoaded', function() {
    // Adiciona listeners para validação em tempo real
    document.getElementById('nome')?.addEventListener('blur', function() {
        validarCampo('nome', validacoes.nome);
    });
    
    document.getElementById('processo')?.addEventListener('blur', function() {
        validarCampo('processo', validacoes.processo);
    });
    
    document.getElementById('contacto_aluno')?.addEventListener('blur', function() {
        validarCampo('contacto_aluno', validacoes.telefone);
    });
    
    document.getElementById('contacto_encarregado')?.addEventListener('blur', function() {
        validarCampo('contacto_encarregado', validacoes.telefone);
    });
    
    document.getElementById('numero_identificacao')?.addEventListener('blur', function() {
        validarCampo('numero_identificacao', validacoes.bi);
    });
    
    document.getElementById('data_nascimento')?.addEventListener('blur', function() {
        validarCampo('data_nascimento', validacoes.data);
    });
  
    // Configuração do modal de duas páginas
    const btnAvancar = document.getElementById('btn-avancar');
    const btnVoltar = document.getElementById('btn-voltar');
    const btnConfirmar = document.getElementById('btn-confirmar');
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    
    if (btnAvancar) {
      btnAvancar.addEventListener('click', function() {
          if (page1.classList.contains('active')) {
              // Validação dos campos da página 1 antes de avançar
              if (!validarPagina1()) {
                  return;
              }
              
              page1.classList.remove('active');
              page2.classList.add('active');
              btnAvancar.style.display = 'none';
              btnVoltar.style.display = 'inline-block';
              btnConfirmar.style.display = 'inline-block';
              
              // Preencher dados de confirmação
              atualizarConfirmacao();
          }
      });
    }
    
    if (btnVoltar) {
      btnVoltar.addEventListener('click', function() {
          page2.classList.remove('active');
          page1.classList.add('active');
          btnAvancar.style.display = 'inline-block';
          btnVoltar.style.display = 'none';
          btnConfirmar.style.display = 'none';
      });
    }
    
    if (btnConfirmar) {
      btnConfirmar.addEventListener('click', function() {
          if (validarPagina2()) {
              // Simular envio do formulário
              const formData = new FormData();
              document.querySelectorAll('#page1 input, #page1 select, #page2 input, #page2 select').forEach(element => {
                  if (element.type !== 'file') {
                      formData.append(element.name, element.value);
                  } else if (element.files[0]) {
                      formData.append(element.name, element.files[0]);
                  }
              });
              
              // Aqui você faria a requisição AJAX para enviar os dados
              console.log('Dados do formulário:', Object.fromEntries(formData));
              
              alert('Matrícula confirmada com sucesso!');
              showSuccessMessage(
                'Inscrição Enviada com sucesso!',
                'Inscrição Feita com sucesso!',
                'ENJOY YOUR STAY',
                3000 // auto-close after 3 seconds
            );
              closeModal();
          }
      });
    }
    
    // Atualizar campos de confirmação quando os valores mudam
    document.getElementById('classe')?.addEventListener('change', atualizarConfirmacao);
    document.getElementById('turno')?.addEventListener('change', atualizarConfirmacao);
    document.getElementById('tipo_identificacao')?.addEventListener('change', atualizarConfirmacao);
    
    // Fechar o modal ao clicar fora dele
    document.getElementById('matriculaModal')?.addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // Atualizar os botões de inscrição para usar a nova função
    document.querySelectorAll('.apply-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const courseName = this.closest('tr').querySelector('td:first-child').textContent;
            openMatriculaModal(courseName);
        });
    });
  });

  function openModal() {
    openMatriculaModal();
}