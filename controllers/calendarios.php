<?php
include '../config/conection.php';
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

class Calendario {
    private $id_calendario;
    private $conn;
    private $titulo_do_anuncio;
    private $data_de_termino;
    private $descricao;
    private $id_curso;
    private $data_de_criacao;
    private $nome_do_curso;

    private $numero_de_vagas;

    public function __construct($conn) {
        $this->conn = $conn;
    }
    public function cadastrar() {
        // Obter dados do POST
        $this->titulo_do_anuncio = $_POST['titulo_do_anuncio'] ?? '';
        $this->data_de_termino = $_POST['data_de_termino'] ?? '';
        $this->descricao = $_POST['descricao'] ?? '';
        $this->id_curso = $_POST['id_curso'] ?? null;
        $this->data_de_criacao = date('Y-m-d H:i:s');
        $this->numero_de_vagas = $_POST['numero_de_vagas'] ?? null;
        
        // Validação dos campos obrigatórios
        if (empty($this->titulo_do_anuncio)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'O título do anúncio é obrigatório.']);
            return false;
        }
        
        // Validação da data de término
        if (!empty($this->data_de_termino) && !strtotime($this->data_de_termino)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Data de término inválida.']);
            return false;
        }
    
        // Verificação de curso
        if (empty($this->id_curso)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID do curso é obrigatório.']);
            return false;
        }
    
        try {
            // Verificar se o curso existe
            $sql = "SELECT * FROM cursos WHERE id_curso = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $this->id_curso);
            $stmt->execute();
            $result = $stmt->get_result();
    
            $nome_do_curso = $result->fetch_assoc()['nome_do_curso'] ?? null;
            if ($nome_do_curso) {
                $this->nome_do_curso = $nome_do_curso;
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Curso não encontrado.']);
                return false;
            }
    
            // Inserir o evento no calendário
            $sql = "INSERT INTO calendarios (titulo_do_anuncio, data_de_termino, descricao, id_curso, nome_do_curso,numero_de_vagas, data_de_criacao) 
                    VALUES (?, ?, ?, ?, ?, ?,?)";
            $stmt = $this->conn->prepare($sql);
            
            $stmt->bind_param("sssis", 
                $this->titulo_do_anuncio, 
                $this->data_de_termino, 
                $this->descricao, 
                $this->id_curso, 
                $this->nome_do_curso,
                $this->numero_de_vagas, 
                $this->data_de_criacao);
        
            if ($stmt->execute()) {
                $this->id_calendario = $stmt->insert_id;
                
                // Adiciona notificação
                $descricao = "Novo evento no calendário: " . $this->titulo_do_anuncio;
                $sql2 = "INSERT INTO notificacoes (descricao) VALUES (?)";
                $stmt2 = $this->conn->prepare($sql2);
                $stmt2->bind_param("s", $descricao);
                $stmt2->execute();
        
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Evento cadastrado com sucesso!',
                    'data' => [
                        'id_calendario' => $this->id_calendario,
                        'titulo_do_anuncio' => $this->titulo_do_anuncio
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
            error_log("Erro no banco de dados: " . $e->getMessage());
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
            $sql = "DELETE FROM calendarios WHERE id_calendario = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_calendario);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    http_response_code(200);
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

    public function editar($id_calendario) {
        if (!is_numeric($id_calendario)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de calendário inválido.']);
            return false;
        }

        // Obter dados do PUT
        parse_str(file_get_contents("php://input"), $_PUT);
        
        $this->titulo_do_anuncio = $_PUT['titulo_do_anuncio'] ?? '';
        $this->data_de_termino = $_PUT['data_de_termino'] ?? '';
        $this->descricao = $_PUT['descricao'] ?? '';
        $this->id_curso = $_PUT['id_curso'] ?? null;

        // Validação dos campos obrigatórios
        if (empty($this->titulo_do_anuncio)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'O título do anúncio é obrigatório.']);
            return false;
        }

        try {
            $sql = "UPDATE calendarios SET 
                    titulo_do_anuncio = ?, 
                    data_de_termino = ?, 
                    descricao = ?, 
                    id_curso = ? 
                    WHERE id_calendario = ?";
            $stmt = $this->conn->prepare($sql);
            
            $stmt->bind_param("sssii", 
                $this->titulo_do_anuncio, 
                $this->data_de_termino, 
                $this->descricao, 
                $this->id_curso, 
                $id_calendario);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    http_response_code(200);
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
            $sql = "SELECT * FROM calendarios WHERE id_calendario = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_calendario);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $evento = $result->fetch_assoc();
                http_response_code(200);
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
            $sql = "SELECT c.*, IFNULL(cur.nome, 'Geral') AS nome 
                    FROM calendarios c 
                    LEFT JOIN cursos cur ON c.id_curso = cur.id_curso 
                    ORDER BY c.data_de_criacao DESC";
            
            // Log para verificar a query
            error_log("Query SQL: " . $sql);
            
            $result = $this->conn->query($sql);
            
            // Log para verificar se a consulta retornou resultados
            error_log("Número de resultados: " . $result->num_rows);
        
            $eventos = [];
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $eventos[] = $row;
                    // Log para verificar cada evento retornado
                    error_log("Evento: " . json_encode($row));
                }
            } else {
                error_log("Nenhum evento encontrado.");
            }
        
            http_response_code(200);
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
            
            // Log do erro ocorrido
            error_log("Erro ao visualizar eventos: " . $e->getMessage());
            return false;
        }
    }
    
    
}

// Configurações iniciais
header('Content-Type: application/json');
$calendario = new Calendario($conn);

// Rotas
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (isset($_GET['id'])) {
        $calendario->visualizar($_GET['id']);
    } else {
        $calendario->visualizar_todos();
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "POST") {
    $calendario->cadastrar();
} elseif ($_SERVER["REQUEST_METHOD"] == "PUT") {
    parse_str(file_get_contents("php://input"), $_PUT);
    if (isset($_PUT['id_calendario'])) {
        $calendario->editar($_PUT['id_calendario']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de calendário não fornecido.']);
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "DELETE") {
    parse_str(file_get_contents("php://input"), $_DELETE);
    if (isset($_DELETE['id_calendario'])) {
        $calendario->eliminar($_DELETE['id_calendario']);
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