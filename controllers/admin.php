<?php
// admin_setup.php
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

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

function setupAdmin($conn, $adminConfig) {
    // Validação básica dos inputs
    if (!is_array($adminConfig) ){
        throw new Exception("Configuração do admin deve ser um array");
    }
    
    $requiredFields = ['email', 'name', 'password'];
    foreach ($requiredFields as $field) {
        if (empty($adminConfig[$field])) {
            throw new Exception("Campo '$field' é obrigatório na configuração do admin");
        }
    }
    
    if (!filter_var($adminConfig['email'], FILTER_VALIDATE_EMAIL)) {
        throw new Exception("Email inválido");
    }
    
    $email = $adminConfig['email'];
    $name = $adminConfig['name'];
    $hashedPassword = password_hash($adminConfig['password'], PASSWORD_DEFAULT);

    try {
        // Verifica se admin já existe
        $check = $conn->prepare("SELECT * FROM usuarios WHERE email = ? LIMIT 1");
        if (!$check) throw new Exception("Erro ao preparar consulta: " . $conn->error);

        $check->bind_param("s", $email);
        if (!$check->execute()) {
            throw new Exception("Erro ao executar consulta: " . $check->error);
        }
        
        $result = $check->get_result();
        if ($result === false) {
            throw new Exception("Erro ao obter resultados: " . $conn->error);
        }

        if ($result->num_rows > 0) {
            $user = $result->fetch_assoc();
            return [
                'action' => 'check',
                'success' => true,
                'message' => $user['email'],
            ];
        } else {
            // Cria o admin
            $stmt = $conn->prepare("INSERT INTO usuarios (nome, email, senha, data_de_criacao) VALUES (?, ?, ?, NOW())");
            if (!$stmt) throw new Exception("Erro ao preparar inserção: " . $conn->error);

            $stmt->bind_param("sss", $name, $email, $hashedPassword);
            $success = $stmt->execute();
            
            if (!$success) {
                throw new Exception("Erro ao criar admin: " . $stmt->error);
            }
            
            return [
                'action' => 'create',
                'success' => true,
                'message' =>$email,
                
            ];
        }
    } catch (Exception $e) {
        // Log do erro seria recomendado aqui
        return [
            'action' => 'error',
            'success' => false,
            'message' =>$email,
        ];
    }
}
// Função para atualizar perfil do usuário
function updateProfile($conn, $userId, $name, $email) {
    // Verifica se o novo email já está em uso por outro usuário
    $check = $conn->prepare("SELECT id_usuario FROM usuarios WHERE email = ? AND id_usuario != ?");
    $check->bind_param("si", $email, $userId);
    $check->execute();
    $result = $check->get_result();

    if ($result->num_rows > 0) {
        return [
            'success' => false,
            'message' => 'Este e-mail já está em uso por outro usuário.'
        ];
    }

    $stmt = $conn->prepare("UPDATE usuarios SET nome = ?, email = ? WHERE id_usuario = ?");
    if (!$stmt) throw new Exception("Erro ao preparar atualização: " . $conn->error);

    $stmt->bind_param("ssi", $name, $email, $userId);
    $success = $stmt->execute();
    
    return [
        'success' => $success,
        'message' => $success ? 'Perfil atualizado com sucesso!' : 'Erro ao atualizar perfil: ' . $stmt->error
    ];
}

// Função para obter dados do usuário
function getUserData($conn, $userId) {
    $stmt = $conn->prepare("SELECT id_usuario, nome, email FROM usuarios WHERE id_usuario = ?");
    if (!$stmt) throw new Exception("Erro ao preparar consulta: " . $conn->error);

    $stmt->bind_param("i", $userId);
    if (!$stmt->execute()) {
        throw new Exception("Erro ao executar consulta: " . $stmt->error);
    }
    
    $result = $stmt->get_result();
    if ($result->num_rows === 0) {
        return [
            'success' => false,
            'message' => 'Usuário não encontrado'
        ];
    }
    
    $userData = $result->fetch_assoc();
    return [
        'success' => true,
        'message' => 'Dados do usuário obtidos com sucesso',
        'userData' => $userData
    ];
}
// Função para atualizar senha do usuário
function updatePassword($conn, $userId, $currentPassword, $newPassword) {
    // Primeiro verifica a senha atual
    $check = $conn->prepare("SELECT senha FROM usuarios WHERE id_usuario = ?");
    $check->bind_param("i", $userId);
    $check->execute();
    $result = $check->get_result();
    
    if ($result->num_rows === 0) {
        return [
            'success' => false,
            'message' => 'Usuário não encontrado.'
        ];
    }
    
    $user = $result->fetch_assoc();
    if (!password_verify($currentPassword, $user['senha'])) {
        return [
            'success' => false,
            'message' => 'Senha atual incorreta.'
        ];
    }
    
    // Atualiza a senha
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE usuarios SET senha = ? WHERE id_usuario = ?");
    if (!$stmt) throw new Exception("Erro ao preparar atualização: " . $conn->error);

    $stmt->bind_param("si", $hashedPassword, $userId);
    $success = $stmt->execute();
    
    return [
        'success' => $success,
        'message' => $success ? 'Senha atualizada com sucesso!' : 'Erro ao atualizar senha: ' . $stmt->error
    ];
}

// Determina a ação a ser executada
$action = $_POST['action'] ?? null;

$response = [
    'success' => false,
    'message' => '',
    'data' => null
];

try {
    switch ($action) {
        case 'setup':
            $result = setupAdmin($conn, $adminConfig);
            break;
        case 'get_user_data':
            $userId = $_POST['user_id'] ?? null;
                if (!$userId) {
                    throw new Exception("ID do usuário não fornecido.");
                }
                $result = getUserData($conn, $userId);
                break;
            
        case 'update_profile':
            $userId = $_POST['user_id'] ?? null;
            $name = $_POST['name'] ?? null;
            $email = $_POST['email'] ?? null;
            
            if (!$userId || !$name || !$email) {
                throw new Exception("Dados incompletos para atualização de perfil.");
            }
            
            $result = updateProfile($conn, $userId, $name, $email);
            break;
            
        case 'update_password':
            $userId = $_POST['user_id'] ?? null;
            $currentPassword = $_POST['current_password'] ?? null;
            $newPassword = $_POST['new_password'] ?? null;
            
            if (!$userId || !$currentPassword || !$newPassword) {
                throw new Exception("Dados incompletos para atualização de senha.");
            }
            
            $result = updatePassword($conn, $userId, $currentPassword, $newPassword);
            break;
            
        default:
            throw new Exception("Ação não especificada ou inválida.");
    }

    $response['success'] = $result['success'];
    $response['message'] = $result['message'];
    error_log($response['message']);
    $response['data'] = $result['data'] ?? null;
    if ($response['success']) {
        http_response_code(200);
    } else {
        http_response_code(400);
    }   

    error_log($response['data']);

 

    // Loga a ação
    file_put_contents(
        __DIR__ . '/admin_setup.log',
        date('[Y-m-d H:i:s] ') . json_encode($result) . "\n",
        FILE_APPEND
    );

} catch (Exception $e) {
    $response['message'] = "ERRO: " . $e->getMessage();
    file_put_contents(
        __DIR__ . '/admin_setup.log',
        date('[Y-m-d H:i:s] ') . "ERRO: " . $e->getMessage() . "\n",
        FILE_APPEND
    );
} finally {
    $conn->close();
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($response, JSON_PRETTY_PRINT);
}
?>