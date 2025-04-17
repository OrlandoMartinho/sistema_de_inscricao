document.addEventListener('DOMContentLoaded', function() {
    console.log('[GALERIA] DOM completamente carregado - Inicializando sistema de galeria');  
    // Carregar galeria
    console.log('[GALERIA] Iniciando carregamento da galeria...');
    carregarGaleria();
    
    // Configurar drag and drop
    console.log('[GALERIA] Configurando área de drag and drop...');
    setupDragAndDrop();
    
    // Configurar formulário de upload
    console.log('[GALERIA] Configurando formulário de upload...');
    const uploadForm = document.getElementById('upload-form');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('[GALERIA] Formulário de upload submetido');
           
        });
    } else {
        console.error('[GALERIA] Erro: Formulário de upload não encontrado');
    }
    
    // Configurar pesquisa
    console.log('[GALERIA] Configurando barra de pesquisa...');
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            console.log('[GALERIA] Pesquisa acionada:', e.target.value);
            pesquisarFotos(e.target.value);
        });
    }
    
    console.log('[GALERIA] Sistema de galeria inicializado com sucesso');
});

// Variáveis globais
let galeriaAtual = [];
let fotoParaDeletar = null;
let selectedFiles = []; // Array para armazenar os arquivos selecionados

/**
 * Carrega a galeria de fotos do servidor
 */
function carregarGaleria() {
    console.log('[GALERIA] Iniciando requisição para carregar galeria...');
    
    const loadingTimer = setTimeout(() => {
        console.log('[GALERIA] A requisição está demorando mais que o esperado...');
    }, 3000);

    fetch('../controllers/galeria.php', {
        method: 'GET',
        headers: {
            
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        clearTimeout(loadingTimer);
        console.log('[GALERIA] Resposta recebida do servidor. Status:', response.status);
        
        if (!response.ok) {
            console.error('[GALERIA] Erro na resposta do servidor:', response.status, response.statusText);
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('[GALERIA] Dados recebidos:', data);
        
        if (data.success) {
            console.log(`[GALERIA] Galeria carregada com sucesso. ${data.data.length} itens encontrados`);
            galeriaAtual = data.data;
            atualizarGaleriaUI(data.data);
        } else {
            console.error('[GALERIA] Erro no carregamento:', data.message);
            mostrarErro('Erro ao carregar galeria: ' + (data.message || 'Erro desconhecido'));
        }
    })
    .catch(error => {
        console.error('[GALERIA] Erro na requisição:', error);
        mostrarErro('Erro ao conectar com o servidor: ' + error.message);
    });
}

/**
 * Atualiza a interface com as fotos da galeria
 * @param {Array} fotos - Array de fotos para exibir
 */
function atualizarGaleriaUI(fotos) {
    console.log('[GALERIA] Atualizando interface com', fotos.length, 'fotos');
    
    const galleryContainer = document.getElementById('gallery');
    if (!galleryContainer) {
        console.error('[GALERIA] Erro: Container da galeria não encontrado');
        return;
    }

    galleryContainer.innerHTML = '';
    
    if (fotos.length === 0) {
        console.log('[GALERIA] Nenhuma foto encontrada, exibindo mensagem');
        galleryContainer.innerHTML = '<p class="no-photos">Nenhuma foto encontrada. Adicione fotos para começar.</p>';
        return;
    }
    
    fotos.forEach((foto, index) => {
        console.log(`[GALERIA] Processando foto ${index + 1}/${fotos.length}:`, foto.id_galeria, foto.titulo);
        
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        galleryItem.dataset.id = foto.id_galeria;
        
        galleryItem.innerHTML = `
            <img src="${foto.foto_url}" alt="${foto.titulo}" loading="lazy">
            <div class="gallery-actions">
                <button class="btn-view" onclick="viewImage(this)"><i class="fas fa-eye"></i></button>
                <button class="btn-delete" onclick="openDeleteModal(${foto.id_galeria}, '${escapeHtml(foto.titulo)}')"><i class="fas fa-trash-alt"></i></button>
            </div>
            <div class="gallery-info">
                <span class="gallery-title">${escapeHtml(foto.titulo)}</span>
                <span class="gallery-date">${formatarData(foto.data_do_evento || foto.data_de_criacao)}</span>
            </div>
        `;
        
        galleryContainer.appendChild(galleryItem);
    });
    
    console.log('[GALERIA] Inicializando viewer.js para a galeria');
    try {
        const gallery = document.getElementById('gallery');
        new Viewer(gallery, {
            toolbar: {
                zoomIn: 1,
                zoomOut: 1,
                oneToOne: 1,
                reset: 1,
                prev: 0,
                play: 0,
                next: 0,
                rotateLeft: 1,
                rotateRight: 1,
                flipHorizontal: 1,
                flipVertical: 1,
            },
        });
        console.log('[GALERIA] Viewer.js inicializado com sucesso');
    } catch (e) {
        console.error('[GALERIA] Erro ao inicializar viewer.js:', e);
    }
}

/**
 * Formata uma data para o formato local
 * @param {string} dataString - Data no formato string
 * @returns {string} Data formatada
 */
function formatarData(dataString) {
    if (!dataString) {
        console.log('[GALERIA] Data vazia, retornando string vazia');
        return '';
    }
    
    console.log('[GALERIA] Formatando data:', dataString);
    try {
        const data = new Date(dataString);
        return data.toLocaleDateString('pt-PT');
    } catch (e) {
        console.error('[GALERIA] Erro ao formatar data:', e);
        return dataString;
    }
}

/**
 * Configura a área de drag and drop para upload de arquivos
 */
function setupDragAndDrop() {
    console.log('[GALERIA] Configurando área de drag and drop...');
    
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('file-input');
    
    if (!uploadArea || !fileInput) {
        console.error('[GALERIA] Erro: Elementos de upload não encontrados');
        return;
    }

    // Prevenir comportamentos padrão
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });
    
    // Destacar área de drop
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Lidar com drop
    uploadArea.addEventListener('drop', handleDrop, false);
    
    // Lidar com seleção de arquivos
    fileInput.addEventListener('change', handleFiles, false);
    
    console.log('[GALERIA] Drag and drop configurado com sucesso');
}

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    console.log('[GALERIA] Destacando área de upload');
    document.getElementById('upload-area').classList.add('highlight');
}

