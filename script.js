class GZDoomLauncher {
    constructor() {
        this.gzdoomPath = '';
        this.wadFiles = [];
		this.isElectron = this.detectElectron();
        this.initializeElements();
        this.bindEvents();
		this.applyEnvironmentMode();
        this.updateUI();
    }

	detectElectron() {
		try {
			// Metodo robusto: controlla process.versions.electron oppure userAgent
			return !!(typeof process !== 'undefined' && process.versions && process.versions.electron)
				|| (typeof navigator !== 'undefined' && navigator.userAgent && navigator.userAgent.toLowerCase().includes('electron'));
		} catch (_) {
			return false;
		}
	}

    initializeElements() {
        this.elements = {
            gzdoomPath: document.getElementById('gzdoomPath'),
            browseGzdoom: document.getElementById('browseGzdoom'),
            gzdoomFile: document.getElementById('gzdoomFile'),
            dropZone: document.getElementById('dropZone'),
            browseWads: document.getElementById('browseWads'),
            wadFiles: document.getElementById('wadFiles'),
            wadList: document.getElementById('wadList'),
            wadItems: document.getElementById('wadItems'),
            iwad: document.getElementById('iwad'),
            skill: document.getElementById('skill'),
            warp: document.getElementById('warp'),
            customArgs: document.getElementById('customArgs'),
            fullscreen: document.getElementById('fullscreen'),
            nomonsters: document.getElementById('nomonsters'),
            fast: document.getElementById('fast'),
            respawn: document.getElementById('respawn'),
            launchBtn: document.getElementById('launchBtn'),
			downloadBat: document.getElementById('downloadBat'),
            commandPreview: document.getElementById('commandPreview'),
            logOutput: document.getElementById('logOutput'),
            clearLog: document.getElementById('clearLog')
        };
    }

	applyEnvironmentMode() {
		// In modalità web, mostra il bottone per scaricare il .BAT e precompila gzdoom.exe
		if (!this.isElectron && this.elements.downloadBat) {
			this.elements.downloadBat.style.display = 'inline-block';
			if (!this.gzdoomPath) {
				this.gzdoomPath = 'gzdoom.exe';
				this.elements.gzdoomPath.value = this.gzdoomPath;
			}
		}
	}

    bindEvents() {
        this.elements.browseGzdoom.addEventListener('click', async () => {
			if (this.isElectron) {
                const { ipcRenderer } = require('electron');
                const selectedPath = await ipcRenderer.invoke('select-gzdoom-exe');
                if (selectedPath) {
                    this.gzdoomPath = selectedPath;
                    this.elements.gzdoomPath.value = this.gzdoomPath;
                    this.updateUI();
                    this.log(`GZDoom selezionato: ${this.gzdoomPath}`);
                }
            } else {
				// In web, non possiamo ottenere il path assoluto. Chiediamo un nome/percorso logico oppure usiamo gzdoom.exe.
				const value = prompt('Inserisci il nome del file di avvio (es: gzdoom.exe) o un percorso relativo:', this.elements.gzdoomPath.value || 'gzdoom.exe');
				if (value !== null) {
					this.gzdoomPath = value.trim() || 'gzdoom.exe';
					this.elements.gzdoomPath.value = this.gzdoomPath;
					this.updateUI();
					this.log(`GZDoom impostato: ${this.gzdoomPath}`);
				}
            }
        });

        this.elements.gzdoomFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
				// In Electron File.path esiste, nel browser usiamo il nome
				const file = e.target.files[0];
				this.gzdoomPath = (this.isElectron && file.path) ? file.path : (file.name || 'gzdoom.exe');
                this.elements.gzdoomPath.value = this.gzdoomPath;
                this.updateUI();
                this.log(`GZDoom selezionato: ${this.gzdoomPath}`);
            }
        });

        this.elements.browseWads.addEventListener('click', async () => {
			if (this.isElectron) {
                const { ipcRenderer } = require('electron');
                const selectedFiles = await ipcRenderer.invoke('select-wad-files');
                if (selectedFiles && selectedFiles.length > 0) {
                    const files = selectedFiles.map(file => ({
                        name: file.name,
                        path: file.path,
                        size: 0
                    }));
                    this.addWadFiles(files);
                }
            } else {
                this.elements.wadFiles.click();
            }
        });

        this.elements.wadFiles.addEventListener('change', (e) => {
            this.addWadFiles(Array.from(e.target.files));
        });

        this.elements.dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.dropZone.classList.add('drag-over');
        });

        this.elements.dropZone.addEventListener('dragleave', () => {
            this.elements.dropZone.classList.remove('drag-over');
        });

        this.elements.dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.dropZone.classList.remove('drag-over');
            const files = Array.from(e.dataTransfer.files).filter(file => 
                file.name.toLowerCase().endsWith('.wad') || 
                file.name.toLowerCase().endsWith('.pk3') || 
                file.name.toLowerCase().endsWith('.pk7')
            );
            this.addWadFiles(files);
        });

        this.elements.launchBtn.addEventListener('click', () => {
            this.launchGZDoom();
        });

        this.elements.clearLog.addEventListener('click', () => {
            this.clearLog();
        });

		if (this.elements.downloadBat) {
			this.elements.downloadBat.addEventListener('click', () => {
				this.downloadBat();
			});
		}

        const updatePreview = () => this.updateCommandPreview();
        this.elements.iwad.addEventListener('change', updatePreview);
        this.elements.skill.addEventListener('change', updatePreview);
        this.elements.warp.addEventListener('input', updatePreview);
        this.elements.customArgs.addEventListener('input', updatePreview);
        this.elements.fullscreen.addEventListener('change', updatePreview);
        this.elements.nomonsters.addEventListener('change', updatePreview);
        this.elements.fast.addEventListener('change', updatePreview);
        this.elements.respawn.addEventListener('change', updatePreview);

        this.elements.gzdoomPath.addEventListener('input', () => {
            this.gzdoomPath = this.elements.gzdoomPath.value;
            this.updateUI();
        });
    }

    addWadFiles(files) {
        files.forEach(file => {
            if (!this.wadFiles.find(wad => wad.name === file.name)) {
                this.wadFiles.push({
                    name: file.name,
					// In browser non esiste path: usiamo nome o webkitRelativePath (se disponibile)
					path: file.path || file.webkitRelativePath || file.name,
                    size: file.size ? this.formatFileSize(file.size) : 'N/A'
                });
            }
        });
        this.updateWadList();
        this.updateUI();
        this.log(`Aggiunti ${files.length} file WAD`);
    }

    removeWadFile(index) {
        const removed = this.wadFiles.splice(index, 1)[0];
        this.updateWadList();
        this.updateUI();
        this.log(`Rimosso: ${removed.name}`);
    }

    updateWadList() {
        this.elements.wadItems.innerHTML = '';
        
        if (this.wadFiles.length === 0) {
            this.elements.wadList.style.display = 'none';
            return;
        }

        this.elements.wadList.style.display = 'block';
        
        this.wadFiles.forEach((wad, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div>
                    <span class="file-name">${wad.name}</span>
                    <span class="file-size">(${wad.size})</span>
                </div>
                <button class="remove-btn" onclick="launcher.removeWadFile(${index})">✕</button>
            `;
            this.elements.wadItems.appendChild(li);
        });
    }

    updateUI() {
        const canLaunch = this.gzdoomPath && this.wadFiles.length > 0;
        this.elements.launchBtn.disabled = !canLaunch;
        this.updateCommandPreview();
    }

	getArgsArray() {
		const args = [];

		if (this.elements.iwad.value) {
			args.push('-iwad', this.elements.iwad.value);
		}

		if (this.wadFiles.length > 0) {
			args.push('-file', ...this.wadFiles.map(wad => wad.path));
		}

		if (this.elements.skill.value) {
			args.push('-skill', this.elements.skill.value);
		}

		if (this.elements.warp.value.trim()) {
			const warp = this.elements.warp.value.trim();
			if (warp.toLowerCase().startsWith('e') && warp.includes('m')) {
				const parts = warp.toLowerCase().replace('e', '').replace('m', ' ').split(' ');
				if (parts.length === 2) {
					args.push('-warp', parts[0], parts[1]);
				}
			} else if (warp.toLowerCase().startsWith('map')) {
				const mapNum = warp.toLowerCase().replace('map', '');
				if (!isNaN(mapNum)) {
					args.push('-warp', mapNum);
				}
			} else if (!isNaN(warp)) {
				args.push('-warp', warp);
			}
		}

		if (this.elements.fullscreen.checked) {
			args.push('-fullscreen');
		}

		if (this.elements.nomonsters.checked) {
			args.push('-nomonsters');
		}

		if (this.elements.fast.checked) {
			args.push('-fast');
		}

		if (this.elements.respawn.checked) {
			args.push('-respawn');
		}

		if (this.elements.customArgs.value.trim()) {
			const customArgs = this.elements.customArgs.value.trim().split(' ');
			args.push(...customArgs);
		}

		return args;
	}

    updateCommandPreview() {
        if (!this.gzdoomPath || this.wadFiles.length === 0) {
            this.elements.commandPreview.textContent = 'Seleziona GZDoom e almeno un file WAD';
            return;
        }

		const args = this.getArgsArray();
		const argsEscaped = args.map(a => (a.includes(' ') ? `"${a}"` : a)).join(' ');
		const command = `"${this.gzdoomPath}" ${argsEscaped}`.trim();
		this.elements.commandPreview.textContent = command;
    }

    async launchGZDoom() {
        if (!this.gzdoomPath || this.wadFiles.length === 0) {
            this.log('Errore: Seleziona GZDoom e almeno un file WAD', 'error');
            return;
        }

        try {
            this.log('Avvio di GZDoom...', 'info');
            
			const args = this.getArgsArray();

			if (this.isElectron) {
                const { ipcRenderer } = require('electron');
                try {
                    const result = await ipcRenderer.invoke('launch-gzdoom', this.gzdoomPath, args);
                    this.log(result.message, 'success');
                } catch (error) {
                    this.log(error.message, 'error');
                }
            } else {
				// Modalità Web: prova helper locale su 127.0.0.1, poi fallback a copia comando
				const launched = await this.tryLaunchViaLocalHelper(this.gzdoomPath, args);
				if (!launched) {
					this.log('Nota: Helper locale non raggiungibile. Copia il comando e avvia manualmente.', 'warning');
					navigator.clipboard.writeText(this.elements.commandPreview.textContent).then(() => {
						this.log('Comando copiato negli appunti!', 'success');
					}).catch(() => {
						this.log('Impossibile copiare il comando negli appunti', 'warning');
					});
				}
            }

        } catch (error) {
            this.log(`Errore: ${error.message}`, 'error');
        }
    }

	async tryLaunchViaLocalHelper(gzdoomPath, args) {
		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), 3000);
		const helperUrl = 'http://127.0.0.1:18787/launch';
		try {
			const res = await fetch(helperUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ gzdoomPath, args }),
				signal: controller.signal
			});
			clearTimeout(timeout);
			if (!res.ok) {
				this.log(`Helper risponde con errore HTTP ${res.status}`, 'warning');
				return false;
			}
			const data = await res.json().catch(() => ({}));
			if (data && data.success) {
				this.log('GZDoom avviato tramite helper locale.', 'success');
				return true;
			}
			this.log('Helper locale ha risposto ma senza success.', 'warning');
			return false;
		} catch (e) {
			clearTimeout(timeout);
			this.log('Impossibile contattare l\'helper locale su 127.0.0.1:18787', 'warning');
			return false;
		}
	}

	generateWindowsBatch() {
		// Genera contenuto .bat che esegue GZDoom dalla stessa cartella del .bat
		const args = this.getArgsArray();
		const argsEscaped = args.map(a => (a.includes(' ') ? `"${a}"` : a)).join(' ');
		const gz = (this.gzdoomPath && this.gzdoomPath.trim()) ? this.gzdoomPath.trim() : 'gzdoom.exe';
		const gzQuoted = gz.includes(' ') ? `"${gz}"` : gz;

		const lines = [
			'@echo off',
			'REM Avvio GZDoom con i parametri scelti in QualeDoom (modalità web)',
			'REM Posiziona questo file nella stessa cartella di GZDoom.exe (o modifica la riga seguente).',
			'cd /d "%~dp0"',
			`${gzQuoted} ${argsEscaped}`.trim(),
			'pause'
		];
		return lines.join('\r\n');
	}

	downloadBat() {
		if (this.wadFiles.length === 0) {
			this.log('Aggiungi almeno un WAD prima di creare il .BAT', 'warning');
			return;
		}
		const content = this.generateWindowsBatch();
		const blob = new Blob([content], { type: 'application/octet-stream' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'avvia-gzdoom.bat';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		this.log('File .BAT generato e scaricato', 'success');
	}

	downloadRequiredFilesList() {
		const lines = [];
		lines.push('QualeDoom (Web) - Elenco file richiesti');
		lines.push('');
		lines.push('Istruzioni:');
		lines.push('- Metti TUTTI i file elencati qui sotto nella stessa cartella del file .BAT e di gzdoom.exe.');
		lines.push('- Se hai scelto un IWAD, assicurati che sia presente con il nome indicato.');
		lines.push('- Poi esegui il file .BAT.');
		lines.push('');
		lines.push('Eseguibile GZDoom atteso:');
		lines.push(`- ${this.gzdoomPath || 'gzdoom.exe'}`);
		lines.push('');
		lines.push('IWAD (se impostato):');
		lines.push(`- ${this.elements.iwad && this.elements.iwad.value ? this.elements.iwad.value : '(Automatico - non specificato)'}`);
		lines.push('');
		lines.push('File WAD/PK3 selezionati:');
		if (this.wadFiles.length === 0) {
			lines.push('- (Nessuno)');
		} else {
			this.wadFiles.forEach(w => lines.push(`- ${w.name}`));
		}

		const content = lines.join('\r\n');
		const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'ELENCO_FILE_DA_COPIARE.txt';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
		this.log('Elenco file (TXT) scaricato', 'success');
	}

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logEntry = `[${timestamp}] ${message}\n`;
        
        const logOutput = this.elements.logOutput;
        logOutput.textContent += logEntry;
        logOutput.scrollTop = logOutput.scrollHeight;

        if (type === 'error') {
            console.error(message);
        } else if (type === 'warning') {
            console.warn(message);
        } else {
            console.log(message);
        }
    }

    clearLog() {
        this.elements.logOutput.textContent = 'Log pulito...\n';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    saveConfig() {
        const config = {
            gzdoomPath: this.gzdoomPath,
            wadFiles: this.wadFiles,
            iwad: this.elements.iwad.value,
            skill: this.elements.skill.value,
            warp: this.elements.warp.value,
            customArgs: this.elements.customArgs.value,
            fullscreen: this.elements.fullscreen.checked,
            nomonsters: this.elements.nomonsters.checked,
            fast: this.elements.fast.checked,
            respawn: this.elements.respawn.checked
        };
        
        localStorage.setItem('gzdoom-launcher-config', JSON.stringify(config));
        this.log('Configurazione salvata', 'success');
    }

    loadConfig() {
        try {
            const config = JSON.parse(localStorage.getItem('gzdoom-launcher-config'));
            if (config) {
                this.gzdoomPath = config.gzdoomPath || '';
                this.wadFiles = config.wadFiles || [];
                
                this.elements.gzdoomPath.value = this.gzdoomPath;
                this.elements.iwad.value = config.iwad || '';
                this.elements.skill.value = config.skill || '';
                this.elements.warp.value = config.warp || '';
                this.elements.customArgs.value = config.customArgs || '';
                this.elements.fullscreen.checked = config.fullscreen || false;
                this.elements.nomonsters.checked = config.nomonsters || false;
                this.elements.fast.checked = config.fast || false;
                this.elements.respawn.checked = config.respawn || false;
                
                this.updateWadList();
                this.updateUI();
                this.log('Configurazione caricata', 'success');
            }
        } catch (error) {
            this.log('Errore nel caricamento della configurazione', 'warning');
        }
    }
}

let launcher;

document.addEventListener('DOMContentLoaded', () => {
    launcher = new GZDoomLauncher();
    launcher.loadConfig();
    
    window.addEventListener('beforeunload', () => {
        launcher.saveConfig();
    });
});

window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        launcher.saveConfig();
    }
    
    if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        launcher.saveConfig();
    }
});