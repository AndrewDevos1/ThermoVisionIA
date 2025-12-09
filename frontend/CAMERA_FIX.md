# 🎥 PROBLEMA: Câmera não detectada no WSL2

## ⚠️ Situação Atual

```
Encontradas 0 câmeras
```

**Causa:** WSL2 não tem acesso direto a dispositivos USB (webcams)

---

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### Rodar no Windows ao invés do WSL2

1. **Abra PowerShell no Windows** (não no WSL)

2. **Navegue até a pasta do projeto:**
   ```powershell
   cd C:\Users\SeuUsuario\Codigos-vscode\ThermoVisionIA-project
   ```

   Ou pelo Windows Explorer:
   - Vá até a pasta do projeto
   - Shift + Clique direito → "Abrir no Terminal"

3. **Execute o arquivo .bat:**
   ```powershell
   .\run.bat
   ```

   Ou simplesmente **clique duas vezes** no arquivo `run.bat`

4. **Pronto!** Acesse: http://localhost:5000

---

## 📋 O que o run.bat faz automaticamente:

- ✓ Verifica se Python está instalado
- ✓ Cria ambiente virtual
- ✓ Instala dependências
- ✓ Cria banco de dados SQLite
- ✓ Inicia o servidor

---

## 🔍 Testar se Câmera Funciona

**No PowerShell do Windows:**

```powershell
# Ativar ambiente virtual
.\venv\Scripts\activate

# Testar câmeras
python test_camera.py
```

**Resultado esperado:**
```
✓ Câmera 0 encontrada!
  Resolução: 640x480
```

---

## 🆘 Se Não Tiver Python no Windows

1. **Baixe:** https://www.python.org/downloads/
2. **Execute o instalador**
3. ⚠️ **MARQUE: "Add Python to PATH"**
4. **Instale**
5. **Reinicie o PowerShell**

---

## 📱 Alternativas

### Opção A: Windows (RECOMENDADO) ⭐⭐⭐⭐⭐
- ✓ Acesso real à câmera
- ✓ Simples e rápido
- ✓ Use `run.bat`

### Opção B: Continuar no WSL (sem câmera)
- ❌ Não acessa câmera
- ✓ Pode desenvolver outras funcionalidades
- ✓ Use `./run_quick.sh`

### Opção C: USBIPd (Avançado)
- ✓ Acessa câmera no WSL
- ❌ Configuração complexa
- ❌ Requer admin
- Ver: `CAMERA_SOLUTIONS.md`

---

## 🎯 Resumo Rápido

| Onde | Acessa Câmera? | Dificuldade | Como Rodar |
|------|----------------|-------------|------------|
| **Windows** | ✅ SIM | ⭐ Fácil | `run.bat` |
| WSL2 | ❌ NÃO | ⭐ Fácil | `./run_quick.sh` |
| WSL2 + USBIPd | ✅ SIM | ⭐⭐⭐ Difícil | Ver guia |

---

## 💡 Dica

Você pode:
- **Editar código** no VSCode no WSL
- **Executar aplicação** no Windows para usar câmera

Os arquivos são os mesmos!

---

## ✅ Checklist

- [ ] Abrir PowerShell no Windows
- [ ] Navegar até a pasta do projeto
- [ ] Executar `run.bat`
- [ ] Acessar http://localhost:5000
- [ ] Criar conta
- [ ] Fazer login
- [ ] Clicar em 🔄 para detectar câmeras
- [ ] Selecionar câmera
- [ ] Conectar e ver streaming! 🎥

---

**Precisa de ajuda? Veja:**
- `RUN_ON_WINDOWS.md` - Guia completo Windows
- `CAMERA_SOLUTIONS.md` - Todas as opções
- `test_camera.py` - Testar detecção de câmeras
