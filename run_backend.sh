#!/usr/bin/env bash

# Executa scripts Python da pasta backend usando o venv de frontend/venv.
# Uso:
#   ./run_backend.sh DatasetCreate.py

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$ROOT_DIR/frontend/venv"
REQ_FILE="$ROOT_DIR/frontend/requirement.txt"

log() { echo "[back] $*"; }
err() { echo "[back][erro] $*" >&2; }

ensure_venv() {
    if [ ! -d "$VENV_DIR" ]; then
        log "Criando venv em frontend/venv..."
        python3 -m venv "$VENV_DIR"
    fi
    # shellcheck disable=SC1091
    source "$VENV_DIR/bin/activate"
    log "Instalando dependências..."
    pip install -q -r "$REQ_FILE"
}

script="${1:-}"
if [ -z "$script" ]; then
    err "Informe o nome do script em backend/. Ex.: ./run_backend.sh DatasetCreate.py"
    exit 1
fi

if [ ! -f "$ROOT_DIR/backend/$script" ]; then
    err "Script não encontrado em backend/: $script"
    exit 1
fi

ensure_venv
cd "$ROOT_DIR/backend"
log "Executando $script ..."
python3 "$script"
