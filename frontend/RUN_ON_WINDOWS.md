# Como Rodar no Windows (Acesso à Câmera)

## Por que no Windows?
WSL2 não tem acesso direto a dispositivos USB como webcams. Para usar sua câmera real, rode no Windows.

---

## Passo a Passo Completo

### 1. Instalar Python no Windows

**Se ainda não tem Python:**

1. Baixe Python 3.12+: https://www.python.org/downloads/
2. Execute o instalador
3. ⚠️ **IMPORTANTE**: Marque "Add Python to PATH"
4. Clique em "Install Now"

**Verificar instalação:**
```powershell
python --version
```

---

### 2. Abrir PowerShell no Windows

1. Pressione `Win + X`
2. Selecione "Windows PowerShell" ou "Terminal"
3. Navegue até a pasta do projeto:
   ```powershell
   cd C:\Users\SeuUsuario\Codigos-vscode\ThermoVisionIA-project
   ```

   **Dica:** No Windows Explorer, você pode Shift+Clique direito na pasta e "Abrir janela do PowerShell aqui"

---

### 3. Criar Ambiente Virtual

```powershell
python -m venv venv
```

---

### 4. Ativar Ambiente Virtual

```powershell
.\venv\Scripts\activate
```

Você verá `(venv)` no início da linha do PowerShell.

---

### 5. Instalar Dependências

```powershell
pip install --upgrade pip
pip install -r requirement.txt
```

**Nota:** Pode demorar alguns minutos, especialmente o OpenCV.

---

### 6. Executar Aplicação

```powershell
python app.py
```

Você verá:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

---

### 7. Acessar no Navegador

Abra: **http://localhost:5000**

---

## Comandos Resumidos

```powershell
# 1. Navegar até a pasta
cd C:\Users\SeuUsuario\Codigos-vscode\ThermoVisionIA-project

# 2. Criar venv (primeira vez apenas)
python -m venv venv

# 3. Ativar venv
.\venv\Scripts\activate

# 4. Instalar dependências (primeira vez apenas)
pip install -r requirement.txt

# 5. Rodar aplicação
python app.py
```

---

## Script Automático para Windows

Crie um arquivo `run.bat`:

```batch
@echo off
echo ======================================
echo   ThermoVisionIA - Windows
echo ======================================
echo.

if not exist "venv\" (
    echo Criando ambiente virtual...
    python -m venv venv
)

echo Ativando ambiente virtual...
call venv\Scripts\activate.bat

echo Instalando/atualizando dependencias...
pip install -q -r requirement.txt

echo.
echo ======================================
echo   Servidor rodando em:
echo   http://localhost:5000
echo ======================================
echo.
echo Pressione Ctrl+C para parar
echo.

python app.py

pause
```

Depois basta clicar duas vezes em `run.bat`!

---

## Verificar Câmeras (Windows)

```powershell
# Ativar venv primeiro
.\venv\Scripts\activate

# Testar câmeras
python test_camera.py
```

Deve mostrar suas câmeras detectadas! ✓

---

## Solução de Problemas

### Erro: "python não é reconhecido"
- Python não está no PATH
- Reinstale o Python e marque "Add Python to PATH"

### Erro: "pip não é reconhecido"
```powershell
python -m pip install --upgrade pip
```

### Câmera não detectada no Windows
1. Feche outros programas usando câmera (Zoom, Teams, etc.)
2. Verifique se câmera funciona (abra app Câmera do Windows)
3. Reinicie o computador

### Porta 5000 já em uso
Mude a porta no final do `app.py`:
```python
if __name__ == "__main__":
    app.run(debug=True, port=5001)  # Use porta 5001
```

---

## Próximos Passos

Depois de rodar no Windows:

1. Acesse http://localhost:5000
2. Crie uma conta (Cadastro)
3. Faça login
4. No dashboard, clique em "🔄" para detectar câmeras
5. Selecione sua webcam
6. Clique em "Conectar Câmera"
7. Veja o streaming ao vivo! ✓

---

**Dica:** Você pode editar os arquivos no VSCode no WSL e executar no Windows simultaneamente!
