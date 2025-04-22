<?php
include '../config/conection.php';
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

class Inscricao {
    private $conn;
    private $id_inscricao;
    private$idade;
    private $genero;
    private $numero_do_processo;
    private $nome_completo;
    private$contacto_do_aluno;
    private $contacto_do_encarregado;
    public $id_calendario;
    private $data_de_nascimento;
    private $natural_de;
    private $provincia;
    private $tipo_de_identificacao;
    private $numero_de_identificacao;
    private $data_de_validade;
    public $arquivo_de_identificacao;
    private $foto_tipo_passe;
    private $classe;
    private $turno;
    private $data_de_criacao;
    private $aprovacao;
    private $comentario;

    private $id_curso;

    private $nome_do_curso; 



    public function __construct($conn) {
        $this->conn = $conn;
    }
    public function registrar() {
        // Obter dados do POST
        $this->idade = $_POST['idade'] ?? '';
        $this->id_calendario = $_POST['id_calendario'] ?? '';
        $this->genero = $_POST['genero'] ?? '';
        $this->numero_do_processo = $_POST['numero_do_processo'] ?? '';
        $this->nome_completo = $_POST['nome_completo'] ?? '';
        $this->contacto_do_aluno = $_POST['contacto_do_aluno'] ?? '';
        $this->contacto_do_encarregado = $_POST['contacto_do_encarregado'] ?? '';
        $this->id_calendario = $_POST['id_calendario'] ?? null;
        $this->data_de_nascimento = $_POST['data_de_nascimento'] ?? '';
        $this->natural_de = $_POST['natural_de'] ?? '';
        $this->provincia = $_POST['provincia'] ?? '';
        $this->tipo_de_identificacao = $_POST['tipo_de_identificacao'] ?? '';
        $this->numero_de_identificacao = $_POST['numero_de_identificacao'] ?? '';
        $this->data_de_validade = $_POST['data_de_validade'] ?? null;
        $this->classe = $_POST['classe'] ?? '';
        $this->turno = $_POST['turno'] ?? '';
        $this->data_de_criacao = date('Y-m-d H:i:s');
        $this->aprovacao = 0;
        $this->comentario = '';
        $this->id_curso = $_POST['id_curso'] ?? null;
        $this->nome_do_curso = $_POST['nome_do_curso'] ?? null; 
    
        error_log("📥 Dados recebidos do POST:");
        error_log(print_r($_POST, true));


        $sql = "SELECT * FROM Calendarios WHERE id_calendario = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $this->id_calendario);
            $stmt->execute();
            $result = $stmt->get_result();

            error_log("Verificando se o calendário existe...");
            error_log("Calendário ID: " . $this->id_calendario);
            error_log("Resultado: " . $result->num_rows . " registros encontrados.");   

           if ($result->num_rows == 0) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Calendário não encontrado.']);
                return false;
            }
            $evento = $result->fetch_assoc();

