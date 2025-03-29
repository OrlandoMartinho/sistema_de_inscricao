// Gráfico de Inscrições (Doughnut)
const ctx1 = document.getElementById('inscricoesChart').getContext('2d');
new Chart(ctx1, {
    type: 'doughnut',
    data: {
        labels: ['Aprovadas', 'Pendentes', 'Canceladas'],
        datasets: [{
            data: [70, 20, 10],
            backgroundColor: ['#8BC34A', '#2196F3', '#F44336']
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

// Gráfico de Usuários Cadastrados por Dia (Barra)
const ctx2 = document.getElementById('usuariosChart').getContext('2d');
new Chart(ctx2, {
    type: 'bar',
    data: {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
        datasets: [{
            label: 'Usuários Cadastrados',
            data: [50, 60, 70, 80, 90, 100],
            backgroundColor: '#3F51B5'
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

// Gráfico de Total de Inscrições ao Longo do Ano (Linha)
const ctx3 = document.getElementById('totalInscricoesChart').getContext('2d');
new Chart(ctx3, {
    type: 'line',
    data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
            label: 'Total de Inscrições',
            data: [10, 40, 30, 70, 90, 60],
            borderColor: '#FF5722',
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

// Gráfico de Distribuição de Usuários (Pie)
const ctx4 = document.getElementById('distribuicaoUsuariosChart1').getContext('2d');
new Chart(ctx4, {
    type: 'pie',
    data: {
        labels: ['Aprovados', 'Não Aprovados', 'Inativos'],
        datasets: [{
            data: [45, 30, 25],
            backgroundColor: ['#4CAF50', '#F44336', '#607D8B']
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

// Gráfico de Taxa de Crescimento das Inscrições (Linha)
const ctx5 = document.getElementById('distribuicaoUsuariosChart2').getContext('2d');
new Chart(ctx5, {
    type: 'line',
    data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
        datasets: [{
            label: 'Crescimento de Inscrições',
            data: [5, 15, 25, 40, 55, 75],
            borderColor: '#FF9800',
            fill: false
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});

// Gráfico de Comparação de Aprovações e Reprovações (Barra)
const ctx6 = document.getElementById('distribuicaoUsuariosChart3').getContext('2d');
new Chart(ctx6, {
    type: 'bar',
    data: {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
        datasets: [
            {
                label: 'Aprovados',
                data: [30, 50, 60, 80, 100, 120],
                backgroundColor: '#4CAF50'
            },
            {
                label: 'Reprovados',
                data: [20, 30, 40, 50, 60, 70],
                backgroundColor: '#F44336'
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false
    }
});
