# ThermoVisionIA

Sistema inteligente de análise de visão térmica combinando processamento de ML e interface web.

## Estrutura do Projeto

```
ThermoVisionIA/
├── backend/          # Scripts de Machine Learning e processamento de datasets
├── frontend/         # Aplicação web Flask
├── shared/          # Código e utilitários compartilhados
├── docs/           # Documentação
└── README.md       # Este arquivo
```

## Backend
Scripts Python para processamento de imagens térmicas e datasets:
- Criação e manipulação de datasets
- Filtros e processamento de imagem
- Detecção e análise térmica

## Frontend
Aplicação web Flask com:
- Interface web para visualização
- APIs REST
- Configuração de banco de dados
- Sistema de câmera

## Como Executar

### Frontend (Desenvolvimento)
```bash
cd frontend
python app.py
```

### Backend (Scripts ML)
```bash
cd backend
python <script_desejado>.py
```

## Próximos Passos
- [ ] Integrar scripts ML como APIs no Flask
- [ ] Criar comunicação entre frontend/backend
- [ ] Documentar APIs
- [ ] Setup de desenvolvimento unificado