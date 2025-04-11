 
        // Variável para armazenar o ID do curso a ser eliminado
        let cursoToDelete = null;
        
        // Função para abrir modal de adicionar curso
        function openModalCurso() {
            document.getElementById('curso-modal-container').style.display = 'block';
        }
        
        // Função para abrir modal de editar curso
        function openModalEditCurso(id) {
            // Aqui você buscaria os dados do curso com o ID fornecido
            // Vou simular dados para demonstração
            const cursos = {
                1: {
                    nome: "Electricidade Industrial",
                    area: "Engenharia",
                    duracao: "6 meses",
                    vagas: 25,
                    descricao: "Curso de electricidade industrial com foco em instalações elétricas.",
                    estado: "Ativo"
                },
                2: {
                    nome: "Informática Básica",
                    area: "Tecnologia",
                    duracao: "3 meses",
                    vagas: 30,
                    descricao: "Curso introdutório de informática para iniciantes.",
                    estado: "Ativo"
                },
                3: {
                    nome: "Mecânica Automóvel",
                    area: "Mecânica",
                    duracao: "9 meses",
                    vagas: 20,
                    descricao: "Curso completo de mecânica de automóveis.",
                    estado: "Inativo"
                },
                4: {
                    nome: "Gestão de Pequenos Negócios",
                    area: "Administração",
                    duracao: "4 meses",
                    vagas: 35,
                    descricao: "Curso de gestão para pequenos empreendedores.",
                    estado: "Ativo"
                }
            };
            
            const curso = cursos[id];
            
            if (curso) {
                document.getElementById('edit-curso-id').value = id;
                document.getElementById('edit-curso-nome').value = curso.nome;
                document.getElementById('edit-curso-area').value = curso.area;
                document.getElementById('edit-curso-duracao').value = curso.duracao;
                document.getElementById('edit-curso-vagas').value = curso.vagas;
                document.getElementById('edit-curso-descricao').value = curso.descricao;
                document.getElementById('edit-curso-estado').value = curso.estado;
                
                document.getElementById('edit-curso-modal-container').style.display = 'block';
            }
        }
        
        // Função para abrir modal de eliminar curso
        function openDeleteModal(id) {
            // Aqui você buscaria o nome do curso com o ID fornecido
            // Vou simular dados para demonstração
            const cursos = {
                1: "Electricidade Industrial",
                2: "Informática Básica",
                3: "Mecânica Automóvel",
                4: "Gestão de Pequenos Negócios"
            };
            
            cursoToDelete = id;
            document.getElementById('curso-delete-name').textContent = cursos[id];
            document.getElementById('confirm-modal').style.display = 'block';
        }
        
        // Função para eliminar curso
        function deleteCurso() {
            if (cursoToDelete) {
                // Aqui você faria a chamada AJAX para eliminar o curso
                console.log(`Curso com ID ${cursoToDelete} eliminado`);
                // Mostrar mensagem de sucesso
                alert(`Curso "${document.getElementById('curso-delete-name').textContent}" eliminado com sucesso!`);
                
                closeModal('confirm-modal');
                // Recarregar a lista de cursos ou remover a linha da tabela
            }
        }
        
        // Função genérica para fechar modais
        function closeModal(modalId) {
            document.getElementById(modalId).style.display = 'none';
        }
        
        // Fechar modais ao clicar fora do conteúdo
        window.onclick = function(event) {
            if (event.target.className === 'modal') {
                event.target.style.display = 'none';
            }
        }
        
        // Manipulação dos formulários
        document.getElementById('curso-form').addEventListener('submit', function(e) {
            e.preventDefault();
            // Lógica para adicionar novo curso
            console.log("Novo curso adicionado");
            alert("Curso adicionado com sucesso!");
            closeModal('curso-modal-container');
            // Limpar formulário
            this.reset();
        });
        
        document.getElementById('edit-curso-form').addEventListener('submit', function(e) {
            e.preventDefault();
            // Lógica para atualizar curso
            const id = document.getElementById('edit-curso-id').value;
            console.log(`Curso com ID ${id} atualizado`);
            alert("Curso atualizado com sucesso!");
            closeModal('edit-curso-modal-container');
        });

        document.getElementById("nomeUsuario").innerText = localStorage.getItem("email") || "Admin User";