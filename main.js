const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
    const iconPath = path.join(__dirname, 'assets', 'icon.png');
    const windowOptions = {
        width: 1200,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: 'QuAleDoom - GZDoom Launcher'
    };
    
    // Aggiungi l'icona solo se esiste
    if (fs.existsSync(iconPath)) {
        windowOptions.icon = iconPath;
    }
    
    mainWindow = new BrowserWindow(windowOptions);

    mainWindow.loadFile('index.html');

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

ipcMain.handle('select-gzdoom-exe', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Seleziona GZDoom.exe',
        filters: [
            { name: 'Eseguibili', extensions: ['exe'] },
            { name: 'Tutti i file', extensions: ['*'] }
        ],
        properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths[0];
    }
    return null;
});

ipcMain.handle('select-wad-files', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Seleziona file WAD',
        filters: [
            { name: 'File WAD', extensions: ['wad', 'pk3', 'pk7'] },
            { name: 'Tutti i file', extensions: ['*'] }
        ],
        properties: ['openFile', 'multiSelections']
    });

    if (!result.canceled && result.filePaths.length > 0) {
        return result.filePaths.map(filePath => ({
            name: path.basename(filePath),
            path: filePath
        }));
    }
    return [];
});

ipcMain.handle('launch-gzdoom', async (event, gzdoomPath, args) => {
    return new Promise((resolve, reject) => {
        try {
            const process = spawn(gzdoomPath, args, { 
                detached: true,
                stdio: 'ignore'
            });
            
            process.unref();
            
            process.on('spawn', () => {
                resolve({ success: true, message: 'GZDoom avviato con successo!' });
            });

            process.on('error', (error) => {
                reject({ success: false, message: `Errore nell'avvio di GZDoom: ${error.message}` });
            });

            setTimeout(() => {
                resolve({ success: true, message: 'GZDoom avviato!' });
            }, 1000);

        } catch (error) {
            reject({ success: false, message: `Errore: ${error.message}` });
        }
    });
});