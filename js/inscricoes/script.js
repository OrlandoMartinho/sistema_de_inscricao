// Variáveis globais
let currentInscricaoId = null;
const API_BASE_URL = '../controllers/inscricoes.php'; // Ajuste conforme necessário

// Funções para manipulação de inscrições
async function registrarInscricao(formData) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('success', 'Inscrição registrada com sucesso!');
            closeModal('matriculaModal');
            loadInscricoes(); // Recarregar a lista de inscrições
        } else {
            showAlert('error', data.message || 'Erro ao registrar inscrição');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('error', 'Erro ao conectar com o servidor');
    }
}

async function editarInscricao(id, formData) {
    try {
        formData.append('action', 'put');
        formData.append('id_inscricao', id);

        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('success', 'Inscrição atualizada com sucesso!');
            closeModal('edit-inscricao-modal');
            loadInscricoes(); // Recarregar a lista de inscrições
        } else {
            showAlert('error', data.message || 'Erro ao atualizar inscrição');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('error', 'Erro ao conectar com o servidor');
    }
}

async function aprovarInscricao(id, comentario) {
    try {
        const formData = new FormData();
        formData.append('action', 'approval');
        formData.append('id_inscricao', id);
        formData.append('comentario', comentario);

        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('success', 'Inscrição aprovada com sucesso!');
            closeModal('decision-modal');
            loadInscricoes(); // Recarregar a lista de inscrições
        } else {
            showAlert('error', data.message || 'Erro ao aprovar inscrição');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('error', 'Erro ao conectar com o servidor');
    }
}

