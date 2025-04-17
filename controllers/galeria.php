<?php
include '../config/conection.php';
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

class Galeria {
    private $id_galeria;
    private $conn;
    private $titulo;
    private $data_do_evento;
    private $descricao;
    private $foto;
    private $data_de_criacao;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function cadastrar() {
        // Obter dados do POST
        $this->titulo = $_POST['titulo'] ?? '';
        $this->data_do_evento = $_POST['data_do_evento'] ?? '';
        $this->descricao = $_POST['descricao'] ?? '';
        $this->data_de_criacao = date('Y-m-d H:i:s');
        
        // Validação dos campos obrigatórios
        if (empty($this->titulo)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'O título é obrigatório.']);
            return false;
        }
        
        // Validação da data do evento
        if (!empty($this->data_do_evento) && !strtotime($this->data_do_evento)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Data do evento inválida.']);
            return false;
        }

        // Processar upload da foto
        $this->foto = $this->processarUploadFoto();
        if ($this->foto === false) {
            return false; // Já emitiu a resposta de erro
        }
    
        try {
            // Inserir a galeria
            $sql = "INSERT INTO galerias (titulo, data_do_evento, descricao, foto, data_de_criacao) 
                    VALUES (?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            
            $stmt->bind_param("sssss", 
                $this->titulo, 
                $this->data_do_evento, 
                $this->descricao,
                $this->foto,
                $this->data_de_criacao);
        
            if ($stmt->execute()) {
                $this->id_galeria = $stmt->insert_id;
                
                // Adiciona notificação
                $descricao = "Nova galeria criada: " . $this->titulo;
                $sql2 = "INSERT INTO notificacoes (descricao) VALUES (?)";
                $stmt2 = $this->conn->prepare($sql2);
                $stmt2->bind_param("s", $descricao);
                $stmt2->execute();
        
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Galeria cadastrada com sucesso!',
                    'data' => [
                        'id_galeria' => $this->id_galeria,
                        'titulo' => $this->titulo,
                        'foto' => $this->foto
                    ]
                ]);
                return true;
            } else {
                // Se falhar, remove a foto enviada
                if (!empty($this->foto)) {
                    $this->removerArquivo($this->foto);
                }
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao cadastrar galeria.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro no banco de dados: " . $e->getMessage());
            return false;
        }
    }

    private function processarUploadFoto() {
        // Verifica se foi enviado um arquivo
        if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Erro no upload da foto.']);
            return false;
        }

        $file = $_FILES['foto'];
        
        // Validação do tipo de arquivo
        $allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!in_array($file['type'], $allowedTypes)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Tipo de arquivo não permitido. Use apenas JPEG, PNG ou GIF.']);
            return false;
        }

        // Validação do tamanho do arquivo (máximo 5MB)
        $maxSize = 5 * 1024 * 1024; // 5MB
        if ($file['size'] > $maxSize) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Arquivo muito grande. Tamanho máximo permitido: 5MB.']);
            return false;
        }

        // Gera um nome único para o arquivo
        $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = uniqid('galeria_') . '.' . $ext;
        $uploadDir = '../uploads/galerias/';
        
        // Cria o diretório se não existir
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $destination = $uploadDir . $filename;
        
        // Move o arquivo para o diretório de uploads
        if (move_uploaded_file($file['tmp_name'], $destination)) {
            return $filename; // Retorna apenas o nome do arquivo
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erro ao salvar a foto.']);
            return false;
        }
    }

    private function removerArquivo($filename) {
        $filepath = '../uploads/galerias/' . $filename;
        if (file_exists($filepath)) {
            unlink($filepath);
        }
    }

    public function eliminar($id_galeria) {
        if (!is_numeric($id_galeria)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de galeria inválido.']);
            return false;
        }

        try {
            // Primeiro obtém o nome do arquivo da foto para removê-lo
            $sqlSelect = "SELECT foto FROM galerias WHERE id_galeria = ?";
            $stmtSelect = $this->conn->prepare($sqlSelect);
            $stmtSelect->bind_param("i", $id_galeria);
            $stmtSelect->execute();
            $result = $stmtSelect->get_result();
            
            if ($result->num_rows > 0) {
                $galeria = $result->fetch_assoc();
                $foto = $galeria['foto'];
            }

            // Depois deleta o registro
            $sql = "DELETE FROM galerias WHERE id_galeria = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_galeria);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    // Remove o arquivo da foto
                    if (!empty($foto)) {
                        $this->removerArquivo($foto);
                    }
                    http_response_code(200);
                    echo json_encode(['success' => true, 'message' => 'Galeria removida com sucesso!']);
                    return true;
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Galeria não encontrada.']);
                    return false;
                }
            } else {
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao remover galeria.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao eliminar galeria: " . $e->getMessage());
            return false;
        }
    }

    public function editar($id_galeria) {
        if (!is_numeric($id_galeria)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de galeria inválido.']);
            return false;
        }

        // Obter dados do PUT (para campos normais)
        parse_str(file_get_contents("php://input"), $_PUT);
        
        $this->titulo = $_PUT['titulo'] ?? '';
        $this->data_do_evento = $_PUT['data_do_evento'] ?? '';
        $this->descricao = $_PUT['descricao'] ?? '';

        // Validação dos campos obrigatórios
        if (empty($this->titulo)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'O título é obrigatório.']);
            return false;
        }

        try {
            // Primeiro obtém a foto atual
            $sqlSelect = "SELECT foto FROM galerias WHERE id_galeria = ?";
            $stmtSelect = $this->conn->prepare($sqlSelect);
            $stmtSelect->bind_param("i", $id_galeria);
            $stmtSelect->execute();
            $result = $stmtSelect->get_result();
            $fotoAtual = $result->fetch_assoc()['foto'];

            // Processar upload da nova foto se foi enviada
            $novaFoto = null;
            if (!empty($_FILES['foto']['name'])) {
                $novaFoto = $this->processarUploadFoto();
                if ($novaFoto === false) {
                    return false;
                }
            }

            // Prepara a query de atualização
            $sql = "UPDATE galerias SET 
                    titulo = ?, 
                    data_do_evento = ?, 
                    descricao = ?";
            
            // Adiciona a foto à query se foi enviada uma nova
            if ($novaFoto !== null) {
                $sql .= ", foto = ?";
            }
            
            $sql .= " WHERE id_galeria = ?";
            
            $stmt = $this->conn->prepare($sql);
            
            // Bind dos parâmetros
            if ($novaFoto !== null) {
                $stmt->bind_param("ssssi", 
                    $this->titulo, 
                    $this->data_do_evento, 
                    $this->descricao,
                    $novaFoto,
                    $id_galeria);
                
                // Remove a foto antiga se foi enviada uma nova
                if (!empty($fotoAtual)) {
                    $this->removerArquivo($fotoAtual);
                }
            } else {
                $stmt->bind_param("sssi", 
                    $this->titulo, 
                    $this->data_do_evento, 
                    $this->descricao,
                    $id_galeria);
            }

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    http_response_code(200);
                    echo json_encode([
                        'success' => true,
                        'message' => 'Galeria atualizada com sucesso!'
                    ]);
                    return true;
                } else {
                    // Se não houve alterações mas a operação foi bem sucedida
                    http_response_code(200);
                    echo json_encode(['success' => true, 'message' => 'Nenhuma alteração realizada.']);
                    return true;
                }
            } else {
                // Se falhar, remove a nova foto enviada (se houver)
                if ($novaFoto !== null) {
                    $this->removerArquivo($novaFoto);
                }
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao atualizar galeria.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao editar galeria: " . $e->getMessage());
            return false;
        }
    }

    public function visualizar_um($id_galeria) {
        if (!is_numeric($id_galeria)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de galeria inválido.']);
            return false;
        }

        try {
            $sql = "SELECT * FROM galerias WHERE id_galeria = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_galeria);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $galeria = $result->fetch_assoc();
                // Adiciona a URL completa da foto
                $galeria['foto_url'] = !empty($galeria['foto']) ? 
                    'http://' . $_SERVER['HTTP_HOST'] . '/uploads/galerias/' . $galeria['foto'] : null;
                
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'data' => $galeria
                ]);
                return true;
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Galeria não encontrada.']);
                return false;
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar galeria.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao visualizar galeria: " . $e->getMessage());
            return false;
        }
    }
    
    public function visualizar_todos() {
        try {
            $sql = "SELECT * FROM galerias ORDER BY data_de_criacao DESC";
            
            $result = $this->conn->query($sql);
        
            $galerias = [];
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    // Adiciona a URL completa da foto para cada galeria
                    $row['foto_url'] = !empty($row['foto']) ? 
                        'http://' . $_SERVER['HTTP_HOST'] . '/sistema_de_inscricao/uploads/galerias/' . $row['foto'] : null;
                    $galerias[] = $row;
                }
            }
        
            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $galerias,
                'count' => count($galerias)
            ]);
            return true;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar galerias.',
                'error' => $e->getMessage()
            ]);
            
            error_log("Erro ao visualizar galerias: " . $e->getMessage());
            return false;
        }
    }
}

