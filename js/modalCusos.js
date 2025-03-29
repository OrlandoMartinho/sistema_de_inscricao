function openModalCurso(id = null) {
  const modalContainer = document.getElementById('curso-modal-container');
  
  // Limpar modal existente
  modalContainer.innerHTML = '';
  
  // Determinar se é criação ou edição
  const isEdit = id !== null;
  const title = isEdit ? 'Editar Curso' : 'Adicionar Novo Curso';
  
  // Criar conteúdo do modal
  modalContainer.innerHTML = `
      <div class="modal">
          <div class="modal-content">
              <div class="modal-header">
                  <h3>${title}</h3>
                  <i data-lucide="x" class="close-modal" onclick="closeModal('curso-modal-container')"></i>
              </div>
              <form id="curso-form">
                  <div class="form-group">
                      <label for="curso-nome">Nome do Curso</label>
                      <input type="text" id="curso-nome" required value="${isEdit ? 'Nome do Curso ' + id : ''}">
                  </div>
                  
                  <div class="form-row">
                      <div class="form-group">
                          <label for="curso-area">Área</label>
                          <select id="curso-area" required>
                              <option value="">Selecione uma área</option>
                              <option value="engenharia" ${isEdit && id === 1 ? 'selected' : ''}>Engenharia</option>
                              <option value="tecnologia" ${isEdit && id === 2 ? 'selected' : ''}>Tecnologia</option>
                              <option value="mecanica" ${isEdit && id === 3 ? 'selected' : ''}>Mecânica</option>
                              <option value="administracao" ${isEdit && id === 4 ? 'selected' : ''}>Administração</option>
                          </select>
                      </div>
                      
                      <div class="form-group">
                          <label for="curso-duracao">Duração (meses)</label>
                          <input type="number" id="curso-duracao" min="1" required value="${isEdit ? (id === 1 ? 6 : id === 2 ? 3 : id === 3 ? 9 : 4) : ''}">
                      </div>
                  </div>
                  
                  <div class="form-row">
                      <div class="form-group">
                          <label for="curso-vagas">Vagas disponíveis</label>
                          <input type="number" id="curso-vagas" min="1" required value="${isEdit ? (id === 1 ? 25 : id === 2 ? 30 : id === 3 ? 20 : 35) : ''}">
                      </div>
                      
                      <div class="form-group">
                          <label for="curso-estado">Estado</label>
                          <select id="curso-estado" required>
                              <option value="ativo" ${isEdit && id !== 3 ? 'selected' : ''}>Ativo</option>
                              <option value="inativo" ${isEdit && id === 3 ? 'selected' : ''}>Inativo</option>
                          </select>
                      </div>
                  </div>
                  
                  <div class="form-group">
                      <label for="curso-descricao">Descrição</label>
                      <textarea id="curso-descricao" rows="4">${isEdit ? `Descrição do curso ${id}. Este curso fornece conhecimentos essenciais na área.` : ''}</textarea>
                  </div>
                  
                  <div class="form-group">
                      <label for="curso-requisitos">Requisitos</label>
                      <textarea id="curso-requisitos" rows="2">${isEdit ? 'Certificado do ensino médio, BI, 2 fotos tipo passe' : ''}</textarea>
                  </div>
                  
                  <div class="modal-actions">
                      <button type="button" class="btn-cancel" onclick="closeModal('curso-modal-container')">Cancelar</button>
                      <button type="submit" class="btn-submit">${isEdit ? 'Atualizar' : 'Salvar'}</button>
                  </div>
              </form>
          </div>
      </div>
  `;
  
  // Mostrar modal
  modalContainer.style.display = 'block';
  
  // Inicializar ícones
  lucide.createIcons();
  
  // Adicionar evento de submit
  document.getElementById('curso-form').addEventListener('submit', function(e) {
      e.preventDefault();
      // Lógica para salvar/atualizar curso
      alert(`Curso ${isEdit ? 'atualizado' : 'criado'} com sucesso!`);
      closeModal('curso-modal-container');
  });
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
}