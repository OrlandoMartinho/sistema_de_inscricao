// Variáveis globais
let photoToDelete = null;
let viewer = null;
const MAX_FILE_SIZE_MB = 5; // Tamanho máximo de arquivo em MB

// Inicializar o visualizador de imagens
function initGalleryViewer() {
    try {
        const gallery = document.getElementById('gallery');
        if (!gallery) {
            console.error('Elemento da galeria não encontrado');
            return;
        }

        viewer = new Viewer(gallery, {
            navbar: false,
            title: false,
            toolbar: {
                zoomIn: true,
                zoomOut: true,
                oneToOne: true,
                reset: true,
                prev: true,
                play: false,
                next: true,
                rotateLeft: true,
                rotateRight: true,
                flipHorizontal: true,
                flipVertical: true,
            },
            hidden: function() {
                // Garante que o viewer seja destruído quando fechado
                if (viewer) {
                    viewer.destroy();
                    viewer = null;
                }
            }
        });
    } catch (error) {
        console.error('Erro ao inicializar o visualizador de imagens:', error);
    }
}

// Função para visualizar imagem individual
function viewImage(element) {
    try {
        if (!element) {
            console.error('Elemento não definido');
            return;
        }

        const galleryItem = element.closest('.gallery-item');
        if (!galleryItem) {
            console.error('Item da galeria não encontrado');
            return;
        }

        const imgElement = galleryItem.querySelector('img');
        const titleElement = galleryItem.querySelector('.gallery-title');

        if (!imgElement || !titleElement) {
            console.error('Elementos de imagem ou título não encontrados');
            return;
        }

        const viewerElement = document.getElementById('image-viewer');
        const viewedImage = document.getElementById('viewed-image');

        if (!viewerElement || !viewedImage) {
            console.error('Elementos do visualizador não encontrados');
            return;
        }

        viewedImage.src = imgElement.src;
        viewedImage.alt = titleElement.textContent || 'Imagem da galeria';
        viewerElement.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Impede scroll da página
    } catch (error) {
        console.error('Erro ao visualizar imagem:', error);
        alert('Ocorreu um erro ao abrir a imagem');
    }
}

// Fechar visualizador de imagem
function closeImageViewer() {
    try {
        const viewerElement = document.getElementById('image-viewer');
        if (viewerElement) {
            viewerElement.style.display = 'none';
            document.body.style.overflow = ''; // Restaura scroll da página
        }
    } catch (error) {
        console.error('Erro ao fechar visualizador:', error);
    }
}

// Abrir modal genérico
function openModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        }
    } catch (error) {
        console.error(`Erro ao abrir modal ${modalId}:`, error);
    }
}

// Fechar modal genérico
function closeModal(modalId) {
    try {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
            
            // Limpa o input de arquivo se for o modal de upload
            if (modalId === 'upload-modal') {
                const fileInput = document.getElementById('file-input');
                if (fileInput) {
                    fileInput.value = '';
                    document.getElementById('file-list').innerHTML = '';
                }
            }
        }
    } catch (error) {
        console.error(`Erro ao fechar modal ${modalId}:`, error);
    }
}

// Abrir modal de upload
function openModalUpload() {
    openModal('upload-modal');
}

// Abrir modal de eliminação
function openDeleteModal(id, title) {
    try {
        photoToDelete = id;
        const deleteNameElement = document.getElementById('photo-delete-name');
        if (deleteNameElement) {
            deleteNameElement.textContent = title || "Foto selecionada";
        }
        openModal('confirm-modal');
    } catch (error) {
        console.error('Erro ao abrir modal de exclusão:', error);
    }
}

// Eliminar foto
async function deletePhoto() {
    if (!photoToDelete) return;

    try {
        // Simulação de chamada AJAX
        console.log(`Eliminando foto com ID ${photoToDelete}...`);
        
        // Aqui você faria a chamada real à API:
        // const response = await fetch(`/api/photos/${photoToDelete}`, { method: 'DELETE' });
        // if (!response.ok) throw new Error('Falha ao eliminar foto');
        
        // Simulando um atraso de rede
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        showNotification('Foto eliminada com sucesso!', 'success');
        closeModal('confirm-modal');
        
        // Recarregar a galeria ou remover o item da DOM
        // location.reload(); // Ou atualizar a lista via AJAX
        
    } catch (error) {
        console.error('Erro ao eliminar foto:', error);
        showNotification('Erro ao eliminar foto', 'error');
    } finally {
        photoToDelete = null;
    }
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    // Implementação básica - considere usar uma lib como Toastify.js
    alert(`${type.toUpperCase()}: ${message}`);
}

// Manipulação do upload de arquivos
function setupFileUpload() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const uploadForm = document.getElementById('upload-form');

    if (!uploadArea || !fileInput || !fileList || !uploadForm) {
        console.error('Elementos para upload não encontrados');
        return;
    }

    // Clique na área de upload
    uploadArea.addEventListener('click', () => fileInput.click());

    // Alteração de arquivos selecionados
    fileInput.addEventListener('change', function(e) {
        if (!this.files || this.files.length === 0) return;

        fileList.innerHTML = '';
        let hasInvalidFiles = false;

        for (let i = 0; i < this.files.length; i++) {
            const file = this.files[i];
            
            // Validação do tipo de arquivo
            if (!file.type.startsWith('image/')) {
                hasInvalidFiles = true;
                continue;
            }

            // Validação do tamanho do arquivo
            const fileSizeMB = file.size / (1024 * 1024);
            if (fileSizeMB > MAX_FILE_SIZE_MB) {
                hasInvalidFiles = true;
                continue;
            }

            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="fas fa-image"></i>
                <span>${file.name}</span>
                <span>${fileSizeMB.toFixed(2)} MB</span>
            `;
            fileList.appendChild(fileItem);
        }

        if (hasInvalidFiles) {
            showNotification('Alguns arquivos foram ignorados (tipos ou tamanhos inválidos)', 'warning');
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    });

    // Envio do formulário
    uploadForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        if (!fileInput.files || fileInput.files.length === 0) {
            showNotification('Selecione pelo menos uma foto', 'warning');
            return;
        }

        try {
            // Simulação de envio
            console.log('Enviando fotos...');
            
            // Aqui você faria o upload real:
            // const formData = new FormData(this);
            // const response = await fetch('/api/upload', { method: 'POST', body: formData });
            // if (!response.ok) throw new Error('Falha no upload');
            
            // Simulando um atraso de rede
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            showNotification('Fotos enviadas com sucesso!', 'success');
            closeModal('upload-modal');
            
            // Recarregar a galeria ou atualizar via AJAX
            // location.reload();
            
        } catch (error) {
            console.error('Erro no upload:', error);
            showNotification('Erro ao enviar fotos', 'error');
        }
    });
}

// Inicialização da página
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Configurar o nome do usuário
        const userElement = document.getElementById('nomeUsuario');
        if (userElement) {
            const userEmail = localStorage.getItem('email');
            userElement.textContent = userEmail || 'Usuário';
        }

        // Inicializar componentes
        initGalleryViewer();
        setupFileUpload();

        // Fechar modais ao clicar fora
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal.id);
                }
            });
        });

        // Fechar modais com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                document.querySelectorAll('.modal').forEach(modal => {
                    if (modal.style.display === 'block') {
                        closeModal(modal.id);
                    }
                });
            }
        });

    } catch (error) {
        console.error('Erro na inicialização:', error);
    }
});