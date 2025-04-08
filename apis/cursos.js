document.addEventListener('DOMContentLoaded', function() {
    carregarCursos();
});

async function carregarCursos() {
    try {
        const response = await fetch('controllers/cursos.php');
        const data = await response.json();
        console.log('[DEBUG] Dados dos cursos:', data);
        const gridContainer = document.querySelector('#cursos .grid');
        
        if (data.success) {
            gridContainer.innerHTML = ''; // Limpa o conteúdo estático
            
            if (data.data.length > 0) {
                data.data.forEach(curso => {
                    const card = document.createElement('div');
                    card.className = 'card';
                    
                    // Formata a duração (supondo que está em meses)
                    const duracaoAnos = Math.floor(curso.duracao / 12);
                    const duracaoMeses = curso.duracao % 12;
                    let textoDuracao = '';
                    
                    if (duracaoAnos > 0) {
                        textoDuracao += `${duracaoAnos} ano${duracaoAnos > 1 ? 's' : ''}`;
                    }
                    if (duracaoMeses > 0) {
                        textoDuracao += `${duracaoAnos > 0 ? ' e ' : ''}${duracaoMeses} mês${duracaoMeses > 1 ? 'es' : ''}`;
                    }
                    
                    card.innerHTML = `
                        <h3>${curso.nome}</h3>
                        <p>${curso.descricao}</p>
                        <p><strong>Área:</strong> ${curso.area}</p>
                        <p><strong>Duração:</strong> ${textoDuracao || 'Não informada'}</p>
                        <p><strong>Vagas:</strong> ${curso.numero_de_vagas}</p>
                        <button class="btn-saiba-mais" data-id="${curso.id_curso}">Saiba mais</button>
                    `;
                    
                    gridContainer.appendChild(card);
                });
                
                // Adiciona event listeners aos botões
                document.querySelectorAll('.btn-saiba-mais').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const cursoId = this.getAttribute('data-id');
                        window.location.href = `curso-detalhes.html?id=${cursoId}`;
                    });
                });
            } else {
                gridContainer.innerHTML = '<p class="no-courses">Nenhum curso disponível no momento.</p>';
            }
        } else {
            gridContainer.innerHTML = `
                <p class="error-message">
                    Não foi possível carregar os cursos. 
                    <button onclick="carregarCursos()">Tentar novamente</button>
                </p>
            `;
            console.error('Erro ao carregar cursos:', data.message);
        }
    } catch (error) {
        document.querySelector('#cursos .grid').innerHTML = `
            <p class="error-message">
                Erro de conexão. 
                <button onclick="carregarCursos()">Tentar novamente</button>
            </p>
        `;
        console.error('Erro:', error);
    }
}