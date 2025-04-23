// Expressões regulares para validação
const validacoes = {
    nome: /^[a-zA-ZÀ-ÿ\s]{5,100}$/, // Min 5 caracteres, max 100, apenas letras e espaços
    telefone: /^[9][1-9]\d{7}$/, // Telefone angolano (9 seguido de 8 dígitos)
    bi: /^\d{9}[A-Za-z]{2}\d{3}$/i, // Formato de BI angolano (9 dígitos + 2 letras + 3 dígitos)
    data: /^\d{4}-\d{2}-\d{2}$/, // Formato de data YYYY-MM-DD
    numero: /^\d+$/, // Apenas números
    idade: /^(1[0-9]|2[0-9]|30)$/ // Idade entre 10 e 30 anos
};

// Mensagens de erro para cada campo
const mensagensErro = {
    nome_completo: "Nome deve ter entre 5 e 100 caracteres (apenas letras)",
    numero_do_processo: "Nº de processo deve ter entre 4 e 10 dígitos",
    contacto_do_aluno: "Telefone inválido (ex: 923456789)",
    contacto_do_encarregado: "Telefone inválido (ex: 923456789)",
    data_de_nascimento: "Data de nascimento inválida (formato: AAAA-MM-DD)",
    numero_de_identificacao: "Número de identificação inválido (formato: 123456789LA123)",
    idade: "Idade deve ser entre 10 e 30 anos",
    genero: "Selecione o sexo",
    filiacao: "Preencha a filiação completa",
    natural_de: "Preencha a naturalidade",
    provincia: "Preencha a província",
    tipo_de_identificacao: "Selecione o tipo de identificação",
    arquivo_de_identificacao: "Anexe o documento de identificação",
    foto_tipo_passe: "Anexe a foto tipo passe",
    curso: "Selecione o curso",
    classe: "Selecione a classe",
    turno: "Selecione o turno",
    data_validade: "Data de validade inválida"
};

// Função para mostrar erro no campo
function mostrarErro(campoId, mensagem) {
    const campo = document.getElementById(campoId);
    if (!campo) return;
    
    campo.classList.add('campo-invalido');
    
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
    
    campo.classList.remove('campo-invalido');
    
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

    // Verifica se é campo obrigatório
    if (campo.required && !valor) {
        mostrarErro(campoId, mensagensErro[campoId] || "Este campo é obrigatório");
        return false;
    }
    
    // Verifica regex se fornecida
    if (regex && valor && !regex.test(valor)) {
        mostrarErro(campoId, mensagensErro[campoId] || "Formato inválido");
        return false;
    }
    
    // Verificação especial para arquivos
    if (campo.type === 'file' && campo.required && !campo.files[0]) {
        mostrarErro(campoId, mensagensErro[campoId] || "Arquivo obrigatório");
        return false;
    }
    
    // Verificação especial para selects
    if (campo.tagName === 'SELECT' && campo.required && !campo.value) {
        mostrarErro(campoId, mensagensErro[campoId] || "Selecione uma opção");
        return false;
    }
    
    limparErro(campoId);
    return true;
}

// Função para validar a página 1
function validarPagina1() {
    let valido = true;
    
    valido &= validarCampo('idade', validacoes.idade);
    valido &= validarCampo('genero');
    valido &= validarCampo('nome_completo', validacoes.nome);
    valido &= validarCampo('filiacao');
    valido &= validarCampo('contacto_do_aluno', validacoes.telefone);
    valido &= validarCampo('contacto_do_encarregado', validacoes.telefone);
    valido &= validarCampo('data_de_nascimento', validacoes.data);
    valido &= validarCampo('natural_de');
    valido &= validarCampo('provincia');
    valido &= validarCampo('tipo_de_identificacao');
    valido &= validarCampo('numero_de_identificacao', validacoes.bi);
    valido &= validarCampo('data_validade', validacoes.data);
    valido &= validarCampo('arquivo_de_identificacao');
    valido &= validarCampo('foto_tipo_passe');
    
    return valido;
}

// Função para validar a página 2
function validarPagina2() {
    let valido = true;
    
    valido &= validarCampo('classe');
    valido &= validarCampo('turno');
    
    return valido;
}

let id_curso = null



