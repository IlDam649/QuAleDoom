# Creazione ZIP per distribuzione

powershell -Command "Compress-Archive -Path 'QualeDoom-Portable\*' -DestinationPath 'QualeDoom-Portable-v1.0.0.zip' -Force"

echo ZIP creato: QualeDoom-Portable-v1.0.0.zip
pause