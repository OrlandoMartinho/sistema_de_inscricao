<?php
include '../config/conection.php';
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

class Contacto {
    private $id_contacto;
    private $conn;
    public $nome;
    public $email;
    public $assunto;
    public $mensagem;
    public $respondido;
    public $data_de_resposta;
    public $data_de_criacao;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    public function cadastrar() {
        // Obter dados brutos do POST (sanitização será feita no bind_param)
        $this->nome = $_POST['nome'] ?? '';
        $this->email = $_POST['email'] ?? '';
        $this->assunto = $_POST['assunto'] ?? '';
        $this->mensagem = $_POST['mensagem'] ?? '';
        $this->respondido = 0;
        $this->data_de_criacao = date('Y-m-d H:i:s');
    
        // Validação dos campos obrigatórios
        if (empty($this->nome) || empty($this->email) || empty($this->mensagem)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Por favor, preencha todos os campos obrigatórios.']);
            return false;
        }
    
        // Validação do email
        if (!filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Por favor, insira um email válido.']);
            return false;
        }
    
        try {
            $sql = "INSERT INTO contactos (nome, email, assunto, mensagem, respondido, data_de_criacao) 
                    VALUES (?, ?, ?, ?, ?, ?)";
            $stmt = $this->conn->prepare($sql);
            
            // O bind_param já faz a sanitização adequada para o banco de dados
            $stmt->bind_param("ssssis", 
                $this->nome, 
                $this->email, 
                $this->assunto, 
                $this->mensagem, 
                $this->respondido, 
                $this->data_de_criacao);
    
            if ($stmt->execute()) {
                // Adiciona notificação
                $descricao = "Novo contato recebido de: " . $this->nome . " (" . $this->email . ")";
                $titulo = "Novo contato recebido"; // ← define em variável
                $sql2 = "INSERT INTO notificacoes (descricao, titulo) VALUES (?, ?)";
                $stmt2 = $this->conn->prepare($sql2);
                $stmt2->bind_param("ss", $descricao, $titulo); // ← agora tudo são variáveis
                $stmt2->execute();
                
    
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Mensagem enviada com sucesso!',
                    'data' => [
                        'nome' => $this->nome,
                        'email' => $this->email,
                        'assunto' => $this->assunto
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
                'message' => 'Erro ao enviar mensagem. Por favor, tente novamente mais tarde.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro no banco de dados: " . $e->getMessage());
            return false;
        }
    }

    // Método para eliminar um contato
    public function eliminar($id_contacto) {
        if (!is_numeric($id_contacto)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de contato inválido.']);
            return false;
        }

        try {
            $sql = "DELETE FROM contactos WHERE id_contacto = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_contacto);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    http_response_code(200);
                    echo json_encode(['success' => true, 'message' => 'Contato apagado com sucesso!']);
                    return true;
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Contato não encontrado.']);
                    return false;
                }
            } else {
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao apagar o contato.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao eliminar contato: " . $e->getMessage());
            return false;
        }
    }

    // Método para visualizar um contato específico
    public function visualizar_um($id_contacto) {
        if (!is_numeric($id_contacto)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de contato inválido.']);
            return false;
        }

        try {
            $sql = "SELECT * FROM contactos WHERE id_contacto = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_contacto);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $contato = $result->fetch_assoc();
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'data' => $contato
                ]);
                return true;
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Contato não encontrado.']);
                return false;
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar contato.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao visualizar contato: " . $e->getMessage());
            return false;
        }
    }

    // Método para visualizar todos os contactos
    public function visualizar_todos() {
        try {
            $sql = "SELECT * FROM contactos ORDER BY data_de_criacao DESC";
            $result = $this->conn->query($sql);

            $contactos = [];
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $contactos[] = $row;
                }
            }

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $contactos,
                'count' => count($contactos)
            ]);
            return true;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar contatos.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao visualizar contatos: " . $e->getMessage());
            return false;
        }
    }
    public function response($id_contacto, $resposta) {
        // Validação do ID do contacto
        if (!is_numeric($id_contacto)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de contato inválido.']);
            return false;
        }
    
        // Validação da resposta
        if (empty(trim($resposta))) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'O texto da resposta é obrigatório.']);
            return false;
        }
    
        try {
            // Buscar os dados do contactante
            $sqlSelect = "SELECT email, nome FROM contactos WHERE id_contacto = ?";
            $stmtSelect = $this->conn->prepare($sqlSelect);
            $stmtSelect->bind_param("i", $id_contacto);
            $stmtSelect->execute();
            $result = $stmtSelect->get_result();
            
            if ($result->num_rows === 0) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Contato não encontrado.']);
                return false;
            }
            
            $contacto = $result->fetch_assoc();
            $email_contactante = $contacto['email'];
            $nome_contactante = $contacto['nome'];
            
            // Validar email do contactante
            if (!filter_var($email_contactante, FILTER_VALIDATE_EMAIL)) {
                throw new Exception("Email do contactante inválido.");
            }
    
            // Atualizar o contato como respondido
            $this->respondido = 1;
            $this->data_de_resposta = date('Y-m-d H:i:s');
            
            $sqlUpdate = "UPDATE contactos SET respondido = ?, data_de_resposta = ? WHERE id_contacto = ?";
            $stmtUpdate = $this->conn->prepare($sqlUpdate);
            $stmtUpdate->bind_param("isi", $this->respondido, $this->data_de_resposta, $id_contacto);
    
            if (!$stmtUpdate->execute()) {
                throw new Exception("Erro ao atualizar o contato: " . $stmtUpdate->error);
            }
            
            if ($stmtUpdate->affected_rows === 0) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Contato não encontrado.']);
                return false;
            }
            
            // // Preparar e enviar o email de resposta
            // $assunto = "Resposta ao seu contacto";
            
            // $mensagem = "Olá " . htmlspecialchars($nome_contactante) . ",\n\n";
            // $mensagem .= "Agradecemos o seu contacto. Segue a nossa resposta:\n\n";
            // $mensagem .= $resposta . "\n\n";
            // $mensagem .= "Cumprimentos,\n";
            // $mensagem .= "[Sua Equipe/Nome da Empresa]";
            
            // $headers = "From: seuemail@seudominio.com" . "\r\n" .
            //            "Reply-To: seuemail@seudominio.com" . "\r\n" .
            //            "X-Mailer: PHP/" . phpversion();
            
            // if (!mail($email_contactante, $assunto, $mensagem, $headers)) {
            //     throw new Exception("Falha ao enviar o email de resposta.");
            // }
    
            http_response_code(200);
            echo json_encode([
                'success' => true, 
                'message' => 'Contato marcado como respondido e email enviado com sucesso!'
            ]);
            return true;
            
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro no processo de resposta.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao responder contato: " . $e->getMessage());
            return false;
        }
    }
}

// Configurações iniciais
header('Content-Type: application/json');
$contacto = new Contacto($conn);

// Rotas
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (isset($_GET['id'])) {
        $contacto->visualizar_um($_GET['id']);
    } else {
        $contacto->visualizar_todos();
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['action']) && $_POST['action'] == 'put') {
        $contacto->response($_POST['id_contacto'], resposta:$_POST['resposta']);
    } elseif (isset($_POST['action']) && $_POST['action'] == 'delete') {
        if (isset($_POST['id_contacto'])) {
            $contacto->eliminar($_POST['id_contacto']);
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de contato não fornecido.']);
        }
    } else {
        $contacto->cadastrar();
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}
$conn->close();
?>