document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM completamente carregado e analisado');
    
    console.log('Token verificado com sucesso');
    
    // Carregar cursos assim que a página for carregada
    carregarCursos().then(() => {
        console.log('Cursos carregados com sucesso');
        // Depois que os cursos forem carregados, carregar os eventos
        
    }).catch(error => {
        console.error('Erro ao carregar cursos:', error);
    });
    
    
});

// Variável global para armazenar eventos
let eventos = [];
let cursos = [];
let eventoSelecionado = null;

// Função para carregar os cursos disponíveis
async function carregarCursos() {
    console.log('Iniciando carregamento de cursos...');
    try {
        console.log('Fazendo requisição para ../controllers/cursos.php');
        const response = await fetch('../controllers/cursos.php');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Resposta da API de cursos:', data);
        
        if (data.success) {
            cursos = data.data;
            console.log(`${cursos.length} cursos carregados`);
            preencherSelectCursos();
        } else {
            throw new Error(data.message || 'Erro ao carregar cursos');
        }
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        mostrarNotificacao('error', 'Erro ao carregar cursos');
    }
}

// Preencher selects de cursos nos modais
function preencherSelectCursos() {
    console.log('Preenchendo selects de cursos...');
    const selectPublicar = document.getElementById('curso');
   
    
    // Limpar opções existentes (mantendo a primeira opção padrão)
    console.log('Limpando selects existentes...');
    while (selectPublicar.options.length > 1) selectPublicar.remove(1);
 
    
    // Adicionar cursos
    console.log('Adicionando cursos aos selects...');
    cursos.forEach(curso => {
        const option = document.createElement('option');
        option.value = curso.id_curso;
        option.textContent = curso.nome;
        
        selectPublicar.appendChild(option.cloneNode(true));
        selectEditar.appendChild(option.cloneNode(true));
    });
    
    console.log('Selects de cursos preenchidos com sucesso');
}


// Função para abrir o modal de matrícula
async function openMatriculaModal(courseName) {
    await getNumberProcess(courseName)
    const modal = document.getElementById('matriculaModal');
    if (!modal) {
        console.error('Modal element not found');
        return;
    }

    id_curso = courseName;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Resetar o formulário ao abrir
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    if (page1 && page2) {
        page1.classList.add('active');
        page2.classList.remove('active');
    }
    
    const btnAvancar = document.getElementById('btn-avancar');
    const btnVoltar = document.getElementById('btn-voltar');
    const btnConfirmar = document.getElementById('btn-confirmar');
    if (btnAvancar && btnVoltar && btnConfirmar) {
        btnAvancar.style.display = 'inline-block';
        btnVoltar.style.display = 'none';
        btnConfirmar.style.display = 'none';
    }
    
    // // Definir o curso selecionado automaticamente se fornecido
    // const cursoSelect = document.getElementById('curso');
    // if (cursoSelect && courseName) {
    //     for (let option of cursoSelect.options) {
    //         if (option.text.toLowerCase().includes(courseName.toLowerCase())) {
    //             option.selected = true;
    //             break;
    //         }
    //     }
    // }
    
    // Limpar todos os erros ao abrir o modal
    document.querySelectorAll('.validate').forEach(campo => {
        if (campo.id) {
            limparErro(campo.id);
        }
    });
}

// Função para fechar o modal
function closeModal() {
    const modal = document.getElementById('matriculaModal');
    if (!modal) return;
    
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    
    // Resetar o formulário
    const form = document.getElementById('form-matricula');
    if (form) {
        form.reset();
    }
}

// // Função para enviar o formulário
// function enviarFormulario() {
//     if (!validarPagina2()) {
//         return false;
//     }

//     const form = document.getElementById('form-matricula');
//     if (!form) return false;
    
//     const formData = new FormData(form);
    
//     fetch(form.action, {
//         method: 'POST',
//         body: formData
//     })
//     .then(response => {
//         if (!response.ok) throw new Error('Erro na rede');
//         return response.json();
//     })
//     .then(data => {
//         if (data.success) {
//             alert('Inscrição confirmada com sucesso!');
//             closeModal();
//         } else {
//             alert('Erro: ' + (data.message || 'Erro ao processar inscrição'));
//         }
//     })
//     .catch(error => {
//         console.error('Erro:', error);
//         alert('Ocorreu um erro ao enviar. Por favor, tente novamente.');
//     });
// }