function unhighlight() {
    console.log('[GALERIA] Removendo destaque da área de upload');
    document.getElementById('upload-area').classList.remove('highlight');
}

function handleDrop(e) {
    console.log('[GALERIA] Arquivos soltos na área de upload');
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles({ target: { files } });
}

/**
 * Processa os arquivos selecionados para upload
 * @param {Event} e - Evento de seleção de arquivos
 */
function handleFiles(e) {
    console.log('[GALERIA] Processando arquivos selecionados...');
    const files = Array.from(e.target.files); // Convertendo FileList para Array
    const fileList = document.getElementById('file-list');
    
    if (!fileList) {
        console.error('[GALERIA] Erro: Lista de arquivos não encontrada');
        return;
    }

    fileList.innerHTML = '';
    selectedFiles = []; // Resetar array de arquivos
    
    if (files.length > 10) {
        console.log('[GALERIA] Muitos arquivos selecionados:', files.length);
        mostrarErro('Você pode enviar no máximo 10 fotos por vez.');
        return;
    }
    
    files.forEach((file, index) => {
        console.log(`[GALERIA] Processando arquivo ${index + 1}/${files.length}:`, file.name, file.type, file.size);
        
        // Verificar tipo de arquivo
        if (!file.type.match('image.*')) {
            console.log('[GALERIA] Arquivo não é uma imagem:', file.name);
            mostrarErro(`O arquivo ${file.name} não é uma imagem. Apenas imagens são permitidas.`);
            return; // Continua para o próximo arquivo
        }
        
        // Verificar tamanho do arquivo (máximo 5MB)
        if (file.size > 5 * 1024 * 1024) {
            console.log('[GALERIA] Arquivo muito grande:', file.name, formatFileSize(file.size));
            mostrarErro(`O arquivo ${file.name} (${formatFileSize(file.size)}) é muito grande. Tamanho máximo: 5MB.`);
            return; // Continua para o próximo arquivo
        }
        
        // Adicionar ao array de arquivos selecionados
        selectedFiles.push(file);
        
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.dataset.index = selectedFiles.length - 1; // Armazena o índice do arquivo
        fileItem.innerHTML = `
            <span>${escapeHtml(file.name)}</span>
            <span>${formatFileSize(file.size)}</span>
            <button type="button" onclick="removerArquivo(this.parentElement)"><i class="fas fa-times"></i></button>
        `;
        fileList.appendChild(fileItem);
    });
    
    console.log('[GALERIA] Total de arquivos válidos selecionados:', selectedFiles.length);
}

