<?php
// token_check.php
include '../config/conection.php';
session_start();
header('Content-Type: application/json');

// Tempo de expiração do token (4 horas em segundos)
define('TOKEN_EXPIRATION', 4 * 60 * 60);

function terminarSessao() {
    // Limpa todos os dados da sessão
    $_SESSION = array();

    // Se deseja matar a sessão, apague também o cookie de sessão
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }

    // Destrói a sessão
    session_destroy();
    
    return true;
}

try {
    // Verifica se é uma requisição de logout
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'logout') {
        terminarSessao();
        echo json_encode([
            'status' => 'success',
            'message' => 'Sessão encerrada com sucesso',
            'redirect' => '../admin/login.html'
        ]);
        exit();
    }

    // Verificação normal do token
    if (!isset($_SESSION['token'], $_SESSION['token_expira'])) {
        throw new Exception('Token não encontrado', 401);
    }

    // Verifica se o token expirou
    $currentTime = time();
    if ($currentTime > $_SESSION['token_expira']) {
        terminarSessao();
        throw new Exception('Token expirado', 401);
    }

    // Se o token estiver válido, retorna informações
    echo json_encode([
        'status' => 'success',
        'message' => 'Token válido',
        'data' => [
            'expira_em' => $_SESSION['token_expira'],
            'expira_em_formatado' => date('Y-m-d H:i:s', $_SESSION['token_expira']),
            'tempo_restante' => $_SESSION['token_expira'] - $currentTime
        ]
    ]);

} catch (Exception $e) {
    http_response_code($e->getCode() ?: 500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'redirect' => true
    ]);
}
?>