-- 1. Criação da base de dados
CREATE DATABASE IF NOT EXISTS sistema_inscricoes;
USE sistema_inscricoes;

-- 2. Criação das tabelas

CREATE TABLE IF NOT EXISTS Usuarios (
    id_usuario INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255),
    senha TEXT,
    token_de_acesso TEXT,
    email VARCHAR(255) UNIQUE,
    data_de_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO `usuarios` (`id_usuario`, `nome`, `senha`, `token_de_acesso`, `email`) VALUES
(1, 'Administrador', '$2y$10$fj7ZHR45aCy5p16H2M1nvuJ9p4/lBd/sG.uXmzQRJ76Wx1O6ljHQq', NULL, 'admin@admin.ao');

CREATE TABLE IF NOT EXISTS Notificacoes (
    id_notificacao INT PRIMARY KEY AUTO_INCREMENT,
    data_da_notificacao VARCHAR(100),
    descricao VARCHAR(255),
    id_usuario INT,
    lido INT NOT NULL DEFAULT 0, 
    titulo VARCHAR(255) DEFAULT NULL,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Cursos (
    id_curso INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255),
    descricao VARCHAR(255),
    area VARCHAR(255),
    duracao INT,
    data_de_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Calendarios (
    id_calendario INT PRIMARY KEY AUTO_INCREMENT,
    titulo_do_anuncio VARCHAR(255),
    data_de_termino DATE,
    descricao VARCHAR(255),
    id_curso INT,
    nome_do_curso VARCHAR(255),
    numero_de_vagas INT ,
    data_de_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Inscricoes (
    id_inscricao INT PRIMARY KEY AUTO_INCREMENT,
    idade INT,
    genero VARCHAR(255),
    numero_de_processo INT,
    nome_completo VARCHAR(255),
    contacto_do_aluno VARCHAR(255),
    contacto_do_encarregado VARCHAR(255),
    id_calendario INT,
    data_de_nascimento DATE,
    natural_de VARCHAR(255),
    provincia VARCHAR(255),
    tipo_de_identificacao VARCHAR(255),
    numero_de_identificacao VARCHAR(255),
    data_de_validade DATE,
    arquivo_de_identificacao LONGBLOB,
    foto_tipo_passe LONGBLOB,
    classe VARCHAR(255),
    turno VARCHAR(255),
    data_de_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    aprovacao INT,
    comentario VARCHAR(255),
    id_curso INT NOT NULL , 
    nome_do_curso VARCHAR(255) NOT NULL,
    FOREIGN KEY (id_calendario) REFERENCES Calendarios(id_calendario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Contactos (
    id_contacto INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255),
    email VARCHAR(255),
    assunto VARCHAR(255),
    mensagem VARCHAR(255),
    resposta VARCHAR(255) DEFAULT NULL,
    respondido INT,
    data_de_resposta DATETIME,
    data_de_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS Galerias (
    id_galeria INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(255),
    data_do_evento DATE,
    descricao VARCHAR(255),
    foto LONGBLOB,
    data_de_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);