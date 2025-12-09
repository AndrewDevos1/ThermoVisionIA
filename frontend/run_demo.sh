#!/bin/bash

# Script para rodar em MODO DEMO (sem câmera física)
# Use este script no WSL2 onde câmeras não funcionam

set -e

echo "======================================"
echo "  ThermoVisionIA - MODO DEMO"
echo "======================================"
echo ""

# Verificar se venv existe
if [ ! -d "venv" ]; then
    echo "⚠ Ambiente virtual não encontrado. Criando..."
    python3 -m venv venv
    echo "✓ Ambiente virtual criado"
    echo ""
fi

# Ativar ambiente virtual
echo "Ativando ambiente virtual..."
source venv/bin/activate

# Verificar se dependências estão instaladas
if ! python -c "import flask" 2>/dev/null; then
    echo "⚠ Instalando dependências..."
    pip install -q --upgrade pip
    pip install -q -r requirement.txt
    echo "✓ Dependências instaladas"
    echo ""
fi

# Criar vídeo demo se não existir
if [ ! -f "demo_video.mp4" ]; then
    echo "⚠ Vídeo de demonstração não encontrado. Criando..."
    python create_demo_video.py
    echo ""
fi

# Verificar/criar banco SQLite
if [ ! -f "thermovision.db" ]; then
    echo "⚠ Banco SQLite não encontrado. Criando..."
    python -c "from services.conexao_sqlite import init_database; init_database()"
    echo ""
fi

# Garantir que está em modo demo
echo "Configurando modo DEMO..."
if grep -q 'MODE = "real"' config.py; then
    sed -i 's/MODE = "real"/MODE = "demo"/' config.py
fi
echo "✓ Modo DEMO ativado"
echo ""

echo "======================================"
echo "  MODO DEMO ATIVO"
echo "  Usando vídeo simulado"
echo "  Servidor rodando em:"
echo "  http://localhost:5000"
echo "======================================"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
echo ""

# Executar aplicação
python app.py
