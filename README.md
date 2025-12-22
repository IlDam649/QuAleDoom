# 🎮 QuAleDoom - GZDoom Launcher

Un launcher moderno e intuitivo per GZDoom che ti permette di caricare e lanciare facilmente i tuoi file WAD con tutte le opzioni personalizzabili.

## ✨ Caratteristiche

- 🚀 **Interfaccia moderna e intuitiva** con design dark
- 📁 **Drag & Drop** per caricare file WAD
- ⚙️ **Opzioni avanzate**: difficoltà, livello, argomenti personalizzati
- 💾 **Salvataggio automatico** della configurazione
- 🌐 **Funziona sia come app Electron che come app web**
- 📦 **Generazione file .BAT** per uso portatile (modalità web)

## 📋 Requisiti

- **Node.js** (versione 14 o superiore) - solo per sviluppo
- **GZDoom** installato sul sistema
- **Windows 10+** (per la versione Electron)
- Browser moderno (per la versione web)

## 🚀 Installazione e Avvio

### Come Applicazione Electron (Desktop)

1. **Installa le dipendenze:**
   ```bash
   npm install
   ```

2. **Avvia l'applicazione:**
   ```bash
   npm start
   ```

3. **Per sviluppo (con DevTools):**
   ```bash
   npm run dev
   ```

### Come Applicazione Web

1. **Apri semplicemente `index.html` nel browser**
   - Oppure usa un server locale (es. `python -m http.server` o `npx serve`)

2. **Per usare l'helper locale (opzionale):**
   ```bash
   npm run web-helper
   ```
   Questo avvia un server locale su `127.0.0.1:18787` che permette di avviare GZDoom direttamente dal browser.

### Build per Distribuzione

**Windows:**
```bash
npm run build-win
```

Il file eseguibile verrà creato nella cartella `dist/`.

## 📖 Come Usare

1. **Seleziona GZDoom:**
   - Clicca su "Sfoglia" e seleziona il percorso di `gzdoom.exe`

2. **Carica i file WAD:**
   - Trascina i file WAD nella zona di drop
   - Oppure clicca su "Seleziona WAD" per scegliere i file

3. **Configura le opzioni:**
   - **IWAD Base**: Scegli il gioco base (DOOM, DOOM II, ecc.)
   - **Difficoltà**: Seleziona il livello di difficoltà
   - **Livello**: Inserisci il livello da cui iniziare (es. E1M1, MAP01)
   - **Argomenti personalizzati**: Aggiungi parametri aggiuntivi
   - **Checkbox**: Schermo intero, nessun mostro, mostri veloci, respawn

4. **Lancia GZDoom:**
   - Clicca su "🚀 Lancia GZDoom"
   - Il comando verrà eseguito automaticamente

### Modalità Web - File .BAT

In modalità web, puoi generare un file `.BAT` che contiene tutti i parametri configurati:

1. Configura tutto come desiderato
2. Clicca su "💾 Scarica file .BAT (Windows)"
3. Metti il file `.BAT` nella stessa cartella di `gzdoom.exe` e dei file WAD
4. Esegui il file `.BAT`

## 🛠️ Sviluppo

### Struttura del Progetto

```
QuAleDOOM/
├── main.js              # Processo principale Electron
├── script.js            # Logica dell'applicazione
├── index.html           # Interfaccia utente
├── styles.css           # Stili CSS
├── web-launch-helper.js # Helper per modalità web
├── package.json         # Configurazione npm
└── README.md           # Questo file
```

### Tecnologie Utilizzate

- **Electron** - Framework per applicazioni desktop
- **HTML/CSS/JavaScript** - Frontend
- **Node.js** - Backend e helper

## 📝 Note

- La configurazione viene salvata automaticamente nel localStorage (modalità web) o nella configurazione dell'app (modalità Electron)
- L'icona dell'app è opzionale: se non presente, verrà usata l'icona di default di Electron
- Il progetto supporta sia l'esecuzione come app desktop che come app web

## 🐛 Risoluzione Problemi

Vedi `TROUBLESHOOTING.md` per problemi comuni e soluzioni.

## 📄 Licenza

Questo progetto è distribuito sotto licenza GNU GPL v3. Vedi `LICENSE` per i dettagli.

## 👤 Autore

Damiano

---

**Divertiti con i tuoi WAD! 🎮**