// Event listeners quando o DOM estiver carregado

async function getNumberProcess(id_calendario) {
 console.log('Iniciando carregamento do número de processo...');
 console.log('Fazendo requisição para ../controllers/inscricoes.php');
    console.log('ID do calendário:', id_calendario);
    try{
    const formData = new FormData()
    formData.append('action','query')
    formData.append('id_calendario',id_calendario)
     const response = await fetch('controllers/inscricoes.php', {
          method: 'POST',
          body: formData,
        });
      
        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }
      
        const data = await response.json();
        console.log("✅ Resposta do servidor:",  data.data);
        const campo = document.getElementById("numero_do_processo")
        campo.value = data.data.length + 1
        campo.setAttribute('readonly', true)
        campo.disabled = true
       
        localStorage.setItem('numero_processo', data.data.length);
      } catch (error) {
        console.error('Erro ao tentar fazer login:', error);
        alert('Erro ao tentar fazer login. Tente novamente.');
      }
}


async function  loaderAdmin(){
        
    try {
        const response = await fetch('controllers/admin.php', {
          method: 'POST',
          headers: {
            'Accept': 'application/json'
          }
        });
      
        if (!response.ok) {
          throw new Error(`Erro HTTP! status: ${response.status}`);
        }
      
        const data = await response.json();
        
        console.log("✅ Resposta do servidor:",  data.data.email);
        localStorage.setItem('email', data.data.email);
      
      } catch (error) {
        alert('Erro ao tentar fazer login. Tente novamente.');
      }
}
document.addEventListener('DOMContentLoaded',  function() {


 
   loaderAdmin()
    

    // Validação em tempo real para campos importantes
    const camposParaValidar = {
        'nome_completo': validacoes.nome,
        'contacto_do_aluno': validacoes.telefone,
        'contacto_do_encarregado': validacoes.telefone,
        'numero_de_identificacao': validacoes.bi,
        'data_de_nascimento': validacoes.data,
        'data_validade': validacoes.data,
        'idade': validacoes.idade
    };



    

    
    for (const [campoId, regex] of Object.entries(camposParaValidar)) {
        const campo = document.getElementById(campoId);
        if (campo) {
            campo.addEventListener('blur', function() {
                validarCampo(campoId, regex);
            });
        }
    }
    
    // Configuração do modal de duas páginas
    const btnAvancar = document.getElementById('btn-avancar');
    const btnVoltar = document.getElementById('btn-voltar');
    const btnConfirmar = document.getElementById('btn-confirmar');
    
    if (btnAvancar) {
        btnAvancar.addEventListener('click', function() {
            if (validarPagina1()) {
                const page1 = document.getElementById('page1');
                const page2 = document.getElementById('page2');
                if (page1 && page2) {
                    page1.classList.remove('active');
                    page2.classList.add('active');
                }
                if (btnAvancar && btnVoltar && btnConfirmar) {
                    btnAvancar.style.display = 'none';
                    btnVoltar.style.display = 'inline-block';
                    btnConfirmar.style.display = 'inline-block';
                }
            }
        });
    }
    
    if (btnVoltar) {
        btnVoltar.addEventListener('click', function() {
            const page1 = document.getElementById('page1');
            const page2 = document.getElementById('page2');
            if (page1 && page2) {
                page1.classList.add('active');
                page2.classList.remove('active');
            }
            if (btnAvancar && btnVoltar && btnConfirmar) {
                btnAvancar.style.display = 'inline-block';
                btnVoltar.style.display = 'none';
                btnConfirmar.style.display = 'none';
            }
        });
    }
    
    // Configurar botão de confirmação
    if (btnConfirmar) {
        btnConfirmar.addEventListener('click', function(e) {
            e.preventDefault();
            enviarFormulario(id_curso);
        });
    }
    
    // Fechar o modal ao clicar fora dele
    const modal = document.getElementById('matriculaModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });
    }
    
    // Configurar botões de aplicação
    document.querySelectorAll('.apply-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            if (row) {
                const courseName = row.querySelector('td:first-child')?.textContent;
                openMatriculaModal(courseName);
            }
        });
    });
});

// Função global para abrir modal
function openModal() {
    openMatriculaModal();
}