# Repository Guidelines

## Estrutura do Projeto e Organizacao de Modulos
- `frontend/`: app Flask (`app.py`), configuracao (`config.py`), templates (`templates/`), assets (`static/`), helpers de banco (`services/`) e validacoes/forms (`utils/`). Scripts de setup/execucao ficam aqui.
- `backend/`: scripts OpenCV de captura e processamento de dataset (`DatasetCreate.py`, `DatasetFilter*.py`, `DatasetCut.py`), geram saida em `imagens/` ou subpastas de filtros.
- `docs/` para documentacao; `run.sh` na raiz orquestra passos de setup; evite versionar midias grandes ou dados gerados.

## Comandos de Build, Teste e Desenvolvimento
- Demo (WSL amigavel): `cd frontend && ./run_demo.sh` — cria venv, gera `demo_video.mp4`, força `MODE="demo"` e sobe Flask com SQLite.
- Rapido sem PostgreSQL: `cd frontend && ./run_quick.sh` — usa SQLite e cria `thermovision.db` se precisar.
- Pilha completa: `cd frontend && ./setup.sh && ./setup_database.sh`, depois `./start_postgres.sh` e `./run.sh` — instala dependencias, prepara PostgreSQL e serve em `http://localhost:5000`.
- Orquestrador raiz: `./run.sh` — menu para setup, status e execucao de scripts do backend.
- Windows: na raiz, `.\run_frontend.bat` cria/ativa `frontend\venv`, instala deps e roda `python app.py` em modo dev.
- Teste de camera: `cd frontend && python test_camera.py` — valide hardware antes de trocar `config.MODE` para `"real"`.

## Estilo de Codigo e Convencoes de Nomes
- Python: PEP8, 4 espacos, snake_case para funcoes/variaveis, classes em CapWords; docstrings curtas; extraia logica para `services/` e `utils/` em vez de duplicar.
- Templates: Jinja2 em `frontend/templates/`; JS proprio em `frontend/static/js/`; mantenha nomes minúsculos por pagina (`dashboard.html/.css/.js`).
- Configuracao: prefira `frontend/config.py` e variaveis de ambiente; nao deixe credenciais fixas em scripts ou conectores.

## Diretrizes de Testes
- Ainda sem suite automatizada; use verificacao manual.
- Modo demo: `./run_demo.sh` e valide cadastro/login e streaming; modo real: `python test_camera.py` para checar captura.
- Ao adicionar testes, nomeie `test_*.py` e agrupe junto ao modulo ou em `frontend/tests/`; use mocks para camera/banco.

## Diretrizes de Commits e Pull Requests
- Mensagens curtas, imperativas e focadas (ex.: `chore: parametrizar filtros`); commits devem ser descritivos.
- Em PRs inclua resumo, comandos/setup executados, evidencias de teste (logs/screenshots), observacoes de banco (PostgreSQL x SQLite) e link com issue.
- Alerta: sinalize antes quando a mudanca for complexa ou de alto impacto para decidir o caminho.

## Seguranca e Configuracao
- Nao versionar credenciais de camera, senhas de banco, `.env`, `thermovision.db` ou datasets grandes. Use variaveis de ambiente.
- Confirme `config.MODE` (`demo` x `real`) antes de publicar; gere videos de demo com `create_demo_video.py` em vez de armazenar binarios pesados.
