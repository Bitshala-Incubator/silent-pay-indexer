import { Injectable, Logger } from '@nestjs/common';
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@Injectable()
@WebSocketGateway()
export class SilentBlocksGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    private readonly logger = new Logger(SilentBlocksGateway.name);

    @WebSocketServer() server: Server;

    handleConnection(client: WebSocket) {
        const remoteAddress = (client as any)._socket.remoteAddress;
        this.logger.debug(`Client connected: ${remoteAddress}`);
    }

    handleDisconnect(client: WebSocket) {
        const remoteAddress = (client as any)._socket.remoteAddress;
        this.logger.debug(`Client disconnected: ${remoteAddress}`);
    }

    broadcastSilentBlock(silentBlock: Buffer) {
        for (const client of this.server.clients) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(silentBlock);
            }
        }
    }
}
