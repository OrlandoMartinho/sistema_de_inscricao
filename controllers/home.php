<?php
include '../config/conection.php';
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
header('Content-Type: application/json');

class Dashboard {
    private $conn;
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    public function getDashboardData($ano, $mes) {
        try {
          

           

            // Dados para retornar
            $data = [];
            
            // 1. Inscrições por curso
            $data['inscricoesPorCurso'] = $this->getInscricoesPorCurso($ano, $mes);
            
            // 2. Status das inscrições
            $data['statusInscricoes'] = $this->getStatusInscricoes($ano, $mes);
            
            // 3. Evolução de inscrições
            $data['evolucaoInscricoes'] = $this->getEvolucaoInscricoes($ano);
            
            // 4. Distribuição por gênero
            $data['distribuicaoGenero'] = $this->getDistribuicaoGenero($ano, $mes);
            
            // 5. Distribuição por faixa etária
            $data['distribuicaoIdade'] = $this->getDistribuicaoIdade($ano, $mes);
            
            // 6. Distribuição por província
            $data['distribuicaoProvincia'] = $this->getDistribuicaoProvincia($ano, $mes);
            
            // 7. Notificações não lidas
            $id_usuario = $_SESSION['id_usuario'] ?? null; // Assuming 'id_usuario' is stored in the session
            if ($id_usuario) {
                $data['notificacoes'] = $this->getNotificacoesNaoLidas($id_usuario);
            } else {
                $data['notificacoes'] = ['naoLidas' => 0]; // Default value if 'id_usuario' is not available
            }
            
            echo json_encode([
                'success' => true,
                'data' => $data
            ]);
            return true;
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao carregar dados do dashboard.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro no dashboard: " . $e->getMessage());
            return false;
        }
    }
    
    private function getInscricoesPorCurso($ano, $mes) {
        $sql = "SELECT c.nome AS nome_curso, COUNT(i.id_inscricao) AS total
                FROM Inscricoes i
                JOIN Calendarios cal ON i.id_calendario = cal.id_calendario
                JOIN Cursos c ON cal.id_curso = c.id_curso
                WHERE YEAR(i.data_de_criacao) = ? 
                AND MONTH(i.data_de_criacao) = ?
                GROUP BY c.nome
                ORDER BY total DESC";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ii", $ano, $mes);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $inscricoes = [];
        while ($row = $result->fetch_assoc()) {
            $inscricoes[] = $row;
        }
        
        return $inscricoes;
    }
    
    private function getStatusInscricoes($ano, $mes) {
        $sql = "SELECT 
                SUM(CASE WHEN aprovacao = 1 THEN 1 ELSE 0 END) AS aprovadas,
                SUM(CASE WHEN aprovacao = 0 THEN 1 ELSE 0 END) AS pendentes,
                SUM(CASE WHEN aprovacao = -1 THEN 1 ELSE 0 END) AS rejeitadas
                FROM Inscricoes
                WHERE YEAR(data_de_criacao) = ? 
                AND MONTH(data_de_criacao) = ?";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ii", $ano, $mes);
        $stmt->execute();
        $result = $stmt->get_result();
        
        return $result->fetch_assoc();
    }
    
    private function getEvolucaoInscricoes($ano) {
        $sql = "SELECT 
                MONTHNAME(data_de_criacao) AS mes,
                MONTH(data_de_criacao) AS mes_num,
                COUNT(id_inscricao) AS total
                FROM Inscricoes
                WHERE YEAR(data_de_criacao) = ?
                GROUP BY MONTH(data_de_criacao), MONTHNAME(data_de_criacao)
                ORDER BY mes_num";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $ano);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $evolucao = [];
        while ($row = $result->fetch_assoc()) {
            $evolucao[] = [
                'mes' => $row['mes'],
                'total' => (int)$row['total']
            ];
        }
        
        return $evolucao;
    }
    
    private function getDistribuicaoGenero($ano, $mes) {
        $sql = "SELECT 
                genero, 
                COUNT(id_inscricao) AS total
                FROM Inscricoes
                WHERE YEAR(data_de_criacao) = ? 
                AND MONTH(data_de_criacao) = ?
                GROUP BY genero";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ii", $ano, $mes);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $distribuicao = [];
        while ($row = $result->fetch_assoc()) {
            $distribuicao[] = [
                'genero' => $row['genero'] ?: 'Não informado',
                'total' => (int)$row['total']
            ];
        }
        
        return $distribuicao;
    }
    
    private function getDistribuicaoIdade($ano, $mes) {
        $sql = "SELECT 
                CASE
                    WHEN idade < 18 THEN 'Menor de 18'
                    WHEN idade BETWEEN 18 AND 24 THEN '18-24 anos'
                    WHEN idade BETWEEN 25 AND 30 THEN '25-30 anos'
                    WHEN idade > 30 THEN 'Maior de 30'
                    ELSE 'Não informado'
                END AS faixa_etaria,
                COUNT(id_inscricao) AS total
                FROM Inscricoes
                WHERE YEAR(data_de_criacao) = ? 
                AND MONTH(data_de_criacao) = ?
                GROUP BY faixa_etaria";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ii", $ano, $mes);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $distribuicao = [];
        while ($row = $result->fetch_assoc()) {
            $distribuicao[] = [
                'faixa_etaria' => $row['faixa_etaria'],
                'total' => (int)$row['total']
            ];
        }
        
        return $distribuicao;
    }
    
    private function getDistribuicaoProvincia($ano, $mes) {
        $sql = "SELECT 
                provincia, 
                COUNT(id_inscricao) AS total
                FROM Inscricoes
                WHERE YEAR(data_de_criacao) = ? 
                AND MONTH(data_de_criacao) = ?
                GROUP BY provincia
                ORDER BY total DESC
                LIMIT 10";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("ii", $ano, $mes);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $distribuicao = [];
        while ($row = $result->fetch_assoc()) {
            $distribuicao[] = [
                'provincia' => $row['provincia'] ?: 'Não informado',
                'total' => (int)$row['total']
            ];
        }
        
        return $distribuicao;
    }
    
    private function getNotificacoesNaoLidas($id_usuario) {
        $sql = "SELECT COUNT(id_notificacao) AS naoLidas
                FROM Notificacoes
                WHERE id_usuario = ? AND lido = 0";
                
        $stmt = $this->conn->prepare($sql);
        $stmt->bind_param("i", $id_usuario);
        $stmt->execute();
        $result = $stmt->get_result();
        
        return $result->fetch_assoc();
    }
}

// Instanciar a classe Dashboard
$dashboard = new Dashboard($conn);

// Rotas
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    $ano = isset($_GET['ano']) ? (int)$_GET['ano'] : date('Y');
    $mes = isset($_GET['mes']) ? (int)$_GET['mes'] : date('m');
    $dashboard->getDashboardData($ano, $mes);
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}

$conn->close();
?>