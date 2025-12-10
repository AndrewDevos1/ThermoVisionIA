# 📊 Relatório de Análise e Plano de Integração Backend → Frontend

**Projeto:** ThermoVisionIA  
**Data:** 2025-12-10  
**Autor:** Análise Técnica  

---

## 🎯 Objetivo

Integrar os scripts Python do backend (processamento de imagens térmicas) à interface web Flask, permitindo que todas as operações atualmente feitas manualmente via terminal e código sejam executadas através do navegador.

---

## 🔍 Análise dos Scripts Backend

### **1. DatasetCreate.py** - Captura de Imagens via RTSP
**Funcionalidade Atual:**
- Conecta em câmera IP via RTSP (hardcoded)
- Captura fotos em intervalos de 30 segundos
- Salva em pasta `imagens/`
- Mostra progresso no terminal

**Parâmetros Hardcoded:**
```python
usuario = 'admin'
senha = 'Kaiser@210891'
ip = '192.168.88.110'
porta = 554
intervalo = 30  # segundos
total_fotos = 30 * 60 // intervalo  # 10 minutos
```

**O que precisa ser configurável pela web:**
- ✅ Credenciais da câmera (usuário, senha, IP, porta)
- ✅ Intervalo entre fotos
- ✅ Duração total da captura
- ✅ Diretório de saída
- ✅ Visualização em tempo real do progresso
- ✅ Controle start/stop da captura

---

### **2. DatasetCut.py** - Seleção de ROI (Região de Interesse)
**Funcionalidade Atual:**
- Abre imagem e permite selecionar área com mouse (cv2.selectROI)
- Salva coordenadas em `recortes.pkl`
- Cria pastas `coordenada1/`, `coordenada2/`, etc.

**Parâmetros Hardcoded:**
```python
Recorte = cv2.imread('imgAdpGray2\imgAdpGray2_670.jpg')  # Imagem fixa
largura_desejada = 1024
```

**O que precisa ser configurável pela web:**
- ✅ Seleção de imagem de referência
- ✅ Interface web para desenhar ROI (canvas HTML5)
- ✅ Preview da área selecionada
- ✅ Salvar/editar múltiplas coordenadas
- ✅ Visualizar coordenadas existentes

---

### **3. DatasetFilter.py** - Aplicação de Filtros de Processamento
**Funcionalidade Atual:**
- Aplica filtros: Brilho, Adaptive Threshold, Canny, Canny Invertido
- Lista de arquivos hardcoded no código

**Parâmetros Hardcoded:**
```python
brilho = -40
cv2.adaptiveThreshold(..., 11, 2)  # Parâmetros fixos
cv2.Canny(imgGray, 100, 200)  # Thresholds fixos

arquivos = [
    'imagens/foto_050.jpg',
    'imagens/foto_1138.jpg',
    # ...
]
```

**O que precisa ser configurável pela web:**
- ✅ Ajuste de brilho (slider)
- ✅ Parâmetros dos filtros (sliders interativos)
- ✅ Preview em tempo real dos filtros
- ✅ Seleção de imagens a processar
- ✅ Comparação lado a lado (original vs filtros)

---

### **4. DatasetFilterApliqued.py** - Processamento em Lote
**Funcionalidade Atual:**
- Processa todas as imagens de uma pasta
- Salva resultados em pastas separadas por filtro
- Barra de progresso no terminal
- Interrupção com tecla ESPAÇO

**O que precisa ser configurável pela web:**
- ✅ Seleção de pasta de entrada
- ✅ Escolha dos filtros a aplicar
- ✅ Barra de progresso visual (web)
- ✅ Botão de parar/cancelar processamento
- ✅ Log em tempo real

---

### **5. DatasetFilterCut.py** - Recorte com Coordenadas Salvas
**Funcionalidade Atual:**
- Carrega coordenadas do `recortes.pkl`
- Recorta todas as imagens filtradas
- Organiza em subpastas

