
// Variáveis globais
let photoToDelete = null;
let viewer = null;

// Inicializar o visualizador de imagens
function initGalleryViewer() {
    const gallery = document.getElementById('gallery');
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
    });
}

// Função para visualizar imagem individual
function viewImage(element) {
    const imgSrc = element.closest('.gallery-item').querySelector('img').src;
    const imgTitle = element.closest('.gallery-item').querySelector('.gallery-title').textContent;
    
    document.getElementById('viewed-image').src = imgSrc;
    document.getElementById('viewed-image').alt = imgTitle;
    document.getElementById('image-viewer').style.display = 'flex';
}

// Fechar visualizador de imagem
function closeImageViewer() {
    document.getElementById('image-viewer').style.display = 'none';
}

// Abrir modal de upload
function openModalUpload() {
    document.getElementById('upload-modal').style.display = 'block';
}

// Abrir modal de eliminação
function openDeleteModal(id, title) {
    photoToDelete = id;
    document.getElementById('photo-delete-name').textContent = title || "Foto selecionada";
    document.getElementById('confirm-modal').style.display = 'block';
}

// Eliminar foto
function deletePhoto() {
    if (photoToDelete) {
        // Aqui você faria a chamada AJAX para eliminar a foto
        console.log(`Foto com ID ${photoToDelete} eliminada`);
        alert("Foto eliminada com sucesso!");
        closeModal('confirm-modal');
        // Recarregar a galeria ou remover o item
    }
}

// Fechar modais
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Manipulação do upload de arquivos
document.getElementById('upload-area').addEventListener('click', function() {
    document.getElementById('file-input').click();
});

document.getElementById('file-input').addEventListener('change', function(e) {
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';
    
    if (this.files.length > 0) {
        for (let i = 0; i < this.files.length; i++) {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="fas fa-image"></i>
                <span>${this.files[i].name}</span>
                <span>${(this.files[i].size / 1024).toFixed(2)} KB</span>
            `;
            fileList.appendChild(fileItem);
        }
    }
});

// Drag and drop
const uploadArea = document.getElementById('upload-area');

uploadArea.addEventListener('dragover', function(e) {
    e.preventDefault();
    this.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', function() {
    this.classList.remove('dragover');
});

uploadArea.addEventListener('drop', function(e) {
    e.preventDefault();
    this.classList.remove('dragover');
    
    const fileInput = document.getElementById('file-input');
    fileInput.files = e.dataTransfer.files;
    
    // Dispara o evento change manualmente
    const event = new Event('change');
    fileInput.dispatchEvent(event);
});

// Envio do formulário
document.getElementById('upload-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const title = document.getElementById('photo-title').value;
    const date = document.getElementById('photo-date').value;
    const description = document.getElementById('photo-description').value;
    const files = document.getElementById('file-input').files;
    
    if (files.length === 0) {
        alert("Por favor, selecione pelo menos uma foto!");
        return;
    }
    
    // Aqui você faria o upload das fotos via AJAX
    console.log("Enviando fotos:", {
        title,
        date,
        description,
        files: files.length
    });
    
    alert("Fotos enviadas com sucesso!");
    closeModal('upload-modal');
    this.reset();
    document.getElementById('file-list').innerHTML = '';
});

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initGalleryViewer();
});
