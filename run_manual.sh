#!/usr/bin/env bash

# Execução rápida do ThermoVisionIA sem ativar o venv manualmente.
# Uso:
#   ./run_manual.sh frontend           -> sobe o Flask em http://localhost:5000
#   ./run_manual.sh backend SCRIPT.py  -> roda um script do backend com as dependências do venv

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$ROOT_DIR/frontend/venv"
REQ_FILE="$ROOT_DIR/frontend/requirement.txt"

log() { echo "[run] $*"; }
err() { echo "[run][erro] $*" >&2; }

ensure_venv() {
    if [ ! -d "$VENV_DIR" ]; then
        log "Criando venv em frontend/venv..."
        python3 -m venv "$VENV_DIR"
    fi
    # shellcheck disable=SC1091
    source "$VENV_DIR/bin/activate"
    log "Instalando dependências do frontend..."
    pip install -q -r "$REQ_FILE"
}

run_frontend() {
    ensure_venv
    export FLASK_APP=app.py
    export FLASK_ENV=development
    export FLASK_DEBUG=1
    log "Subindo Flask em http://localhost:5000 ..."
    cd "$ROOT_DIR/frontend"
    python3 app.py
}

run_backend() {
    local script="$1"
    if [ -z "$script" ]; then
        err "Informe o nome do script: ./run_manual.sh backend DatasetCreate.py"
        exit 1
    fi
    ensure_venv
    cd "$ROOT_DIR/backend"
    if [ ! -f "$script" ]; then
        err "Script não encontrado: $script (pasta backend)"
        exit 1
    fi
    log "Executando backend/$script ..."
    python3 "$script"
}

cmd="${1:-}"
case "$cmd" in
    frontend)
        run_frontend
        ;;
    backend)
        run_backend "${2:-}"
        ;;
    *)
        echo "Uso:"
        echo "  ./run_manual.sh frontend           # sobe Flask"
        echo "  ./run_manual.sh backend SCRIPT.py  # executa um script do backend"
        exit 1
        ;;
esac
