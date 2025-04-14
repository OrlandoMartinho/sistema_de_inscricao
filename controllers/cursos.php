<?php
include '../config/conection.php';
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

class Cursos {
    private $id_curso;
    private $conn;
    private $nome;
    private $descricao;
    private $area;
    private $duracao;
   
 

    public function __construct($conn) {
        $this->conn = $conn;
    }
    public function cadastrar() {
        $this->nome = $_POST['nome'] ?? '';
        $this->descricao = $_POST['descricao'] ?? '';
        $this->area = $_POST['area'] ?? '';
        $this->duracao = $_POST['duracao'] ?? 0;
    
        // error_log("Dados recebidos para cadastro: " . json_encode($_POST));
    
        // if (empty($this->nome) || empty($this->descricao) || empty($this->area)) {
        //     error_log("Campos obrigatórios ausentes.");
        //     http_response_code(400);
        //     echo json_encode(['success' => false, 'message' => $_POST,'data' => $_POST]);
        //     return false;
        // }
    
        // if (!is_numeric($this->duracao) || $this->duracao <= 0) {
        //     error_log("Duração inválida: " . $this->duracao);
        //     http_response_code(400);
        //     echo json_encode(['success' => false, 'message' => 'Duração deve ser um número positivo.']);
        //     return false;
        // }
    
        // // Data de criação manual (caso não esteja vindo via POST)
        // $this->data_de_criacao = date("Y-m-d H:i:s");
        // error_log("Data de criação: " . $this->data_de_criacao);
    
        try {
            $sql = "INSERT INTO cursos (nome, descricao, area, duracao) VALUES (?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("sssi", $this->nome, $this->descricao, $this->area, $this->duracao);
    
            if ($stmt->execute()) {
                $this->id_curso = $stmt->insert_id;
                error_log("Curso inserido com ID: " . $this->id_curso);
    
                
    
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Curso cadastrado com sucesso!',
                    'data' => [
                        'id_curso' => $this->id_curso,
                        'nome' => $this->nome
                    ]
                ]);
                return true;
            } else {
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            error_log("Erro ao cadastrar curso: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao cadastrar curso.',
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    
    public function eliminar($id_curso) {
        if (!is_numeric($id_curso)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de curso inválido.']);
            return false;
        }

        try {
            $sql = "DELETE FROM cursos WHERE id_curso = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_curso);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    http_response_code(200);
                    echo json_encode(['success' => true, 'message' => 'Curso removido com sucesso!']);
                    return true;
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Curso não encontrado.']);
                    return false;
                }
            } else {
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao remover curso.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao eliminar curso: " . $e->getMessage());
            return false;
        }
    }

    public function editar($id_curso) {
        if (!is_numeric($id_curso)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de curso inválido.']);
            return false;
        }

        // Obter dados do PUT
        parse_str(file_get_contents("php://input"), $_PUT);
        
        $this->nome = $_PUT['nome'] ?? '';
        $this->descricao = $_PUT['descricao'] ?? '';
        $this->area = $_PUT['area'] ?? '';
        $this->duracao = $_PUT['duracao'] ?? 0;
    

        // Validação dos campos obrigatórios
        if (empty($this->nome) || empty($this->descricao) || empty($this->area)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Nome, descrição e área são campos obrigatórios.']);
            return false;
        }

        try {
            $sql = "UPDATE cursos SET 
                    nome = ?, 
                    descricao = ?, 
                    area = ?, 
                    duracao = ?, 
                    WHERE id_curso = ?";
            $stmt = $this->conn->prepare($sql);
            
            $stmt->bind_param("sssiii", 
                $this->nome, 
                $this->descricao, 
                $this->area, 
                $this->duracao, 
                $id_curso);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Curso atualizado com sucesso!'
                    ]);
                    return true;
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Nenhuma alteração realizada ou curso não encontrado.']);
                    return false;
                }
            } else {
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao atualizar curso.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao editar curso: " . $e->getMessage());
            return false;
        }
    }

    public function visualizar($id_curso) {
        if (!is_numeric($id_curso)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de curso inválido.']);
            return false;
        }

        try {
            $sql = "SELECT * FROM cursos WHERE id_curso = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_curso);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $curso = $result->fetch_assoc();
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'data' => $curso
                ]);
                return true;
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Curso não encontrado.']);
                return false;
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar curso.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao visualizar curso: " . $e->getMessage());
            return false;
        }
    }
    
    public function visualizar_todos() {
        try {
            $sql = "SELECT * FROM cursos ORDER BY data_de_criacao DESC";
            $result = $this->conn->query($sql);
        
            $cursos = [];
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $cursos[] = $row;
                }
            }
        
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $cursos,
                'count' => count($cursos)
            ]);
            return true;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar cursos.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao visualizar cursos: " . $e->getMessage());
            return false;
        }
    }
}

// Configurações iniciais
header('Content-Type: application/json');
$curso = new Cursos($conn);

// Rotas
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (isset($_GET['id'])) {
        $curso->visualizar($_GET['id']);
    } else {
        $curso->visualizar_todos();
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "POST") {
    $curso->cadastrar();
} elseif ($_SERVER["REQUEST_METHOD"] == "PUT") {
    parse_str(file_get_contents("php://input"), $_PUT);
    if (isset($_PUT['id_curso'])) {
        $curso->editar($_PUT['id_curso']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de curso não fornecido.']);
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "DELETE") {
    parse_str(file_get_contents("php://input"), $_DELETE);
    if (isset($_DELETE['id_curso'])) {
        $curso->eliminar($_DELETE['id_curso']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de curso não fornecido.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}

$conn->close();
?>