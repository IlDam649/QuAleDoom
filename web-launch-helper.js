/**
 * Helper HTTP locale per avvio GZDoom dalla pagina web.
 * Avvia un server su 127.0.0.1:18787 che accetta:
 *  - GET  /health           -> { ok: true }
 *  - POST /launch { gzdoomPath: string, args: string[], workingDir?: string }
 *
 * Sicurezza: abilita CORS per consentire chiamate dal sito (GitHub Pages, ecc.).
 * Avvio: node web-launch-helper.js
 */
const http = require('http');
const { spawn } = require('child_process');
const url = require('url');

const HOST = '127.0.0.1';
const PORT = 18787;

function sendJson(res, status, data) {
    const body = JSON.stringify(data);
    res.writeHead(status, {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body),
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(body);
}

function handleOptions(req, res) {
    res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '600'
    });
    res.end();
}

function parseBody(req) {
    return new Promise((resolve, reject) => {
        let raw = '';
        req.on('data', (chunk) => {
            raw += chunk.toString('utf8');
            if (raw.length > 1024 * 1024) {
                reject(new Error('Body troppo grande'));
                req.destroy();
            }
        });
        req.on('end', () => {
            if (!raw) return resolve({});
            try {
                resolve(JSON.parse(raw));
            } catch (e) {
                reject(new Error('JSON non valido'));
            }
        });
        req.on('error', reject);
    });
}

function launchGzdoom(gzdoomPath, args, workingDir) {
    return new Promise((resolve, reject) => {
        try {
            const child = spawn(gzdoomPath, Array.isArray(args) ? args : [], {
                cwd: workingDir || undefined,
                detached: true,
                stdio: 'ignore',
                windowsHide: false
            });
            child.unref();
            // Non possiamo sapere l'esito finale; rispondiamo subito al client
            resolve({ success: true, message: 'GZDoom avviato (helper).' });
        } catch (error) {
            reject(error);
        }
    });
}

const server = http.createServer(async (req, res) => {
    const parsed = url.parse(req.url, true);
    if (req.method === 'OPTIONS') {
        return handleOptions(req, res);
    }

    if (req.method === 'GET' && parsed.pathname === '/health') {
        return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'POST' && parsed.pathname === '/launch') {
        try {
            const body = await parseBody(req);
            const gzdoomPath = typeof body.gzdoomPath === 'string' ? body.gzdoomPath.trim() : '';
            const args = Array.isArray(body.args) ? body.args : [];
            const workingDir = typeof body.workingDir === 'string' ? body.workingDir.trim() : '';

            if (!gzdoomPath) {
                return sendJson(res, 400, { success: false, error: 'gzdoomPath mancante' });
            }
            await launchGzdoom(gzdoomPath, args, workingDir);
            return sendJson(res, 200, { success: true });
        } catch (error) {
            return sendJson(res, 500, { success: false, error: error.message || String(error) });
        }
    }

    sendJson(res, 404, { error: 'Not found' });
});

server.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`web-launch-helper in ascolto su http://${HOST}:${PORT}`);
}); 


