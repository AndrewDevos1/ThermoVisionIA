#!/bin/bash

# Script de Setup Inicial - ThermoVisionIA
# Este script configura o ambiente completo para rodar a aplicação

set -e  # Para em caso de erro

echo "======================================"
echo "  ThermoVisionIA - Setup Inicial"
echo "======================================"
echo ""

# 1. Verificar Python
echo "[1/5] Verificando Python..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado. Por favor, instale Python 3.12+"
    exit 1
fi

PYTHON_VERSION=$(python3 --version | awk '{print $2}')
echo "✓ Python $PYTHON_VERSION instalado"
echo ""

# 2. Criar ambiente virtual
echo "[2/5] Criando ambiente virtual..."
if [ -d "venv" ]; then
    echo "⚠ Ambiente virtual já existe. Pulando..."
else
    python3 -m venv venv
    echo "✓ Ambiente virtual criado"
fi
echo ""

# 3. Instalar dependências
echo "[3/5] Instalando dependências..."
source venv/bin/activate
pip install --upgrade pip -q
pip install -r requirement.txt -q
echo "✓ Dependências instaladas"
echo ""

# 4. Verificar PostgreSQL
echo "[4/5] Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não encontrado!"
    echo "   Instale com: sudo apt install postgresql postgresql-contrib"
    exit 1
fi

PSQL_VERSION=$(psql --version | awk '{print $3}')
echo "✓ PostgreSQL $PSQL_VERSION instalado"
echo ""

# 5. Informações sobre banco de dados
echo "[5/5] Configuração do Banco de Dados"
echo "======================================"
echo ""
echo "⚠ IMPORTANTE: Configure o banco de dados antes de continuar!"
echo ""
echo "Execute o script de banco de dados:"
echo "  ./setup_database.sh"
echo ""
echo "Ou configure manualmente:"
echo "  1. psql -U postgres -h localhost"
echo "  2. CREATE DATABASE \"ThermoVision\";"
echo "  3. \\c \"ThermoVision\""
echo "  4. CREATE TABLE usuarios (...);"
echo ""
echo "⚠ Verifique também a senha em: services/conexao.py"
echo "   Senha atual configurada: 'password'"
echo ""

echo "======================================"
echo "✓ Setup concluído com sucesso!"
echo "======================================"
echo ""
echo "Próximos passos:"
echo "  1. Configure o banco: ./setup_database.sh"
echo "  2. Execute a aplicação: ./run.sh"
echo ""
