

// Variáveis globais
let currentContactoId = null;
let contactoToDelete = null;

// Dados simulados
const contactosData = {
    1: {
        remetente: "João Carlos",
        email: "joao@email.com",
        assunto: "Dúvida sobre inscrição",
        data: "12/12/2022",
        estado: "Não respondido",
        mensagem: "Bom dia, gostaria de saber se ainda estão abertas as inscrições para o curso de Electricidade Industrial e quais os documentos necessários para me inscrever. Aguardo resposta, obrigado.",
        resposta: ""
    },
    2: {
        remetente: "Maria Fernandes",
        email: "maria@email.com",
        assunto: "Informação sobre cursos",
        data: "10/12/2022",
        estado: "Respondido",
        mensagem: "Olá, gostaria de obter mais informações sobre os cursos disponíveis para o próximo semestre, especialmente na área de informática. Quais são os horários disponíveis?",
        resposta: "Prezada Maria,\n\nAgradecemos o seu contacto. Os cursos de informática para o próximo semestre são: Informática Básica (segundas e quartas, 18h-20h), Programação Web (terças e quintas, 19h-21h) e Redes de Computadores (sábados, 9h-13h).\n\nAs inscrições estarão abertas até dia 20/12.\n\nAtenciosamente,\nEquipa 30 de Setembro"
    },
    3: {
        remetente: "Pedro Santos",
        email: "pedro@email.com",
        assunto: "Problema com login",
        data: "05/12/2022",
        estado: "Arquivado",
        mensagem: "Boa tarde, estou com dificuldades para aceder ao sistema de inscrição. Quando tento fazer login, recebo uma mensagem de erro. Já tentei recuperar a senha mas não recebi nenhum email. O que devo fazer?",
        resposta: "Caro Pedro,\n\nVerificamos o seu problema e parece que o seu email não estava confirmado no sistema. Já regularizamos a situação e você deve receber um email com instruções para criar uma nova senha dentro das próximas horas.\n\nCaso não receba, por favor entre em contacto novamente.\n\nSaudações,\nSuporte Técnico"
    },
    4: {
        remetente: "Ana Silva",
        email: "ana@email.com",
        assunto: "Reclamação sobre atendimento",
        data: "01/12/2022",
        estado: "Respondido",
        mensagem: "Bom dia, venho por meio desta mensagem expressar minha insatisfação com o atendimento recebido no dia 30/11. Fui mal atendida pelo funcionário da recepção quando fui entregar meus documentos.",
        resposta: "Prezada Ana,\n\nLamentamos muito pela experiência desagradável. Já encaminhamos sua reclamação para o setor responsável e tomaremos as providências necessárias para que situações como esta não se repitam.\n\nAgradecemos seu feedback e pedimos desculpas pelo ocorrido.\n\nAtenciosamente,\nCoordenação"
    }
};

// Função para abrir modal de visualização
function openViewModal(id) {
    currentContactoId = id;
    const contacto = contactosData[id];
    
    if (contacto) {
        document.getElementById('view-remetente').textContent = contacto.remetente;
        document.getElementById('view-email').textContent = contacto.email;
        document.getElementById('view-assunto').textContent = contacto.assunto;
        document.getElementById('view-data').textContent = contacto.data;
        
        // Atualizar estado com a classe CSS correta
        const estadoElement = document.getElementById('view-estado');
        estadoElement.innerHTML = `<span class="status ${contacto.estado.toLowerCase().replace(' ', '-')}">${contacto.estado}</span>`;
        
        // Preencher mensagem
        document.getElementById('view-mensagem').textContent = contacto.mensagem;
        
        // Mostrar resposta se existir
        const respostaContainer = document.getElementById('view-resposta-container');
        const respostaElement = document.getElementById('view-resposta');
        
        if (contacto.resposta) {
            respostaContainer.style.display = 'block';
            respostaElement.textContent = contacto.resposta;
        } else {
            respostaContainer.style.display = 'none';
        }
        
        document.getElementById('view-contacto-modal').style.display = 'block';
    }
}

// Função para abrir modal de resposta
function openReplyModal(id) {
    closeModal('view-contacto-modal');
    currentContactoId = id;
    const contacto = contactosData[id];
    
    if (contacto) {
        document.getElementById('reply-id').value = id;
        document.getElementById('reply-email').textContent = contacto.email;
        document.getElementById('reply-assunto').textContent = `RE: ${contacto.assunto}`;
        document.getElementById('reply-mensagem-original').textContent = contacto.mensagem;
        document.getElementById('reply-resposta').value = contacto.resposta || '';
        
        document.getElementById('reply-contacto-modal').style.display = 'block';
    }
}

// Função para abrir modal de eliminação
function openDeleteModal(id) {
    contactoToDelete = id;
    const contacto = contactosData[id];
    document.getElementById('contacto-delete-name').textContent = `${contacto.remetente} - ${contacto.assunto}`;
    document.getElementById('confirm-modal').style.display = 'block';
}

// Função para eliminar contacto
function deleteContacto() {
    if (contactoToDelete) {
        // Aqui você faria a chamada AJAX para eliminar o contacto
        console.log(`Contacto com ID ${contactoToDelete} eliminado`);
        // Mostrar mensagem de sucesso
        alert(`Mensagem de "${contactosData[contactoToDelete].remetente}" eliminada com sucesso!`);
        
        closeModal('confirm-modal');
        // Recarregar a lista de contactos ou remover a linha da tabela
    }
}

// Função genérica para fechar modais
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Fechar modais ao clicar fora do conteúdo
window.onclick = function(event) {
    if (event.target.className === 'modal') {
        event.target.style.display = 'none';
    }
}

// Manipulação do formulário de resposta
document.getElementById('reply-contacto-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const id = document.getElementById('reply-id').value;
    const resposta = document.getElementById('reply-resposta').value;
    
    // Atualizar dados simulados
    contactosData[id].resposta = resposta;
    contactosData[id].estado = "Respondido";
    
    alert("Resposta enviada com sucesso!");
    closeModal('reply-contacto-modal');
    
    // Aqui você atualizaria a tabela ou recarregaria os dados
});
