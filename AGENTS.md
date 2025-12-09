# Repository Guidelines

## Estrutura do Projeto e Organização de Módulos
- `frontend/`: entrada Flask (`app.py`), templates (`templates/`), assets (`static/`), configuração (`config.py`), helpers de banco (`services/`) e validações/forms (`utils/`). Scripts de execução e setup (`run_demo.sh`, `run_quick.sh`, `setup.sh`) também ficam aqui; o SQLite local gera `thermovision.db`.
- `backend/`: scripts OpenCV para captura e preparação de datasets (ex.: `DatasetCreate.py`, `DatasetFilter*.py`) que gravam em `imagens/` e testam câmeras/RTSP.
- `shared/`: reservado para utilitários comuns; `docs/` mantém documentação; o `run.sh` na raiz traz menu para configurar o frontend ou rodar scripts do backend. Evite versionar mídias grandes ou dados gerados.

## Comandos de Build, Teste e Desenvolvimento
- Demo (WSL amigável): `cd frontend && ./run_demo.sh` — cria venv se faltar, gera `demo_video.mp4`, força `MODE="demo"` e sobe Flask com SQLite.
- Rápido sem PostgreSQL: `cd frontend && ./run_quick.sh` — usa SQLite e cria `thermovision.db` se precisar.
- Pilha completa: `cd frontend && ./setup.sh && ./setup_database.sh`, depois `./start_postgres.sh` e `./run.sh` — instala dependências, prepara PostgreSQL e serve em `http://localhost:5000`.
- Orquestrador raiz: `./run.sh` — menu para setup, status e execução de scripts do backend.
- Teste de câmera: `cd frontend && python test_camera.py` — verifica câmeras físicas antes de trocar `config.MODE` para `"real"`.

## Estilo de Código e Convenções de Nomes
- Python: siga PEP 8, indentação de 4 espaços, snake_case para funções/variáveis, constantes em maiúsculas; mantenha docstrings curtas; reutilize utilitários de `services/` e `utils/` em vez de duplicar lógica.
- Templates: Jinja2 em `frontend/templates/`; estilização com classes Tailwind; JavaScript próprio em `frontend/static/js/`.
- Configuração: prefira `frontend/config.py` e variáveis de ambiente; não deixe credenciais fixas em scripts de captura ou conectores de banco.

## Diretrizes de Testes
- Não há suíte automatizada ainda; use verificação manual.
- Em modo demo, execute `./run_demo.sh` e valide cadastro/login e streaming de vídeo; com hardware real, rode `python test_camera.py` e confira leitura de frames.
- Ao adicionar testes, nomeie `test_*.py` e agrupe junto ao módulo ou em `frontend/tests/`; isole câmera/banco com mocks para manter reprodutibilidade.

## Diretrizes de Commits e Pull Requests
- Histórico usa assuntos curtos (Português/Inglês). Prefira mensagens imperativas e concisas, opcionalmente com escopo (`[frontend]`, `[backend]`).
- Em PRs inclua: resumo das mudanças, comandos executados/setup, evidências de teste (logs ou screenshots do streaming/UI), observações de banco (PostgreSQL x SQLite) e vínculo com issue/tarefa.

## Segurança e Configuração
- Não versionar credenciais de câmera, senhas de banco, `thermovision.db` ou datasets grandes. Use variáveis de ambiente ou configs locais.
- Confirme `config.MODE` (`demo` x `real`) antes de publicar; gere vídeos de demo com `create_demo_video.py` em vez de armazenar binários volumosos no git.
