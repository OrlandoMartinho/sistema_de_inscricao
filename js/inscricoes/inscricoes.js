    // Variável global para controlar a inscrição atual
    let currentInscricaoId = null;
    const { jsPDF } = window.jspdf;

    // Função para mostrar opções de exportação
    function showExportOptions() {
        // Cria o modal de opções
        const modalHTML = `
        <div id="export-options-modal" class="modal" style="display: block;justify-content: center;
    align-items: center;">
            <div class="modal-content" style="max-width: 400px;">
                <span class="close" onclick="closeModal('export-options-modal')">&times;</span>
                <h3>Exportar para PDF</h3>
                <p>Deseja exportar todos os registros ou apenas os filtrados?</p>
                
                <div style="display: flex; gap: 10px; margin-top: 20px;">
                    <button onclick="exportToPDF(true)" style="padding: 10px; background: #16a085; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-database"></i> Todos
                    </button>
                    <button onclick="exportToPDF(false)" style="padding: 10px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-filter"></i> Filtrados
                    </button>
                    <button onclick="closeModal('export-options-modal')" style="padding: 10px; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            </div>
        </div>`;
        
        // Adiciona ao body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    // Função modificada para exportar para PDF
    function exportToPDF(exportAll = true) {
        // Fecha o modal se estiver aberto
        const exportModal = document.getElementById('export-options-modal');
        if (exportModal) exportModal.remove();
        
        const doc = new jsPDF();
        const table = document.getElementById('inscricoes-table');
        const title = "Relatório de Inscrições";
        const date = new Date().toLocaleDateString();
        
        // Adiciona título e data
        doc.setFontSize(18);
        doc.text(title, 14, 15);
        doc.setFontSize(11);
        doc.text(`Data: ${date}`, 14, 22);
        doc.text(`Tipo: ${exportAll ? 'Todos registros' : 'Registros filtrados'}`, 14, 29);
        
        // Extrai dados da tabela
        const data = [];
        const headers = [];
        
        // Pega cabeçalhos (ignorando as duas últimas colunas de ações)
        table.querySelectorAll('thead th').forEach((th, index) => {
            if (index < table.querySelectorAll('thead th').length - 2) {
                headers.push(th.textContent);
            }
        });
        
        // Pega linhas de dados (todos ou apenas os filtrados)
        const rows = exportAll 
            ? table.querySelectorAll('tbody tr') 
            : table.querySelectorAll('tbody tr:not([style*="display: none"])');
        
        // Verifica se há dados para exportar
        if (rows.length === 0) {
            alert(exportAll ? 'Não há registros para exportar.' : 'Não há registros visíveis após o filtro.');
            return;
        }
        
        // Processa as linhas
        rows.forEach(tr => {
            const row = [];
            tr.querySelectorAll('td').forEach((td, index) => {
                if (index < tr.querySelectorAll('td').length - 2) {
                    // Remove HTML dos status
                    const text = index === 5 ? td.textContent.trim() : td.textContent;
                    row.push(text);
                }
            });
            data.push(row);
        });
        
        // Adiciona tabela ao PDF
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
                textColor: 255,
                fontStyle: 'bold'
            },
            didDrawPage: function(data) {
                // Adiciona número da página
                doc.setFontSize(10);
                doc.text(`Página ${doc.internal.getNumberOfPages()}`, 
                    data.settings.margin.left, 
                    doc.internal.pageSize.height - 10);
            }
        });
        
        // Salva o PDF
        const exportType = exportAll ? 'completo' : 'filtrado';
        doc.save(`inscricoes_${exportType}_${new Date().toISOString().slice(0,10)}.pdf`);
    }

    // Modifica o evento do botão Exportar PDF para mostrar as opções
    document.querySelector('.export-btn').addEventListener('click', showExportOptions);

    // Funções para abrir/fechar modais (mantidas)
    function openViewModal(id) {
        currentInscricaoId = id;
        // Simulação de dados - na prática, você buscaria esses dados de uma API
        const inscricoes = {
            1: { nome: "Fulano da Silva", curso: "Electricidade", data: "12/12/2022", estado: "Pendente", documentos: ["Certificado.pdf", "BI.pdf", "Foto1.jpg", "Foto2.jpg"], parecer: "Aguardando análise do coordenador do curso." },
            2: { nome: "Sicrano da Silva", curso: "Informática", data: "15/12/2022", estado: "Aceite", documentos: ["Certificado.pdf", "BI.pdf", "Foto1.jpg", "Foto2.jpg"], parecer: "Documentação completa e adequada. Aprovado pelo coordenador." },
            3: { nome: "Alberto Moisés", curso: "Electricidade", data: "18/12/2022", estado: "Rejeitado", documentos: ["Certificado.pdf", "BI.pdf"], parecer: "Faltam documentos obrigatórios (fotos)." }
        };
        
        const inscricao = inscricoes[id];
        document.getElementById('view-nome').textContent = inscricao.nome;
        document.getElementById('view-curso').textContent = inscricao.curso;
        document.getElementById('view-data').textContent = inscricao.data;
        
        // Atualiza o status com a classe correta
        const estadoElement = document.getElementById('view-estado');
        estadoElement.innerHTML = `<span class="status ${inscricao.estado.toLowerCase()}">${inscricao.estado}</span>`;
        
        // Preenche os documentos
        const documentosContainer = document.getElementById('view-documentos');
        documentosContainer.innerHTML = inscricao.documentos.map(doc => 
            `<div class="document-item"><i class="fas fa-file"></i> ${doc}</div>`
        ).join('');
        
        // Preenche o parecer
        document.getElementById('view-parecer').textContent = inscricao.parecer;
        
        // Abre o modal
        document.getElementById('view-inscricao-modal').style.display = 'block';
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            // Remove o modal de exportação se existir
            if (modalId === 'export-options-modal') {
                modal.remove();
            }
        }
    }

    // Funções para aprovar/rejeitar inscrições
    function approveInscricao(id) {
        currentInscricaoId = id;
        document.getElementById('decision-title').textContent = 'Aprovar Inscrição';
        document.getElementById('decision-id').value = id;
        document.getElementById('decision-type').value = 'approve';
        document.getElementById('decision-comment').value = '';
        document.getElementById('decision-modal').style.display = 'block';
    }

    function rejectInscricao(id) {
        currentInscricaoId = id;
        document.getElementById('decision-title').textContent = 'Rejeitar Inscrição';
        document.getElementById('decision-id').value = id;
        document.getElementById('decision-type').value = 'reject';
        document.getElementById('decision-comment').value = '';
        document.getElementById('decision-modal').style.display = 'block';
    }

    function confirmDecision() {
        const id = document.getElementById('decision-id').value;
        const type = document.getElementById('decision-type').value;
        const comment = document.getElementById('decision-comment').value;
        
        // Atualiza a tabela (na prática, você enviaria para uma API)
        const row = document.querySelector(`#inscricoes-table tbody tr:nth-child(${id})`);
        if (row) {
            const statusCell = row.querySelector('td:nth-child(6)');
            if (type === 'approve') {
                statusCell.innerHTML = '<span class="status accepted">Aceite</span>';
                // Atualiza o parecer na visualização
                if (id == currentInscricaoId) {
                    document.getElementById('view-parecer').textContent = comment || "Inscrição aprovada.";
                    document.getElementById('view-estado').innerHTML = '<span class="status accepted">Aceite</span>';
                }
            } else {
                statusCell.innerHTML = '<span class="status rejected">Rejeitado</span>';
                // Atualiza o parecer na visualização
                if (id == currentInscricaoId) {
                    document.getElementById('view-parecer').textContent = comment || "Inscrição rejeitada.";
                    document.getElementById('view-estado').innerHTML = '<span class="status rejected">Rejeitado</span>';
                }
            }
        }
        
        closeModal('decision-modal');
        alert(`Inscrição ${type === 'approve' ? 'aprovada' : 'rejeitada'} com sucesso!`);
    }

    // Função para aplicar filtros
    function applyFilters() {
        const searchText = document.getElementById('search-input').value.toLowerCase();
        const statusFilter = document.getElementById('status-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        
        const rows = document.querySelectorAll('#inscricoes-table tbody tr');
        
        rows.forEach(row => {
            const nome = row.cells[1].textContent.toLowerCase();
            const curso = row.cells[2].textContent.toLowerCase();
            const data = row.cells[4].textContent;
            const status = row.cells[5].textContent.trim();
            
            const matchesSearch = nome.includes(searchText) || curso.includes(searchText);
            const matchesStatus = !statusFilter || status === statusFilter;
            const matchesDate = !dateFilter || data === formatDate(new Date(dateFilter));
            
            row.style.display = matchesSearch && matchesStatus && matchesDate ? '' : 'none';
        });
    }

    function formatDate(date) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Função para baixar inscrição
    function downloadInscricao(id) {
        // Simulação - na prática você buscaria os dados completos da API
        const inscricao = {
            1: { nome: "Fulano da Silva", curso: "Electricidade", data: "12/12/2022", estado: "Pendente", documentos: ["Certificado.pdf", "BI.pdf", "Foto1.jpg", "Foto2.jpg"], parecer: "Aguardando análise do coordenador do curso." },
            2: { nome: "Sicrano da Silva", curso: "Informática", data: "15/12/2022", estado: "Aceite", documentos: ["Certificado.pdf", "BI.pdf", "Foto1.jpg", "Foto2.jpg"], parecer: "Documentação completa e adequada. Aprovado pelo coordenador." },
            3: { nome: "Alberto Moisés", curso: "Electricidade", data: "18/12/2022", estado: "Rejeitado", documentos: ["Certificado.pdf", "BI.pdf"], parecer: "Faltam documentos obrigatórios (fotos)." }
        }[id];
        
        const doc = new jsPDF();
        
        // Cabeçalho
        doc.setFontSize(18);
        doc.text('Detalhes da Inscrição', 105, 15, { align: 'center' });
        doc.setFontSize(12);
        doc.text(`ID: ${id}`, 14, 25);
        
        // Informações básicas
        doc.setFontSize(14);
        doc.text('Informações do Candidato', 14, 35);
        doc.setFontSize(12);
        doc.text(`Nome: ${inscricao.nome}`, 14, 45);
        doc.text(`Curso: ${inscricao.curso}`, 14, 55);
        doc.text(`Data de Inscrição: ${inscricao.data}`, 14, 65);
        doc.text(`Status: ${inscricao.estado}`, 14, 75);
        
        // Documentos
        doc.setFontSize(14);
        doc.text('Documentos Anexados:', 14, 90);
        doc.setFontSize(12);
        inscricao.documentos.forEach((docName, index) => {
            doc.text(`- ${docName}`, 20, 100 + (index * 5));
        });
        
        // Parecer
        doc.setFontSize(14);
        doc.text('Parecer:', 14, 120);
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(inscricao.parecer, 180);
        doc.text(splitText, 14, 130);
        
        // Rodapé
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleString()}`, 14, 280);
        
        doc.save(`inscricao_${id}_${inscricao.nome.replace(/\s/g, '_')}.pdf`);
    }