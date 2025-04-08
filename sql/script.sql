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

CREATE TABLE IF NOT EXISTS Notificacoes (
    id_notificacao INT PRIMARY KEY AUTO_INCREMENT,
    data_da_notificacao VARCHAR(100),
    descricao VARCHAR(255),
    id_usuario INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuarios(id_usuario)
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
    numero_de_vagas INT,
    data_de_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_curso) REFERENCES Cursos(id_curso)
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
    FOREIGN KEY (id_calendario) REFERENCES Calendarios(id_calendario)
);

CREATE TABLE IF NOT EXISTS Contactos (
    id_contacto INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255),
    email VARCHAR(255),
    assunto VARCHAR(255),
    mensagem VARCHAR(255),
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
