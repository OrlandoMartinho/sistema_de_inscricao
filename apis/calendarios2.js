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
       showErrorMessage('Não foi possível carregar os cursos', 'Erro de Envio', 3000);
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
        showErrorMessage('Não foi possível carregar os eventos', 'Erro de Envio', 3000);
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
        publicarEvento(this); // Passando o formulário como parâmetro
    });
    
    // Formulário de edição
    const formEditar = document.getElementById('form-editar-evento');
    formEditar.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('Formulário de edição submetido');
        editarEvento(this); // Passando o formulário como parâmetro
    });
    console.log('Listeners dos formulários configurados');
}


// Formulários
document.getElementById('form-publicar-evento').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    console.log('Iniciando processo de publicação de evento...');
    try {
     
        console.log('FormData criado:', formData);
        
        // Adicionar nome do curso ao FormData
        const nomeCurso = document.getElementById('nome-curso').value;
        formData.append('nome_do_curso', nomeCurso);
        
        // Validar campos obrigatórios
        console.log('Validando campos obrigatórios...');
        if (!formData.get('titulo-anuncio') || !formData.get('data-termino') || !formData.get('numero-vagas')) {
            throw new Error('Preencha todos os campos obrigatórios');
        }
             

        formData.append('titulo_do_anuncio', formData.get('titulo-anuncio'));
        formData.append('data_de_termino', formData.get('data-termino'));
        formData.append('descricao', formData.get('descricao'));    
        formData.append('id_curso', formData.get('evento-curso'));  
        formData.append('numero_de_vagas', formData.get('numero-vagas'));  
        formData.append('action','post') 
        const formDataObj = {};
        formData.forEach((value, key) => formDataObj[key] = value);
        console.log('Dados a serem enviados:', formDataObj);

        const response = await fetch('../controllers/calendarios.php', {
            method: 'POST',
            body: formData // Enviando FormData diretamente
        });
        
        const data = await response.json();
        console.log('Resposta da API:', data);
        showSuccessMessage(
            'Calendário publicado com sucesso!',
            'Calendário publicado',
            'success',
            'ENJOY YOUR STAY',
            3000 // auto-close after 3 seconds
        );

        if (data.success) {
            showSuccessMessage(
                'Calendário publicado com sucesso!',
                'Calendário publicado',
                'success',
                'ENJOY YOUR STAY',
                3000 // auto-close after 3 seconds
            );  
            closeModalPublicarEvento();
            await carregarEventos();
        } else {
            throw new Error(data.message || 'Erro ao publicar evento');
        }
    } catch (error) {
        console.error('Erro ao publicar evento:', error);
        showErrorMessage('Não foi possível publicar o evento', 'Erro de Envio', 3000);  
    }
    closeModalPublicarEvento();
});

async function publicarEvento(formElement) {
    
}

async function editarEvento(formElement) {
    console.log('Iniciando processo de edição de evento...');
    try {
        // Criar FormData a partir do formulário
        const formData = new FormData(formElement);
        console.log('FormData criado:', formData);
        
        // Adicionar nome do curso ao FormData
        const nomeCurso = document.getElementById('editar-nome-curso').value;
        formData.append('nome_do_curso', nomeCurso);
        
        // Validar campos obrigatórios
        console.log('Validando campos obrigatórios...');
        if (!formData.get('editar-titulo-anuncio') || !formData.get('editar-data-termino') || !formData.get('editar-numero-vagas')) {
            throw new Error('Preencha todos os campos obrigatórios');
        }
       
        // Converter FormData para objeto para exibir no console
        const formDataObj = {};
        formData.forEach((value, key) => formDataObj[key] = value);
        console.log('Dados a serem enviados:', formDataObj);

        formData.append('titulo_do_anuncio', formData.get('editar-titulo-anuncio'));
        formData.append('data_de_termino', formData.get('editar-data-termino'));
        formData.append('descricao', formData.get('editar-descricao'));
        formData.append('id_curso', formData.get('editar-evento-curso'));   
        formData.append('numero_de_vagas', formData.get('editar-numero-vagas'));    
        formData.append('id_calendario', formData.get('editar-id-calendario'));
        formData.append('action','put')
        // Adicionando ID do evento
        console.log('Dados do FormData para edição:', formDataObj);
        const idCalendario = formData.get('editar-id-calendario');
        const response = await fetch(`../controllers/calendarios.php?id=${idCalendario}`, {
            method: 'POST',
            body: formData // Enviando FormData diretamente
        });
        
        const data = await response.json();
        console.log('Resposta da API:', data);
        showSuccessMessage(
            'Calendário editado com sucesso!',  
            'Calendário editado',
            'success',
            'ENJOY YOUR STAY',
            3000 // auto-close after 3 seconds
        );

        if (data.success) {
            showErrorMessage('Não foi possível enviar o calendario', 'Erro de Envio', 3000);
            closeModalEditarEvento();
            await carregarEventos();
        } else {
            throw new Error(data.message || 'Erro ao atualizar evento');
        }
    } catch (error) {
        console.error('Erro ao editar evento:', error);
        showErrorMessage('Não foi possível enviar o calendario', 'Erro de Envio', 3000);
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
        const formData = new FormData();
        formData.append('id_calendario', eventoSelecionado.id_calendario);
        formData.append('action','delete')
        
        console.log('Dados do FormData para exclusão:', {id_calendario: eventoSelecionado.id_calendario});

        const response = await fetch('../controllers/calendarios.php', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        console.log('Resposta da API:', data);
        
        showSuccessMessage(
            'Calendário excluído com sucesso!',
            'Calendário excluído',
            'success',
            'ENJOY YOUR STAY',
            3000 // auto-close after 3 seconds
        );

        
        if (data.success) {
            showSuccessMessage(
                'Calendário excluído com sucesso!',
                'Calendário excluído',
                'success',
                'ENJOY YOUR STAY',
                3000 // auto-close after 3 seconds
            );
           
            closeModalExcluirEvento();
            carregarEventos();
        } else {
            throw new Error(data.message || 'Erro ao excluir evento');
        }
    } catch (error) {
        console.error('Erro ao excluir evento:', error);
        showErrorMessage('Não foi possível excluir o evento', 'Erro de Envio', 3000);
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
        showErrorMessage('Não foi possível carregar os detalhes do evento', 'Erro de Envio', 3000);
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
        showErrorMessage('Evento não encontrado', 'Erro de Envio', 3000);   
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

