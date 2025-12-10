# Repository Guidelines

## Estrutura do Projeto
- `backend/`: scripts de datasets e visao computacional (ex.: `DatasetCreate.py`, `DatasetFilterTest.py`).
- `frontend/`: app Flask; `app.py` e o entrypoint; `config.py` define `MODE` demo/real e camera padrao; `services/` para banco (Postgres/SQLite), `utils/` para formularios/validacoes; UI em `templates/` e `static/`.
- `frontend/static/{css,js}` guarda estilos/JS por pagina; `imagens/` e `coordenada*/` armazenam amostras; `frontend/demo_video.mp4` e usado no modo demo.
- Dependencias em `frontend/requirement.txt`; scripts de setup/execucao (`setup*.sh`, `run*.sh`, `run.bat`).

## Comandos de Build, Teste e Desenvolvimento
- Preparar ambiente (raiz do repo):
  ```
  python -m venv venv
  venv\Scripts\activate  # Windows/WSL
  pip install -r frontend/requirement.txt
  ```
- Rodar UI (demo por padrao): `cd frontend && python app.py`.
- Camera real: ajustar `MODE="real"` e `DEFAULT_CAMERA_INDEX` em `frontend/config.py`.
- Checar cameras: `cd frontend && python test_camera.py`; recriar video demo: `python create_demo_video.py`.
- Scripts de backend: `cd backend && python DatasetCreate.py` (trocar pelo desejado).

## Estilo de Codigo e Convencoes
- Python 3.12+, indentacao 4 espacos, `snake_case` para funcoes/arquivos, CapWords para classes; mantenha nomes em portugues para consistencia.
- Siga PEP8; adicione docstrings e type hints em novos servicos/endpoints; handlers Flask devem delegar para `services/` ou helpers.
- Templates e assets em minusculas por pagina (`dashboard.html`, `dashboard.css`, `dashboard.js`); nao exponha segredos no codigo.

## Diretrizes de Testes
- Ainda sem suite automatizada; preferir `pytest` com `test_*.py` em `frontend/` ou `backend/`.
- Cobrir validacoes (`utils/validacoes.py`), conectores de DB (`services/`) e fluxos de camera/streaming em `app.py`; mock de OpenCV quando nao houver hardware.
- Antes de mesclar mudancas de camera, rodar `python frontend/test_camera.py` em modo real ou validar playback em demo.

## Commits e Pull Requests
- Historico curto em portugues; use mensagens imperativas e focadas (ex.: `feat: habilita selecao de camera demo`, `fix: trata frame vazio`). Commits devem ser completos e descritivos.
- PRs devem trazer proposito, issue vinculada, comandos/testes rodados (`python app.py`, `python test_camera.py`), configuracao usada (demo vs real) e screenshots/GIFs para UI.
- Documente novas dependencias, alteracoes de schema ou scripts e atualize guias rapidos quando o comportamento mudar.
- Alerta: quando a mudança for complexa ou de alto impacto, sinalize antes para alinhamento e decisao do autor.

## Seguranca, Ambiente e Comunicacao
- Segredos (secret key, credenciais de DB) em variaveis de ambiente; nao comitar `.env`.
- Em WSL, prefira `MODE="demo"` se a webcam nao estiver mapeada; para hardware real, use usbipd ou execute direto no Windows.
- Comunicacao, comentarios e revisoes devem ser em portugues; registre excecoes no PR se necessario.
