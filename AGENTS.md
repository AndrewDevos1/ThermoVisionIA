# Repository Guidelines

## Estrutura do Projeto e Organização de Módulos
- `frontend/`: app Flask (`app.py`), configs em `config.py`, páginas em `templates/`, assets em `static/`, acesso a dados em `services/` (SQLite/PostgreSQL) e validações em `utils/`. Scripts auxiliares (`run_demo.sh`, `run_quick.sh`, `run.bat`) ficam aqui.
- `backend/`: scripts OpenCV para captura/recorte/filtros (`DatasetCreate.py`, `DatasetCut.py`, `DatasetFilter*.py`, `DatasetCreateVideo.py`); exemplos em `backend/Imagens de teste/`, saídas em `imagens/` ou `coordenada*/`.
- `docs/` e `manuais/`: relatórios e planos. Wrappers na raiz (`run_frontend.*`, `run_backend.sh`, `run_manual.sh`, `run.sh`) simplificam setup/execução.

## Comandos de Build, Teste e Desenvolvimento
- `./run_frontend.sh` (Linux/mac) ou `\.\run_frontend.bat` (Windows): cria/ativa `frontend/venv`, instala `requirement.txt` e sobe Flask em `http://localhost:5000`.
- `./run_backend.sh DatasetCreate.py`: executa um script do backend usando o mesmo venv.
- `./run_manual.sh frontend` ou `./run_manual.sh backend DatasetCut.py`: atalho direto sem menu.
- `./run.sh`: menu para setup completo, iniciar frontend, rodar scripts do backend, checar status ou limpar ambiente.
- `python frontend/test_camera.py`: valida webcam/RTSP antes de mudar `MODE` em `frontend/config.py` para `real`.

## Estilo de Código e Convenções de Nomes
- Python: PEP8, 4 espaços, `snake_case` para funções/variáveis, `CapWords` para classes; privilegie helpers em `services/` e `utils/`.
- JavaScript: arquivos em `frontend/static/js/` com `const/let`; CSS/Tailwind no mesmo nível; nomeie arquivos em minúsculas junto ao template correspondente.
- Templates Jinja2 em português (UTF-8); não exponha credenciais nem caminhos absolutos.

## Diretrizes de Testes
- Sem suíte automatizada: teste manual login (incluindo “Login rápido”), streaming, ROI e scripts do backend acionados pelo painel.
- Novos testes: `pytest` ou `unittest`, nome `test_*.py` perto do módulo ou em `frontend/tests/`; use mocks para câmera/banco.

## Diretrizes de Commits e Pull Requests
- Commits curtos e imperativos em português, descrevendo efeito e contexto (ex.: `feat: adicionar captura com intervalo configurável`). Avise quando a mudança for complexa ou de impacto alto.
- Em PRs traga resumo, comandos executados, evidências de teste (log/print), notas de banco/ambiente (SQLite vs PostgreSQL) e links para issues/docs.

## Segurança e Configuração
- Não versionar credenciais (RTSP, senhas), `.env`, dumps, `thermovision.db` nem datasets/recortes volumosos; mantenha-os fora do repositório.
- Revise `frontend/config.py` antes de subir (modo `demo` vs `real`, `DEMO_VIDEO_PATH`). Prefira variáveis de ambiente para URLs de câmeras e senhas.
- Limpe arquivos gerados em `imagens/`, `coordenada*/` e pastas de filtros antes de abrir PR; guarde só amostras mínimas.
