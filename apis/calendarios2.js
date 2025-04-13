document.addEventListener('DOMContentLoaded', function() {
    // Função para formatar a data (de YYYY-MM-DD para DD/MM/YYYY)
    function formatDate(dateString) {
        if (!dateString) return 'Sem data definida';
        
        const date = new Date(dateString);
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return date.toLocaleDateString('pt-BR', options);
    }

    // Função para formatar data completa (com hora)
    function formatDateTime(dateString) {
        if (!dateString) return 'Sem data definida';
        
        const date = new Date(dateString);
        const options = { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        return date.toLocaleDateString('pt-BR', options);
    }

    // Função para buscar e exibir os eventos do calendário
    async function loadCalendarEvents() {
        try {
            const response = await fetch('../controllers/calendarios.php');
            const data = await response.json();
            
            const eventosGrid = document.querySelector('.eventos-grid');
            eventosGrid.innerHTML = ''; // Limpa o conteúdo atual
            
            if (data.success && data.data.length > 0) {
                // Para cada evento, cria um card
                data.data.forEach(evento => {
                    const eventoCard = document.createElement('div');
                    eventoCard.className = 'evento-card';
                    
                    // Cria o conteúdo do card
                    eventoCard.innerHTML = `
                        <div class="card-actions">
                            <i class="fa-solid fa-pen-to-square" onclick="openModalEditarEvento(${evento.id_calendario})"></i>
                            <i class="fa-solid fa-trash" onclick="openModalExcluirEvento(${evento.id_calendario}, '${evento.titulo_do_anuncio}')"></i>
                        </div>
                        <h3 class="evento-titulo">${evento.titulo_do_anuncio}</h3>
                        <p><strong>Curso:</strong> ${evento.nome_do_curso || 'Geral'}</p>
                        <p><strong>Vagas:</strong> ${evento.numero_de_vagas || 'Não especificado'}</p>
                        <p><strong>Data de Término:</strong> ${formatDate(evento.data_de_termino)}</p>
                        <p><strong>Descrição:</strong> ${evento.descricao || 'Sem descrição'}</p>
                        <button class="apply-btn" onclick="openMatriculaModal(${evento.id_curso}, ${evento.id_calendario})">
                            Inscrever-se
                        </button>
                    `;
                    
                    eventosGrid.appendChild(eventoCard);
                });
            } else {
                // Se não houver eventos, mostra uma mensagem
                eventosGrid.innerHTML = `
                    <div class="no-events">
                        <i class="fa-regular fa-calendar-xmark"></i>
                        <p>Nenhum evento agendado no momento.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            document.querySelector('.eventos-grid').innerHTML = `
                <div class="error-loading">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>Erro ao carregar os eventos. Tente novamente mais tarde.</p>
                </div>
            `;
        }
    }

    // Funções para abrir/fechar modais
    window.openModalPublicarEvento = function() {
        const modal = document.getElementById('modal-publicar-evento');
        modal.showModal();
    };

    window.closeModalPublicarEvento = function() {
        const modal = document.getElementById('modal-publicar-evento');
        modal.close();
    };

    window.openModalEditarEvento = function(eventId) {
        const modal = document.getElementById('modal-editar-evento');
        // Aqui você pode buscar os dados do evento específico para preencher o formulário
        modal.showModal();
    };

    window.closeModalEditarEvento = function() {
        const modal = document.getElementById('modal-editar-evento');
        modal.close();
    };

    window.openModalExcluirEvento = function(eventId, eventTitle) {
        const modal = document.getElementById('modal-excluir-evento');
        // Atualiza o modal com os dados do evento
        modal.querySelector('strong').textContent = `"${eventTitle}"`;
        modal.dataset.eventId = eventId;
        modal.showModal();
    };

    window.closeModalExcluirEvento = function() {
        const modal = document.getElementById('modal-excluir-evento');
        modal.close();
    };

    window.confirmarExclusaoEvento = async function() {
        const modal = document.getElementById('modal-excluir-evento');
        const eventId = modal.dataset.eventId;
        
        try {
            const response = await fetch('../controllers/calendarios.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_calendario: eventId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Evento excluído com sucesso!');
                loadCalendarEvents(); // Recarrega a lista de eventos
                closeModalExcluirEvento();
            } else {
                throw new Error(data.message || 'Erro ao excluir evento');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao excluir evento: ' + error.message);
        }
    };

    // Manipulação do formulário de publicação
    document.getElementById('form-publicar-evento').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            titulo_do_anuncio: document.getElementById('evento-titulo').value,
            data_de_termino: document.getElementById('evento-inscricoes-ate').value,
            descricao: document.getElementById('evento-descricao').value,
            // Adicione outros campos conforme necessário
        };
        
        try {
            const response = await fetch('../controllers/calendarios.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Evento publicado com sucesso!');
                loadCalendarEvents(); // Recarrega a lista de eventos
                closeModalPublicarEvento();
                this.reset(); // Limpa o formulário
            } else {
                throw new Error(data.message || 'Erro ao publicar evento');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao publicar evento: ' + error.message);
        }
    });

    // Manipulação do formulário de edição
    document.getElementById('form-editar-evento').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            id_calendario: document.getElementById('modal-editar-evento').dataset.eventId,
            titulo_do_anuncio: document.getElementById('evento-titulo').value,
            data_de_termino: document.getElementById('editar-inscricoes-ate').value,
            descricao: document.getElementById('editar-descricao').value,
            // Adicione outros campos conforme necessário
        };
        
        try {
            const response = await fetch('../controllers/calendarios.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Evento atualizado com sucesso!');
                loadCalendarEvents(); // Recarrega a lista de eventos
                closeModalEditarEvento();
            } else {
                throw new Error(data.message || 'Erro ao atualizar evento');
            }
        } catch (error) {
            console.error('Erro:', error);
            alert('Erro ao atualizar evento: ' + error.message);
        }
    });

    // Função para abrir modal de matrícula (simplificada)
    window.openMatriculaModal = function(cursoId, eventoId) {
        // Implemente conforme sua necessidade
        alert(`Inscrição para o curso ${cursoId} no evento ${eventoId}`);
    };

    // Carrega os eventos quando a página é carregada
    loadCalendarEvents();
});