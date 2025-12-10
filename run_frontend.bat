@echo off
setlocal

set ROOT=%~dp0
set FRONTEND=%ROOT%frontend
set VENV=%FRONTEND%\venv
set ACTIVATE=%VENV%\Scripts\activate.bat
set PYTHON=%VENV%\Scripts\python.exe

call :log Preparando frontend com venv dedicado...

if not exist "%ACTIVATE%" (
    call :log Criando venv em frontend\venv...
    python -m venv "%VENV%" || goto error
)

call "%ACTIVATE%"
call :log Instalando dependencias...
"%PYTHON%" -m pip install -r "%FRONTEND%\requirement.txt" || goto error

set FLASK_APP=app.py
set FLASK_ENV=development
set FLASK_DEBUG=1
cd /d "%FRONTEND%" || goto error
call :log Subindo Flask em http://localhost:5000 ...
"%PYTHON%" app.py
goto :eof

:log
echo [front] %*
goto :eof

:error
echo [front][erro] Falha ao preparar ou executar o frontend.
exit /b 1
