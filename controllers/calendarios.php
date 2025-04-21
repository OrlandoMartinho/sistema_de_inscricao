<?php
include '../config/conection.php';
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");
header('Content-Type: application/json');

class Calendario {
    private $conn;
    
    public function __construct($conn) {
        $this->conn = $conn;
    }
    
    public function cadastrar() {
        // Obter dados do POST
        $titulo_do_anuncio = $_POST['titulo_do_anuncio'] ?? '';
        $data_de_termino = $_POST['data_de_termino'] ?? '';
        $descricao = $_POST['descricao'] ?? '';
        $id_curso = $_POST['id_curso'] ?? null;
        $numero_de_vagas = $_POST['numero_de_vagas'] ?? null;
        
        // Validação dos campos obrigatórios
        if (empty($titulo_do_anuncio)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'O título do anúncio é obrigatório.']);
            return false;
        }
        
        if (empty($id_curso)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'O curso é obrigatório.']);
            return false;
        }
        
        if (empty($numero_de_vagas) || !is_numeric($numero_de_vagas) || $numero_de_vagas <= 0) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Número de vagas inválido.']);
            return false;
        }

        try {
            // Obter nome do curso
            $stmt_curso = $this->conn->prepare("SELECT nome FROM cursos WHERE id_curso = ?");
            $stmt_curso->bind_param("i", $id_curso);
            $stmt_curso->execute();
            $result_curso = $stmt_curso->get_result();
            
            if ($result_curso->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Curso não encontrado.']);
                return false;
            }
            
            $curso = $result_curso->fetch_assoc();
            $nome_do_curso = $curso['nome'];

            // Inserir o evento no calendário
            $sql = "INSERT INTO Calendarios (
                titulo_do_anuncio, 
                data_de_termino, 
                descricao, 
                id_curso, 
                nome_do_curso,
                numero_de_vagas
            ) VALUES (?, ?, ?, ?, ?, ?)";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param(
                "sssisi", 
                $titulo_do_anuncio,
                $data_de_termino,
                $descricao,
                $id_curso,
                $nome_do_curso,
                $numero_de_vagas
            );
            
            if ($stmt->execute()) {
                $id_calendario = $stmt->insert_id;
                
                // // Adicionar notificação
                // $descricao_notificacao = "Novo evento no calendário: " . $titulo_do_anuncio;
                // $sql_notificacao = "INSERT INTO notificacoes (descricao) VALUES (?)";
                // $stmt_notificacao = $this->conn->prepare($sql_notificacao);
                // $stmt_notificacao->bind_param("s", $descricao_notificacao);
                // $stmt_notificacao->execute();
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Evento cadastrado com sucesso!',
                    'data' => [
                        'id_calendario' => $id_calendario,
                        'titulo_do_anuncio' => $titulo_do_anuncio
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
                'message' => 'Erro ao cadastrar evento.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro no cadastro de evento: " . $e->getMessage());
            return false;
        }
    }
    
    public function eliminar($id_calendario) {
        if (!is_numeric($id_calendario)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de calendário inválido.']);
            return false;
        }

        try {
            $sql = "DELETE FROM Calendarios WHERE id_calendario = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_calendario);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    echo json_encode(['success' => true, 'message' => 'Evento removido com sucesso!']);
                    return true;
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Evento não encontrado.']);
                    return false;
                }
            } else {
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao remover evento.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao eliminar evento: " . $e->getMessage());
            return false;
        }
    }

    public function editar($dados) {
        if (!is_numeric($dados['id_calendario'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de calendário inválido.']);
            return false;
        }

        // Validação dos campos obrigatórios
        if (empty($dados['titulo_do_anuncio'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'O título do anúncio é obrigatório.']);
            return false;
        }

        try {
            // Obter nome do curso se o ID do curso foi alterado
            if (isset($dados['id_curso'])) {
                $stmt_curso = $this->conn->prepare("SELECT nome FROM cursos WHERE id_curso = ?");
                $stmt_curso->bind_param("i", $dados['id_curso']);
                $stmt_curso->execute();
                $result_curso = $stmt_curso->get_result();
                
                if ($result_curso->num_rows === 0) {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Curso não encontrado.']);
                    return false;
                }
                
                $curso = $result_curso->fetch_assoc();
                $dados['nome_do_curso'] = $curso['nome'];
            }

            $sql = "UPDATE Calendarios SET 
                    titulo_do_anuncio = ?, 
                    data_de_termino = ?, 
                    descricao = ?, 
                    id_curso = ?, 
                    nome_do_curso = ?,
                    numero_de_vagas = ?
                    WHERE id_calendario = ?";
            
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param(
                "ssssisi",
                $dados['titulo_do_anuncio'],
                $dados['data_de_termino'],
                $dados['descricao'],
                $dados['id_curso'],
                $dados['nome_do_curso'],
                $dados['numero_de_vagas'],
                $dados['id_calendario']
            );

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Evento atualizado com sucesso!'
                    ]);
                    return true;
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Nenhuma alteração realizada ou evento não encontrado.']);
                    return false;
                }
            } else {
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao atualizar evento.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao editar evento: " . $e->getMessage());
            return false;
        }
    }

    public function visualizar($id_calendario) {
        if (!is_numeric($id_calendario)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de calendário inválido.']);
            return false;
        }

        try {
            $sql = "SELECT * FROM Calendarios WHERE id_calendario = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_calendario);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $evento = $result->fetch_assoc();
                echo json_encode([
                    'success' => true,
                    'data' => $evento
                ]);
                return true;
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Evento não encontrado.']);
                return false;
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar evento.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao visualizar evento: " . $e->getMessage());
            return false;
        }
    }
    
    public function visualizar_todos() {
        try {
            $sql = "SELECT c.*, IFNULL(cur.nome, 'Geral') AS nome_do_curso 
                    FROM Calendarios c 
                    LEFT JOIN cursos cur ON c.id_curso = cur.id_curso 
                    ORDER BY c.data_de_criacao DESC";
            
            $result = $this->conn->query($sql);
        
            $eventos = [];
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $eventos[] = $row;
                }
            }
        
            echo json_encode([
                'success' => true,
                'data' => $eventos,
                'count' => count($eventos)
            ]);
            return true;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar eventos.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao visualizar eventos: " . $e->getMessage());
            return false;
        }
    }
}

// Instanciar a classe Calendario
$calendario = new Calendario($conn);

// Rotas
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (isset($_GET['id'])) {
        $calendario->visualizar($_GET['id']);
    } else {
        $calendario->visualizar_todos();
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['action']) && $_POST['action'] == 'post') {
    $calendario->cadastrar();
} elseif ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['action']) && $_POST['action'] == 'put') {
    parse_str(file_get_contents("php://input"), $_PUT);
    $dados = [
        'id_calendario' => $_POST['id_calendario'] ?? null,
        'titulo_do_anuncio' => $_POST['titulo_do_anuncio'] ?? '',
        'data_de_termino' => $_POST['data_de_termino'] ?? '',
        'descricao' => $_POST['descricao'] ?? '',
        'id_curso' => $_POST['id_curso'] ?? null,
        'numero_de_vagas' => $_POST['numero_de_vagas'] ?? null
    ];
    $calendario->editar($dados);
} elseif ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['action']) && $_POST['action'] == 'delete') {
    parse_str(file_get_contents("php://input"), $_DELETE);
    if (isset($_POST['id_calendario'])) {
        $calendario->eliminar($_POST['id_calendario']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de calendário não fornecido.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}

$conn->close();
?>