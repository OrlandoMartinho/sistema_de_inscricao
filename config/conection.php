<?php
// Função para carregar variáveis de um env.json
function loadEnvJson($jsonPath) {
    if (!file_exists($jsonPath)) {
        throw new Exception("Arquivo env.json não encontrado em: $jsonPath");
    }

    $json = file_get_contents($jsonPath);
    $data = json_decode($json, true);

    if (!is_array($data)) {
        throw new Exception("env.json inválido ou corrompido.");
    }

    foreach ($data as $key => $value) {
        $_ENV[$key] = $value;
    }
}

// Carrega as variáveis de ambiente do JSON
try {
    $baseDir = dirname(__DIR__); // Pasta raiz do projeto
    loadEnvJson($baseDir . '/env.json');
} catch (Exception $e) {
    die("Erro ao carregar configurações: " . $e->getMessage());
}

// Atribuir as variáveis do JSON às variáveis de conexão
$servername = $_ENV['DB_HOST'] ?? 'localhost';
$username   = $_ENV['DB_USER'] ?? 'root';
$password   = $_ENV['DB_PASS'] ?? '';
$dbname     = $_ENV['DB_NAME'] ?? 'sistema_inscricoes';

// Criar a conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar a conexão
if ($conn->connect_error) {
    die("Conexão falhou: " . $conn->connect_error);
}
?>