**O que precisa ser configurável pela web:**
- ✅ Seleção de conjunto de coordenadas
- ✅ Preview dos recortes antes de processar
- ✅ Escolha de filtros para recortar
- ✅ Progresso visual

---

### **6. TesseractTest.py** - OCR (Reconhecimento de Texto)
**Funcionalidade Atual:**
- Extrai texto de imagens usando Tesseract OCR
- Caminho do Tesseract hardcoded (Windows)

**Parâmetros Hardcoded:**
```python
pt.pytesseract.tesseract_cmd = r'C:\\Program Files (x86)\\Tesseract-OCR\\tesseract.exe'
```

**O que precisa ser configurável pela web:**
- ✅ Upload de imagem
- ✅ Seleção de idioma OCR
- ✅ Preview da imagem e texto extraído
- ✅ Exportar resultado (TXT/JSON)

---

## 🏗️ Arquitetura Proposta

### **Estrutura de Diretórios**
```
ThermoVisionIA/
├── backend/
│   └── [scripts originais mantidos para referência]
├── frontend/
│   ├── app.py                    # Flask principal
│   ├── services/
│   │   ├── camera_service.py     # Captura RTSP
│   │   ├── image_processor.py    # Filtros e processamento
│   │   ├── roi_service.py        # Gerenciamento de ROI
│   │   ├── batch_processor.py    # Processamento em lote
│   │   └── ocr_service.py        # Tesseract OCR
│   ├── static/
│   │   ├── js/
│   │   │   ├── camera_capture.js
│   │   │   ├── roi_selector.js   # Canvas para seleção de ROI
│   │   │   └── filter_preview.js
│   │   └── css/
│   ├── templates/
│   │   ├── dataset_capture.html  # Captura de imagens
│   │   ├── roi_selection.html    # Seleção de ROI
│   │   ├── filter_config.html    # Configuração de filtros
│   │   ├── batch_process.html    # Processamento em lote
│   │   └── ocr_tool.html         # Ferramenta OCR
│   └── uploads/                  # Imagens temporárias
└── shared/
    ├── config.py                 # Configurações compartilhadas
    └── utils.py
```

---

## 🎨 Interfaces Web Propostas

### **1. Dashboard Principal**
```
┌─────────────────────────────────────────────────┐
│  ThermoVisionIA - Processamento de Imagens     │
├─────────────────────────────────────────────────┤
│  [📷 Capturar Dataset]  [✂️ Definir ROI]        │
│  [🎨 Aplicar Filtros]   [⚙️ Processar Lote]     │
│  [📝 OCR/Texto]         [📊 Visualizar]         │
└─────────────────────────────────────────────────┘
```

### **2. Página de Captura (DatasetCreate)**
```
┌─────────────────────────────────────────────────┐
│  📷 Captura de Dataset via RTSP                 │
├─────────────────────────────────────────────────┤
│  Configurações da Câmera:                       │
│  IP: [192.168.88.110] Porta: [554]             │
│  Usuário: [admin] Senha: [••••••]              │
│                                                  │
│  Configurações de Captura:                      │
│  Intervalo: [30s] ────○──── Duração: [10min]   │
│  Pasta Destino: [imagens/] 📁                   │
│                                                  │
│  [▶️ Iniciar Captura] [⏸️ Pausar] [⏹️ Parar]   │
│                                                  │
│  Status: Capturando... (5/20 fotos)            │
│  ████████░░░░░░░░░░ 40%                        │
│  Preview: [imagem ao vivo]                      │
└─────────────────────────────────────────────────┘
```

