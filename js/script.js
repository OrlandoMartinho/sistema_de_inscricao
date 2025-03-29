 // Mobile menu toggle
 document.querySelector('.mobile-menu-btn').addEventListener('click', function() {
  document.querySelector('.menu').classList.toggle('active');
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      document.querySelector(this.getAttribute('href')).scrollIntoView({
          behavior: 'smooth'
      });
      
      // Close mobile menu if open
      document.querySelector('.menu').classList.remove('active');
  });
});


// Funções para o modal
function openModal(courseName) {
  document.getElementById('courseName').value = courseName;
  document.getElementById('modalTitle').textContent = `Candidatura para: ${courseName}`;
  document.getElementById('applyModal').style.display = 'block';
  document.body.style.overflow = 'hidden'; // Impede scroll da página principal
}

function closeModal() {
  document.getElementById('applyModal').style.display = 'none';
  document.body.style.overflow = 'auto'; // Restaura scroll da página principal
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
  const modal = document.getElementById('applyModal');
  if (event.target == modal) {
      closeModal();
  }
}

// Envio do formulário
document.getElementById('applicationForm').addEventListener('submit', function(e) {
  e.preventDefault();
  
  // Aqui você pode adicionar a lógica para enviar os dados
  alert('Candidatura enviada com sucesso! Entraremos em contato em breve.');
  closeModal();
  
  // Limpar formulário
  this.reset();
});