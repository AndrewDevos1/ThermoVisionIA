# Soluções para Acesso à Câmera no WSL2

## Problema
WSL2 não tem acesso direto a dispositivos USB como webcams.

---

## ✅ SOLUÇÃO 1: Rodar no Windows (RECOMENDADO)

A forma mais simples é rodar o Python diretamente no Windows.

### Passo a Passo:

1. **Abra o PowerShell ou CMD no Windows** (não no WSL)
   ```powershell
   cd C:\caminho\para\ThermoVisionIA-project
   ```

2. **Instale o Python no Windows** (se ainda não tem)
   - Baixe em: https://www.python.org/downloads/
   - Marque "Add Python to PATH" na instalação

3. **Crie ambiente virtual no Windows**
   ```powershell
   python -m venv venv
   ```

4. **Ative o ambiente virtual**
   ```powershell
   venv\Scripts\activate
   ```

5. **Instale as dependências**
   ```powershell
   pip install -r requirement.txt
   ```

6. **Execute a aplicação**
   ```powershell
   python app.py
   ```

7. **Acesse** http://localhost:5000

---

## ✅ SOLUÇÃO 2: Modo Demo com Vídeo de Teste

Use um vídeo de exemplo para testar o sistema sem câmera.

### Passo a Passo:

1. **Baixe um vídeo de teste** ou use um vídeo qualquer (MP4, AVI, etc.)

2. **Execute o modo demo:**
   ```bash
   ./run_demo.sh
   ```

3. O sistema usará o vídeo ao invés da câmera real

---

## ⚠️ SOLUÇÃO 3: USBIPd (Avançado)

Conectar USB do Windows ao WSL2 usando usbipd.

### Requisitos:
- Windows 11 ou Windows 10 (build 19041+)
- Privilégios de administrador

### Instalação:

1. **No Windows (PowerShell como Admin):**
   ```powershell
   winget install --interactive --exact dorssel.usbipd-win
   ```

2. **No WSL2:**
   ```bash
   sudo apt install linux-tools-generic hwdata
   sudo update-alternatives --install /usr/local/bin/usbip usbip /usr/lib/linux-tools/*-generic/usbip 20
   ```

3. **Liste dispositivos USB (PowerShell no Windows):**
   ```powershell
   usbipd list
   ```

4. **Conecte sua webcam (substitua BUSID pelo ID correto):**
   ```powershell
   usbipd bind --busid 1-2
   usbipd attach --wsl --busid 1-2
   ```

5. **Verifique no WSL2:**
   ```bash
   lsusb
   ls /dev/video*
   ```

6. **Execute o teste:**
   ```bash
   python test_camera.py
   ```

### Problemas Comuns:
- Requer reinstalar a cada boot do WSL
- Pode ter problemas de driver
- Requer permissões de admin

---

## 📊 Comparação das Soluções

| Solução | Dificuldade | Acesso Real à Câmera | Recomendação |
|---------|-------------|----------------------|--------------|
| Windows Nativo | ⭐ Fácil | ✅ Sim | ⭐⭐⭐⭐⭐ Melhor |
| Modo Demo | ⭐ Fácil | ❌ Não (vídeo teste) | ⭐⭐⭐⭐ Boa para testes |
| USBIPd | ⭐⭐⭐ Difícil | ✅ Sim | ⭐⭐ Complicado |

---

## 🎯 Recomendação Final

**Use a Solução 1 (Windows Nativo)** se você precisa:
- Acessar câmera real
- Solução estável
- Menos problemas

**Use a Solução 2 (Modo Demo)** se você quer:
- Testar o sistema rapidamente
- Desenvolver funcionalidades sem câmera
- Continuar no WSL

---

## 🔍 Verificar se Funciona

Depois de escolher uma solução, teste com:

```bash
python test_camera.py
```

Deve mostrar câmeras encontradas! ✓

---

**Qual solução você quer implementar?**