### **3. Página de ROI (DatasetCut)**
```
┌─────────────────────────────────────────────────┐
│  ✂️ Seleção de Região de Interesse (ROI)        │
├─────────────────────────────────────────────────┤
│  Imagem Base: [Selecionar arquivo ▼]           │
│                                                  │
│  ┌─────────────────────────────┐               │
│  │   [Canvas interativo para   │               │
│  │    desenhar retângulos]     │               │
│  │                             │               │
│  └─────────────────────────────┘               │
│                                                  │
│  ROIs Definidas:                                │
│  ☑ ROI 1: (100, 50, 200, 150) [Editar] [❌]   │
│  ☑ ROI 2: (300, 80, 180, 120) [Editar] [❌]   │
│  [+ Adicionar Nova ROI]                         │
│                                                  │
│  [💾 Salvar Coordenadas] [🔄 Aplicar Recortes] │
└─────────────────────────────────────────────────┘
```

### **4. Página de Filtros (DatasetFilter)**
```
┌─────────────────────────────────────────────────┐
│  🎨 Configuração de Filtros                     │
├─────────────────────────────────────────────────┤
│  Imagem Preview: [Selecionar ▼]                │
│                                                  │
│  ┌──────────┬──────────┬──────────┬──────────┐ │
│  │ Original │ Brilho   │ Adaptive │  Canny   │ │
│  │ [img]    │ [img]    │ [img]    │  [img]   │ │
│  └──────────┴──────────┴──────────┴──────────┘ │
│                                                  │
│  Ajustes:                                       │
│  Brilho:  [-40] ────○────                      │
│  Adaptive Block: [11] ────○────                │
│  Adaptive C: [2] ────○────                     │
│  Canny Low: [100] ────○────                    │
│  Canny High: [200] ────○────                   │
│                                                  │
│  [👁️ Preview Tempo Real] [💾 Salvar Config]    │
└─────────────────────────────────────────────────┘
```

