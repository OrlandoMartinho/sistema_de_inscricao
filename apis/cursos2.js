document.addEventListener('DOMContentLoaded', function () {
    let cursoIdToDelete = null;

 
    const userData = JSON.parse(localStorage.getItem('user_data'));
    const nome = userData.nome || 'Nome não disponível'; // Substitua pelo valor real
    const email = userData.email || 'Email não disponível'; // Substitua pelo valor real
    
    
    // Atualiza o nome exibido na barra superior
    document.getElementById('nomeUsuario').textContent = nome;
    window.openModalCurso = function () {
        document.getElementById('curso-modal-container').style.display = 'block';
    };

    window.openModalEditCurso = async function (id) {
        try {
            const response = await fetch(`../controllers/cursos.php?id=${id}`);
            const data = await response.json();

            if (data.success) {
                const curso = data.data;
                document.getElementById('edit-curso-id').value = curso.id_curso;
                document.getElementById('edit-curso-nome').value = curso.nome;
                document.getElementById('edit-curso-duracao').value = curso.duracao;
                document.getElementById('edit-curso-descricao').value = curso.descricao;
                document.getElementById('edit-curso-modal-container').style.display = 'block';
            } else {
                throw new Error(data.message || 'Curso não encontrado');
            }
        } catch (error) {
            console.error('Erro ao carregar curso para edição:', error);
            showErrorMessage('Não foi possível carregar o curso para edição', 'Ocorreu um erro', 3000);   
        }
    };

    window.openDeleteModal = function (id, nome) {
        cursoIdToDelete = id;
        document.getElementById('curso-delete-name').textContent = nome;
        document.getElementById('confirm-modal').style.display = 'block';
    };

    window.closeModal = function (modalId) {
        document.getElementById(modalId).style.display = 'none';
    };

    // Função DELETE atualizada com sistema de action
    window.deleteCurso = async function () {
        if (!cursoIdToDelete) return;

        try {
            const formData = new FormData();
            formData.append('action', 'delete');
            formData.append('id_curso', cursoIdToDelete);

            console.log('Enviando para exclusão:', {
                action: 'delete',
                id_curso: cursoIdToDelete
            });

            const response = await fetch('../controllers/cursos.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log('Resposta do servidor:', data);
            
            if (data.success) {
                showSuccessMessage(
                    'Curso excluído com sucesso!',
                    'Curso excluído',   
                    'success',
                    'ENJOY YOUR STAY',
                    3000 // auto-close after 3 seconds
                );
                closeModal('confirm-modal');
                loadCursos();
            } else {
                throw new Error(data.message || 'Erro ao excluir curso');
            }
        } catch (error) {
            console.error('Erro ao excluir curso:', error);
            showErrorMessage('Não foi possível excluir curso', 'Ocorreu um erro', 3000);
        } finally {
            cursoIdToDelete = null;
        }
    };

    // Event listener do formulário de edição atualizado
    document.getElementById('edit-curso-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        try {
            const formData = new FormData(this);
            const idCurso = document.getElementById('edit-curso-id').value;
            const dados = getEdicaoData();
            formData.append('action', 'update');
            formData.append('id_curso', idCurso);
            formData.append('nome', dados.nome);
            formData.append('descricao', dados.descricao);
            formData.append('area', 'any');
            formData.append('duracao', dados.duracao);

           

           
            validarFormulario(dados);
         
            const response = await fetch('../controllers/cursos.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            console.log('Resposta do servidor:', data);

            if (data.success) {
                showSuccessMessage(
                    'Curso atualizado com sucesso!',
                    'Atualização realizada',
                    'success',
                    'ENJOY YOUR STAY',
                    3000 // auto-close after 3 seconds
                );
                closeModal('edit-curso-modal-container');
                loadCursos();
            } else {
                throw new Error(data.message || 'Erro ao atualizar curso');
            }
        } catch (error) {
            console.error('Erro na edição:', error);
           showErrorMessage('Não foi possível atualizar o curso', 'Ocorreu um erro', 3000);
        }
    });

    window.onclick = function (event) {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });
    };

    loadCursos();
});

