
let contactos = [];
// Função para carregar todos os contactos
async function loadContactos() {
    try {
        const response = await fetch('../controllers/contactos.php', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao carregar contactos');
        }

        const data = await response.json();
        
        if (data.success) {
   
            contactos = data.data;
           
            renderContactosTable(contactos);
        } else {
            showAlert('error', 'Erro', data.message || 'Erro ao carregar contactos');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('error', 'Erro', 'Ocorreu um erro ao carregar os contactos');
    }
}

// Função para renderizar a tabela de contactos
function renderContactosTable(contactos) {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';

    if (contactos.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="7" style="text-align: center;">Nenhum contacto encontrado</td>';
        tbody.appendChild(tr);
        return;
    }

    contactos.forEach(contacto => {
        const tr = document.createElement('tr');
        
        // Formatar data
        const dataCriacao = new Date(contacto.data_de_criacao);
        const dataFormatada = dataCriacao.toLocaleDateString('pt-PT');
        
        // Determinar estado
        let estadoClass, estadoText;
        if (contacto.respondido === 1) {
            estadoClass = 'responded';
            estadoText = 'Respondido';
        } else {
            estadoClass = 'pending';
            estadoText = 'Não respondido';
        }

        tr.innerHTML = `
            <td>${contacto.id_contacto}</td>
            <td>${contacto.nome}</td>
            <td>${contacto.email}</td>
            <td>${contacto.assunto || 'Sem assunto'}</td>
            <td>${dataFormatada}</td>
            <td><span class="status ${estadoClass}">${estadoText}</span></td>
            <td>
                <button class="btn-view" onclick="openViewModal(${contacto.id_contacto})"><i class="fa-solid fa-eye"></i></button>
                <button class="btn-reply" onclick="openReplyModal(${contacto.id_contacto})"><i class="fa-solid fa-reply"></i></button>
                <button class="btn-delete" onclick="openDeleteModal(${contacto.id_contacto})"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Função para abrir o modal de visualização
async function openViewModal(id) {
    currentContactoId = id;
    const contacto = contactos.find(c => c.id_contacto == id);
    
    if (!contacto) {
        showAlert('error', 'Erro', 'Contacto não encontrado');
        return;
    }

    // Preencher os dados no modal
    document.getElementById('view-remetente').textContent = contacto.nome;
    document.getElementById('view-email').textContent = contacto.email;
    document.getElementById('view-assunto').textContent = contacto.assunto || 'Sem assunto';
    
    const dataCriacao = new Date(contacto.data_de_criacao);
    document.getElementById('view-data').textContent = dataCriacao.toLocaleDateString('pt-PT');
    
    const estadoSpan = document.querySelector('#view-estado span');
    if (contacto.respondido === 1) {
        estadoSpan.className = 'status responded';
        estadoSpan.textContent = 'Respondido';
        
        // Mostrar resposta se existir
        const respostaContainer = document.getElementById('view-resposta-container');
        respostaContainer.style.display = 'block';
        
        const dataResposta = new Date(contacto.data_de_resposta);
        document.getElementById('view-resposta').innerHTML = `
            <p><strong>Data de Resposta:</strong> ${dataResposta.toLocaleDateString('pt-PT')}</p>
            <p>${contacto.resposta || 'Resposta não disponível'}</p>
        `;
    } else {
        estadoSpan.className = 'status pending';
        estadoSpan.textContent = 'Não respondido';
        document.getElementById('view-resposta-container').style.display = 'none';
    }
    
    document.getElementById('view-mensagem').textContent = contacto.mensagem;
    
    // Mostrar o modal
    document.getElementById('view-contacto-modal').style.display = 'block';
}

// Função para abrir o modal de resposta
async function openReplyModal(id) {
    currentContactoId = id;
    const contacto = contactos.find(c => c.id_contacto == id);
    
    if (!contacto) {
        showAlert('error', 'Erro', 'Contacto não encontrado');
        return;
    }

    // Preencher os dados no modal
    document.getElementById('reply-email').textContent = contacto.email;
    document.getElementById('reply-assunto').textContent = `RE: ${contacto.assunto || 'Sem assunto'}`;
    document.getElementById('reply-mensagem-original').textContent = contacto.mensagem;
    document.getElementById('reply-resposta').value = '';
    
    // Mostrar o modal
    document.getElementById('reply-contacto-modal').style.display = 'block';
}

// Função para enviar a resposta
async function sendReply() {
    const resposta = document.getElementById('reply-resposta').value.trim();
    
    if (!resposta) {
        showAlert('error', 'Erro', 'Por favor, escreva uma resposta');
        return false;
    }

    try {
        const response = await fetch('../controllers/contactos.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                responder: true,
                id_contacto: currentContactoId,
                resposta: resposta  // Adicionei o campo resposta que estava faltando
            })
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('success', 'Sucesso', 'Resposta enviada com sucesso!');
            closeModal('reply-contacto-modal');
            loadContactos(); // Recarregar a lista de contactos
        } else {
            showAlert('error', 'Erro', data.message || 'Erro ao responder ao contacto');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('error', 'Erro', 'Ocorreu um erro ao responder ao contacto');
    }
    return false; // Previne o recarregamento da página
}

// Função para abrir o modal de confirmação de eliminação
function openDeleteModal(id) {
    currentContactoId = id;
    const contacto = contactos.find(c => c.id_contacto == id);
    
    if (!contacto) {
        showAlert('error', 'Erro', 'Contacto não encontrado');
        return;
    }

    document.getElementById('contacto-delete-name').textContent = `${contacto.nome} - ${contacto.assunto || 'Sem assunto'}`;
    document.getElementById('confirm-modal').style.display = 'block';
}

// Função para eliminar o contacto
async function deleteContacto() {
    try {
      console.log('ID do contacto a eliminar:', currentContactoId); // Debugging
      const formData = new FormData();
        formData.append('id_contacto', currentContactoId);
        formData.append('action', 'delete');
        const response = await fetch('../controllers/contactos.php', {
            method: 'POST',
            body: formData,
        });

       if(response.status== 200){
        alert('Contacto eliminado com sucesso!');
        location.reload();
       }else{
        alert('Erro ao eliminar contacto!');
       }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('error', 'Erro', 'Ocorreu um erro ao eliminar o contacto');
    }
}

// Função para fechar modais
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Função para mostrar alertas
function showAlert(type, title, message) {
    // Implementação simples de alerta - pode ser substituída por uma biblioteca como SweetAlert
    alert(`${title}: ${message}`);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Carregar contactos quando a página é carregada
    loadContactos();
    
    // Configurar o formulário de resposta
    document.getElementById('reply-contacto-form').addEventListener('submit', (e) => {
        e.preventDefault();
        sendReply();
    });
    
    // Configurar a barra de pesquisa
    const searchInput = document.querySelector('.search-bar input');
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = contactos.filter(contacto => 
            contacto.nome.toLowerCase().includes(searchTerm) || 
            contacto.email.toLowerCase().includes(searchTerm) ||
            (contacto.assunto && contacto.assunto.toLowerCase().includes(searchTerm)) ||
            (contacto.mensagem && contacto.mensagem.toLowerCase().includes(searchTerm)));
        
        renderContactosTable(filtered);
    });
});

// Fechar modais ao clicar fora deles
window.addEventListener('click', (event) => {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
});