@echo off
echo Installazione requisiti QualeDoom
echo.

echo 1. Installazione .NET Framework 4.8...
start /wait https://dotnet.microsoft.com/download/dotnet-framework/thank-you/net48-web-installer

echo.
echo 2. Download Visual C++ Redistributable...
start /wait https://aka.ms/vs/17/release/vc_redist.x64.exe

echo.
echo 3. Sblocco applicazione...
powershell -Command "Get-ChildItem -Path '.' -Recurse -File | Unblock-File"

echo.
echo Installazione completata!
echo Riavvia il computer e lancia QualeDoom
pause