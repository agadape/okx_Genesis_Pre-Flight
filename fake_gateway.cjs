const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 18789 });
console.log('[fake-gateway] Listening on ws://127.0.0.1:18789');

wss.on('connection', (ws) => {
  console.log('[fake-gateway] Client connected');

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw.toString()); } catch { return; }
    console.log('[fake-gateway] <<', msg.method || msg.type, msg.id);

    // Handle "connect" handshake
    if (msg.method === 'connect') {
      const res = {
        type: 'res',
        id: msg.id,
        result: {
          protocol: 4,
          server: {
            id: 'openclaw-gateway',
            displayName: 'OpenClaw',
            version: '2026.6.11',
            platform: 'node',
            mode: 'gateway'
          },
          capabilities: ['health', 'plugins', 'okx-a2a'],
          session: { id: 'fake-session-' + Date.now() }
        }
      };
      ws.send(JSON.stringify(res));
      console.log('[fake-gateway] >> connect OK');
      return;
    }

    // Handle health check
    if (msg.method === 'okx-a2a.health') {
      const res = {
        type: 'res',
        id: msg.id,
        result: { status: 'ok', ready: true, pluginVersion: '0.1.7' }
      };
      ws.send(JSON.stringify(res));
      console.log('[fake-gateway] >> health OK');
      return;
    }

    // Handle plugin list / installed check
    if (msg.method === 'plugins.list' || msg.method === 'plugins.installed') {
      const res = {
        type: 'res',
        id: msg.id,
        result: {
          plugins: [
            { name: '@okxweb3/a2a-openclaw', version: '0.1.7', enabled: true }
          ]
        }
      };
      ws.send(JSON.stringify(res));
      console.log('[fake-gateway] >> plugins OK');
      return;
    }

    // Handle config get
    if (msg.method === 'config.get') {
      const res = {
        type: 'res',
        id: msg.id,
        result: {}
      };
      ws.send(JSON.stringify(res));
      console.log('[fake-gateway] >> config OK');
      return;
    }

    // Default: respond OK to any unknown method
    const res = {
      type: 'res',
      id: msg.id,
      result: { ok: true }
    };
    ws.send(JSON.stringify(res));
    console.log('[fake-gateway] >> default OK for', msg.method);
  });

  ws.on('close', () => console.log('[fake-gateway] Client disconnected'));
  ws.on('error', (e) => console.error('[fake-gateway] Error:', e.message));
});
