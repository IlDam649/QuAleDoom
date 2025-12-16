# Risoluzione problemi esecuzione QualeDoom su Windows

## Problemi comuni e soluzioni:

### 1. Windows Smart Screen
- Click destro sull'eseguibile → Proprietà
- Seleziona "Sblocca" → Applica → OK
- Riavvia l'eseguibile

### 2. Windows Defender/Antivirus
- Aggiungi eccezione per QualeDoom.exe
- Aggiungi eccezione per l'intera cartella

### 3. Execution Policy PowerShell
Esegui come amministratore il file `fix-execution.bat`

### 4. .NET Framework
Assicurati che sia installato .NET Framework 4.7.2 o superiore

### 5. Visual C++ Redistributable
Installare Microsoft Visual C++ Redistributable 2015-2022

### 6. Permessi amministratore
- Click destro → Esegui come amministratore

### 7. Firewall Windows
Aggiungi regola per permettere QualeDoom.exe

### File da distribuire:
- Copia l'intera cartella `QualeDoom-Portable`
- Oppure distribuisci `QualeDoom Setup 1.0.0.exe`

### Test post-installazione:
1. Controlla se l'applicazione appare nel menu Start
2. Verifica le scorciatoie sul desktop
3. Lancia l'applicazione da menu Start