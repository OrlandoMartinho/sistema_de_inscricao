    // Variável global para controlar a inscrição atual
    let currentInscricaoId = null;
    const { jsPDF } = window.jspdf;

   


   // Função para abrir o modal de exportação
function openExportModal() {
  document.getElementById('export-pdf-modal').style.display = 'block';
}

function exportToPDF(type) {
  try {
      // Verifica se jsPDF está disponível
      if (!window.jspdf) {
          throw new Error("A biblioteca jsPDF não foi carregada corretamente");
      }

      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4"
      });

      // Fechar o modal
      closeModal('export-pdf-modal');

      // Obter os dados da tabela
      const headers = [];
      const tableData = [];
      
      // Obter cabeçalhos (ignorando colunas de ação e decisão)
      document.querySelectorAll('#inscricoes-table thead th').forEach((th, index) => {
          if (index < 6) { // Pega apenas as primeiras 6 colunas
              headers.push({
                  title: th.textContent.trim(),
                  dataKey: index.toString()
              });
          }
      });

      // Obter dados conforme o tipo selecionado
      const rows = type === 'all' 
          ? document.querySelectorAll('#inscricoes-table tbody tr') 
          : getFilteredRows();

      // Processar as linhas
      rows.forEach(row => {
          const rowData = {};
          const cells = row.querySelectorAll('td');
          
          cells.forEach((cell, index) => {
              if (index < 6) { // Pega apenas as primeiras 6 colunas
                  const value = index === 5 
                      ? cell.querySelector('span').textContent.trim()
                      : cell.textContent.trim();
                  rowData[index.toString()] = value;
              }
          });
          
          tableData.push(rowData);
      });

      // Configurações de página
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;

      // Adicionar logo (com fallback caso a imagem não carregue)
      try {
          const logoUrl = '../assets/logo-branco.png';
          const logoWidth = 40;
          const logoHeight = 20;
          const logoX = (pageWidth - logoWidth) / 2;
          
          doc.addImage(logoUrl, 'PNG', logoX, 10, logoWidth, logoHeight);
      } catch (e) {
          console.warn("Não foi possível carregar a logo:", e);
      }

      // Título centralizado
      doc.setFontSize(16);
      doc.setTextColor(40, 40, 40);
      doc.text('Relatório de Inscrições', pageWidth / 2, 30, { align: 'center' });

      // Informações do relatório
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      
      const infoLines = [
          `Tipo: ${type === 'all' ? 'Todos os registros' : 'Dados filtrados'}`,
          `Data de exportação: ${new Date().toLocaleDateString('pt-PT')}`,
          `Total de registros: ${tableData.length}`
      ];
      
      infoLines.forEach((line, i) => {
          doc.text(line, pageWidth / 2, 40 + (i * 5), { align: 'center' });
      });

      // Configurações da tabela
      const tableConfig = {
          startY: 55,
          margin: { left: margin, right: margin },
          head: [headers.map(h => h.title)],
          body: tableData.map(row => headers.map(h => row[h.dataKey])),
          theme: 'grid',
          headStyles: {
              fillColor: [41, 128, 185],
              textColor: 255,
              fontStyle: 'bold',
              halign: 'center'
          },
          bodyStyles: {
              halign: 'left',
              valign: 'middle'
          },
          alternateRowStyles: {
              fillColor: [240, 240, 240]
          },
          styles: {
              fontSize: 9,
              cellPadding: 3,
              overflow: 'linebreak',
              textColor: [40, 40, 40]
          },
          columnStyles: {
              0: { cellWidth: 15, halign: 'center' }, // ID
              1: { cellWidth: 30, halign: 'left' },   // Nome
              2: { cellWidth: 25, halign: 'left' },    // Curso
              3: { cellWidth: 40, halign: 'left' },    // Requisitos
              4: { cellWidth: 20, halign: 'center' },  // Data
              5: { cellWidth: 15, halign: 'center' }   // Status
          }
      };

      // Gerar a tabela principal
      doc.autoTable(tableConfig);

      // Adicionar área de assinatura
      const finalY = doc.lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.text('Assinatura do Responsável:', pageWidth / 2, finalY, { align: 'center' });
      
      // Linha para assinatura
      doc.setDrawColor(150, 150, 150);
      const lineLength = 60;
      doc.line((pageWidth - lineLength) / 2, finalY + 5, (pageWidth + lineLength) / 2, finalY + 5);

      // Rodapé
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Instituto 30 de Setembro - Sistema de Gestão de Inscrições', pageWidth / 2, doc.internal.pageSize.height - 15, { align: 'center' });
      doc.text(`Gerado em: ${new Date().toLocaleString('pt-PT')}`, pageWidth / 2, doc.internal.pageSize.height - 10, { align: 'center' });

      // Salvar o PDF
      doc.save(`Inscricoes_${type === 'all' ? 'completas' : 'filtradas'}_${new Date().toLocaleDateString('pt-PT').replace(/\//g, '-')}.pdf`);

  } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
  }
}

// Função auxiliar para obter linhas filtradas
function getFilteredRows() {
  const searchTerm = document.getElementById('search-input').value.toLowerCase();
  const statusFilter = document.getElementById('status-filter').value;
  const dateFilter = document.getElementById('date-filter').value;
  
  let rows = document.querySelectorAll('#inscricoes-table tbody tr');
  let filteredRows = [];
  
  rows.forEach(row => {
      const nome = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
      const curso = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
      const status = row.querySelector('td:nth-child(6) span').textContent;
      const dataInscricao = row.getAttribute('data-inscricao');
      
      let matchesSearch = searchTerm === '' || 
                        nome.includes(searchTerm) || 
                        curso.includes(searchTerm);
      
      let matchesStatus = statusFilter === '' || status === statusFilter;
      
      let matchesDate = dateFilter === '' || dataInscricao === dateFilter;
      
      if (matchesSearch && matchesStatus && matchesDate) {
          filteredRows.push(row);
      }
  });
  
  return filteredRows;
}

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
      if (modal && modal.style.display !== 'none') {
          modal.style.display = 'none';
  
          if (modalId === 'export-options-modal') {
              setTimeout(() => {
                  if (document.getElementById(modalId)) {
                      document.getElementById(modalId).remove();
                  }
              }, 100); // Pequeno delay para evitar remoções múltiplas
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