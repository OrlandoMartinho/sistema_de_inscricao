document.addEventListener('DOMContentLoaded', function() {
     
const userData = JSON.parse(localStorage.getItem('user_data'));
const nome = userData.nome || 'Nome não disponível'; // Substitua pelo valor real
const email = userData.email || 'Email não disponível'; // Substitua pelo valor real


// Atualiza o nome exibido na barra superior
document.getElementById('nomeUsuario').textContent = nome;
    carregarGaleria();
});

async function carregarGaleria() {
    try {
        const response = await fetch('controllers/galeria.php');
        const data = await response.json();
        if (data.success) {
            const galleryContainer = document.getElementById('gallery-container');
            galleryContainer.innerHTML = ''; // Limpa o loading
           
            if (data.data.length > 0) {
                data.data.forEach(galeria => {
                    const galleryItem = document.createElement('div');
                    galleryItem.className = 'gallery-item';
                    
                    const img = document.createElement('img');
                    img.src = galeria.foto_url 
                    img.alt = galeria.titulo;
                    img.loading = 'lazy';
                    
                    // Opcional: Adicionar overlay com informações
                    const overlay = document.createElement('div');
                    overlay.className = 'gallery-overlay';
                    overlay.innerHTML = `
                        <h3>${galeria.titulo}</h3>
                        <p>${galeria.data_do_evento ? new Date(galeria.data_do_evento).toLocaleDateString() : 'Data não informada'}</p>
                    `;
                    
                    galleryItem.appendChild(img);
                    galleryItem.appendChild(overlay);
                    galleryContainer.appendChild(galleryItem);
                });
            } else {
                galleryContainer.innerHTML = '<p class="no-gallery">Nenhuma imagem na galeria ainda.</p>';
            }
        } else {
            console.error('Erro ao carregar galeria:', data.message);
            document.getElementById('gallery-container').innerHTML = 
                '<p class="gallery-error">Não foi possível carregar a galeria. Tente novamente mais tarde.</p>';
        }
    } catch (error) {
        console.error('Erro:', error);
        document.getElementById('gallery-container').innerHTML = 
            '<p class="gallery-error">Erro ao conectar com o servidor.</p>';
    }
}

