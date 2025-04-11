<?php
include '../config/conection.php';
session_start();
header('Content-Type: application/json');

// Ativar logs de erros
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', '../logs/login_errors.log');

// Tempo de expiração do token (4 horas em segundos)
define('TOKEN_EXPIRATION', 4 * 60 * 60);

try {
    // Validação dos campos
    if (!isset($_POST['email'], $_POST['senha'])) {
        throw new Exception("Campos obrigatórios não enviados.");
    }

    $email = trim($_POST['email']);
    $senha = $_POST['senha'];

    error_log("[LOGIN] Tentativa de login para o email: $email - IP: " . $_SERVER['REMOTE_ADDR']);

    // Consulta SQL
    $sql = "SELECT * FROM usuarios WHERE email = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        error_log("[LOGIN] Erro ao preparar SQL: " . $conn->error);
        throw new Exception("Erro no banco de dados.");
    }

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    error_log("[LOGIN] Linhas encontradas: " . $result->num_rows);

    if ($result->num_rows > 0) {
        $usuario = $result->fetch_assoc();

        if (password_verify($senha, $usuario['senha'])) {
            // Login válido - gerar token com expiração
            $token = hash('sha256', $senha . time() . bin2hex(random_bytes(16)));
            $expira_em = time() + TOKEN_EXPIRATION;
            
            // Armazenar na sessão
            $_SESSION['token'] = $token;
            $_SESSION['token_expira'] = $expira_em;
            $_SESSION['usuario'] = $usuario['nome'];
            $_SESSION['email'] = $usuario['email'];
            $_SESSION['user_id'] = $usuario['id']; // Adicionado para referência

            error_log("[LOGIN] Login bem-sucedido para: " . $_SESSION['usuario'] . " - Token expira em: " . date('Y-m-d H:i:s', $expira_em));

            echo json_encode([
                'status' => 'success',
                'mensagem' => 'Login realizado com sucesso.',
                'usuario' => $_SESSION['usuario'],
                'token' => $token,
                'expira_em' => $expira_em,
                'expira_em_formatado' => date('Y-m-d H:i:s', $expira_em)
            ]);
        } else {
            // Senha incorreta
            error_log("[LOGIN] Senha inválida para: $email");
            echo json_encode([
                'status' => 'erro',
                'mensagem' => 'Email ou senha inválidos.'
            ]);
        }
    } else {
        // Email não encontrado
        error_log("[LOGIN] Email não encontrado: $email");
        echo json_encode([
            'status' => 'erro',
            'mensagem' => 'Email ou senha inválidos.'
        ]);
    }
} catch (Exception $e) {
    error_log("[LOGIN] Exceção: " . $e->getMessage() . " em " . $e->getFile() . ":" . $e->getLine());
    http_response_code(500);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Erro interno. Tente novamente mais tarde.'
    ]);
}

error_log("[LOGIN] Fim do script - " . date('Y-m-d H:i:s') . "\n");
?>