
// Funções para manipular os modais
function openModalPublicarEvento() {
    document.getElementById('modal-publicar-evento').showModal();
}

function closeModalPublicarEvento() {
    document.getElementById('modal-publicar-evento').close();
}

function openModalEditarEvento() {
    document.getElementById('modal-editar-evento').showModal();
}

function closeModalEditarEvento() {
    document.getElementById('modal-editar-evento').close();
}

function openModalExcluirEvento() {
    document.getElementById('modal-excluir-evento').showModal();
}

function closeModalExcluirEvento() {
    document.getElementById('modal-excluir-evento').close();
}

function confirmarExclusaoEvento() {
    // Lógica para excluir o evento
    alert('Evento excluído com sucesso!');
    closeModalExcluirEvento();
}

function openModalNotifications() {
    document.getElementById('modal-notificacoes').showModal();
}

function closeModalNotifications() {
    document.getElementById('modal-notificacoes').close();
}

// Fechar modais ao clicar fora do conteúdo
document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('click', (e) => {
        const dialogDimensions = dialog.getBoundingClientRect();
        if (
            e.clientX < dialogDimensions.left ||
            e.clientX > dialogDimensions.right ||
            e.clientY < dialogDimensions.top ||
            e.clientY > dialogDimensions.bottom
        ) {
            dialog.close();
        }
    });
});



document.getElementById('form-editar-evento').addEventListener('submit', function(e) {
    e.preventDefault();
    alert('Evento atualizado com sucesso!');
    closeModalEditarEvento();
});

document.getElementById("nomeUsuario").innerText = localStorage.getItem("email") || "Admin User";
