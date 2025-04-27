// definicoes.js

document.addEventListener('DOMContentLoaded', function() {

    
    // Configura os event listeners dos formulários
    setupFormListeners();
});
function setupFormListeners() {
    // Formulário de segurança (alteração de senha)
    const formSeguranca = document.getElementById('form-seguranca');
    if (formSeguranca) {
        formSeguranca.addEventListener('submit', function(e) {
            e.preventDefault();
            updatePassword();
        });
    }
    
    // Formulário de perfil
    const formPerfil = document.getElementById('form-perfil');
    if (formPerfil) {
        formPerfil.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
}

function updateProfile() {
    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const userData = JSON.parse(localStorage.getItem('user_data'));
    
    if (!userData || !userData.id_usuario) {
        showErrorMessage('Não foi possível  carregar a pagina faça o login novamente', 'Ocorreu um erro', 3000);
        window.location.href = 'login.html';
        return;
    }
    
    const data = {
        action: 'update_profile',
        user_id: userData.id_usuario,
        name: nome,
        email: email
    };

    const formData = new FormData();
    formData.append('action', 'update_profile');    
    formData.append('user_id', userData.id_usuario);    
    formData.append('name', nome);  
    formData.append('email', email);    

    
    fetch('../controllers/admin.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(async data => {
        if (data.success) {
            showMessage('success', 'Sucesso', data.message);
            closeModalPerfil();
            await showSuccessMessage(
                'Seus dados foram actualizados com sucesso!', 
                'Perfil actualizado com sucesso',
                'success',
                'ENJOY YOUR STAY',
                3000 // auto-close after 3 seconds
            );
            // Atualiza os dados locais do usuário
            const userData = JSON.parse(localStorage.getItem('user_data'));
            userData.nome = nome;
            userData.email = email;
            localStorage.setItem('userData', JSON.stringify(userData));
            
            // Atualiza o nome exibido na barra superior
            document.getElementById('nomeUsuario').textContent = nome;
        } else {
            showErrorMessage('Não foi possível enviar a actualizar os seus dados', 'Ocorreu um erro', 3000);
        }
    })
    .catch(error => {
        showErrorMessage('Não foi possível actualizar os seus dados', 'Ocorreu um erro', 3000);
        console.error('Error:', error);
    });
}

function updatePassword() {
    const senhaAtual = document.getElementById('senha-atual').value;
    const novaSenha = document.getElementById('nova-senha').value;
    const confirmarSenha = document.getElementById('confirmar-senha').value;
    const userData = JSON.parse(localStorage.getItem('user_data'));
    
    console.log('Starting password update process...');
    console.log('User data from localStorage:', userData);
    
    if (!userData || !userData.id_usuario) {
        console.error('User data not found or invalid');
        showErrorMessage('Não foi possível  carregar a pagina faça o login novamente', 'Ocorreu um erro', 3000);
        window.location.href = 'login.html';
        return;
    }
    
    console.log('Checking if new passwords match...');
    if (novaSenha !== confirmarSenha) {
        console.error('New passwords do not match');
       
        showErrorMessage('As senhas não coincidem.', 'Ocorreu um erro', 3000);
        return;
    }
    
    // Verifica se a nova senha é diferente da atual
    if (novaSenha === senhaAtual) {
        console.error('New password is the same as current password');
        showMessage('error', 'Erro', 'A nova senha deve ser diferente da senha atual.');
        return;
    }
    
    const formData = new FormData();
    formData.append('action', 'update_password');
    formData.append('user_id', userData.id_usuario);  // Corrigido: estava userData.id_id_usuario
    formData.append('current_password', senhaAtual);
    formData.append('new_password', novaSenha); 

    console.log('FormData contents:');
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }
    
    console.log('Sending request to server...');
    fetch('../controllers/admin.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('Received response, parsing JSON...');
        console.log('Response status:', response);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(async data => {
        console.log('Response data:', data);
        if (data.success) {
            console.log('Password update successful');
            await showSuccessMessage(
                'A sua senha foi actualizada com sucesso!', 
                'Senha alterada com sucesso',
                'success',
                'ENJOY YOUR STAY',
                3000 // auto-close after 3 seconds
            );
            closeModalSeguranca();
            
            // Limpa os campos do formulário
            document.getElementById('senha-atual').value = '';
            document.getElementById('nova-senha').value = '';
            document.getElementById('confirmar-senha').value = '';
        } else {
            console.error('Password update failed:', data.message);
            showErrorMessage('Não foi possível  actualizar a sua senha', 'Ocorreu um erro', 3000);
        }
    })
    .catch(error => {
        console.error('Error in fetch request:', error);
        showErrorMessage('Não foi possível  actualizar a sua senha', 'Ocorreu um erro', 3000);
    });
}
// Funções para abrir/fechar modais (já existentes no seu script.js)
function openModalSeguranca() {
    document.getElementById('modal-seguranca').style.display = 'block';
}

function closeModalSeguranca() {
    document.getElementById('modal-seguranca').style.display = 'none';
}

function openModalPerfil() {
    // Preenche o formulário com os dados atuais do usuário
    const userData = JSON.parse(localStorage.getItem('user_data'));
    if (userData) {
        document.getElementById('nome').value = userData.nome;
        document.getElementById('email').value = userData.email;
    }
    
    document.getElementById('modal-perfil').style.display = 'block';
}

function closeModalPerfil() {
    document.getElementById('modal-perfil').style.display = 'none';
}

// Função para exibir mensagens (deve ser compatível com seu message-modal.js)
function showMessage(type, title, message) {
    // Implemente conforme seu sistema de notificações
    console.log(`[${type}] ${title}: ${message}`);
    // Exemplo: createNotificationModal(title, message, type);
}

 
const userData = JSON.parse(localStorage.getItem('user_data'));
const nome = userData.nome || 'Nome não disponível'; // Substitua pelo valor real
const email = userData.email || 'Email não disponível'; // Substitua pelo valor real


// Atualiza o nome exibido na barra superior
document.getElementById('nomeUsuario').textContent = nome;