function validarFormulario(dados) {
    if (!dados.nome || dados.nome.trim() === '') {
        throw new Error('O nome do curso é obrigatório');
    }
   
    if (isNaN(dados.duracao) || dados.duracao < 0) {
        throw new Error('A duração deve ser um número positivo');
    }
}

function getCadastroData() {
    return {
        nome: document.getElementById('curso-nome').value.trim(),
        descricao: document.getElementById('curso-descricao').value.trim(),
        duracao: parseInt(document.getElementById('curso-duracao').value) || 0
    };
}
function getEdicaoData() {
    return {
        nome: document.getElementById('edit-curso-nome').value.trim(),
        descricao: document.getElementById('edit-curso-descricao').value.trim(),
        duracao: parseInt(document.getElementById('edit-curso-duracao').value) || 0
    };
}

async function cadastrarCurso() {
    try {
        const dados = getCadastroData();
        validarFormulario(dados);

        const formData = new FormData();
        formData.append('action', 'create');
        formData.append('nome', dados.nome);
        formData.append('descricao', dados.descricao);
        formData.append('area', 'any');
        formData.append('duracao', dados.duracao);


        const response = await fetch('../controllers/cursos.php', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        console.log('Resposta do servidor:', data);
        if (data.success) {
            showSuccessMessage(
                'Curso cadastrado com sucesso!',
                'Cadastro realizado',
                'success',
                'ENJOY YOUR STAY',
                3000 // auto-close after 3 seconds
            );
            closeModal('curso-modal-container');
            document.getElementById('curso-form').reset(); // Limpa o formulário após o cadastro
            loadCursos();
        } else {
            throw new Error(data.message || 'Erro ao cadastrar curso');
        }
    } catch (error) {
        console.error('Erro no cadastro:', error);
        showErrorMessage('Não foi possível cadastrar o curso', 'Ocorreu um erro', 3000);
    }
}


document.getElementById('curso-form').addEventListener('submit', function (e) {
    e.preventDefault();
    cadastrarCurso();
});

async function loadCursos() {
    try {
        const response = await fetch('../controllers/cursos.php');
        const data = await response.json();

        const tbody = document.querySelector('table tbody');
        tbody.innerHTML = '';
        
        if (data.success && data.data.length > 0) {
            data.data.forEach((curso, index) => {
                const tr = document.createElement('tr');
                const rowNumber = (index + 1).toString().padStart(2, '0'); // Formata para 2 dígitos
                let duracaoText = 'Não definido';
                
                // Lógica para formatar a duração
                if (curso.duracao) {
                    if (curso.duracao > 12) {
                        const anos = Math.floor(curso.duracao / 12);
                        const meses = curso.duracao % 12;
                        tr.classList.add('highlight-row');
                        
                        duracaoText = `${anos} ano${anos > 1 ? 's' : ''}`;
                        if (meses > 0) {
                            duracaoText += ` e ${meses} mês${meses > 1 ? 'es' : ''}`;
                        }
                    } else {
                        tr.classList.remove('highlight-row');
                        duracaoText = `${curso.duracao} mês${curso.duracao > 1 ? 'es' : ''}`;
                    }
                }

                tr.innerHTML = `
                    <td>${rowNumber}</td>
                    <td>${curso.nome}</td>
                    <td>${curso.descricao || 'Sem descrição'}</td>
                    <td>${duracaoText}</td>
                    <td>
                        <button class="btn-edit" onclick="openModalEditCurso(${curso.id_curso})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="openDeleteModal(${curso.id_curso}, '${curso.nome.replace(/'/g, "\\'")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
                
                tbody.appendChild(tr);
            });
        } else {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center;">
                        Nenhum curso cadastrado ainda.
                    </td>
                </tr>
            `;
        }
    } catch (error) {
        console.error('Erro ao carregar cursos:', error);
        document.querySelector('table tbody').innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: red;">
                    Erro ao carregar cursos. Tente novamente mais tarde.
                </td>
            </tr>
        `;
    }
}

 
