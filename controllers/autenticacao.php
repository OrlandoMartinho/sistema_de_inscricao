<?php
include '../config/conection.php';
session_start();
header('Content-Type: application/json');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Don't show errors to users
ini_set('log_errors', 1);
ini_set('error_log', '../logs/login_errors.log');

// Log script start
error_log("[LOGIN] Login attempt started - " . date('Y-m-d H:i:s'));

try {
    // Validate input
    if (empty($_POST['email']) || empty($_POST['senha'])) {
        error_log("[LOGIN] Missing email or password - IP: " . $_SERVER['REMOTE_ADDR']);
        http_response_code(400);
        echo json_encode(['status' => 'erro', 'mensagem' => 'Email e senha são obrigatórios.']);
        exit;
    }

    $email = $_POST['email'];
    $senha = $_POST['senha'];
    
    error_log("[LOGIN] Attempting login for email: " . $email . " - IP: " . $_SERVER['REMOTE_ADDR']);

    // Database query
    $sql = "SELECT * FROM usuarios WHERE email = ? AND senha = ?";
    error_log("[LOGIN] Preparing SQL: " . $sql);
    
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        error_log("[LOGIN] Prepare failed: " . $conn->error);
        throw new Exception("Database error");
    }
    
    $stmt->bind_param("ss", $email, $senha);
    $executed = $stmt->execute();
    
    if (!$executed) {
        error_log("[LOGIN] Execute failed: " . $stmt->error);
        throw new Exception("Database error");
    }
    
    $result = $stmt->get_result();
    error_log("[LOGIN] Found rows: " . $result->num_rows);

    if ($result->num_rows > 0) {
        // User found
        $usuario = $result->fetch_assoc();
        error_log("[LOGIN] User found: " . print_r($usuario, true));
        
        $_SESSION['token'] = hash('sha256', $senha . time());
        $_SESSION['usuario'] = $usuario['nome'] ?? 'admin';
        $_SESSION['email'] = $email;
        
        error_log("[LOGIN] Login successful for user: " . $_SESSION['usuario'] . " - Token: " . $_SESSION['token']);

        echo json_encode([
            'status' => 'success',
            'mensagem' => 'Login realizado com sucesso.',
            'usuario' => $_SESSION['usuario'],
            'token' => $_SESSION['token']
        ]);
    } else {
        error_log("[LOGIN] Invalid credentials for email: " . $email . " - IP: " . $_SERVER['REMOTE_ADDR']);
        echo json_encode([
            'status' => 'erro',
            'mensagem' => 'Email ou senha inválidos.'
        ]);
    }
} catch (Exception $e) {
    error_log("[LOGIN] Exception: " . $e->getMessage() . " in " . $e->getFile() . " on line " . $e->getLine());
    http_response_code(500);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Ocorreu um erro interno. Por favor, tente novamente mais tarde.'
    ]);
}

// Log script end
error_log("[LOGIN] Script execution completed - " . date('Y-m-d H:i:s') . "\n");
?>