/**
 * Remove um arquivo da lista de upload
 * @param {HTMLElement} fileItem - Elemento do arquivo a ser removido
 */
function removerArquivo(fileItem) {
    const index = fileItem.dataset.index;
    console.log('[GALERIA] Removendo arquivo da lista:', index);
    
    if (index >= 0 && index < selectedFiles.length) {
        console.log('[GALERIA] Removendo arquivo:', selectedFiles[index].name);
        selectedFiles.splice(index, 1);
        
        // Atualizar os índices dos itens restantes
        const fileItems = document.querySelectorAll('.file-item');
        fileItems.forEach((item, i) => {
            item.dataset.index = i;
        });
        
        fileItem.remove();
        console.log('[GALERIA] Arquivo removido. Arquivos restantes:', selectedFiles.length);
    } else {
        console.error('[GALERIA] Índice inválido para remoção:', index);
    }
}

/**
 * Envia as fotos para o servidor
 */
document.getElementById('upload-form').addEventListener('submit', function(e) {
    e.preventDefault();

    const title = document.getElementById('photo-title')?.value.trim();
    const date = document.getElementById('photo-date')?.value;
    const description = document.getElementById('photo-description')?.value.trim();
    const files = document.getElementById('file-input')?.files;

    if (!files || files.length === 0) {
        alert("Por favor, selecione pelo menos uma foto!");
        return;
    }

    // Validação básica
    if (!title || title.length < 3) {
        alert("O título é obrigatório e deve ter pelo menos 3 caracteres.");
        return;
    }

    enviarFotos( title, date, description, files );
});

function enviarFotos(title, date, description, files ) {
    const formData = new FormData();
    
    // Adiciona arquivos
   
    formData.append(`foto`, files[0]);
       
    console.log()
    // Adiciona campos do formulário
    formData.append('titulo', title);
    if (date) formData.append('data_do_evento', date);
    if (description) formData.append('descricao', description);

    // Debug do conteúdo
    console.log('[GALERIA] Conteúdo do FormData:');
    for (let [key, value] of formData.entries()) {
        console.log(key, value instanceof File ? `${value.name} (${formatFileSize(value.size)})` : value);
    }

    const btnEnviar = document.querySelector('#upload-form .btn-confirm');
    if (!btnEnviar) {
        console.error('[GALERIA] Botão de enviar não encontrado');
        return;
    }

    const originalText = btnEnviar.innerHTML;
    btnEnviar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
    btnEnviar.disabled = true;

    console.log('[GALERIA] Enviando requisição para o servidor...');
    const startTime = performance.now();
    console.log('Conteúdo do FormData:', formData);
    formData.append('action', 'upload');
    fetch('../controllers/galeria.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        const duration = (performance.now() - startTime).toFixed(2);
        console.log(`[GALERIA] Resposta recebida em ${duration}ms. Status:`, response.status);

        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }

        return response.json();
    })
    .then(data => {
        if (data.success) {
            mostrarSucesso(data.message || 'Fotos enviadas com sucesso!');
            closeModal('upload-modal');
            carregarGaleria();

            // Resetar formulário
            document.getElementById('upload-form').reset();
            document.getElementById('file-list').innerHTML = '';
        } else {
            mostrarErro(data.message || 'Erro ao enviar fotos.');
        }
    })
    .catch(error => {
        console.error('[GALERIA] Erro na requisição:', error);
        mostrarErro(error.message || 'Erro ao conectar com o servidor.');
    })
    .finally(() => {
        btnEnviar.innerHTML = originalText;
        btnEnviar.disabled = false;
    });
}

