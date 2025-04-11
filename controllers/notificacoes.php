<?php
include '../config/conection.php';
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

class Notificacoes {
    private $id_notificacoes;
    private $conn;
    public $data_de_notificacao;
    public $descricao;
    public $id_usuario;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function adicionar() {
        // Obter dados brutos do POST (sanitização será feita no bind_param)
        $this->descricao = $_POST['descricao'] ?? '';
        $this->id_usuario = $_POST['id_usuario'] ?? null;
        $this->data_de_notificacao = date('Y-m-d H:i:s');
    
        // Validação dos campos obrigatórios
        if (empty($this->descricao)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'A descrição da notificação é obrigatória.']);
            return false;
        }
    
        try {
            $sql = "INSERT INTO notificacoes (data_de_notificacao, descricao, id_usuario) 
                    VALUES (?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            
            $stmt->bind_param("ssi", 
                $this->data_de_notificacao, 
                $this->descricao, 
                $this->id_usuario);
    
            if ($stmt->execute()) {
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Notificação adicionada com sucesso!',
                    'data' => [
                        'descricao' => $this->descricao,
                        'id_usuario' => $this->id_usuario
                    ]
                ]);
                return true;
            } else {
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao adicionar notificação.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro no banco de dados: " . $e->getMessage());
            return false;
        }
    }

    // Método para deletar uma notificação
    public function deletar($id_notificacoes) {
        if (!is_numeric($id_notificacoes)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de notificação inválido.']);
            return false;
        }

        try {
            $sql = "DELETE FROM notificacoes WHERE id_notificacoes = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_notificacoes);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    http_response_code(200);
                    echo json_encode(['success' => true, 'message' => 'Notificação apagada com sucesso!']);
                    return true;
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Notificação não encontrada.']);
                    return false;
                }
            } else {
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao apagar a notificação.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao deletar notificação: " . $e->getMessage());
            return false;
        }
    }

    // Método para visualizar notificações por usuário
    public function visualizar_por_usuario($id_usuario) {
        if (!is_numeric($id_usuario)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de usuário inválido.']);
            return false;
        }

        try {
            $sql = "SELECT * FROM notificacoes  ORDER BY data_de_notificacao DESC";
            $stmt = $this->conn->prepare($sql);
            if (!$stmt) {
                throw new Exception("Erro ao preparar a consulta: " . $this->conn->error);
            }
            $stmt->execute();
            $result = $stmt->get_result();

            $notificacoes = [];
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $notificacoes[] = $row;
                }
            }

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $notificacoes,
                'count' => count($notificacoes)
            ]);
            return true;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar notificações.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao visualizar notificações: " . $e->getMessage());
            return false;
        }
    }

    // Método para marcar notificação como lida
    public function marcar_como_lido($id_notificacoes) {
        if (!is_numeric($id_notificacoes)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de notificação inválido.']);
            return false;
        }

        try {
            // Supondo que temos uma coluna 'lida' na tabela notificacoes
            $sql = "UPDATE notificacoes SET lida = 1 WHERE id_notificacoes = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_notificacoes);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    http_response_code(200);
                    echo json_encode(['success' => true, 'message' => 'Notificação marcada como lida!']);
                    return true;
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Notificação não encontrada.']);
                    return false;
                }
            } else {
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao atualizar a notificação.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao marcar notificação como lida: " . $e->getMessage());
            return false;
        }
    }
}

// Configurações iniciais
header('Content-Type: application/json');
$notificacoes = new Notificacoes($conn);

// Rotas
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (isset($_GET['id_usuario'])) {
        $notificacoes->visualizar_por_usuario($_GET['id_usuario']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de usuário não fornecido.']);
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['marcar_lido'])) {
        $notificacoes->marcar_como_lido($_POST['id_notificacoes']);
    } else {
        $notificacoes->adicionar();
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "DELETE") {
    parse_str(file_get_contents("php://input"), $_DELETE);
    if (isset($_DELETE['id_notificacoes'])) {
        $notificacoes->deletar($_DELETE['id_notificacoes']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de notificação não fornecido.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}

$conn->close();
?>