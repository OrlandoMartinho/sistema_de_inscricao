document.addEventListener('DOMContentLoaded', function() {


    // Função para formatar a data (de YYYY-MM-DD para DD/MM/YYYY)
    function formatDate(dateString) {
        if (!dateString) return 'Sem data definida';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR');
    }

    // Função para buscar e exibir os eventos do calendário
    async function loadCalendarEvents() {
        try {
            const response = await fetch('controllers/calendarios.php'); // Endpoint da API
            const data = await response.json();
            
            if (data.success && data.data.length > 0) {
                const tbody = document.getElementById('calendar-body');
                tbody.innerHTML = ''; // Limpa o conteúdo atual
        
                // Para cada evento, cria uma linha na tabela
                data.data.forEach(evento => {
                    const row = document.createElement('tr');
                    
                    // Nome do curso ou "Geral" se não estiver associado a um curso
                    const curso = evento.nome_curso || 'Geral';
                    
                    // Formata a descrição para limitar o tamanho (opcional)
                    const descricao = evento.descricao.length > 50 
                        ? evento.descricao.substring(0, 50) + '...' 
                        : evento.descricao;
                    
                    row.innerHTML = `
                        <td>${curso}</td>
                        <td>${evento.numero_de_vagas}</td>
                        <td>${evento.titulo_do_anuncio}</td>
                        <td>${formatDate(evento.data_de_termino)}</td>
                        <td class="event">${descricao}</td>
                        <td>
                            <button class="apply-btn" onclick="openMatriculaModal('${evento.id_calendario}')">
                                Inscrever-se
                            </button>
                        </td>
                    `;
                    
                    tbody.appendChild(row);
                });
            } else {
                // Se não houver eventos, mostra uma mensagem
                document.getElementById('calendar-body').innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center;">
                            Nenhum evento agendado no momento.
                        </td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Erro ao carregar eventos:', error);
            document.getElementById('calendar-body').innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: red;">
                        Erro ao carregar os eventos. Tente novamente mais tarde.
                    </td>
                </tr>
            `;
        }
    }

    // Carrega os eventos quando a página é carregada
    loadCalendarEvents();
});

