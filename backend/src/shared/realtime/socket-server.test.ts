import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { describe, it } from 'node:test';
import { attachSocketServer } from './socket-server.ts';

describe('Socket.IO server', () => {
  it('accepts a Socket.IO client connection over HTTP polling', async () => {
    const httpServer = createServer();
    const io = attachSocketServer(httpServer, true);

    try {
      await new Promise<void>((resolve) => {
        httpServer.listen(0, resolve);
      });

      const address = httpServer.address();
      assert.ok(address && typeof address !== 'string');

      const endpoint = `http://127.0.0.1:${address.port}/socket.io/?EIO=4&transport=polling`;
      const connectedSocket = new Promise<string>((resolve) => {
        io.once('connection', (socket) => resolve(socket.id));
      });

      const handshakeResponse = await fetch(endpoint);
      assert.equal(handshakeResponse.status, 200);
      const handshakePacket = (await handshakeResponse.text()).split('\x1e')[0];
      if (!handshakePacket?.startsWith('0')) {
        throw new Error('Socket.IO did not return an open packet.');
      }

      const handshake = JSON.parse(handshakePacket.slice(1)) as { sid?: unknown };
      if (typeof handshake.sid !== 'string') {
        throw new Error('Socket.IO handshake did not include a session ID.');
      }
      const sessionId = handshake.sid;

      const connectResponse = await fetch(`${endpoint}&sid=${encodeURIComponent(sessionId)}`, {
        method: 'POST',
        headers: { 'content-type': 'text/plain;charset=UTF-8' },
        body: '40',
      });

      assert.equal(connectResponse.status, 200);
      assert.ok(await connectedSocket);
    } finally {
      await new Promise<void>((resolve, reject) => {
        io.close((error) => {
          if (error) {
            reject(error);
            return;
          }

          resolve();
        });
      });
    }
  });
});
