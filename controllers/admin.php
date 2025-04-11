<?php
// admin_setup.php

include '../config/conection.php';
include './env_loader.php';

// Carrega as variáveis de ambiente do arquivo JSON
loadEnv2(dirname(__DIR__) . '/env.json');

// Pega os dados do admin a partir do JSON carregado
$adminConfig = [
    'email' => getenv('ADMIN_EMAIL'),
    'name' => getenv('ADMIN_NAME'),
    'password' => getenv('ADMIN_PASSWORD')
];

// Função para setup do admin
function setupAdmin($conn, $adminConfig) {
    $email = $adminConfig['email'];
    $name = $adminConfig['name'];
    $hashedPassword = password_hash($adminConfig['password'], PASSWORD_DEFAULT);

    // Verifica se admin já existe
    $check = $conn->prepare("SELECT * FROM usuarios WHERE email = ? LIMIT 1");
    if (!$check) throw new Exception("Erro ao preparar consulta: " . $conn->error);

    $check->bind_param("s", $email);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows > 0) {
        // Atualiza o admin
        $stmt = $conn->prepare("UPDATE usuarios SET nome = ?, senha = ? WHERE email = ?");
        if (!$stmt) throw new Exception("Erro ao preparar atualização: " . $conn->error);

        $stmt->bind_param("sss", $name, $hashedPassword, $email);
        $success = $stmt->execute();
        return [
            'action' => 'update',
            'success' => $success,
            'message' => $success ? 'Admin atualizado com sucesso!' : 'Erro ao atualizar admin: ' . $stmt->error,
            'email' => $email,
        ];
    } else {
        // Cria o admin
        $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, data_de_criacao) VALUES (?, ?, ?, NOW())");
        if (!$stmt) throw new Exception("Erro ao preparar inserção: " . $conn->error);

        $stmt->bind_param("sss", $name, $email, $hashedPassword);
        $success = $stmt->execute();
        return [
            'action' => 'create',
            'success' => $success,
            'message' => $success ? 'Admin criado com sucesso!' : 'Erro ao criar admin: ' . $stmt->error,
            'email' => $email
        ];
    }
}

// Executa o processo e retorna JSON
header('Content-Type: application/json; charset=utf-8');

$response = [
    'success' => false,
    'message' => '',
    'data' => null
];

try {
    $result = setupAdmin($conn, $adminConfig);

    $response['success'] = $result['success'];
    $response['message'] = $result['message'];
    $response['data'] = [
        'action' => $result['action'],
        'email' => $result['email'],
        'timestamp' => date('Y-m-d H:i:s')
    ];

    // Loga a ação
    file_put_contents(
        __DIR__ . '/admin_setup.log',
        date('[Y-m-d H:i:s] ') . json_encode($result) . "\n",
        FILE_APPEND
    );

    $conn->close();
} catch (Exception $e) {
    $response['message'] = "ERRO: " . $e->getMessage();
    file_put_contents(
        __DIR__ . '/admin_setup.log',
        date('[Y-m-d H:i:s] ') . "ERRO: " . $e->getMessage() . "\n",
        FILE_APPEND
    );
} finally {
    echo json_encode($response, JSON_PRETTY_PRINT);
}
?>