            if($evento['numero_de_vagas'] == 0) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Número de vagas esgotado.']);
                return false;

            }
               
            if ($result->num_rows == 0) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Evento não encontrado.']);
                return false;
            }
        // Validação dos campos obrigatórios
        $camposObrigatorios = [
            'idade' => 'Idade',
            'genero' => 'Gênero',
            'numero_do_processo' => 'Número do Processo',
            'nome_completo' => 'Nome Completo',
            'contacto_do_aluno' => 'Contacto do Aluno',
            'contacto_do_encarregado' => 'Contacto do Encarregado',
            'data_de_nascimento' => 'Data de Nascimento',
            'natural_de' => 'Natural de',
            'provincia' => 'Província',
            'tipo_de_identificacao' => 'Tipo de Identificação',
            'numero_de_identificacao' => 'Número de Identificação',
            'classe' => 'Classe',
            'turno' => 'Turno',
            'id_calendario' => 'ID do Calendário'
        ];

        

        $this->id_curso = $evento['id_curso'] ?? null;
        $this->nome_do_curso = $evento['nome_do_curso'] ?? null;
      
        $erros = [];
        foreach ($camposObrigatorios as $campo => $nome) {
            if (empty($this->$campo)) {
                $erros[] = "O campo {$nome} é obrigatório.";
            }
        }
    
        if (!empty($erros)) {
            error_log("❌ Erros de campos obrigatórios: " . implode(', ', $erros));
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $erros]);
            return false;
        }
    
        // Validações adicionais
        if (!is_numeric($this->idade)) {
            $erros[] = "A idade deve ser um número válido.";
        }
    
        if (!preg_match('/^[0-9]{9}$/', $this->contacto_do_aluno)) {
            $erros[] = "O contacto do aluno deve ter 9 dígitos.";
        }
    
        if (!preg_match('/^[0-9]{9}$/', $this->contacto_do_encarregado)) {
            $erros[] = "O contacto do encarregado deve ter 9 dígitos.";
        }
    
        if (!empty($erros)) {
            error_log("❌ Erros de validação adicional: " . implode(', ', $erros));
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $erros]);
            return false;
        }
    
        try {
            error_log("📤 Iniciando upload de arquivos...");
            $this->arquivo_de_identificacao = $this->processarUpload('arquivo_de_identificacao');
            $this->foto_tipo_passe = $this->processarUpload('foto_tipo_passe');
    
            error_log("✅ Uploads finalizados. Iniciando INSERT...");
            $sql = "INSERT INTO inscricoes (
                idade, genero, numero_de_processo, nome_completo, 
                contacto_do_aluno, contacto_do_encarregado, id_calendario,
                data_de_nascimento, natural_de, provincia, 
                tipo_de_identificacao, numero_de_identificacao, data_de_validade,
                arquivo_de_identificacao, foto_tipo_passe, classe, turno, 
                data_de_criacao, aprovacao, comentario, id_curso, nome_do_curso 
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
            $stmt = $this->conn->prepare($sql); // <--- ESSENCIAL
            if (!$stmt) {
                throw new Exception("Erro ao preparar a query: " . $this->conn->error);
            }
    
            $stmt->bind_param(
                "isisssisssssssssssisss",
                $this->idade,
                $this->genero,
                $this->numero_do_processo,
                $this->nome_completo,
                $this->contacto_do_aluno,
                $this->contacto_do_encarregado,
                $this->id_calendario,
                $this->data_de_nascimento,
                $this->natural_de,
                $this->provincia,
                $this->tipo_de_identificacao,
                $this->numero_de_identificacao,
                $this->data_de_validade,
                $this->arquivo_de_identificacao,
                $this->foto_tipo_passe,
                $this->classe,
                $this->turno,
                $this->data_de_criacao,
                $this->aprovacao,
                $this->comentario,
                $this->id_curso,
                $this->nome_do_curso    
            );
    
            if ($stmt->execute()) {
                $this->id_inscricao = $stmt->insert_id;
                error_log("✅ Inscrição inserida com sucesso. ID: {$this->id_inscricao}");
    
                $descricao = "A uma nova inscrição a ser avaliada"; // ← define em variável
                $titulo = "Nova inscrição recebida"; // ← define em variável
                $sql2 = "INSERT INTO notificacoes (descricao, titulo) VALUES (?, ?)";
                $stmt2 = $this->conn->prepare($sql2);
                $stmt2->bind_param("ss", $descricao, $titulo); // ← agora tudo são variáveis
                $stmt2->execute();
                $stmt2->close();
                

                $sql3 = "UPDATE Calendarios SET numero_de_vagas = numero_de_vagas - 1 WHERE id_calendario = ?";
                $stmt3 = $this->conn->prepare($sql3);
                $stmt3->bind_param("i", $this->id_calendario);
                $stmt3->execute();
                $stmt3->close();

    
                http_response_code(201);
                echo json_encode([
                    'success' => true,
                    'message' => 'Inscrição registrada com sucesso!',
                    'data' => [
                        'id_inscricao' => $this->id_inscricao,
                        'nome_completo' => $this->nome_completo
                    ]
                ]);
                return true;
            } else {
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            error_log("🚨 Exceção lançada: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao registrar inscrição.',
                'error' => $e->getMessage()
            ]);
            return false;
        }
    }
    

    private function processarUpload($campo) {
        if (isset($_FILES[$campo]) && $_FILES[$campo]['error'] === UPLOAD_ERR_OK) {
            $diretorio = '../uploads/';
            if (!is_dir($diretorio)) {
                mkdir($diretorio, 0755, true);
            }
            
            $extensao = pathinfo($_FILES[$campo]['name'], PATHINFO_EXTENSION);
            $nomeArquivo = uniqid() . '.' . $extensao;
            $caminhoCompleto = $diretorio . $nomeArquivo;

            if (move_uploaded_file($_FILES[$campo]['tmp_name'], $caminhoCompleto)) {
                return $nomeArquivo;
            }
        }
        return null;
    }

    public function editar($id_inscricao) {
        if (!is_numeric($id_inscricao)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de inscrição inválido.']);
            return false;
        }

        // Obter dados do POST
        $this->idade = $_POST['idade'] ?? '';
        $this->genero = $_POST['genero'] ?? '';
        $this->numero_do_processo = $_POST['numero_do_processo'] ?? '';
        $this->nome_completo = $_POST['nome_completo'] ?? '';
        $this->contacto_do_aluno = $_POST['contacto_do_aluno'] ?? '';
        $this->contacto_do_encarregado = $_POST['contacto_do_encarregado'] ?? '';
        $this->id_calendario = $_POST['id_calendario'] ?? null;
        $this->data_de_nascimento = $_POST['data_de_nascimento'] ?? '';
        $this->natural_de = $_POST['natural_de'] ?? '';
        $this->provincia = $_POST['provincia'] ?? '';
        $this->tipo_de_identificacao = $_POST['tipo_de_identificacao'] ?? '';
        $this->numero_de_identificacao = $_POST['numero_de_identificacao'] ?? '';
        $this->data_de_validade = $_POST['data_de_validade'] ?? null;
        $this->classe = $_POST['classe'] ?? '';
        $this->turno = $_POST['turno'] ?? '';
        $this->aprovacao = $_POST['aprovacao'] ?? 0;
        $this->comentario = $_POST['comentario'] ?? '';

        // Processar uploads se existirem
        if (isset($_FILES['arquivo_de_identificacao'])) {
            $this->arquivo_de_identificacao = $this->processarUpload('arquivo_de_identificacao');
        }
        if (isset($_FILES['foto_tipo_passe'])) {
            $this->foto_tipo_passe = $this->processarUpload('foto_tipo_passe');
        }

        try {
            $sql = "UPDATE inscricoes SET 
                    idade = ?, genero = ?, numero_do_processo = ?, nome_completo = ?, 
                    contacto_do_aluno = ?, contacto_do_encarregado = ?, id_calendario = ?, 
                    data_de_nascimento = ?, natural_de = ?, provincia = ?, 
                    tipo_de_identificacao = ?, numero_de_identificacao = ?, data_de_validade = ?,
                    " . ($this->arquivo_de_identificacao ? "arquivo_de_identificacao = ?, " : "") .
                    ($this->foto_tipo_passe ? "foto_tipo_passe = ?, " : "") . "
                    classe = ?, turno = ?, aprovacao = ?, comentario = ?
                    WHERE id_inscricao = ?";

            // Construir os parâmetros dinamicamente
            $params = [
                $this->idade,
                $this->genero,
                $this->numero_do_processo,
                $this->nome_completo,
                $this->contacto_do_aluno,
                $this->contacto_do_encarregado,
                $this->id_calendario,
                $this->data_de_nascimento,
                $this->natural_de,
                $this->provincia,
                $this->tipo_de_identificacao,
                $this->numero_de_identificacao,
                $this->data_de_validade
            ];

            if ($this->arquivo_de_identificacao) {
                $params[] = $this->arquivo_de_identificacao;
            }
            if ($this->foto_tipo_passe) {
                $params[] = $this->foto_tipo_passe;
            }

            $params[] = $this->classe;
            $params[] = $this->turno;
            $params[] = $this->aprovacao;
            $params[] = $this->comentario;
            $params[] = $id_inscricao;

            $stmt = $this->conn->prepare($sql);
            $tipos = str_repeat('s', count($params) - 1) . 'i'; // Todos strings exceto o último que é inteiro (id)
            $stmt->bind_param($tipos, ...$params);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    http_response_code(200);
                    echo json_encode(['success' => true, 'message' => 'Inscrição atualizada com sucesso!']);
                    return true;
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Nenhuma alteração realizada ou inscrição não encontrada.']);
                    return false;
                }
            } else {
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao atualizar inscrição.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao editar inscrição: " . $e->getMessage());
            return false;
        }
    }

    public function eliminar($id_inscricao) {
        if (!is_numeric($id_inscricao)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de inscrição inválido.']);
            return false;
        }

        try {
            $sql = "DELETE FROM inscricoes WHERE id_inscricao = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_inscricao);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    http_response_code(200);
                    echo json_encode(['success' => true, 'message' => 'Inscrição eliminada com sucesso!']);
                    return true;
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Inscrição não encontrada.']);
                    return false;
                }
            } else {
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao eliminar inscrição.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao eliminar inscrição: " . $e->getMessage());
            return false;
        }
    }

    // Método para visualizar uma inscrição específica
    public function visualizar($id_inscricao) {
        if (!is_numeric($id_inscricao)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de inscrição inválido.']);
            return false;
        }

        try {
            $sql = "SELECT * FROM inscricoes WHERE id_inscricao = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_inscricao);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $inscricao = $result->fetch_assoc();
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'data' => $inscricao
                ]);
                return true;
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Inscrição não encontrada.']);
                return false;
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar inscrição.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao visualizar inscrição: " . $e->getMessage());
            return false;
        }
    }

    // Método para visualizar todas as inscrições
    public function visualizar_todos() {
        try {
            $sql = "SELECT * FROM inscricoes ORDER BY data_de_criacao DESC";
            $result = $this->conn->query($sql);

            $inscricoes = [];
            if ($result->num_rows > 0) {
                while($row = $result->fetch_assoc()) {
                    $inscricoes[] = $row;
                }
            }

            http_response_code(200);
            echo json_encode([
                'success' => true,
                'data' => $inscricoes,
                'count' => count($inscricoes)
            ]);
            return true;
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar inscrições.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao visualizar inscrições: " . $e->getMessage());
            return false;
        }
    }
    public function getNumberProcess($id_calendario): bool {

        if (!is_numeric($id_calendario)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de calendário inválido.']);
            return false;
        }
    
        try {
            $sql = "SELECT * FROM inscricoes WHERE id_calendario = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("i", $id_calendario);
            $stmt->execute();
            $result = $stmt->get_result();
    
            if ($result->num_rows > 0) {
                $inscricoes = [];
    
                while ($row = $result->fetch_assoc()) {
                    $inscricoes[] = $row;
                }
    
                http_response_code(200);
                echo json_encode([
                    'success' => true,
                    'data' => $inscricoes
                ]);
                return true;
    
            } else {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Nenhuma inscrição encontrada.']);
                return false;
            }
    
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao buscar inscrições.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao buscar inscrições: " . $e->getMessage());
            return false;
        }
    }
    
    // Método para aprovar uma inscrição
    public function aprovar($id_inscricao, $comentario) {   
        if (!is_numeric($id_inscricao)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de inscrição inválido.']);
            return false;
        }

        $this->aprovacao = 1;
        $this->comentario = $comentario ?? '';

        try {
            $sql = "UPDATE inscricoes SET aprovacao = ?, comentario = ? WHERE id_inscricao = ?";
            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param("isi", $this->aprovacao, $this->comentario, $id_inscricao);

            if ($stmt->execute()) {
                if ($stmt->affected_rows > 0) {
                    // Adicionar notificação
                    $descricao = "Inscrição aprovada: ID " . $id_inscricao;
                    $sql2 = "INSERT INTO notificacoes (descricao) VALUES (?)";
                    $stmt2 = $this->conn->prepare($sql2);
                    $stmt2->bind_param("s", $descricao);
                    $stmt2->execute();

                    http_response_code(200);
                    echo json_encode(['success' => true, 'message' => 'Inscrição aprovada com sucesso!']);
                    return true;
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Inscrição não encontrada.']);
                    return false;
                }
            } else {
                throw new Exception("Erro ao executar a query: " . $stmt->error);
            }
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao aprovar inscrição.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro ao aprovar inscrição: " . $e->getMessage());
            return false;
        }
    }
}

