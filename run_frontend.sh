#!/usr/bin/env bash

# Executa o frontend Flask usando o venv de frontend/venv.
# Uso: ./run_frontend.sh

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
VENV_DIR="$ROOT_DIR/frontend/venv"
REQ_FILE="$ROOT_DIR/frontend/requirement.txt"

log() { echo "[front] $*"; }
err() { echo "[front][erro] $*" >&2; }

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

ensure_venv
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_DEBUG=1
log "Subindo Flask em http://localhost:5000 ..."
cd "$ROOT_DIR/frontend"
python3 app.py
