 
        // Variável para armazenar o ID do curso a ser eliminado
        let cursoToDelete = null;
        
      
       
        document.getElementById("nomeUsuario").innerText = localStorage.getItem("email") || "Admin User";

        function pesquisarCursos() {
            const termoPesquisa = document.getElementById('search-input').value.toLowerCase();
            const linhasTabela = document.querySelectorAll('.table-container tbody tr');
            
            linhasTabela.forEach(linha => {
                const textoLinha = linha.textContent.toLowerCase();
                if (textoLinha.includes(termoPesquisa)) {
                    linha.style.display = '';
                } else {
                    linha.style.display = 'none';
                }
            });
        }