header('Content-Type: application/json');

// Verifica se a conexão $conn está definida antes de criar a Galeria
if (!isset($conn)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro de conexão com o banco de dados']);
    exit;
}

$galeria = new Galeria($conn);

// Processamento das requisições
try {
    switch ($_SERVER["REQUEST_METHOD"]) {
        case 'GET':
            if (isset($_GET['id'])) {
                $galeria->visualizar_um($_GET['id']);
            } else {
                $galeria->visualizar_todos();
            }
            break;

        case 'POST':
            // Tratamento para ação de deletar
            if (isset($_POST['action']) && $_POST['action'] == 'delete') {
                if (isset($_POST['id_galeria'])) {
                    $result = $galeria->eliminar($_POST['id_galeria']);
                    if ($result) {
                        echo json_encode(['success' => true, 'message' => 'Foto eliminada com sucesso.']);
                    } else {
                        http_response_code(500);
                        echo json_encode(['success' => false, 'message' => 'Falha ao eliminar foto.']);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'ID de galeria não fornecido.']);
                }
            } else {
                // Cadastro normal
                $galeria->cadastrar();
            }
            break;

        case 'PUT':
            // Processamento manual para PUT com arquivos
            if (empty($_FILES) && !empty($_SERVER['CONTENT_TYPE']) && 
                strpos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false) {
                parse_str(file_get_contents("php://input"), $_PUT);
                $_FILES = $_PUT['files'] ?? [];
                $_POST = array_merge($_PUT, $_GET);
            }

            if (isset($_POST['id_galeria'])) {
                $galeria->editar($_POST['id_galeria']);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID de galeria não fornecido.']);
            }
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erro interno: ' . $e->getMessage()]);
}

$conn->close();
?>