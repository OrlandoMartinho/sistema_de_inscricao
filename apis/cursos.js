document.addEventListener('DOMContentLoaded', function() {
     
const userData = JSON.parse(localStorage.getItem('user_data'));
const nome = userData.nome || 'Nome não disponível'; // Substitua pelo valor real
const email = userData.email || 'Email não disponível'; // Substitua pelo valor real


// Atualiza o nome exibido na barra superior
document.getElementById('nomeUsuario').textContent = nome;
    carregarCursos();
});
async function carregarCursos() {
    try {
        const response = await fetch('controllers/cursos.php');
        const data = await response.json();
  
        const gridContainer = document.querySelector('#cursos .grid');
        
        if (data.success) {
            gridContainer.innerHTML = ''; // Limpa o conteúdo estático
            
            if (data.data && data.data.length > 0) {
                data.data.forEach(curso => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    
                    // Formatação aprimorada da duração
                    let textoDuracao = 'Não informada';
                    if (curso.duracao) {
                        const duracaoAnos = Math.floor(curso.duracao / 12);
                        const duracaoMeses = curso.duracao % 12;
                        
                        if (duracaoAnos > 0) {
                            textoDuracao = `${duracaoAnos} ano${duracaoAnos > 1 ? 's' : ''}`;
                            if (duracaoMeses > 0) {
                                textoDuracao += ` e ${duracaoMeses} mês${duracaoMeses > 1 ? 'es' : ''}`;
                            }
                        } else {
                            textoDuracao = `${duracaoMeses} mês${duracaoMeses > 1 ? 'es' : ''}`;
                        }
                    }
                    // <p><strong>Área:</strong> ${curso.area || 'Não especificada'}</p>
                    card.innerHTML = `
                        <h3>${curso.nome || 'Nome não informado'}</h3>
                        <p class="descricao">${curso.descricao || 'Descrição não disponível'}</p>
          
                        <p><strong>Duração:</strong> ${textoDuracao}</p>
                    `;
                    
                    gridContainer.appendChild(card);
                });

                // Adiciona event listeners aos botões - versão mais segura
                document.querySelectorAll('.btn-saiba-mais').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const cursoId = this.getAttribute('data-id');
                        if (cursoId) {
                            window.location.href = `curso-detalhes.html?id=${encodeURIComponent(cursoId)}`;
                        }
                    });
                });
            } else {
                gridContainer.innerHTML = `
                    <div class="no-courses">
                        <i class="fas fa-book-open"></i>
                        <p>Nenhum curso disponível no momento.</p>
                    </div>
                `;
            }
        } else {
            gridContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Não foi possível carregar os cursos.</p>
                    <button class="btn-retry" onclick="carregarCursos()">
                        <i class="fas fa-sync-alt"></i> Tentar novamente
                    </button>
                </div>
            `;
            console.error('Erro ao carregar cursos:', data.message || 'Erro desconhecido');
        }
    } catch (error) {
        gridContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-unlink"></i>
                <p>Erro de conexão com o servidor.</p>
                <button class="btn-retry" onclick="carregarCursos()">
                    <i class="fas fa-sync-alt"></i> Tentar novamente
                </button>
            </div>
        `;
        console.error('Erro na requisição:', error);
    }
}

 
