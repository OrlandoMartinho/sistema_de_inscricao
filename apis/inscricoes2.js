
  
//   document.addEventListener('DOMContentLoaded', function() {
//       // Variáveis globais
//       let currentInscricaoId = null;
//       let inscricoesData = [];
      
//       // Inicialização
//       loadInscricoes();
   
      
//       // Event Listeners
//       document.getElementById('search-input').addEventListener('keyup', function(e) {
//           if (e.key === 'Enter') {
//               applyFilters();
//           }
//       });
      
//       // Carregar inscrições do servidor
//       function loadInscricoes() {
//           fetch('../controllers/inscricoes.php', {
//               method: 'GET',
//               headers: {
//                   'Content-Type': 'application/json',
//                   'Authorization': 'Bearer ' + localStorage.getItem('token')
//               }
//           })
//           .then(response => response.json())
//           .then(data => {
//               if (data.success) {
//                   inscricoesData = data.data;
//                   renderInscricoesTable(inscricoesData);
//               } else {
//                   showMessage('error', 'Erro ao carregar inscrições: ' + data.message);
//               }
//           })
//           .catch(error => {
//               console.error('Error:', error);
//               showMessage('error', 'Erro ao conectar com o servidor');
//           });
//       }
      
//       // Renderizar tabela de inscrições
//       function renderInscricoesTable(data) {
//           const tableBody = document.querySelector('#inscricoes-table tbody');
//           tableBody.innerHTML = '';
//           console.log(data);


//           data.forEach(inscricao => {
//               const row = document.createElement('tr');
//               row.setAttribute('data-inscricao', inscricao.data_de_criacao);
              
//               // Status badge
//               let statusBadge = '';
//               if (inscricao.aprovacao === 1) {
//                   statusBadge = '<span class="status accepted">Aprovado</span>';
//               } else if (inscricao.aprovacao === 0 && inscricao.comentario) {
//                   statusBadge = '<span class="status rejected">Rejeitado</span>';
//               } else {
//                   statusBadge = '<span class="status pending">Pendente</span>';
//               }
              
//               // Botões de ação
//               const actionButtons = `
//                   <button class="btn-view" onclick="openViewModal(${inscricao.id_inscricao})">Visualizar</button>
//               `;
              
//               // Botões de decisão
//               const decisionButtons = `
//                   <button class="btn-approve" onclick="approveInscricao(${inscricao.id_inscricao})">Aprovar</button>
//                   <button class="btn-reject" onclick="rejectInscricao(${inscricao.id_inscricao})">Rejeitar</button>
//               `;
//             //   <th>Id</th>
//             //                 <th>Nome completo</th>
//             //                 <th>Curso</th>
//             //                 <th>Data de inscrição</th>
//             //                 <th>Status</th>
//             //                 <th>Ação</th>
//             //                 <th>Decisão</th>
//             //   // Preencher linha
//               row.innerHTML = `
//                   <td>${inscricao.id_inscricao}</td>
//                   <td>${inscricao.nome_completo}</td>
//                     <td>${inscricao.nome_completo}</td>
//                     <td>${inscricao.nome_completo}</td>
//                        <td>${inscricao.nome_completo}</td>
//                           <td>${inscricao.nome_completo}</td>
//                              <td>${inscricao.nome_completo}</td>
                 
//                 //   <td>${actionButtons} actions </td>
//                 //   <td>${decisionButtons}</td>
//                 //   <td>${decisionButtons}</td>
//               `;
              
//               tableBody.appendChild(row);
//           });
//       }
      
//       // Formatar requisitos
//       function getRequisitosFormatados(inscricao) {
//           const docs = [];
//           if (inscricao.arquivo_de_identificacao) docs.push('Identificação');
//           if (inscricao.foto_tipo_passe) docs.push('Foto');
//           return docs.join(', ') || 'Nenhum documento enviado';
//       }
      
//       // Formatar data
//       function formatDate(dateString) {
//           const date = new Date(dateString);
//           return date.toLocaleDateString('pt-PT');
//       }
      
  
    
    
//   });
 
 
const userData = JSON.parse(localStorage.getItem('user_data'));
const nome = userData.nome || 'Nome não disponível'; // Substitua pelo valor real
const email = userData.email || 'Email não disponível'; // Substitua pelo valor real


// Atualiza o nome exibido na barra superior
document.getElementById('nomeUsuario').textContent = nome;