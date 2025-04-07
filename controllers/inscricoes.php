<?php
include '../config/conection.php';

class Inscricao {
    private $conn;
    public $id_inscricao;
    public $idade;
    public $genero;
    public $numero_do_processo;
    public $nome_completo;
    public $contacto_do_aluno;
    public $contacto_do_encarregado;
    public $id_calendario;
    public $data_de_nascimento;
    public $natural_de;
    public $provincia;
    public $tipo_de_identificacao;
    public $numero_de_identificacao;
    public $arquivo_de_identificacao;
    public $foto_tipo_passe;
    public $classe;
    public $turno;
    public $data_de_criacao;
    public $aprovacao;
    public $comentario;

    public function __construct($conn) {
        $this->conn = $conn;
    }

    // Método para registrar uma nova inscrição
    public function registrar() {
        // Obter dados do POST
        $this->idade = $_POST['idade'] ?? '';
        $this->genero = $_POST['genero'] ?? '';
        $this->numero_do_processo = $_POST['numero_do_processo'] ?? '';
        $this->nome_completo = $_POST['nome_completo'] ?? '';
        $this->contacto_do_aluno = $_POST['contacto_do_aluno'] ?? '';
        $this->contacto_do_encarregado = $_POST['contacto_do_encarregado'] ?? '';
        $this->data_de_nascimento = $_POST['data_de_nascimento'] ?? '';
        $this->natural_de = $_POST['natural_de'] ?? '';
        $this->provincia = $_POST['provincia'] ?? '';
        $this->tipo_de_identificacao = $_POST['tipo_de_identificacao'] ?? '';
        $this->numero_de_identificacao = $_POST['numero_de_identificacao'] ?? '';
        $this->classe = $_POST['classe'] ?? '';
        $this->turno = $_POST['turno'] ?? '';
        $this->data_de_criacao = date('Y-m-d H:i:s');
        $this->aprovacao = 0; // Não aprovado por padrão
        $this->comentario = '';

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
            'turno' => 'Turno'
        ];

        $erros = [];
        foreach ($camposObrigatorios as $campo => $nome) {
            if (empty($this->$campo)) {
                $erros[] = "O campo {$nome} é obrigatório.";
            }
        }

        if (!empty($erros)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $erros]);
            return false;
        }

        // Validação adicional
        if (!is_numeric($this->idade)){
            $erros[] = "A idade deve ser um número válido.";
        }

        if (!preg_match('/^[0-9]{9}$/', $this->contacto_do_aluno)) {
            $erros[] = "O contacto do aluno deve ter 9 dígitos.";
        }

        if (!preg_match('/^[0-9]{9}$/', $this->contacto_do_encarregado)) {
            $erros[] = "O contacto do encarregado deve ter 9 dígitos.";
        }

        if (!empty($erros)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => $erros]);
            return false;
        }

        try {
            // Processar upload de arquivos (simplificado - implementação real depende da sua configuração)
            $this->arquivo_de_identificacao = $this->processarUpload('arquivo_de_identificacao');
            $this->foto_tipo_passe = $this->processarUpload('foto_tipo_passe');

            $sql = "INSERT INTO inscricoes (
                idade, genero, numero_do_processo, nome_completo, contacto_do_aluno, 
                contacto_do_encarregado, id_calendario, data_de_nascimento, natural_de, 
                provincia, tipo_de_identificacao, numero_de_identificacao, arquivo_de_identificacao, 
                foto_tipo_passe, classe, turno, data_de_criacao, aprovacao, comentario
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param(
                "isisssissssssssssis",
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
                $this->arquivo_de_identificacao,
                $this->foto_tipo_passe,
                $this->classe,
                $this->turno,
                $this->data_de_criacao,
                $this->aprovacao,
                $this->comentario
            );

            if ($stmt->execute()) {
                $this->id_inscricao = $stmt->insert_id;

                // Adicionar notificação
                $descricao = "Nova inscrição registrada: " . $this->nome_completo;
                $sql2 = "INSERT INTO notificacoes (descricao) VALUES (?)";
                $stmt2 = $this->conn->prepare($sql2);
                $stmt2->bind_param("s", $descricao);
                $stmt2->execute();

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
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao registrar inscrição.',
                'error' => $e->getMessage()
            ]);
            error_log("Erro no banco de dados: " . $e->getMessage());
            return false;
        }
    }

    private function processarUpload($campo) {
        // Implementação básica - deve ser adaptada para seu ambiente
        if (isset($_FILES[$campo]) && $_FILES[$campo]['error'] === UPLOAD_ERR_OK) {
            $diretorio = '../uploads/';
            $nomeArquivo = uniqid() . '_' . basename($_FILES[$campo]['name']);
            $caminhoCompleto = $diretorio . $nomeArquivo;

            if (move_uploaded_file($_FILES[$campo]['tmp_name'], $caminhoCompleto)) {
                return $nomeArquivo;
            }
        }
        return null;
    }

    // Método para editar uma inscrição
    public function editar($id_inscricao) {
        if (!is_numeric($id_inscricao)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de inscrição inválido.']);
            return false;
        }

        // Obter dados do POST (similar ao registrar)
        // Implementação similar ao registrar, mas com UPDATE

        try {
            $sql = "UPDATE inscricoes SET 
                    idade = ?, genero = ?, numero_do_processo = ?, nome_completo = ?, 
                    contacto_do_aluno = ?, contacto_do_encarregado = ?, id_calendario = ?, 
                    data_de_nascimento = ?, natural_de = ?, provincia = ?, 
                    tipo_de_identificacao = ?, numero_de_identificacao = ?, 
                    classe = ?, turno = ?, aprovacao = ?, comentario = ?
                    WHERE id_inscricao = ?";

            $stmt = $this->conn->prepare($sql);
            $stmt->bind_param(
                "isisssissssssssii",
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
                $this->classe,
                $this->turno,
                $this->aprovacao,
                $this->comentario,
                $id_inscricao
            );

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

    // Método para eliminar uma inscrição
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

    // Método para aprovar uma inscrição
    public function aprovar($id_inscricao) {
        if (!is_numeric($id_inscricao)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID de inscrição inválido.']);
            return false;
        }

        $this->aprovacao = 1;
        $this->comentario = $_POST['comentario'] ?? '';

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

// Rotas
if ($_SERVER["REQUEST_METHOD"] == "GET") {
    if (isset($_GET['id'])) {
        $inscricao->visualizar($_GET['id']);
    } else {
        $inscricao->visualizar_todos();
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "POST") {
    if (isset($_POST['aprovacao'])) {
        $inscricao->aprovar($_POST['id_inscricao']);
    } elseif (isset($_POST['edicao'])) {
        $inscricao->editar($_POST['id_inscricao']);
    } else {
        $inscricao->registrar();
    }
} elseif ($_SERVER["REQUEST_METHOD"] == "DELETE") {
    parse_str(file_get_contents("php://input"), $_DELETE);
    if (isset($_DELETE['id_inscricao'])) {
        $inscricao->eliminar($_DELETE['id_inscricao']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'ID de inscrição não fornecido.']);
    }
} else {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
}

$conn->close();
?>