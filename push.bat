@echo off
set /p msg="Digite a mensagem do commit: "
if "%msg%"=="" set msg="Auto-push: %date% %time%"

git add .
git commit -m "%msg%"
git pull --rebase origin main
git push origin main

echo.
echo Processo concluido!
pause
