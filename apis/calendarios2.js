document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM completamente carregado e analisado');
    
    console.log('Token verificado com sucesso');
    
    // Carregar cursos assim que a página for carregada
    carregarCursos().then(() => {
        console.log('Cursos carregados com sucesso');
        // Depois que os cursos forem carregados, carregar os eventos
        carregarEventos();
    }).catch(error => {
        console.error('Erro ao carregar cursos:', error);
    });
    
    // Configurar formulários
    configurarFormularios();
    console.log('Formulários configurados');
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
    const selectPublicar = document.getElementById('evento-curso');
    const selectEditar = document.getElementById('editar-evento-curso');
    
    // Limpar opções existentes (mantendo a primeira opção padrão)
    console.log('Limpando selects existentes...');
    while (selectPublicar.options.length > 1) selectPublicar.remove(1);
    while (selectEditar.options.length > 1) selectEditar.remove(1);
    
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

// Função para carregar todos os eventos
async function carregarEventos() {
    console.log('Iniciando carregamento de eventos...');
    try {
        console.log('Fazendo requisição para ../controllers/calendarios.php');
        const response = await fetch('../controllers/calendarios.php');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Resposta da API de eventos:', data);
        
        if (data.success) {
            eventos = data.data;
            console.log(`${eventos.length} eventos carregados`);
            renderizarEventos();
        } else {
            throw new Error(data.message || 'Erro ao carregar eventos');
        }
    } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        mostrarNotificacao('error', 'Erro ao carregar eventos');
    }
}

// Renderizar eventos na grade
function renderizarEventos() {
    console.log('Renderizando eventos na grade...');
    const grid = document.querySelector('.eventos-grid');
    grid.innerHTML = ''; // Limpar eventos existentes
    
    if (eventos.length === 0) {
        console.log('Nenhum evento encontrado para renderizar');
        grid.innerHTML = '<p class="sem-eventos">Nenhum evento cadastrado ainda.</p>';
        return;
    }
    
    console.log(`Renderizando ${eventos.length} eventos`);
    eventos.forEach((evento, index) => {
        console.log(`Processando evento ${index + 1}:`, evento);
        const card = document.createElement('div');
        card.className = 'evento-card';
        
        // Formatar data para exibição
        const dataTermino = evento.data_de_termino ? 
            new Date(evento.data_de_termino).toLocaleDateString('pt-BR', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            }) : 'Não especificada';
        
        card.innerHTML = `
            <div class="card-actions">
                <i class="fa-solid fa-pen-to-square" onclick="abrirModalEditarEvento(${evento.id_calendario})"></i>
                <i class="fa-solid fa-trash" onclick="abrirModalExcluirEvento(${evento.id_calendario})"></i>
            </div>
            <h3 class="evento-titulo">${evento.titulo_do_anuncio}</h3>
            <p><strong>Curso:</strong> ${evento.nome_do_curso || 'Geral'}</p>
            <p><strong>Data Limite:</strong> ${dataTermino}</p>
            <p><strong>Vagas:</strong> ${evento.numero_de_vagas}</p>
            <p><strong>Descrição:</strong> ${evento.descricao || 'Sem descrição'}</p>
        `;
        
        grid.appendChild(card);
    });
    console.log('Eventos renderizados com sucesso');
}

// Configurar listeners dos formulários
function configurarFormularios() {
    console.log('Configurando listeners dos formulários...');
    // Formulário de publicação
    const formPublicar = document.getElementById('form-publicar-evento');
    formPublicar.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Formulário de publicação submetido');
        publicarEvento();
    });
    
    // Formulário de edição
    const formEditar = document.getElementById('form-editar-evento');
    formEditar.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Formulário de edição submetido');
        editarEvento();
    });
    console.log('Listeners dos formulários configurados');
}
async function publicarEvento() {
    try {
        // Obter valores do formulário
        const formData = {
            titulo_do_anuncio: document.getElementById('titulo-anuncio').value,
            data_de_termino: document.getElementById('data-termino').value,
            descricao: document.getElementById('descricao').value,
            id_curso: document.getElementById('evento-curso').value,
            nome_do_curso: document.getElementById('nome-curso').value,
            numero_de_vagas: document.getElementById('numero-vagas').value
        };
        console.log('Dados do formulário de edição:', formData);
        // Validar campos obrigatórios
        if (!formData.titulo_do_anuncio || !formData.data_de_termino || !formData.numero_de_vagas) {
            throw new Error('Preencha todos os campos obrigatórios');
        }

        console.log('Dados a serem enviados:', formData);

        const response = await fetch('../controllers/calendarios.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacao('success', 'Evento publicado com sucesso!');
            closeModalPublicarEvento();
            await carregarEventos();
        } else {
            throw new Error(data.message || 'Erro ao publicar evento');
        }
    } catch (error) {
        console.error('Erro ao publicar evento:', error);
        mostrarNotificacao('error', error.message || 'Erro ao publicar evento');
    }
}

