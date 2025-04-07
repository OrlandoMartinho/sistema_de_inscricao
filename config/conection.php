<?php
// Função para carregar as variáveis do arquivo .env
function loadEnv($path) {
    if (!file_exists($path)) return;

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        // Ignorar comentários
        if (str_starts_with(trim($line), '#')) continue;

        if (strpos($line, '=') !== false) {
            list($key, $value) = explode('=', $line, 2);
            $key = trim($key);
            $value = trim($value, "\"'"); // Remover aspas
            $_ENV[$key] = $value;
        }
    }
}

// Carrega as variáveis do .env
loadEnv(__DIR__ . '.env');

// Atribuir as variáveis do .env às variáveis de conexão
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

// echo "Conexão bem-sucedida!";
?>
