#!/bin/bash

# Script para Iniciar PostgreSQL - ThermoVisionIA
# Use este script para iniciar o PostgreSQL no WSL2

echo "======================================"
echo "  Iniciando PostgreSQL..."
echo "======================================"
echo ""

# Iniciar PostgreSQL
sudo systemctl start postgresql

# Verificar status
if systemctl is-active --quiet postgresql; then
    echo "✓ PostgreSQL iniciado com sucesso!"
    echo ""
    echo "Status do serviço:"
    sudo systemctl status postgresql --no-pager -l
else
    echo "❌ Erro ao iniciar PostgreSQL"
    exit 1
fi

echo ""
echo "======================================"
echo "✓ PostgreSQL está rodando!"
echo "======================================"
echo ""
echo "Agora você pode executar:"
echo "  ./run.sh"
echo ""
