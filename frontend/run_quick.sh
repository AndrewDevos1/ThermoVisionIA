#!/bin/bash

# Script Rápido - Rodar com SQLite (sem PostgreSQL)
# Use este script para rodar rapidamente sem configurar PostgreSQL

set -e

echo "======================================"
echo "  ThermoVisionIA - Modo Rápido SQLite"
echo "======================================"
echo ""

# Verificar se venv existe
if [ ! -d "venv" ]; then
    echo "⚠ Ambiente virtual não encontrado. Criando..."
    python3 -m venv venv
    echo "✓ Ambiente virtual criado"
fi

# Ativar ambiente virtual
echo "Ativando ambiente virtual..."
source venv/bin/activate

# Verificar se dependências estão instaladas
if ! python -c "import flask" 2>/dev/null; then
    echo "⚠ Instalando dependências..."
    pip install -q -r requirement.txt
    echo "✓ Dependências instaladas"
fi

# Inicializar banco SQLite se não existir
if [ ! -f "thermovision.db" ]; then
    echo "⚠ Banco SQLite não encontrado. Inicializando..."
    python -c "from services.conexao_sqlite import init_database; init_database()"
    echo "✓ Banco SQLite criado"
fi

echo "✓ Ambiente pronto"
echo ""
echo "======================================"
echo "  Usando SQLite (sem PostgreSQL)"
echo "  Servidor rodando em:"
echo "  http://localhost:5000"
echo "======================================"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

# Executar aplicação
python app.py
