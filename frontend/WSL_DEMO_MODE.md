# 🎥 Modo DEMO - Rodar no WSL2 sem Câmera

## ✅ Solução para WSL2

Como WSL2 não tem acesso a câmeras USB, criamos um **MODO DEMO** que usa vídeo simulado!

---

## 🚀 Como Usar (1 comando)

```bash
./run_demo.sh
```

**Pronto!** Acesse: http://localhost:5000

---

## 📋 O que o modo demo faz:

1. ✓ Cria vídeo de demonstração automaticamente
2. ✓ Configura ambiente virtual
3. ✓ Instala dependências
4. ✓ Cria banco SQLite
5. ✓ Ativa modo DEMO
6. ✓ Inicia servidor Flask

---

## 🎬 Como Funciona

### Vídeo Simulado

O sistema cria um vídeo `demo_video.mp4` com:
- **Duração:** 10 segundos (loop infinito)
- **Resolução:** 640x480
- **FPS:** 30
- **Tamanho:** ~1.5 MB
- **Conteúdo:** Gradiente colorido animado

### Câmera Virtual

No dashboard você verá:
- **"Câmera Demo (Vídeo Simulado)"** na lista
- Conecta normalmente como câmera real
- Streaming funciona perfeitamente
- Vídeo roda em loop contínuo

---

## 🎯 Passo a Passo

### 1. Executar Modo Demo

```bash
./run_demo.sh
```

### 2. Acessar Sistema

```
http://localhost:5000
```

### 3. Criar Conta

- Clique em "Cadastrar"
- Preencha os dados
- Crie sua conta

### 4. Fazer Login

- Use suas credenciais
- Acesse o dashboard

### 5. Conectar Câmera Demo

- Clique em "🔄" para detectar câmeras
- Você verá: **"Câmera Demo (Vídeo Simulado)"**
- Selecione e clique em "Conectar Câmera"
- Veja o streaming! 🎥

---

## ⚙️ Configurações

O modo está configurado em `config.py`:

```python
MODE = "demo"  # Modo demo ativo
DEMO_VIDEO_PATH = "demo_video.mp4"
```

### Trocar para Modo Real (se tiver câmera)

Edite `config.py`:

```python
MODE = "real"  # Volta para câmera física
```

Ou use:
```bash
./run.sh  # Modo real
```

---

## 🔄 Alternar Entre Modos

```bash
# Modo DEMO (vídeo simulado - WSL2)
./run_demo.sh

# Modo REAL (câmera física - Windows)
./run.sh
```

---

## 📁 Arquivos Criados

```
ThermoVisionIA-project/
├── demo_video.mp4          # Vídeo de demonstração (criado automaticamente)
├── config.py               # Configurações (MODE = "demo")
├── run_demo.sh             # Script para modo demo
├── create_demo_video.py    # Script para criar vídeo
└── app.py                  # Modificado para suportar modo demo
```

---

## ✨ Vantagens do Modo Demo

- ✓ **Funciona no WSL2** sem configuração extra
- ✓ **Não precisa de câmera** física
- ✓ **Streaming funciona** perfeitamente
- ✓ **Testa funcionalidades** sem hardware
- ✓ **Desenvolvimento rápido** sem depender de câmera
- ✓ **Loop infinito** para testes contínuos

---

## 🐛 Solução de Problemas

### Erro: "demo_video.mp4 not found"

```bash
python create_demo_video.py
```

### Câmera demo não aparece

Verifique `config.py`:
```python
MODE = "demo"  # Deve estar em "demo"
```

### Vídeo não carrega

```bash
# Recriar vídeo
rm demo_video.mp4
python create_demo_video.py
```

### Criar vídeo personalizado

Edite `create_demo_video.py` e modifique:
- `duration` - Duração do vídeo
- `width, height` - Resolução
- `fps` - Taxa de frames

---

## 🎨 Personalizar Vídeo Demo

Você pode usar qualquer vídeo MP4 como demo:

```bash
# Copie seu vídeo
cp seu_video.mp4 demo_video.mp4

# Execute
./run_demo.sh
```

Ou edite `config.py`:
```python
DEMO_VIDEO_PATH = "seu_video_personalizado.mp4"
```

---

## 🔍 Verificar Modo Atual

```bash
grep MODE config.py
```

Saída:
```
MODE = "demo"  # Modo demo ativo
```

---

## 📊 Comparação

| Modo | WSL2 | Windows | Câmera Real | Script |
|------|------|---------|-------------|--------|
| **Demo** | ✅ SIM | ✅ SIM | ❌ Vídeo | `./run_demo.sh` |
| **Real** | ❌ NÃO | ✅ SIM | ✅ SIM | `./run.sh` ou `run.bat` |

---

## 🎯 Resumo Rápido

**No WSL2:**
```bash
./run_demo.sh           # Usa vídeo simulado ✓
```

**No Windows:**
```bash
.\run.bat               # Usa câmera real ✓
```

---

## ✅ Checklist de Uso

- [ ] Execute `./run_demo.sh`
- [ ] Acesse http://localhost:5000
- [ ] Crie uma conta
- [ ] Faça login
- [ ] Clique em 🔄 para detectar câmeras
- [ ] Veja "Câmera Demo (Vídeo Simulado)"
- [ ] Conecte e veja o streaming! 🎥

---

**Modo DEMO perfeito para desenvolvimento no WSL2!** 🚀
