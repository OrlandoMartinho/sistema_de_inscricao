<?php
// env_loader.php
header("Cache-Control: no-cache, no-store, must-revalidate");
header("Pragma: no-cache");
header("Expires: 0");

function loadEnv2($jsonPath) {
    if (!file_exists($jsonPath)) {
        throw new Exception("Arquivo JSON de ambiente não encontrado");
    }

    $json = file_get_contents($jsonPath);
    $data = json_decode($json, true);

    if (!is_array($data)) {
        throw new Exception("Formato do JSON inválido");
    }

    foreach ($data as $name => $value) {
        // Define como variável de ambiente
        putenv("$name=$value");
        $_ENV[$name] = $value;
        $_SERVER[$name] = $value;
    }
}
?>
