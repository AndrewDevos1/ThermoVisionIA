#!/bin/bash

# ThermoVisionIA - Script de Execução
# Autor: Devos & Renan
# Data: $(date +"%Y-%m-%d")

set -e  # Para o script em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logs coloridos
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Banner do projeto
show_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════════════╗"
    echo "║                            ThermoVisionIA                           ║"
    echo "║              Sistema Inteligente de Análise Térmica                 ║"
    echo "║                        Backend + Frontend                           ║"
    echo "╚══════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Verificar dependências do sistema
check_dependencies() {
    log_info "Verificando dependências do sistema..."
    
    # Python
    if ! command -v python3 &> /dev/null; then
        log_error "Python3 não encontrado. Instale Python 3.8+"
        exit 1
    fi
    
    # Pip
    if ! command -v pip3 &> /dev/null; then
        log_error "pip3 não encontrado. Instale pip para Python3"
        exit 1
    fi
    
    log_success "Dependências do sistema verificadas"
}

# Setup do ambiente virtual
setup_venv() {
    log_info "Configurando ambiente virtual..."
    
    cd frontend
    
    if [ ! -d "venv" ]; then
        log_info "Criando ambiente virtual..."
        python3 -m venv venv
    fi
    
    log_info "Ativando ambiente virtual..."
    source venv/bin/activate
    
    log_info "Instalando dependências Python..."
    pip install -r requirement.txt
    
    log_success "Ambiente virtual configurado"
    cd ..
}

# Inicializar banco de dados
setup_database() {
    log_info "Configurando banco de dados..."
    
    cd frontend
    source venv/bin/activate
    
    # Criar banco SQLite se não existir
    if [ ! -f "thermovision.db" ]; then
        log_info "Criando banco de dados SQLite..."
        python3 -c "
from services.manipular_database_sqlite import criar_tabelas
criar_tabelas()
print('Banco de dados criado com sucesso!')
        " 2>/dev/null || log_warning "Erro ao criar banco, continuando..."
    fi
    
    log_success "Banco de dados configurado"
    cd ..
}

# Executar frontend
run_frontend() {
    log_info "Iniciando servidor Flask..."
    
    cd frontend
    source venv/bin/activate
    
    # Configurar variáveis de ambiente
    export FLASK_APP=app.py
    export FLASK_ENV=development
    export FLASK_DEBUG=1
    
    log_success "Servidor Flask iniciado em http://localhost:5000"
    log_info "Pressione Ctrl+C para parar o servidor"
    
    python3 app.py
}

# Menu principal
show_menu() {
    echo ""
    log_info "Escolha uma opção:"
    echo "1) Setup completo (primeira execução)"
    echo "2) Executar frontend (Flask)"
    echo "3) Executar backend (Scripts ML)"
    echo "4) Verificar status"
    echo "5) Limpar ambiente"
    echo "0) Sair"
    echo ""
    read -p "Opção: " choice
}

# Executar scripts ML do backend
run_backend() {
    log_info "Scripts ML disponíveis no backend:"
    echo ""
    
    cd backend
    echo "Scripts disponíveis:"
    ls -1 *.py | nl -s") "
    echo ""
    
    read -p "Digite o número do script ou nome completo: " script_choice
    
    if [[ "$script_choice" =~ ^[0-9]+$ ]]; then
        script_file=$(ls -1 *.py | sed -n "${script_choice}p")
    else
        script_file="$script_choice"
    fi
    
    if [ -f "$script_file" ]; then
        log_info "Executando: $script_file"
        python3 "$script_file"
    else
        log_error "Script não encontrado: $script_file"
    fi
    
    cd ..
}

# Verificar status do projeto
check_status() {
    log_info "Status do projeto ThermoVisionIA:"
    echo ""
    
    # Verificar estrutura
    log_info "Estrutura de diretórios:"
    for dir in backend frontend shared docs; do
        if [ -d "$dir" ]; then
            echo "  ✅ $dir/"
        else
            echo "  ❌ $dir/ (ausente)"
        fi
    done
    
    echo ""
    
    # Verificar ambiente virtual
    log_info "Ambiente Python:"
    if [ -d "frontend/venv" ]; then
        echo "  ✅ Ambiente virtual criado"
        cd frontend
        source venv/bin/activate
        echo "  📦 Versão Python: $(python3 --version)"
        echo "  📦 Pacotes instalados: $(pip list | wc -l) pacotes"
        cd ..
    else
        echo "  ❌ Ambiente virtual não encontrado"
    fi
    
    echo ""
    
    # Verificar banco de dados
    log_info "Banco de dados:"
    if [ -f "frontend/thermovision.db" ]; then
        echo "  ✅ Banco SQLite criado"
    else
        echo "  ❌ Banco SQLite não encontrado"
    fi
}

# Limpar ambiente
clean_environment() {
    log_warning "Esta ação irá remover o ambiente virtual e banco de dados"
    read -p "Tem certeza? (y/N): " confirm
    
    if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
        log_info "Limpando ambiente..."
        rm -rf frontend/venv
        rm -f frontend/thermovision.db
        rm -rf frontend/__pycache__
        rm -rf backend/__pycache__
        log_success "Ambiente limpo"
    else
        log_info "Operação cancelada"
    fi
}

# Setup completo
full_setup() {
    log_info "Iniciando setup completo..."
    check_dependencies
    setup_venv
    setup_database
    log_success "Setup completo finalizado!"
    echo ""
    log_info "Execute novamente e escolha a opção 2 para iniciar o frontend"
}

# Main function
main() {
    show_banner
    
    while true; do
        show_menu
        
        case $choice in
            1)
                full_setup
                ;;
            2)
                if [ ! -d "frontend/venv" ]; then
                    log_error "Ambiente não configurado. Execute o setup completo primeiro (opção 1)"
                else
                    run_frontend
                fi
                ;;
            3)
                run_backend
                ;;
            4)
                check_status
                ;;
            5)
                clean_environment
                ;;
            0)
                log_info "Saindo..."
                exit 0
                ;;
            *)
                log_error "Opção inválida"
                ;;
        esac
        
        echo ""
        read -p "Pressione Enter para continuar..."
    done
}

# Verificar se está no diretório correto
if [ ! -f "README.md" ] || [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    log_error "Execute este script no diretório raiz do projeto ThermoVisionIA"
    exit 1
fi

# Executar função principal
main