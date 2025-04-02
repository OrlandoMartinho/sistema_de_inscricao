     
// Funções para abrir modais
function openModalSeguranca() {
    document.getElementById('modal-seguranca').style.display = 'block';
}

function openModalPerfil() {
    document.getElementById('modal-perfil').style.display = 'block';
}

function openModalNotificacoes() {
    document.getElementById('modal-notificacoes').style.display = 'block';
}

function openModalSistema() {
    document.getElementById('modal-sistema').style.display = 'block';
}

function openModalBackup() {
    document.getElementById('modal-backup').style.display = 'block';
}

function openModalNotifications() {
    document.getElementById('modal-notifications').style.display = 'block';
}

// Funções para fechar modais
function closeModalSeguranca() {
    document.getElementById('modal-seguranca').style.display = 'none';
}

function closeModalPerfil() {
    document.getElementById('modal-perfil').style.display = 'none';
}

function closeModalNotificacoes() {
    document.getElementById('modal-notificacoes').style.display = 'none';
}

function closeModalSistema() {
    document.getElementById('modal-sistema').style.display = 'none';
}

function closeModalBackup() {
    document.getElementById('modal-backup').style.display = 'none';
}

function closeModalNotifications() {
    document.getElementById('modal-notifications').style.display = 'none';
}

// Fechar modais ao clicar fora do conteúdo
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
}

// Funções de exemplo para backup
function criarBackup() {
    alert('Backup criado com sucesso!');
    // Aqui iria a lógica real de criação de backup
}

function restaurarBackup() {
    const arquivo = document.getElementById('arquivo-backup').files[0];
    if (arquivo) {
        alert(`Backup ${arquivo.name} será restaurado. Confirma?`);
        // Aqui iria a lógica real de restauração
    } else {
        alert('Selecione um arquivo de backup primeiro.');
    }
}

function marcarTodasComoLidas() {
    const notificacoes = document.querySelectorAll('.notification-item.unread');
    notificacoes.forEach(not => not.classList.remove('unread'));
    alert('Todas as notificações marcadas como lidas.');
}
