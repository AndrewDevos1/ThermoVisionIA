@echo off
REM Script para rodar ThermoVisionIA no Windows
REM Execute este arquivo clicando duas vezes nele

echo ======================================
echo   ThermoVisionIA - Windows
echo ======================================
echo.

REM Verificar se Python está instalado
python --version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Python nao encontrado!
    echo.
    echo Instale Python em: https://www.python.org/downloads/
    echo Marque "Add Python to PATH" na instalacao
    pause
    exit /b 1
)

REM Criar ambiente virtual se não existir
if not exist "venv\" (
    echo Criando ambiente virtual...
    python -m venv venv
    echo.
)

REM Ativar ambiente virtual
echo Ativando ambiente virtual...
call venv\Scripts\activate.bat

REM Instalar dependências se necessário
if not exist "venv\Lib\site-packages\flask\" (
    echo Instalando dependencias...
    pip install -q --upgrade pip
    pip install -q -r requirement.txt
    echo.
)

REM Verificar se SQLite database existe, se não, criar
if not exist "thermovision.db" (
    echo Criando banco de dados SQLite...
    python -c "from services.conexao_sqlite import init_database; init_database()"
    echo.
)

echo ======================================
echo   Servidor rodando em:
echo   http://localhost:5000
echo ======================================
echo.
echo Pressione Ctrl+C para parar o servidor
echo.

REM Executar aplicação
python app.py

pause
