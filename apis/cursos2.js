document.addEventListener('DOMContentLoaded', function() {
    // Variável para armazenar o ID do curso a ser deletado
    let cursoIdToDelete = null;
    
    // Função para validar os dados do formulário
    function validarFormulario(dados) {
        if (!dados.nome || dados.nome.trim() === '') {
            throw new Error('O nome do curso é obrigatório');
        }
        if (!dados.area || dados.area.trim() === '') {
            throw new Error('A área do curso é obrigatória');
        }
        if (isNaN(dados.duracao) || dados.duracao < 0) {
            throw new Error('A duração deve ser um número positivo');
        }
    }

    // Função para obter dados do formulário de cadastro
    function getCadastroData() {
        return {
            nome: document.getElementById('curso-nome').value.trim(),
            descricao: document.getElementById('curso-descricao').value.trim(),
            area: document.getElementById('curso-area').value,
            duracao: parseInt(document.getElementById('edit-curso-duracao').value) || 0
        };
    }

    // Função para obter dados do formulário de edição
    function getEdicaoData() {
        return {
            id_curso: document.getElementById('edit-curso-id').value,
            nome: document.getElementById('edit-curso-nome').value.trim(),
            descricao: document.getElementById('edit-curso-descricao').value.trim(),
            area: document.getElementById('edit-curso-area').value,
            duracao: parseInt(document.getElementById('edit-curso-duracao').value) || 0
        };
    }

    // Função para carregar todos os cursos
    async function loadCursos() {
        try {
            const response = await fetch('../controllers/cursos.php');
            const data = await response.json();
            
            const tbody = document.querySelector('table tbody');
            tbody.innerHTML = '';
            
            if (data.success && data.data.length > 0) {
                data.data.forEach(curso => {
                    const tr = document.createElement('tr');
                    
                    // Formata a duração para exibir "meses"
                    const duracao = curso.duracao ? `${curso.duracao} meses` : 'Não definido';
                    
                    tr.innerHTML = `
                        <td>${curso.id_curso}</td>
                        <td>${curso.nome}</td>
                        <td>${curso.area}</td>
                        <td>${duracao}</td>
                        <td>${curso.vagas || 'N/A'}</td>
                        <td>${curso.inscricoes || '0'}</td>
                        <td><span class="status ${curso.estado === 'Ativo' ? 'active' : 'inactive'}">${curso.estado || 'Ativo'}</span></td>
                        <td>
                            <button class="btn-edit" onclick="openModalEditCurso(${curso.id_curso})"><i class="fas fa-edit"></i></button>
                            <button class="btn-delete" onclick="openDeleteModal(${curso.id_curso}, '${curso.nome}')"><i class="fas fa-trash"></i></button>
                        </td>
                    `;
                    
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center;">
                            Nenhum curso cadastrado ainda.
                        </td>
                    </tr>
                `;
            }
        } catch (error) {
            console.error('Erro ao carregar cursos:', error);
            document.querySelector('table tbody').innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; color: red;">
                        Erro ao carregar cursos. Tente novamente mais tarde.
                    </td>
                </tr>
            `;
        }
    }

    // Função para abrir modal de adicionar curso
    window.openModalCurso = function() {
        document.getElementById('curso-modal-container').style.display = 'block';
    };

    // Função para abrir modal de edição de curso
    window.openModalEditCurso = async function(id) {
        try {
            const response = await fetch(`../controllers/cursos.php?id=${id}`);
            const data = await response.json();
            
            if (data.success) {
                const curso = data.data;
                const modal = document.getElementById('edit-curso-modal-container');
                
                document.getElementById('edit-curso-id').value = curso.id_curso;
                document.getElementById('edit-curso-nome').value = curso.nome;
                document.getElementById('edit-curso-area').value = curso.area;
                document.getElementById('edit-curso-duracao').value = curso.duracao;
                document.getElementById('edit-curso-descricao').value = curso.descricao;
                
                modal.style.display = 'block';
            } else {
                throw new Error(data.message || 'Curso não encontrado');
            }
        } catch (error) {
            console.error('Erro ao carregar curso para edição:', error);
            alert('Erro ao carregar curso: ' + error.message);
        }
    };

    // Função para abrir modal de confirmação de exclusão
    window.openDeleteModal = function(id, nome) {
        cursoIdToDelete = id;
        document.getElementById('curso-delete-name').textContent = nome;
        document.getElementById('confirm-modal').style.display = 'block';
    };

    // Função para fechar modais
    window.closeModal = function(modalId) {
        document.getElementById(modalId).style.display = 'none';
    };

    // Função para deletar um curso
    window.deleteCurso = async function() {
        if (!cursoIdToDelete) return;
        
        try {
            const response = await fetch('../controllers/cursos.php', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id_curso: cursoIdToDelete })
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Curso excluído com sucesso!');
                closeModal('confirm-modal');
                loadCursos();
            } else {
                throw new Error(data.message || 'Erro ao excluir curso');
            }
        } catch (error) {
            console.error('Erro ao excluir curso:', error);
            alert('Erro ao excluir curso: ' + error.message);
        } finally {
            cursoIdToDelete = null;
        }
    };

    // Manipulador do formulário de adição de curso
    document.getElementById('btn-confirm').addEventListener('click', async function() {
       
        
        try {
            const formData = getCadastroData();
            validarFormulario(formData);
            
            console.log('Dados do formulário (cadastro):', formData);
            
            const response = await fetch('../controllers/cursos.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Curso cadastrado com sucesso!');
                closeModal('curso-modal-container');
                this.reset();
                loadCursos();
            } else {
                throw new Error(data.message || 'Erro ao cadastrar curso');
            }
        } catch (error) {
            console.error('Erro no cadastro:', error);
            alert('Erro: ' + error.message);
        }
    });

    // Manipulador do formulário de edição de curso
    document.getElementById('edit-curso-form').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        try {
            const formData = getEdicaoData();
            validarFormulario(formData);
            
            console.log('Dados do formulário (edição):', formData);
            
            const response = await fetch('../controllers/cursos.php', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (data.success) {
                alert('Curso atualizado com sucesso!');
                closeModal('edit-curso-modal-container');
                loadCursos();
            } else {
                throw new Error(data.message || 'Erro ao atualizar curso');
            }
        } catch (error) {
            console.error('Erro na edição:', error);
            alert('Erro: ' + error.message);
        }
    });

    // Fechar modais ao clicar fora deles
    window.onclick = function(event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    };

    // Carrega os cursos quando a página é carregada
    loadCursos();
});