async function editarEvento() {
    try {
        // Obter valores do formulário de edição
        const formData = {
            id_calendario: document.getElementById('editar-id-calendario').value,
            titulo_do_anuncio: document.getElementById('editar-titulo-anuncio').value,
            data_de_termino: document.getElementById('editar-data-termino').value,
            descricao: document.getElementById('editar-descricao').value,
            id_curso: document.getElementById('editar-evento-curso').value,
            nome_do_curso: document.getElementById('editar-nome-curso').value,
            numero_de_vagas: document.getElementById('editar-numero-vagas').value
        };

      
        // Validar campos obrigatórios
        if (!formData.titulo_do_anuncio || !formData.data_de_termino || !formData.numero_de_vagas) {
            throw new Error('Preencha todos os campos obrigatórios');
        }

        console.log('Dados a serem enviados (edição):', formData);

        const response = await fetch(`../controllers/calendarios.php?id=${formData.id_calendario}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarNotificacao('success', 'Evento atualizado com sucesso!');
            closeModalEditarEvento();
            await carregarEventos();
        } else {
            throw new Error(data.message || 'Erro ao atualizar evento');
        }
    } catch (error) {
        console.error('Erro ao editar evento:', error);
        mostrarNotificacao('error', error.message || 'Erro ao atualizar evento');
    }
}

// Função para confirmar exclusão
async function confirmarExclusaoEvento() {
    if (!eventoSelecionado) {
        console.error('Nenhum evento selecionado para exclusão');
        return;
    }
    
    console.log(`Confirmando exclusão do evento ID: ${eventoSelecionado.id_calendario}`);
    
    try {
        console.log('Enviando requisição para excluir evento...');
        const response = await fetch('../controllers/calendarios.php', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id_calendario: eventoSelecionado.id_calendario })
        });
        
        const data = await response.json();
        console.log('Resposta da API:', data);
        
        if (data.success) {
            console.log('Evento excluído com sucesso');
            mostrarNotificacao('success', 'Evento excluído com sucesso!');
            closeModalExcluirEvento();
            carregarEventos();
        } else {
            throw new Error(data.message || 'Erro ao excluir evento');
        }
    } catch (error) {
        console.error('Erro ao excluir evento:', error);
        mostrarNotificacao('error', error.message || 'Erro ao excluir evento');
    }
}

// Função para abrir modal de edição com dados do evento
async function abrirModalEditarEvento(idCalendario) {
    console.log(`Abrindo modal de edição para evento ID: ${idCalendario}`);
    try {
        console.log(`Buscando detalhes do evento ID: ${idCalendario}`);
        const response = await fetch(`../controllers/calendarios.php?id=${idCalendario}`);
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Resposta da API:', data);
        
        if (data.success) {
            eventoSelecionado = data.data;
            console.log('Evento encontrado:', eventoSelecionado);
            preencherFormularioEdicao(eventoSelecionado);
            openModalEditarEvento();
        } else {
            throw new Error(data.message || 'Erro ao carregar evento');
        }
    } catch (error) {
        console.error('Erro ao abrir modal de edição:', error);
        mostrarNotificacao('error', error.message || 'Erro ao carregar evento');
    }
}

// Preencher formulário de edição
function preencherFormularioEdicao(evento) {
    console.log('Preenchendo formulário de edição com dados do evento:', evento);
    
    document.getElementById('editar-id-calendario').value = evento.id_calendario;
    document.getElementById('editar-titulo-anuncio').value = evento.titulo_do_anuncio;
    document.getElementById('editar-data-termino').value = evento.data_de_termino;
    document.getElementById('editar-numero-vagas').value = evento.numero_de_vagas;
    document.getElementById('editar-descricao').value = evento.descricao || '';
    
    // Selecionar o curso correto
    const selectCurso = document.getElementById('editar-evento-curso');
    if (evento.id_curso) {
        console.log(`Selecionando curso ID: ${evento.id_curso}`);
        selectCurso.value = evento.id_curso;
    } else {
        console.log('Nenhum curso específico para este evento');
        selectCurso.value = '';
    }
    
    // Atualizar nome do curso
    document.getElementById('editar-nome-curso').value = evento.nome_do_curso || '';
    console.log('Formulário de edição preenchido');
}



// Função para abrir modal de exclusão
function abrirModalExcluirEvento(idCalendario) {
    console.log(`Abrindo modal de exclusão para evento ID: ${idCalendario}`);
    eventoSelecionado = eventos.find(evento => evento.id_calendario == idCalendario);
    
    if (!eventoSelecionado) {
        console.error('Evento não encontrado para exclusão');
        mostrarNotificacao('error', 'Evento não encontrado');
        return;
    }
    
    console.log('Evento selecionado para exclusão:', eventoSelecionado);
    
    // Atualizar mensagem no modal
    const modal = document.getElementById('modal-excluir-evento');
    modal.querySelector('strong').textContent = eventoSelecionado.titulo_do_anuncio;
    
    openModalExcluirEvento();
}


// Funções auxiliares para atualizar nome do curso
function atualizarNomeCurso() {
    console.log('Atualizando nome do curso (modal de publicação)...');
    const select = document.getElementById('evento-curso');
    const nomeCursoInput = document.getElementById('nome-curso');
    
    if (select.value) {
        const cursoSelecionado = cursos.find(curso => curso.id_curso == select.value);
        nomeCursoInput.value = cursoSelecionado ? cursoSelecionado.nome : '';
        console.log(`Nome do curso atualizado para: ${nomeCursoInput.value}`);
    } else {
        nomeCursoInput.value = '';
        console.log('Nenhum curso selecionado');
    }
}

function atualizarNomeCursoEdicao() {
    console.log('Atualizando nome do curso (modal de edição)...');
    const select = document.getElementById('editar-evento-curso');
    const nomeCursoInput = document.getElementById('editar-nome-curso');
    
    if (select.value) {
        const cursoSelecionado = cursos.find(curso => curso.id_curso == select.value);
        nomeCursoInput.value = cursoSelecionado ? cursoSelecionado.nome : '';
        console.log(`Nome do curso atualizado para: ${nomeCursoInput.value}`);
    } else {
        nomeCursoInput.value = '';
        console.log('Nenhum curso selecionado');
    }
}

// Funções para manipulação dos modais
function openModalPublicarEvento() {
    console.log('Abrindo modal de publicação de evento');
    const modal = document.getElementById('modal-publicar-evento');
    modal.showModal();
}

function closeModalPublicarEvento() {
    console.log('Fechando modal de publicação de evento');
    const modal = document.getElementById('modal-publicar-evento');
    modal.close();
    document.getElementById('form-publicar-evento').reset();
}

function openModalEditarEvento() {
    console.log('Abrindo modal de edição de evento');
    const modal = document.getElementById('modal-editar-evento');
    modal.showModal();
}

function closeModalEditarEvento() {
    console.log('Fechando modal de edição de evento');
    const modal = document.getElementById('modal-editar-evento');
    modal.close();
}

function openModalExcluirEvento() {
    console.log('Abrindo modal de exclusão de evento');
    const modal = document.getElementById('modal-excluir-evento');
    modal.showModal();
}

function closeModalExcluirEvento() {
    console.log('Fechando modal de exclusão de evento');
    const modal = document.getElementById('modal-excluir-evento');
    modal.close();
    eventoSelecionado = null;
}

// Função para mostrar notificações
function mostrarNotificacao(tipo, mensagem) {
    console.log(`Mostrando notificação [${tipo}]: ${mensagem}`);
    const notification = document.createElement('div');
    notification.className = `notification ${tipo}`;
    notification.innerHTML = `
        <i class="fas ${tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${mensagem}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 3000);
}

/**
 * Carrega os cursos disponíveis da API e preenche os selects
 */
async function carregarCursos() {
    console.log('Iniciando carregamento dinâmico de cursos...');
    try {
        // Mostrar estado de carregamento
        const selectPublicar = document.getElementById('evento-curso');
        const selectEditar = document.getElementById('editar-evento-curso');
        
        console.log('Atualizando selects para estado de carregamento...');
        selectPublicar.innerHTML = '<option value="">Carregando cursos...</option>';
        selectEditar.innerHTML = '<option value="">Carregando cursos...</option>';

        // Fazer requisição à API
        console.log('Fazendo requisição para ../controllers/cursos.php');
        const response = await fetch('../controllers/cursos.php');
        
        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Resposta da API de cursos:', data);
        
        if (data.success && data.data && data.data.length > 0) {
            console.log(`${data.data.length} cursos recebidos da API`);
            // Preencher os selects com os cursos
            preencherSelectCursos(data.data);
        } else {
            throw new Error(data.message || 'Nenhum curso disponível');
        }
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        
        // Atualizar mensagem de erro nos selects
        const selectPublicar = document.getElementById('evento-curso');
        const selectEditar = document.getElementById('editar-evento-curso');
        
        console.log('Atualizando selects para estado de erro...');
        selectPublicar.innerHTML = '<option value="">Erro ao carregar cursos</option>';
        selectEditar.innerHTML = '<option value="">Erro ao carregar cursos</option>';
        
        mostrarNotificacao('error', 'Erro ao carregar cursos. Tente recarregar a página.');
    }
}

/**
 * Preenche os selects de cursos nos formulários
 * @param {Array} cursos - Lista de cursos
 */
function preencherSelectCursos(cursos) {
    console.log('Preenchendo selects de cursos com dados dinâmicos...');
    const selectPublicar = document.getElementById('evento-curso');
    const selectEditar = document.getElementById('editar-evento-curso');
    
    // Limpar e adicionar opção padrão
    console.log('Limpando selects...');
    selectPublicar.innerHTML = '<option value="">Selecione um curso</option>';
    selectEditar.innerHTML = '<option value="">Selecione um curso</option>';
    
    // Adicionar cursos
    console.log(`Adicionando ${cursos.length} cursos aos selects...`);
    cursos.forEach(curso => {
        const option = document.createElement('option');
        option.value = curso.id_curso;
        option.textContent = curso.nome;
        
        selectPublicar.appendChild(option.cloneNode(true));
        selectEditar.appendChild(option.cloneNode(true));
    });
    
    // Adicionar opção "Geral" se necessário
    console.log('Adicionando opção "Geral"...');
    const optionGeral = document.createElement('option');
    optionGeral.value = '0';
    optionGeral.textContent = 'Geral (sem curso específico)';
    
    selectPublicar.appendChild(optionGeral.cloneNode(true));
    selectEditar.appendChild(optionGeral.cloneNode(true));
    
    console.log('Selects de cursos preenchidos com sucesso');
}

/**
 * Atualiza o campo hidden com o nome do curso selecionado (modal de publicação)
 */
function atualizarNomeCurso() {
    console.log('Atualizando nome do curso (modal de publicação)...');
    const select = document.getElementById('evento-curso');
    const nomeCursoInput = document.getElementById('nome-curso');
    const cursoSelecionado = select.options[select.selectedIndex];
    
    if (select.value && select.value !== '0') {
        nomeCursoInput.value = cursoSelecionado.text;
        console.log(`Nome do curso atualizado para: ${nomeCursoInput.value}`);
    } else {
        nomeCursoInput.value = 'Geral';
        console.log('Curso definido como "Geral"');
    }
}

/**
 * Atualiza o campo hidden com o nome do curso selecionado (modal de edição)
 */
function atualizarNomeCursoEdicao() {
    console.log('Atualizando nome do curso (modal de edição)...');
    const select = document.getElementById('editar-evento-curso');
    const nomeCursoInput = document.getElementById('editar-nome-curso');
    const cursoSelecionado = select.options[select.selectedIndex];
    
    if (select.value && select.value !== '0') {
        nomeCursoInput.value = cursoSelecionado.text;
        console.log(`Nome do curso atualizado para: ${nomeCursoInput.value}`);
    } else {
        nomeCursoInput.value = 'Geral';
        console.log('Curso definido como "Geral"');
    }
}