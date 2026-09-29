import type { Server as HttpServer } from 'node:http';
import type { CorsOptions } from 'cors';
import { Server as SocketServer } from 'socket.io';

export function attachSocketServer(
  httpServer: HttpServer,
  corsOrigin: CorsOptions['origin'],
): SocketServer {
  return new SocketServer(httpServer, {
    cors: { origin: corsOrigin },
  });
}
