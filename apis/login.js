const form = document.getElementById('loginForm');

form.addEventListener('submit', async function(e) {
  e.preventDefault();

  const formData = new FormData(form);

  // Exibir os dados que serão enviados
  console.log("🔄 Enviando os seguintes dados:");
  for (let pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }

  try {
    const response = await fetch('../controllers/autenticacao.php', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    // Mostrar a resposta recebida do servidor
    console.log("✅ Resposta do servidor:", data);

    if (data.status === 'success') {
      alert(data.mensagem);
      window.location.href = 'home.html';
    } else {
      alert(data.mensagem);
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error);
    alert('Erro ao tentar fazer login. Tente novamente.');
  }
});
