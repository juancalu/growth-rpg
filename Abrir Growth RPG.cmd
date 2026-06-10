@echo off
chcp 65001 >nul
title Growth RPG - servidor local

rem Sobe o app estatico (app/) em http://localhost:5000 e abre o navegador.
rem Duplo-clique para iniciar. Feche esta janela para PARAR o servidor.

where python >nul 2>&1
if errorlevel 1 (
  echo.
  echo [ERRO] Python nao encontrado no PATH.
  echo Instale o Python ^(https://www.python.org/downloads/^) e marque
  echo "Add python.exe to PATH" durante a instalacao.
  echo.
  pause
  exit /b 1
)

rem Sincroniza a copia servida com o dados.json canonico (raiz, gerado pelo cowork).
rem Sem isso, app/ servia uma versao defasada enquanto o cowork atualizava a raiz.
if exist "%~dp0dados.json" (
  copy /Y "%~dp0dados.json" "%~dp0app\dados.json" >nul
  echo  dados.json sincronizado ^(raiz -^> app/^).
) else (
  echo  [aviso] dados.json nao encontrado na raiz; servindo a copia atual de app/.
)

cd /d "%~dp0app"

echo.
echo  Growth RPG rodando em:  http://localhost:5000/
echo  Abrindo o navegador...
echo  ^(feche esta janela para parar o servidor^)
echo.

rem Abre o navegador 1s depois, ja com o servidor de pe.
start "" cmd /c "timeout /t 1 >nul & start "" http://localhost:5000/"

python -m http.server 5000
