import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets'

@WebSocketGateway({
  path: '/api',
  // Block CORS (Cross-Origin Resource Sharing) in production
  cors: { origin: process.env.NODE_ENV !== 'production' },
})
export class MessageGateway {
  @SubscribeMessage('message')
  handleMessage(): string {
    return 'Hello world!'
  }
}