// Função auxiliar para formatar o tamanho do arquivo
function formatFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function resetarFormulario() {
    console.log('[GALERIA] Resetando formulário de upload...');
    
    const form = document.getElementById('upload-form');
    if (form) form.reset();
    
    const fileList = document.getElementById('file-list');
    if (fileList) fileList.innerHTML = '';
    
    const fileInput = document.getElementById('file-input');
    if (fileInput) fileInput.value = '';
    
    selectedFiles = []; // Limpa o array de arquivos
    console.log('[GALERIA] Formulário resetado com sucesso');
}

/**
 * Abre o modal de upload
 */
function openModalUpload() {
    console.log('[GALERIA] Abrindo modal de upload');
    document.getElementById('upload-modal').style.display = 'block';
}


/**
 * Fecha um modal
 * @param {string} modalId - ID do modal a ser fechado
 */
function closeModal(modalId) {
    console.log(`[GALERIA] Fechando modal: ${modalId}`);
    document.getElementById(modalId).style.display = 'none';
    
    if (modalId === 'upload-modal') {
        resetarFormulario();
    }
}



/**
 * Visualiza uma imagem em tela cheia
 * @param {HTMLElement} button - Botão que acionou a visualização
 */
function viewImage(button) {
    const galleryItem = button.closest('.gallery-item');
    if (!galleryItem) {
        console.error('[GALERIA] Item da galeria não encontrado');
        return;
    }
    
    const imgSrc = galleryItem.querySelector('img')?.src;
    const imgTitle = galleryItem.querySelector('.gallery-title')?.textContent;
    
    if (!imgSrc) {
        console.error('[GALERIA] Imagem não encontrada no item da galeria');
        return;
    }
    
    console.log('[GALERIA] Visualizando imagem:', imgSrc, imgTitle);
    
    const viewer = document.createElement('div');
    viewer.className = 'image-viewer-modal';
    viewer.innerHTML = `
        <div class="viewer-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>${escapeHtml(imgTitle || 'Imagem')}</h3>
            <img src="${imgSrc}" alt="${escapeHtml(imgTitle || 'Imagem')}">
        </div>
    `;
    
    document.body.appendChild(viewer);
    
    // Fechar ao clicar fora da imagem
    viewer.addEventListener('click', function(e) {
        if (e.target === viewer) {
            console.log('[GALERIA] Fechando visualizador de imagem');
            viewer.remove();
        }
    });
}

/**
 * Mostra uma mensagem de erro
 * @param {string} mensagem - Mensagem a ser exibida
 */