async function eliminarInscricao(id) {
    try {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('id_inscricao', id);

        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (data.success) {
            showAlert('success', 'Inscrição eliminada com sucesso!');
            loadInscricoes(); // Recarregar a lista de inscrições
        } else {
            showAlert('error', data.message || 'Erro ao eliminar inscrição');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('error', 'Erro ao conectar com o servidor');
    }
}

async function getInscricaoDetails(id) {
    try {
        const response = await fetch(`${API_BASE_URL}?id=${id}`, {
            method: 'GET'
        });

        const data = await response.json();
        
        if (data.success) {
            return data.data;
        } else {
            showAlert('error', data.message || 'Erro ao carregar detalhes da inscrição');
            return null;
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('error', 'Erro ao conectar com o servidor');
        return null;
    }
}

// Funções para renderização
function renderInscricoesTable(inscricoes) {
    const tableBody = document.querySelector('#inscricoes-table tbody');
    tableBody.innerHTML = '';

    inscricoes.forEach(inscricao => {
        const row = document.createElement('tr');
        row.dataset.id = inscricao.id_inscricao;
        
        const statusClass = inscricao.aprovacao === 1 ? 'accepted' : 
                          inscricao.aprovacao === 2 ? 'rejected' : 'pending';
        const statusText = inscricao.aprovacao === 1 ? 'Aceite' : 
                          inscricao.aprovacao === 2 ? 'Rejeitado' : 'Pendente';

        row.innerHTML = `
            <td>${inscricao.id_inscricao}</td>
            <td>${inscricao.nome_completo}</td>
            <td>${inscricao.nome_do_curso || 'N/A'}</td>
            <td>${inscricao.requisitos || 'N/A'}</td>
            <td>${formatDate(inscricao.data_de_criacao)}</td>
            <td><span class="status ${statusClass}">${statusText}</span></td>
            <td>
                <button class="btn-view" onclick="openViewModal(${inscricao.id_inscricao})">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn-edit" onclick="openEditModal(${inscricao.id_inscricao})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn-delete" onclick="confirmDelete(${inscricao.id_inscricao})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
            <td>
                ${inscricao.aprovacao === 0 ? `
                <button class="btn-approve" onclick="approveInscricao(${inscricao.id_inscricao})">
                    <i class="fas fa-check"></i>
                </button>
                <button class="btn-reject" onclick="rejectInscricao(${inscricao.id_inscricao})">
                    <i class="fas fa-times"></i>
                </button>
                ` : ''}
                <button class="btn-pdf" onclick="exportSingleToPDF(${inscricao.id_inscricao})">
                    <i class="fas fa-file-pdf"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Funções para modais
async function openViewModal(id) {
    currentInscricaoId = id;
    const inscricao = await getInscricaoDetails(id);
    
    if (inscricao) {
        const statusClass = inscricao.aprovacao === 1 ? 'accepted' : 
                          inscricao.aprovacao === 2 ? 'rejected' : 'pending';
        const statusText = inscricao.aprovacao === 1 ? 'Aceite' : 
                          inscricao.aprovacao === 2 ? 'Rejeitado' : 'Pendente';

        document.getElementById('view-nome').textContent = inscricao.nome_completo;
        document.getElementById('view-curso').textContent = inscricao.nome_do_curso || 'N/A';
        document.getElementById('view-data').textContent = formatDate(inscricao.data_de_criacao);
        document.getElementById('view-estado').innerHTML = `<span class="status ${statusClass}">${statusText}</span>`;
        document.getElementById('view-parecer').textContent = inscricao.comentario || 'Nenhum parecer foi adicionado ainda.';
        
        // Documentos
        const documentosContainer = document.getElementById('view-documentos');
        documentosContainer.innerHTML = '';
        
        if (inscricao.arquivo_de_identificacao) {
            addDocumentoItem(documentosContainer, 'Documento de Identificação', inscricao.arquivo_de_identificacao);
        }
        
        if (inscricao.foto_tipo_passe) {
            addDocumentoItem(documentosContainer, 'Foto Tipo Passe', inscricao.foto_tipo_passe);
        }
        
        document.getElementById('view-inscricao-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function addDocumentoItem(container, nome, arquivo) {
    const docElement = document.createElement('div');
    docElement.className = 'document-item';
    docElement.innerHTML = `
        <span>${nome}</span>
        <button onclick="downloadDocument('${arquivo}')">
            <i class="fas fa-download"></i> Download
        </button>
    `;
    container.appendChild(docElement);
}

async function openEditModal(id) {
    currentInscricaoId = id;
    const inscricao = await getInscricaoDetails(id);
    
    if (inscricao) {
        document.getElementById('edit-id').value = inscricao.id_inscricao;
        document.getElementById('edit-nome').value = inscricao.nome_completo;
        document.getElementById('edit-idade').value = inscricao.idade;
        document.getElementById('edit-genero').value = inscricao.genero;
        document.getElementById('edit-processo').value = inscricao.numero_do_processo;
        document.getElementById('edit-contacto-aluno').value = inscricao.contacto_do_aluno;
        document.getElementById('edit-contacto-encarregado').value = inscricao.contacto_do_encarregado;
        document.getElementById('edit-data-nascimento').value = inscricao.data_de_nascimento;
        document.getElementById('edit-natural').value = inscricao.natural_de;
        document.getElementById('edit-provincia').value = inscricao.provincia;
        document.getElementById('edit-tipo-identificacao').value = inscricao.tipo_de_identificacao;
        document.getElementById('edit-numero-identificacao').value = inscricao.numero_de_identificacao;
        document.getElementById('edit-data-validade').value = inscricao.data_de_validade || '';
        document.getElementById('edit-classe').value = inscricao.classe;
        document.getElementById('edit-turno').value = inscricao.turno;
        document.getElementById('edit-aprovacao').value = inscricao.aprovacao;
        document.getElementById('edit-comentario').value = inscricao.comentario || '';
        
        // Documentos (somente visualização na edição)
        const documentosContainer = document.getElementById('edit-documentos');
        documentosContainer.innerHTML = '';
        
        if (inscricao.arquivo_de_identificacao) {
            addDocumentoItem(documentosContainer, 'Documento de Identificação', inscricao.arquivo_de_identificacao);
        }
        
        if (inscricao.foto_tipo_passe) {
            addDocumentoItem(documentosContainer, 'Foto Tipo Passe', inscricao.foto_tipo_passe);
        }
        
        document.getElementById('edit-inscricao-modal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function openNewInscricaoModal() {
    resetForm();
    document.getElementById('matriculaModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function openExportModal() {
    document.getElementById('export-pdf-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId = null) {
    if (modalId) {
        document.getElementById(modalId).style.display = 'none';
    } else {
        // Fechar todos os modais
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
    document.body.style.overflow = 'auto';
}

// Funções para aprovar/rejeitar inscrições
function approveInscricao(id) {
    currentInscricaoId = id;
    document.getElementById('decision-id').value = id;
    document.getElementById('decision-type').value = 'approve';
    document.getElementById('decision-title').textContent = 'Aprovar Inscrição';
    document.getElementById('decision-comment').value = '';
    document.getElementById('decision-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function rejectInscricao(id) {
    currentInscricaoId = id;
    document.getElementById('decision-id').value = id;
    document.getElementById('decision-type').value = 'reject';
    document.getElementById('decision-title').textContent = 'Rejeitar Inscrição';
    document.getElementById('decision-comment').value = '';
    document.getElementById('decision-modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function confirmDecision() {
    const id = document.getElementById('decision-id').value;
    const type = document.getElementById('decision-type').value;
    const comment = document.getElementById('decision-comment').value;
    
    if (type === 'approve') {
        aprovarInscricao(id, comment);
    } else {
        // Para rejeição, você pode implementar uma função similar
        // ou usar a função editarInscricao para atualizar o status
        const formData = new FormData();
        formData.append('aprovacao', 2); // 2 para rejeitado
        formData.append('comentario', comment);
        editarInscricao(id, formData);
    }
}

function confirmDelete(id) {
    currentInscricaoId = id;
    if (confirm('Tem certeza que deseja eliminar esta inscrição?')) {
        eliminarInscricao(id);
    }
}

// Função principal para exportar para PDF
async function exportToPDF(type) {
    try {
        // Obter os dados (todos ou filtrados)
        const inscricoes = await fetchInscricoes(type);
        
        // Criar PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Adicionar título
        doc.setFontSize(18);
        doc.text('Relatório de Inscrições', 14, 22);
        doc.setFontSize(12);
        doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 30);
        
        // Configurar tabela
        const headers = [
            'ID', 
            'Nome', 
            'Curso', 
            'Data Inscrição', 
            'Estado', 
            'Processo',
            'Contacto'
        ];
        
        const data = inscricoes.map(insc => [
            insc.id_inscricao,
            insc.nome_completo,
            insc.nome_do_curso || 'N/A',
            formatDate(insc.data_de_criacao),
            getStatusText(insc.aprovacao),
            insc.numero_do_processo,
            insc.contacto_do_aluno
        ]);
        
        // Adicionar tabela
        doc.autoTable({
            head: [headers],
            body: data,
            startY: 40,
            styles: {
                fontSize: 8,
                cellPadding: 2
            },
            headStyles: {
                fillColor: [22, 160, 133],
                textColor: 255
            }
        });
        
        // Salvar PDF
        doc.save(`inscricoes_${type}_${new Date().toISOString().slice(0,10)}.pdf`);
        
        showAlert('success', 'PDF gerado com sucesso!');
        closeModal('export-pdf-modal');
    } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        showAlert('error', 'Erro ao gerar PDF');
    }
}

// Função para exportar inscrição individual
async function exportSingleToPDF(id) {
    try {
        const inscricao = await getInscricaoDetails(id);
        if (!inscricao) return;
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Configuração do documento
        doc.setFontSize(16);
        doc.text('Ficha de Inscrição', 105, 20, { align: 'center' });
        
        // Adicionar logo (opcional)
        // doc.addImage(logoData, 'JPEG', 10, 10, 30, 15);
        
        // Informações básicas
        doc.setFontSize(12);
        doc.text(`Nº de Processo: ${inscricao.numero_do_processo}`, 14, 40);
        doc.text(`Nome: ${inscricao.nome_completo}`, 14, 50);
        doc.text(`Curso: ${inscricao.nome_do_curso || 'N/A'}`, 14, 60);
        doc.text(`Estado: ${getStatusText(inscricao.aprovacao)}`, 14, 70);
        
        // Criar tabela com detalhes
        const details = [
            ['Data Nascimento', formatDate(inscricao.data_de_nascimento)],
            ['Naturalidade', inscricao.natural_de],
            ['Província', inscricao.provincia],
            ['Contacto Aluno', inscricao.contacto_do_aluno],
            ['Contacto Encarregado', inscricao.contacto_do_encarregado],
            ['Documento Identificação', `${inscricao.tipo_de_identificacao}: ${inscricao.numero_de_identificacao}`],
            ['Data Validade', inscricao.data_de_validade || 'N/A'],
            ['Classe', inscricao.classe],
            ['Turno', inscricao.turno],
            ['Observações', inscricao.comentario || 'Nenhuma']
        ];
        
        doc.autoTable({
            startY: 80,
            head: [['Campo', 'Valor']],
            body: details,
            columnStyles: {
                0: { fontStyle: 'bold', cellWidth: 70 },
                1: { cellWidth: 'auto' }
            }
        });
        
        // Adicionar assinaturas (opcional)
        doc.text('Assinatura do Responsável:', 50, doc.lastAutoTable.finalY + 20);
        doc.text('__________________________', 50, doc.lastAutoTable.finalY + 30);
        
        doc.save(`inscricao_${id}_${inscricao.nome_completo.replace(/\s+/g, '_')}.pdf`);
        
        showAlert('success', 'PDF da inscrição gerado com sucesso!');
    } catch (error) {
        console.error('Erro ao gerar PDF individual:', error);
        showAlert('error', 'Erro ao gerar PDF da inscrição');
    }
}

// Funções auxiliares
async function fetchInscricoes(type) {
    // Implementar lógica para buscar inscrições (todos ou filtrados)
    // Pode ser similar à sua função atual de carregar inscrições
    const url = type === 'all' ? 
        `${API_BASE_URL}?action=get_all` : 
        `${API_BASE_URL}?action=get_filtered&filter=${getCurrentFilters()}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    return data.success ? data.data : [];
}

function getStatusText(status) {
    switch(status) {
        case 1: return 'Aprovado';
        case 2: return 'Rejeitado';
        default: return 'Pendente';
    }
}

function getCurrentFilters() {
    // Retorna os filtros atuais como uma string para a URL
    const searchTerm = document.getElementById('search-input').value;
    const statusFilter = document.getElementById('status-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    
    return JSON.stringify({
        search: searchTerm,
        status: statusFilter,
        date: dateFilter
    });
}

// Funções auxiliares
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-AO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function downloadDocument(filename) {
    // Implementação real precisaria de um endpoint para download
    const url = `../uploads/${filename}`;
    window.open(url, '_blank');
}

function showAlert(type, message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}

// Função para carregar as inscrições
async function loadInscricoes() {
    try {
        const response = await fetch(`${API_BASE_URL}?action=get_all`);
        const data = await response.json();
        
        if (data.success) {
            renderInscricoesTable(data.data);
        } else {
            showAlert('error', data.message || 'Erro ao carregar inscrições');
        }
    } catch (error) {
        console.error('Erro:', error);
        showAlert('error', 'Erro ao conectar com o servidor');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Carregar inscrições ao iniciar
    loadInscricoes();
    
    // Configurar formulário de nova inscrição
    const inscricaoForm = document.getElementById('form-matricula');
    inscricaoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(inscricaoForm);
        formData.append('action', 'post');
        
        registrarInscricao(formData);
    });
    
    // Configurar formulário de edição
    const editForm = document.getElementById('edit-inscricao-form');
    editForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(editForm);
        const id = document.getElementById('edit-id').value;
        
        editarInscricao(id, formData);
    });
    
    // Configurar botões de filtro
    document.getElementById('apply-filters').addEventListener('click', applyFilters);
    
    // Fechar modais ao clicar fora
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    });
});

// Função para aplicar filtros
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const statusFilter = document.getElementById('status-filter').value;
    const dateFilter = document.getElementById('date-filter').value;
    
    document.querySelectorAll('#inscricoes-table tbody tr').forEach(row => {
        const nome = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const curso = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        const status = row.querySelector('.status').textContent;
        const dataInscricao = row.querySelector('td:nth-child(5)').textContent;
        
        const matchesSearch = nome.includes(searchTerm) || curso.includes(searchTerm);
        const matchesStatus = !statusFilter || status === statusFilter;
        const matchesDate = !dateFilter || dataInscricao.includes(dateFilter);
        
        row.style.display = matchesSearch && matchesStatus && matchesDate ? '' : 'none';
    });
}

// Função para resetar o formulário
function resetForm() {
    document.getElementById('form-matricula').reset();
}

// Mostrar nome do usuário
document.getElementById("nomeUsuario").innerText = localStorage.getItem("email") || "Admin User";