// Configurações iniciais
header('Content-Type: application/json');
$inscricao = new Inscricao($conn);

// Verificar o método da requisição
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (isset($_GET['id'])) {
        $inscricao->visualizar($_GET['id']);
    } else {
        $inscricao->visualizar_todos();
    }

} elseif ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Verificar a chave "action" para determinar o tipo de ação
    if (isset($_POST['action'])) {
        switch ($_POST['action']) {
            case 'approval':
                if (isset($_POST['id_inscricao']) && isset($_POST['comentario'])) {
                    $inscricao->aprovar($_POST['id_inscricao'], $_POST['comentario']);
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'ID de inscrição não fornecido para aprovação.']);
                }
                break;

            case 'put':
                if (isset($_POST['id_inscricao'])) {
                    $inscricao->editar($_POST['id_inscricao']);
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'ID de inscrição não fornecido para edição.']);
                }
                break;

            case 'query': // Para a ação de consulta
                if (isset($_POST['id_calendario'])) {
                    $inscricao->getNumberProcess($_POST['id_calendario']);
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'ID do calendário não fornecido.']);
                }
                break;

            case 'post':
                $inscricao->registrar();
                break;

            case 'delete':
                if (isset($_POST['id_inscricao'])) {
                    $inscricao->eliminar($_POST['id_inscricao']);
                } else {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'ID de inscrição não fornecido para eliminação.']);
                }
                break;

            default:
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Ação não reconhecida.']);
                break;
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Ação não especificada.']);
    }

} elseif ($_SERVER["REQUEST_METHOD"] == "DELETE") {
    parse_str(file_get_contents("php://input"), $_DELETE);
    if (isset($_DELETE['id_inscricao'])) {
        $inscricao->eliminar($_DELETE['id_inscricao']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de inscrição não fornecido para eliminação.']);
    }

} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}

$conn->close();


?>