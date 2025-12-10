# Relatório de atividades – 2025-12-09

## O que foi feito
- **Execução de scripts pelo painel avançado**  
  - Backend (`/scripts/run`) agora gera `script_id`, passa parâmetros permitidos (camera_url, camera_index, output_dir, intervalo, duracao) aos scripts e registra stdout/stderr em `backend/logs/<id>.log`.  
  - Novos endpoints: `/scripts/logs` (log + finished/return_code), `/scripts/logs/download` (download do log) e `/scripts/stop` (interromper processo).  
  - Front: painel avançado por viewer passou a exibir logs em tempo real (polling), botões de Parar e Baixar log, e envia parâmetros (câmera selecionada + pasta de saída). Feedback mostra status final.

- **Parametrização do DatasetCreate.py**  
  - Script reformulado para aceitar CLI (`--camera_url/--camera-index/--output_dir/--intervalo/--duracao`), sem hardcodes. Mantém defaults próximos ao original.

- **Scripts de execução rápida**  
  - Criados `run_frontend.sh`, `run_backend.sh` e `run_manual.sh` para subir Flask ou executar scripts do backend usando o venv sem precisar ativar manualmente.

- **Limpeza de duplicados**  
  - Removidos scripts `.py` duplicados da raiz; mantidos apenas em `backend/`.

- **Documentação existente referenciada**  
  - Mantido `docs/RELATORIO-INTEGRACAO-BACKEND-FRONTEND.md` com o plano amplo de integração (captura, ROI, filtros, batch, OCR).

## Estado atual
- Conectar câmera via dashboard continua usando a captura global de Flask (única) e não gera log.  
- Execução de scripts via painel usa parâmetros básicos (câmera + pasta de saída) e grava log/permite stop.  
- Apenas `DatasetCreate.py` foi adaptado para parâmetros; outros scripts (ex.: `DatasetCut.py`) ainda dependem de caminhos/ROI hardcoded.

## Próximos passos sugeridos
- Implementar seleção de ROI via web (canvas + API) e adaptar `DatasetCut.py` (e correlatos) para receber coordenadas/paths via parâmetros, eliminando `cv2.selectROI`.  
- Estender painel avançado para capturar mais parâmetros por script (ex.: intervalos/durações/filtros) conforme o plano do relatório de integração.  
- Validar multi-viewer real no backend (hoje uma captura global); refatorar com `viewer_id` se quisermos streams simultâneos.
