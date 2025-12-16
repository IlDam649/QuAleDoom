@echo off
echo Risoluzione problemi di esecuzione QualeDoom
echo.

echo 1. Controlla Execution Policy PowerShell:
powershell -Command "Get-ExecutionPolicy"
echo.

echo 2. Imposta Execution Policy a RemoteSigned:
powershell -Command "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force"
echo Execution Policy impostata
echo.

echo 3. Sblocca i file scaricati:
powershell -Command "Get-ChildItem -Path '.' -Recurse -File | Unblock-File"
echo File sbloccati
echo.

echo 4. Verifica se Windows Defender blocca l'eseguibile:
powershell -Command "Add-MpPreference -ExclusionPath '.\QualeDoom.exe'" 2>nul
powershell -Command "Add-MpPreference -ExclusionPath '.\QualeDoom Setup 1.0.0.exe'" 2>nul
echo Esclusione Windows Defender aggiunta (se possibile)
echo.

pause