function mostrarErro(mensagem) {
    console.error('[GALERIA] Exibindo erro:', mensagem);
    
    const notification = document.createElement('div');
    notification.className = 'notification error';
    notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${escapeHtml(mensagem)}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

/**
 * Mostra uma mensagem de sucesso
 * @param {string} mensagem - Mensagem a ser exibida
 */
function mostrarSucesso(mensagem) {
    console.log('[GALERIA] Exibindo sucesso:', mensagem);
    
    const notification = document.createElement('div');
    notification.className = 'notification success';
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${escapeHtml(mensagem)}`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 500);
    }, 5000);
}

/**
 * Pesquisa fotos na galeria
 * @param {string} termo - Termo de pesquisa
 */
function pesquisarFotos(termo) {
    console.log('[GALERIA] Pesquisando fotos com termo:', termo);
    
    if (!termo) {
        console.log('[GALERIA] Termo vazio, mostrando todas as fotos');
        atualizarGaleriaUI(galeriaAtual);
        return;
    }
    
    const termoLower = termo.toLowerCase();
    const fotosFiltradas = galeriaAtual.filter(foto => 
        foto.titulo.toLowerCase().includes(termoLower) || 
        (foto.descricao && foto.descricao.toLowerCase().includes(termoLower))
    );
    
    console.log('[GALERIA] Fotos filtradas encontradas:', fotosFiltradas.length);
    atualizarGaleriaUI(fotosFiltradas);
}

/* Funções auxiliares */

/**
 * Formata o tamanho do arquivo para uma string legível
 * @param {number} bytes - Tamanho em bytes
 * @returns {string} Tamanho formatado
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Escapa caracteres HTML para prevenir XSS
 * @param {string} text - Texto a ser escapado
 * @returns {string} Texto seguro
 */
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Variáveis globais (modificado para garantir escopo global)
window.galeriaAtual = [];
window.fotoParaDeletar = null; // Agora é explicitamente global
window.selectedFiles = [];



function closeModal(modalId) {
    console.log(`[GALERIA] Fechando modal: ${modalId}`);
    document.getElementById(modalId).style.display = 'none';
    
    if (modalId === 'confirm-modal') {
        window.fotoParaDeletar = null; // Resetar ao fechar o modal
    }
    
    if (modalId === 'upload-modal') {
        resetarFormulario();
    }
}

function closeModal(modalId) {
    console.log(`[GALERIA] Fechando modal: ${modalId}`);
    document.getElementById(modalId).style.display = 'none';
    
    if (modalId === 'upload-modal') {
        resetarFormulario();
    }
}
function deletePhoto() {
    console.log('[GALERIA] Iniciando função deletePhoto()');
    
    // Obter ID da galeria
    const id_galeria = localStorage.getItem("id_galeria");
    console.log('[GALERIA] ID obtido do localStorage:', id_galeria);

    if (!id_galeria) {
        console.error('[GALERIA] Erro: ID da foto não encontrado');
        mostrarErro("ID da foto não encontrado");
        return;
    }

    // Configurar botão
    const btnDelete = document.querySelector('#btn-delete-photo');
    if (!btnDelete) {
        console.error('[GALERIA] Erro: Botão não encontrado');
        return;
    }

    const originalText = btnDelete.innerHTML;
    btnDelete.innerHTML = 'Deletando...';
    btnDelete.disabled = true;

    // Preparar dados para envio (usando URLSearchParams para melhor compatibilidade)
    const dados = new URLSearchParams();
    dados.append('id_galeria', id_galeria);
    dados.append('action', 'delete');

    console.log('[GALERIA] Enviando requisição para:', '../controllers/galeria.php');
    console.log('[GALERIA] Dados enviados:', Object.fromEntries(dados.entries()));

    fetch('../controllers/galeria.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: dados
    })
    .then(async response => {
        console.log('[GALERIA] Resposta recebida - Status:', response.status);
        conso
        if(response.status === 200) {
            console.log('[GALERIA] Resposta vazia (204 No Content)');
            return { success: true, message: 'Foto deletada com sucesso!' };

        }
        // // Verificar se a resposta é JSON válido
        // const contentType = response.headers.get('content-type');
        // if (!contentType || !contentType.includes('application/json')) {
        //     const text = await response.text();
        //     console.error('[GALERIA] Resposta não é JSON:', text);
        //     throw new Error('Resposta inválida do servidor');
        // }

        console.log('[GALERIA] Verificando se a resposta é JSON');
        if (!response.ok) {
            console.error('[GALERIA] Erro na resposta do servidor:', response.status, response.statusText);
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        throw new Error(`Erro ao cadastrar foto`);
        
    })
    .then(data => {
        console.log('[GALERIA] Resposta do servidor:', data);
        
        if (data.success) {
            alert('Foto deletada com sucesso!');
            mostrarSucesso(data.message || 'Foto deletada com sucesso!');
            closeModal('confirm-modal');
            carregarGaleria();
        } else {
            throw new Error(data.message || 'Erro ao deletar foto');
        }
    })
    .catch(error => {
        console.error('[GALERIA] Erro na requisição:', {
            message: error.message,
            stack: error.stack
        });
        mostrarErro(error.message || 'Erro ao conectar com o servidor');
    })
    .finally(() => {
        btnDelete.innerHTML = originalText;
        btnDelete.disabled = false;
        console.log('[GALERIA] Processo finalizado');
    });
}