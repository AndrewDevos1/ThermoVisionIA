#!/bin/bash

# Script de Configuração do Banco de Dados - ThermoVisionIA
# Este script cria o banco de dados e a tabela de usuários

echo "======================================"
echo "  ThermoVisionIA - Setup Database"
echo "======================================"
echo ""

# Verificar se PostgreSQL está instalado
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não encontrado!"
    echo "   Instale com: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

echo "Este script irá criar:"
echo "  - Banco de dados: ThermoVision"
echo "  - Tabela: usuarios"
echo ""

# Solicitar informações do usuário PostgreSQL
read -p "Digite o usuário do PostgreSQL [postgres]: " PG_USER
PG_USER=${PG_USER:-postgres}

read -p "Digite o host do PostgreSQL [localhost]: " PG_HOST
PG_HOST=${PG_HOST:-localhost}

echo ""
echo "Criando banco de dados..."
echo ""

# Criar banco de dados e tabela
psql -U "$PG_USER" -h "$PG_HOST" <<EOF
-- Verificar se o banco já existe
SELECT 'CREATE DATABASE "ThermoVision"'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ThermoVision')\gexec

-- Conectar ao banco
\c "ThermoVision"

-- Criar tabela de usuários (se não existir)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    senha VARCHAR(100) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Verificar criação
\dt usuarios

-- Informações
SELECT 'Banco de dados ThermoVision configurado com sucesso!' as status;
EOF

if [ $? -eq 0 ]; then
    echo ""
    echo "======================================"
    echo "✓ Banco de dados configurado!"
    echo "======================================"
    echo ""
    echo "⚠ IMPORTANTE: Verifique as credenciais em:"
    echo "   services/conexao.py"
    echo ""
    echo "Configuração atual:"
    echo "  - Usuário: postgres"
    echo "  - Senha: password"
    echo "  - Host: localhost"
    echo "  - Porta: 5432"
    echo ""
    echo "Se suas credenciais forem diferentes, edite o arquivo!"
    echo ""
else
    echo ""
    echo "❌ Erro ao configurar banco de dados"
    echo "   Verifique suas credenciais do PostgreSQL"
    exit 1
fi
