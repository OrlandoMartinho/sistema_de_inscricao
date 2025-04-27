document.addEventListener('DOMContentLoaded', function() {
     
const userData = JSON.parse(localStorage.getItem('user_data'));
const nome = userData.nome || 'Nome não disponível'; // Substitua pelo valor real
const email = userData.email || 'Email não disponível'; // Substitua pelo valor real


// Atualiza o nome exibido na barra superior
document.getElementById('nomeUsuario').textContent = nome;
    // Objeto para armazenar todas as instâncias de gráficos
    const charts = {
        inscricoesPorCurso: null,
        statusInscricoes: null,
        evolucaoInscricoes: null,
        distribuicaoGenero: null,
        distribuicaoIdade: null,
        distribuicaoProvincia: null
    };

    // Configurar selects com valores atuais
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    
    document.getElementById('yearSelect').value = currentYear;
    document.getElementById('monthSelect').value = currentMonth;
    
    console.log('Configuração inicial: Ano:', currentYear, 'Mês:', currentMonth);
    
    // Carregar dados iniciais
    loadDashboardData();
    
    // Adicionar listeners para mudanças nos selects
    document.getElementById('yearSelect').addEventListener('change', loadDashboardData);
    document.getElementById('monthSelect').addEventListener('change', loadDashboardData);
    
    // Função principal para carregar os dados
    function loadDashboardData() {
        const year = document.getElementById('yearSelect').value;
        const month = document.getElementById('monthSelect').value;
        
        console.log('Carregando dados para:', year, month);
        
        fetch(`../controllers/home.php?ano=${year}&mes=${month}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erro na requisição: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                console.log('Dados recebidos:', data);
                
                if (data.success) {
                    updateDashboard(data.data);
                    updateNotificationCount(data.data.notificacoes.naoLidas);
                } else {
                    console.error('Erro ao carregar dados:', data.message);
                }
            })
            .catch(error => {
                console.error('Erro na requisição:', error);
            });
    }
    
    // Atualizar contador de notificações
    function updateNotificationCount(count) {
        console.log('Atualizando contador de notificações:', count);
        
        const notificationElement = document.getElementById('notificationCount');
        notificationElement.textContent = count;
        
        if (count > 0) {
            notificationElement.classList.add('active');
        } else {
            notificationElement.classList.remove('active');
        }
    }
    
    // Atualizar todos os gráficos com os dados recebidos
    function updateDashboard(data) {
        console.log('Atualizando dashboard com dados:', data);
        
        // 1. Gráfico de Inscrições por Curso
        createInscricoesPorCursoChart(data.inscricoesPorCurso);
        
        // 2. Gráfico de Status das Inscrições
        createStatusInscricoesChart(data.statusInscricoes);
        
        // 3. Gráfico de Evolução de Inscrições
        createEvolucaoInscricoesChart(data.evolucaoInscricoes);
        
        // 4. Gráfico de Distribuição por Gênero
        createDistribuicaoGeneroChart(data.distribuicaoGenero);
        
        // 5. Gráfico de Distribuição por Faixa Etária
        createDistribuicaoIdadeChart(data.distribuicaoIdade);
        
        // 6. Gráfico de Distribuição por Província
        createDistribuicaoProvinciaChart(data.distribuicaoProvincia);
    }
    
    // Funções para criar cada gráfico
    function createInscricoesPorCursoChart(data) {
        console.log('Criando gráfico Inscrições por Curso:', data);
        
        const ctx = document.getElementById('inscricoesPorCursoChart');
        if (!ctx) {
            console.error('Elemento canvas não encontrado: inscricoesPorCursoChart');
            return;
        }
        
        // Destruir gráfico anterior se existir
        if (charts.inscricoesPorCurso) {
            console.log('Destruindo gráfico anterior de Inscrições por Curso');
            charts.inscricoesPorCurso.destroy();
        }
        
        const labels = data.map(item => item.nome_curso);
        const values = data.map(item => item.total);
        
        console.log('Labels:', labels, 'Values:', values);
        
        charts.inscricoesPorCurso = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Inscrições por Curso',
                    data: values,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Inscrições por Curso'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
    
    function createStatusInscricoesChart(data) {
        console.log('Criando gráfico Status das Inscrições:', data);
        
        const ctx = document.getElementById('statusInscricoesChart');
        if (!ctx) {
            console.error('Elemento canvas não encontrado: statusInscricoesChart');
            return;
        }
        
        if (charts.statusInscricoes) {
            console.log('Destruindo gráfico anterior de Status das Inscrições');
            charts.statusInscricoes.destroy();
        }
        
        charts.statusInscricoes = new Chart(ctx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Aprovadas', 'Pendentes', 'Rejeitadas'],
                datasets: [{
                    data: [data.aprovadas, data.pendentes, data.rejeitadas],
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(255, 99, 132, 0.7)'
                    ],
                    borderColor: [
                        'rgba(75, 192, 192, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(255, 99, 132, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Status das Inscrições'
                    }
                }
            }
        });
    }
    
    function createEvolucaoInscricoesChart(data) {
        console.log('Criando gráfico Evolução de Inscrições:', data);
        
        const ctx = document.getElementById('evolucaoInscricoesChart');
        if (!ctx) {
            console.error('Elemento canvas não encontrado: evolucaoInscricoesChart');
            return;
        }
        
        if (charts.evolucaoInscricoes) {
            console.log('Destruindo gráfico anterior de Evolução de Inscrições');
            charts.evolucaoInscricoes.destroy();
        }
        
        // Ordenar os meses corretamente
        data.sort((a, b) => {
            const months = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            return months.indexOf(a.mes) - months.indexOf(b.mes);
        });
        
        const labels = data.map(item => {
            const monthMap = {
                'January': 'Janeiro', 'February': 'Fevereiro', 'March': 'Março',
                'April': 'Abril', 'May': 'Maio', 'June': 'Junho',
                'July': 'Julho', 'August': 'Agosto', 'September': 'Setembro',
                'October': 'Outubro', 'November': 'Novembro', 'December': 'Dezembro'
            };
            return monthMap[item.mes] || item.mes;
        });
        
        const values = data.map(item => item.total);
        
        console.log('Meses ordenados:', labels, 'Valores:', values);
        
        charts.evolucaoInscricoes = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Inscrições',
                    data: values,
                    fill: false,
                    backgroundColor: 'rgba(153, 102, 255, 0.7)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Evolução das Inscrições'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
    
    function createDistribuicaoGeneroChart(data) {
        console.log('Criando gráfico Distribuição por Gênero:', data);
        
        const ctx = document.getElementById('distribuicaoGeneroChart');
        if (!ctx) {
            console.error('Elemento canvas não encontrado: distribuicaoGeneroChart');
            return;
        }
        
        if (charts.distribuicaoGenero) {
            console.log('Destruindo gráfico anterior de Distribuição por Gênero');
            charts.distribuicaoGenero.destroy();
        }
        
        const labels = data.map(item => item.genero);
        const values = data.map(item => item.total);
        
        console.log('Gêneros:', labels, 'Totais:', values);
        
        charts.distribuicaoGenero = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição por Gênero'
                    }
                }
            }
        });
    }
    
    function createDistribuicaoIdadeChart(data) {
        console.log('Criando gráfico Distribuição por Faixa Etária:', data);
        
        const ctx = document.getElementById('distribuicaoIdadeChart');
        if (!ctx) {
            console.error('Elemento canvas não encontrado: distribuicaoIdadeChart');
            return;
        }
        
        if (charts.distribuicaoIdade) {
            console.log('Destruindo gráfico anterior de Distribuição por Faixa Etária');
            charts.distribuicaoIdade.destroy();
        }
        
        const labels = data.map(item => item.faixa_etaria);
        const values = data.map(item => item.total);
        
        console.log('Faixas etárias:', labels, 'Totais:', values);
        
        charts.distribuicaoIdade = new Chart(ctx.getContext('2d'), {
            type: 'polarArea',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)',
                        'rgba(54, 162, 235, 0.7)',
                        'rgba(255, 206, 86, 0.7)',
                        'rgba(75, 192, 192, 0.7)',
                        'rgba(153, 102, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição por Faixa Etária'
                    }
                }
            }
        });
    }
    
    function createDistribuicaoProvinciaChart(data) {
        console.log('Criando gráfico Distribuição por Província:', data);
        
        const ctx = document.getElementById('distribuicaoProvinciaChart');
        if (!ctx) {
            console.error('Elemento canvas não encontrado: distribuicaoProvinciaChart');
            return;
        }
        
        if (charts.distribuicaoProvincia) {
            console.log('Destruindo gráfico anterior de Distribuição por Província');
            charts.distribuicaoProvincia.destroy();
        }
        
        const labels = data.map(item => item.provincia);
        const values = data.map(item => item.total);
        
        console.log('Províncias:', labels, 'Totais:', values);
        
        charts.distribuicaoProvincia = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Inscrições',
                    data: values,
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Distribuição por Província (Top 10)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
});

