
 
        
// Variáveis globais
let currentInscricaoId = null;
let currentAction = null;

// Dados simulados
const inscricoesData = {
    1: {
        nome: "Fulano da Silva",
        curso: "Electricidade Industrial",
        data: "12/12/2022",
        estado: "Pendente",
        documentos: [
            { nome: "Certificado de Habilitações", tipo: "PDF", tamanho: "2.4 MB" },
            { nome: "Bilhete de Identidade", tipo: "JPG", tamanho: "1.2 MB" },
            { nome: "Fotografia Tipo Passe", tipo: "JPG", tamanho: "0.8 MB" }
        ],
        observacoes: "Aguardando análise dos documentos."
    },
    2: {
        nome: "Sicrano da Silva",
        curso: "Informática Básica",
        data: "12/12/2022",
        estado: "Aceite",
        documentos: [
            { nome: "Certificado de Habilitações", tipo: "PDF", tamanho: "2.1 MB" },
            { nome: "Bilhete de Identidade", tipo: "JPG", tamanho: "1.5 MB" },
            { nome: "Fotografia Tipo Passe", tipo: "JPG", tamanho: "0.9 MB" }
        ],
        observacoes: "Documentação completa e válida. Inscrição aceite."
    },
    3: {
        nome: "Alberto Moisés",
        curso: "Electricidade Industrial",
        data: "12/12/2022",
        estado: "Rejeitado",
        documentos: [
            { nome: "Certificado de Habilitações", tipo: "PDF", tamanho: "1.8 MB" },
            { nome: "Bilhete de Identidade", tipo: "JPG", tamanho: "1.3 MB" }
        ],
        observacoes: "Falta fotografia tipo passe. Inscrição rejeitada."
    }
};

// Função para abrir modal de visualização
function openViewModal(id) {
    currentInscricaoId = id;
    const inscricao = inscricoesData[id];
    
    if (inscricao) {
        document.getElementById('view-nome').textContent = inscricao.nome;
        document.getElementById('view-curso').textContent = inscricao.curso;
        document.getElementById('view-data').textContent = inscricao.data;
        
        // Atualizar estado com a classe CSS correta
        const estadoElement = document.getElementById('view-estado');
        estadoElement.innerHTML = `<span class="status ${inscricao.estado.toLowerCase()}">${inscricao.estado}</span>`;
        
        // Preencher documentos
        const documentosContainer = document.getElementById('view-documentos');
        documentosContainer.innerHTML = '';
        
        inscricao.documentos.forEach(doc => {
            const docElement = document.createElement('div');
            docElement.className = 'document-item';
            docElement.innerHTML = `
                <span>${doc.nome} (${doc.tipo}, ${doc.tamanho})</span>
                <a href="#" class="download-link">Download</a>
            `;
            documentosContainer.appendChild(docElement);
        });
        
        document.getElementById('view-observacoes').value = inscricao.observacoes;
        
        document.getElementById('view-inscricao-modal').style.display = 'block';
    }
}

// Função para abrir modal de edição
function openEditModal(id) {
    closeModal('view-inscricao-modal');
    currentInscricaoId = id;
    const inscricao = inscricoesData[id];
    
    if (inscricao) {
        document.getElementById('edit-id').value = id;
        document.getElementById('edit-nome').value = inscricao.nome;
        document.getElementById('edit-curso').value = inscricao.curso;
        document.getElementById('edit-data').value = inscricao.data;
        document.getElementById('edit-estado').value = inscricao.estado;
        
        // Preencher documentos
        const documentosContainer = document.getElementById('edit-documentos');
        documentosContainer.innerHTML = '';
        
        inscricao.documentos.forEach(doc => {
            const docElement = document.createElement('div');
            docElement.className = 'document-item';
            docElement.innerHTML = `
                <span>${doc.nome} (${doc.tipo}, ${doc.tamanho})</span>
                <a href="#" class="download-link">Download</a>
            `;
            documentosContainer.appendChild(docElement);
        });
        
        document.getElementById('edit-observacoes').value = inscricao.observacoes;
        
        document.getElementById('edit-inscricao-modal').style.display = 'block';
    }
}

// Função para fechar modais
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Função para confirmar ação
function confirmAction() {
    if (currentAction === 'save') {
        // Simular salvamento das alterações
        const estado = document.getElementById('edit-estado').value;
        const observacoes = document.getElementById('edit-observacoes').value;
        
        // Atualizar dados simulados
        inscricoesData[currentInscricaoId].estado = estado;
        inscricoesData[currentInscricaoId].observacoes = observacoes;
        
        alert("Inscrição atualizada com sucesso!");
        closeModal('confirm-modal');
        closeModal('edit-inscricao-modal');
        
        // Aqui você atualizaria a tabela ou recarregaria os dados
    }
}

// Event listener para o formulário de edição
document.getElementById('edit-inscricao-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Configurar mensagem de confirmação
    document.getElementById('confirm-message').textContent = 
        "Tem certeza que deseja atualizar o status desta inscrição?";
    currentAction = 'save';
    
    // Abrir modal de confirmação
    document.getElementById('confirm-modal').style.display = 'block';
});

// Fechar modais ao clicar fora do conteúdo
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
}
