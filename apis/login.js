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
      showSuccessMessage(
        data.mensagem,
        'Logon efectuado com sucesso',
        'success',
        'ENJOY YOUR STAY',
        3000 // auto-close after 3 seconds
    );
      window.location.href = 'home.html';
    } else {
        showErrorMessage('Os seus dados de Login estão incorretos', 'Credenciais inválidas', 3000);
    }

  } catch (error) {
    console.error('❌ Erro na requisição:', error);
 
    showErrorMessage('Erro ao tentar fazer login. Tente novamente.', 'Erro no servidor', 3000);
  }
});
