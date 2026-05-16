@echo off
cd /d "%~dp0"
echo.
echo  ========================================
echo   Servidor de Sync - Alerta Leiloes PB
echo  ========================================
echo.
echo  Iniciando servidor na porta 3100...
echo  Mantenha esta janela aberta enquanto usar o painel admin.
echo  Para parar: feche esta janela ou pressione Ctrl+C
echo.
node sync-server.mjs
pause
