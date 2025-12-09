#!/bin/bash

# Script para Executar a Aplicação - ThermoVisionIA
# Execute este script após o setup inicial

set -e

echo "======================================"
echo "  ThermoVisionIA - Iniciando..."
echo "======================================"
echo ""

# Verificar se venv existe
if [ ! -d "venv" ]; then
    echo "❌ Ambiente virtual não encontrado!"
    echo "   Execute primeiro: ./setup.sh"
    exit 1
fi

# Ativar ambiente virtual
echo "Ativando ambiente virtual..."
source venv/bin/activate

# Verificar se dependências estão instaladas
if ! python -c "import flask" 2>/dev/null; then
    echo "❌ Dependências não instaladas!"
    echo "   Execute primeiro: ./setup.sh"
    exit 1
fi

echo "✓ Ambiente pronto"
echo ""

# Verificar se PostgreSQL está rodando
if ! systemctl is-active --quiet postgresql 2>/dev/null; then
    echo "⚠ PostgreSQL não está rodando!"
    echo ""
    echo "Execute um dos comandos abaixo:"
    echo "  1. ./start_postgres.sh"
    echo "  2. sudo systemctl start postgresql"
    echo ""
    exit 1
fi

echo "✓ PostgreSQL rodando"
echo ""
echo "======================================"
echo "  Servidor rodando em:"
echo "  http://localhost:5000"
echo "======================================"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

# Executar aplicação
python app.py