### **5. Página de Processamento em Lote**
```
┌─────────────────────────────────────────────────┐
│  ⚙️ Processamento em Lote                       │
├─────────────────────────────────────────────────┤
│  Pasta de Entrada: [imagens/] 📁               │
│  (150 imagens encontradas)                      │
│                                                  │
│  Filtros a Aplicar:                             │
│  ☑ Brilho  ☑ Adaptive Threshold                │
│  ☑ Canny   ☐ Canny Invertido                   │
│                                                  │
│  Opções de Recorte:                             │
│  ☑ Aplicar ROIs salvas  [recortes.pkl]         │
│                                                  │
│  [▶️ Iniciar Processamento]                     │
│                                                  │
│  Progresso Geral:                               │
│  ████████████████░░░░ 80% (120/150)            │
│                                                  │
│  Log:                                           │
│  ✓ foto_001.jpg processada (0.8s)              │
│  ✓ foto_002.jpg processada (0.7s)              │
│  → Processando foto_003.jpg...                 │
│                                                  │
│  [⏸️ Pausar] [⏹️ Cancelar]                      │
└─────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológica

### **Backend (Python)**
- **Flask**: Framework web principal
- **OpenCV (cv2)**: Processamento de imagem
- **Tesseract OCR**: Reconhecimento de texto
- **NumPy**: Operações numéricas
- **Pickle**: Serialização de dados
- **Flask-SocketIO**: Comunicação em tempo real (WebSockets)

### **Frontend (JavaScript)**
- **Vanilla JS / jQuery**: Manipulação DOM
- **Canvas API**: Desenho de ROI
- **Socket.IO**: WebSocket cliente
- **Bootstrap**: Framework CSS
- **Chart.js**: Gráficos e visualizações

---

## 📋 Plano de Implementação

### **Fase 1: Infraestrutura Base (1-2 dias)**
- [ ] Criar estrutura de serviços em `frontend/services/`
- [ ] Configurar Flask-SocketIO para comunicação tempo real
- [ ] Criar sistema de upload e gestão de arquivos
- [ ] Implementar sistema de jobs/tarefas assíncronas

### **Fase 2: Captura de Imagens (2-3 dias)**
- [ ] Criar `camera_service.py` com suporte RTSP
- [ ] Desenvolver interface de configuração de câmera
- [ ] Implementar preview de vídeo em tempo real (MJPEG stream)
- [ ] Criar sistema de controle start/stop/pause
- [ ] Barra de progresso e contador de fotos

### **Fase 3: Seleção de ROI (2-3 dias)**
- [ ] Criar `roi_service.py` para gerenciar coordenadas
- [ ] Desenvolver canvas HTML5 para desenho de retângulos
- [ ] Implementar salvamento/carregamento de ROIs
- [ ] Preview de recortes antes de aplicar
- [ ] Editor de coordenadas (ajuste fino)

### **Fase 4: Sistema de Filtros (3-4 dias)**
- [ ] Criar `image_processor.py` com todos os filtros
- [ ] Interface com sliders para ajuste de parâmetros
- [ ] Preview em tempo real (debouncing)
- [ ] Comparação lado a lado de filtros
- [ ] Salvamento de presets de configuração

### **Fase 5: Processamento em Lote (2-3 dias)**
- [ ] Criar `batch_processor.py` com sistema de filas
- [ ] Interface de seleção de arquivos/pastas
- [ ] Barra de progresso com WebSocket
- [ ] Sistema de log em tempo real
- [ ] Controles de pausa/cancelamento

### **Fase 6: OCR (1-2 dias)**
- [ ] Criar `ocr_service.py` integrando Tesseract
- [ ] Interface de upload e preview
- [ ] Seleção de idioma OCR
- [ ] Exportação de resultados (TXT/JSON)

### **Fase 7: Dashboard e Visualização (2 dias)**
- [ ] Dashboard principal com cards
- [ ] Sistema de navegação entre ferramentas
- [ ] Galeria de imagens processadas
- [ ] Estatísticas e métricas

### **Fase 8: Testes e Refinamento (2-3 dias)**
- [ ] Testes de integração
- [ ] Ajustes de UX/UI
- [ ] Otimização de performance
- [ ] Documentação de uso

**Tempo Total Estimado: 15-22 dias**

---

## 🔧 APIs REST Necessárias

### **Camera Service**
```
POST   /api/camera/start       - Iniciar captura
POST   /api/camera/stop        - Parar captura
GET    /api/camera/status      - Status da captura
GET    /api/camera/stream      - Stream MJPEG
PUT    /api/camera/config      - Atualizar configuração
```

### **ROI Service**
```
GET    /api/roi/list           - Listar ROIs salvas
POST   /api/roi/save           - Salvar nova ROI
PUT    /api/roi/:id            - Atualizar ROI
DELETE /api/roi/:id            - Deletar ROI
POST   /api/roi/apply          - Aplicar recortes
```

### **Filter Service**
```
POST   /api/filter/preview     - Preview de filtro
POST   /api/filter/apply       - Aplicar filtro a imagem
GET    /api/filter/presets     - Listar presets
POST   /api/filter/preset      - Salvar preset
```

### **Batch Processing**
```
POST   /api/batch/start        - Iniciar processamento
POST   /api/batch/pause        - Pausar processamento
POST   /api/batch/cancel       - Cancelar processamento
GET    /api/batch/status/:id   - Status do job
```

### **OCR Service**
```
POST   /api/ocr/extract        - Extrair texto de imagem
GET    /api/ocr/languages      - Listar idiomas disponíveis
```

---

## 💾 Estrutura de Dados

### **Configuração de Captura**
```json
{
  "camera": {
    "ip": "192.168.88.110",
    "port": 554,
    "username": "admin",
    "password": "Kaiser@210891",
    "channel": 1
  },
  "capture": {
    "interval": 30,
    "duration": 600,
    "output_dir": "imagens/"
  }
}
```

### **ROI**
```json
{
  "id": "roi_001",
  "name": "Temperatura Superior",
  "coordinates": {
    "x": 100,
    "y": 50,
    "width": 200,
    "height": 150
  },
  "reference_image": "foto_670.jpg"
}
```

### **Preset de Filtros**
```json
{
  "id": "preset_001",
  "name": "Alta Contraste",
  "filters": {
    "brightness": -40,
    "adaptive_threshold": {
      "block_size": 11,
      "c": 2
    },
    "canny": {
      "low": 100,
      "high": 200
    }
  }
}
```

---

## ⚡ Otimizações e Melhorias

### **Performance**
1. **Cache de Imagens**: Cache Redis para imagens processadas
2. **Processamento Assíncrono**: Celery para jobs pesados
3. **Compressão**: WebP para preview no navegador
4. **Streaming**: MJPEG eficiente para vídeo

### **UX/UI**
1. **Atalhos de Teclado**: Para operações comuns
2. **Drag & Drop**: Upload de imagens
3. **Modo Escuro**: Tema alternativo
4. **Responsivo**: Mobile-friendly

### **Segurança**
1. **Validação**: Inputs sanitizados
2. **Autenticação**: Sistema de login já existe
3. **Rate Limiting**: Prevenir abuse
4. **Logs**: Auditoria de operações

---

## 📊 Comparação: Antes vs Depois

| Operação | Antes (Terminal) | Depois (Web) |
|----------|-----------------|--------------|
| **Configurar Captura** | Editar código Python | Formulário web intuitivo |
| **Selecionar ROI** | cv2.selectROI (desktop) | Canvas HTML5 (qualquer dispositivo) |
| **Ajustar Filtros** | Modificar variáveis hardcoded | Sliders com preview em tempo real |
| **Processar Lote** | Executar script + esperar | Um clique + progresso visual |
| **Monitorar Progresso** | Terminal logs | Dashboard web em tempo real |
| **Interromper Processo** | Ctrl+C ou ESPAÇO | Botão "Cancelar" |
| **Visualizar Resultados** | Abrir pastas manualmente | Galeria web integrada |
| **Configurar OCR** | Editar path do Tesseract | Upload + clique |

---

## 🎯 Benefícios da Integração

### **Para o Usuário**
✅ **Interface Intuitiva**: Sem necessidade de conhecimento Python  
✅ **Acesso Remoto**: Usar de qualquer dispositivo na rede  
✅ **Feedback Visual**: Ver resultados em tempo real  
✅ **Histórico**: Manter registro de configurações e processos  
✅ **Colaboração**: Múltiplos usuários podem acessar  

### **Para o Desenvolvimento**
✅ **Manutenibilidade**: Código organizado em serviços  
✅ **Escalabilidade**: Fácil adicionar novas features  
✅ **Testabilidade**: APIs bem definidas  
✅ **Documentação**: Interface auto-documenta funcionalidades  

---

## 🚀 Próximos Passos Imediatos

1. **Aprovação do Plano**: Revisar e ajustar proposta
2. **Priorização**: Definir qual fase implementar primeiro
3. **Protótipo**: Criar mockup/wireframe das interfaces
4. **Configuração Ambiente**: Instalar dependências adicionais (Flask-SocketIO, etc.)
5. **Início do Desenvolvimento**: Fase 1 - Infraestrutura Base

---

## 📝 Notas Técnicas

### **Dependências Adicionais Necessárias**
```txt
flask-socketio==5.3.5
python-socketio==5.10.0
celery==5.3.4
redis==5.0.1
python-dotenv==1.0.0
pillow==10.1.0
```

### **Configurações de Ambiente**
```env
# .env
TESSERACT_PATH=/usr/bin/tesseract  # Linux
UPLOAD_FOLDER=uploads/
MAX_CONTENT_LENGTH=50MB
REDIS_URL=redis://localhost:6379/0
```

---

**Conclusão**: O projeto é totalmente viável e trará grande melhoria na usabilidade. A arquitetura proposta mantém a lógica de processamento original enquanto adiciona uma camada web intuitiva e poderosa.

Pronto para começar? 🚀
