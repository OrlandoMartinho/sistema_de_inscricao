
 
        
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



// Fechar modais ao clicar fora do conteúdo
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
}



let currentModal = null;

// Funções para abrir modais
function openNewInscricaoModal() {
    resetForm();
    document.getElementById('btn-confirmar').textContent = 'Confirmar Inscrição';
    document.getElementById('matriculaModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function openViewModal(id) {
    currentInscricaoId = id;
    
    // Simulação - na implementação real, buscaria os dados do servidor
    const inscricao = {
        nome: id === 1 ? 'Fulano da Silva' : id === 2 ? 'Sicrano da Silva' : 'Alberto Moisés',
        curso: id === 1 ? 'Electricidade' : id === 2 ? 'Informática' : 'Electricidade',
        data: id === 1 ? '12/12/2022' : id === 2 ? '15/12/2022' : '18/12/2022',
        status: id === 1 ? 'Pendente' : id === 2 ? 'Aceite' : 'Rejeitado',
        documentos: ['Certificado.pdf', 'BI.pdf', 'Foto1.jpg', 'Foto2.jpg']
    };

    document.getElementById('view-nome').textContent = inscricao.nome;
    document.getElementById('view-curso').textContent = inscricao.curso;
    document.getElementById('view-data').textContent = inscricao.data;
    document.getElementById('view-estado').innerHTML = `<span class="status ${inscricao.status.toLowerCase()}">${inscricao.status}</span>`;
    
    const documentosContainer = document.getElementById('view-documentos');
    documentosContainer.innerHTML = inscricao.documentos.map(doc => 
        `<div><i class="fas fa-file"></i> ${doc} <button onclick="downloadDocument(${id}, '${doc}')"><i class="fas fa-download"></i></button></div>`
    ).join('');

    document.getElementById('view-inscricao-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function openExportModal() {
    document.getElementById('export-pdf-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Funções para fechar modais
function closeModal(modalId = null) {
    if (modalId) {
        document.getElementById(modalId).style.display = 'none';
    } else {
        document.getElementById('matriculaModal').style.display = 'none';
    }
    document.body.style.overflow = 'auto';
}

// Funções para aprovar/rejeitar inscrições
function approveInscricao(id) {
    currentInscricaoId = id;
    document.getElementById('decision-id').value = id;
    document.getElementById('decision-type').value = 'approve';
    document.getElementById('decision-title').textContent = 'Aprovar Inscrição';
    document.getElementById('decision-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function rejectInscricao(id) {
    currentInscricaoId = id;
    document.getElementById('decision-id').value = id;
    document.getElementById('decision-type').value = 'reject';
    document.getElementById('decision-title').textContent = 'Rejeitar Inscrição';
    document.getElementById('decision-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function confirmDecision() {
    const id = document.getElementById('decision-id').value;
    const type = document.getElementById('decision-type').value;
    const comment = document.getElementById('decision-comment').value;
    
    // Simulação - na implementação real, faria uma requisição ao servidor
    console.log(`Inscrição ${id} ${type === 'approve' ? 'aprovada' : 'rejeitada'} com comentário: ${comment}`);
    
    // Atualizar a linha na tabela
    const row = document.querySelector(`tr[data-inscricao] td:nth-child(1):contains('${id}')`).parentNode;
    row.querySelector('.status').className = `status ${type === 'approve' ? 'accepted' : 'rejected'}`;
    row.querySelector('.status').textContent = type === 'approve' ? 'Aceite' : 'Rejeitado';
    
    closeModal('decision-modal');
}

// Funções para o modal de matrícula
document.addEventListener('DOMContentLoaded', function() {
    const btnAvancar = document.getElementById('btn-avancar');
    const btnVoltar = document.getElementById('btn-voltar');
    const btnConfirmar = document.getElementById('btn-confirmar');
    const page1 = document.getElementById('page1');
    const page2 = document.getElementById('page2');
    
    btnAvancar.addEventListener('click', function() {
        if (validatePage1()) {
            page1.classList.remove('active');
            page2.classList.add('active');
            btnAvancar.style.display = 'none';
            btnVoltar.style.display = 'inline-block';
            btnConfirmar.style.display = 'inline-block';
            updateConfirmation();
        }
    });
    
    btnVoltar.addEventListener('click', function() {
        page2.classList.remove('active');
        page1.classList.add('active');
        btnAvancar.style.display = 'inline-block';
        btnVoltar.style.display = 'none';
        btnConfirmar.style.display = 'none';
    });
    
    btnConfirmar.addEventListener('click', function() {
        if (validatePage2()) {
            saveInscricao();
            closeModal();
        }
    });
    
    // Atualizar campos de confirmação quando os valores mudam
    document.getElementById('classe').addEventListener('change', updateConfirmation);
    document.getElementById('turno').addEventListener('change', updateConfirmation);
    document.querySelectorAll('input[name="curso"]').forEach(radio => {
        radio.addEventListener('change', updateConfirmation);
    });
});

function updateConfirmation() {
    const classe = document.getElementById('classe').value;
    const turno = document.getElementById('turno').value;
    const curso = document.querySelector('input[name="curso"]:checked')?.value;
    
    document.getElementById('classe_confirmacao').textContent = classe ? classe + 'ª' : '______';
    
    if (turno === 'MANHA') {
        document.getElementById('turno_confirmacao').textContent = 'MANHÃ';
    } else if (turno === 'TARDE') {
        document.getElementById('turno_confirmacao').textContent = 'TARDE';
    } else {
        document.getElementById('turno_confirmacao').textContent = '______';
    }
    
    if (curso === 'TECNICO_ENERGIA') {
        document.getElementById('curso_confirmacao').textContent = 'TÉCNICO DE ENERGIA E INSTALAÇÕES ELÉCTRICAS';
    } else if (curso === 'TECNICO_INFORMATICA') {
        document.getElementById('curso_confirmacao').textContent = 'TÉCNICO DE INFORMÁTICA';
    } else {
        document.getElementById('curso_confirmacao').textContent = '______';
    }
    
    const hoje = new Date();
    document.getElementById('data_confirmacao').textContent = hoje.toLocaleDateString('pt-AO');
}

// Funções de validação
function validatePage1() {
    let isValid = true;
    
    // Validação básica dos campos obrigatórios
    const requiredFields = ['idade', 'sexo', 'processo', 'nome', 'contacto_aluno', 'data_nascimento'];
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showError(fieldId, 'Este campo é obrigatório');
            isValid = false;
        } else {
            clearError(fieldId);
        }
    });
    
    // Validação específica da idade (mínimo 14 anos)
    const idade = parseInt(document.getElementById('idade').value);
    if (isNaN(idade)) {
        showError('idade', 'Por favor, informe uma idade válida');
        isValid = false;
    } else if (idade < 14) {
        showError('idade', 'A idade mínima é 14 anos');
        isValid = false;
    }
    
    return isValid;
}

function validatePage2() {
    let isValid = true;
    
    if (!document.querySelector('input[name="area_formacao"]:checked')) {
        showError('area_formacao', 'Selecione uma área de formação');
        isValid = false;
    }
    
    if (!document.querySelector('input[name="curso"]:checked')) {
        showError('curso', 'Selecione um curso');
        isValid = false;
    }
    
    if (!document.getElementById('classe').value) {
        showError('classe', 'Selecione a classe');
        isValid = false;
    }
    
    if (!document.getElementById('turno').value) {
        showError('turno', 'Selecione o turno');
        isValid = false;
    }
    
    return isValid;
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    field.classList.add('error');
    
    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('mensagem-erro')) {
        errorElement = document.createElement('div');
        errorElement.className = 'mensagem-erro';
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    
    errorElement.textContent = message;
}

function clearError(fieldId) {
    const field = document.getElementById(fieldId);
    field.classList.remove('error');
    
    const errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('mensagem-erro')) {
        errorElement.remove();
    }
}

// Funções para manipulação de dados
function saveInscricao() {
    // Simulação - na implementação real, enviaria os dados para o servidor
    const formData = {
        nome: document.getElementById('nome').value,
        idade: document.getElementById('idade').value,
        curso: document.querySelector('input[name="curso"]:checked').value,
        classe: document.getElementById('classe').value,
        turno: document.getElementById('turno').value,
        // ... coletar outros dados do formulário
    };
    
    console.log('Dados da inscrição:', formData);
    alert('Inscrição registrada com sucesso!');
}

function resetForm() {
    document.getElementById('page1').querySelectorAll('input, select').forEach(element => {
        if (element.type !== 'radio' && element.type !== 'checkbox') {
            element.value = '';
        }
    });
    document.getElementById('page2').querySelectorAll('input, select').forEach(element => {
        if (element.type !== 'radio' && element.type !== 'checkbox') {
            element.value = '';
        }
    });
    document.querySelectorAll('.mensagem-erro').forEach(el => el.remove());
    document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    
    // Resetar páginas
    document.getElementById('page1').classList.add('active');
    document.getElementById('page2').classList.remove('active');
    document.getElementById('btn-avancar').style.display = 'inline-block';
    document.getElementById('btn-voltar').style.display = 'none';
    document.getElementById('btn-confirmar').style.display = 'none';
}

function downloadInscricao(id) {
    // Simulação - na implementação real, faria o download do PDF
    console.log(`Baixando inscrição ${id} como PDF`);
    alert(`Iniciando download da inscrição ${id}`);
}

function downloadDocument(id, docName) {
    // Simulação - na implementação real, faria o download do documento
    console.log(`Baixando documento ${docName} da inscrição ${id}`);
    alert(`Iniciando download do documento: ${docName}`);
}

function exportToPDF(type) {
    // Simulação - na implementação real, geraria o PDF
    console.log(`Exportando ${type === 'all' ? 'todos os dados' : 'dados filtrados'} para PDF`);
    alert(`PDF gerado com ${type === 'all' ? 'todos os registros' : 'os registros filtrados'}`);
    closeModal('export-pdf-modal');
}

function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    
    document.querySelectorAll('#inscricoes-table tbody tr').forEach(row => {
        const nome = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const curso = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        const status = row.querySelector('.status').textContent;
        const dataInscricao = row.getAttribute('data-inscricao');
        
        const matchesSearch = nome.includes(searchTerm) || curso.includes(searchTerm);
        const matchesStatus = !statusFilter || status === statusFilter;
        const matchesDate = !dateFilter || dataInscricao === dateFilter;
        
        row.style.display = matchesSearch && matchesStatus && matchesDate ? '' : 'none';
    });
}

// Fechar modal ao clicar fora
window.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal-overlay')) {
        closeModal(event.target.id);
    }
});


document.getElementById("nomeUsuario").innerText = localStorage.getItem("email") || "Admin User";