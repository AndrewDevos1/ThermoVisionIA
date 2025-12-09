# 🚀 COMEÇA AQUI - ThermoVisionIA

## ⚡ Início Rápido (1 comando)

### No WSL2 (você está aqui):

```bash
./run_demo.sh
```

Depois acesse: **http://localhost:5000**

---

## 🎥 Modo DEMO vs Modo REAL

### Você está no WSL2?

**SIM** → Use `./run_demo.sh` (vídeo simulado, sem câmera física)

**NÃO (Windows)** → Use `run.bat` (câmera real)

---

## 📖 Guias Disponíveis

1. **`WSL_DEMO_MODE.md`** ← **LEIA PRIMEIRO** (WSL2)
   - Como funciona o modo demo
   - Vídeo simulado
   - Sem precisar de câmera

2. **`RUN_ON_WINDOWS.md`** (Windows)
   - Rodar com câmera real
   - Passo a passo completo

3. **`CAMERA_FIX.md`** (Problema de câmera)
   - Por que câmera não funciona no WSL2
   - Soluções disponíveis

4. **`QUICK_START.md`** (Guia geral)
   - Todos os scripts
   - Comandos úteis

5. **`README.md`** (Documentação completa)
   - Funcionalidades
   - API endpoints
   - Arquitetura

---

## 🎯 Fluxo Recomendado no WSL2

```bash
# 1. Rodar modo demo
./run_demo.sh

# Acessar no navegador
http://localhost:5000

# 2. Criar conta
#    - Clique em "Cadastrar"
#    - Preencha os dados
#    - Crie usuário

# 3. Fazer login
#    - Use suas credenciais

# 4. Conectar câmera demo
#    - Clique em 🔄
#    - Selecione "Câmera Demo (Vídeo Simulado)"
#    - Clique em "Conectar Câmera"
#    - Veja o streaming! 🎥
```

---

## 🛠️ Scripts Disponíveis

| Script | Para | Descrição |
|--------|------|-----------|
| `./run_demo.sh` | WSL2 | ⭐ **Use este!** Modo demo |
| `./run_quick.sh` | WSL2 | Setup + rodar (sem PostgreSQL) |
| `./run.sh` | Linux | Modo real (com PostgreSQL) |
| `run.bat` | Windows | ⭐ Câmera real Windows |
| `./start_postgres.sh` | Linux | Iniciar PostgreSQL |
| `./setup.sh` | Todos | Setup completo |
| `./setup_database.sh` | Linux | Criar banco PostgreSQL |

---

## ❓ FAQ Rápido

### Por que a câmera não funciona no WSL2?
WSL2 não tem acesso direto a dispositivos USB. Use modo demo ou rode no Windows.

### Como usar minha câmera real?
Rode no Windows com `run.bat`. Veja `RUN_ON_WINDOWS.md`.

### O que é modo demo?
Sistema usa um vídeo simulado ao invés de câmera física. Perfeito para desenvolvimento.

### Posso usar meu próprio vídeo?
Sim! Coloque seu vídeo como `demo_video.mp4` ou edite `config.py`.

### Como trocar entre demo e real?
Edite `config.py` e mude `MODE = "demo"` para `MODE = "real"`.

---

## ✅ Checklist de Primeiro Uso

- [ ] Execute `./run_demo.sh`
- [ ] Aguarde carregar (cria vídeo se necessário)
- [ ] Acesse http://localhost:5000
- [ ] Crie uma conta (Cadastrar)
- [ ] Faça login
- [ ] No dashboard, clique em 🔄
- [ ] Veja "Câmera Demo (Vídeo Simulado)"
- [ ] Selecione e conecte
- [ ] Veja o streaming funcionando! ✓

---

## 🆘 Ajuda

**Erro ao rodar?**
- Veja `WSL_DEMO_MODE.md` → Seção "Solução de Problemas"

**Quer câmera real?**
- Veja `RUN_ON_WINDOWS.md`

**Dúvidas gerais?**
- Veja `README.md` completo

---

## 🎊 Pronto para começar!

```bash
./run_demo.sh
```

**Aguarde alguns segundos e acesse:**
```
http://localhost:5000
```

Divirta-se! 🚀
