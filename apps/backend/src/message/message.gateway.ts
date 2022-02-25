import { UnauthorizedException } from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets'
import * as cookieParser from 'cookie-parser'
import { Server, Socket } from 'socket.io'
import { UserService } from '../user/user.service'
import { MessageService } from './message.service'

@WebSocketGateway({
  path: '/api/socket.io',
  // Block CORS (Cross-Origin Resource Sharing) in production
  cors: { origin: process.env.NODE_ENV !== 'production' },
})
export class MessageGateway implements OnGatewayInit, OnGatewayConnection {
  constructor(
    private readonly messageService: MessageService,
    private readonly userService: UserService,
  ) {}

  afterInit(server: Server) {
    const parser = cookieParser()
    server.use((socket, next) => {
      // @ts-expect-error These types can't match
      parser(socket.request, undefined, next)
    })
    server.use(async (socket, next) => {
      const { token } = socket.request.cookies
      if (!token) return next(new UnauthorizedException())
      const user = await this.userService.fromToken(token)
      if (!user) return next(new UnauthorizedException())
      socket.user = user
      next()
    })
  }

  handleConnection(socket: Socket) {
    socket.join(`user:${socket.user.id}`)
  }

  @SubscribeMessage('message')
  async handleMessage(
    @MessageBody() data: { to: number; body: string },
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      await this.messageService.createMessage({
        fromId: socket.user.id,
        toId: data.to,
        body: data.body,
      })
      socket.emit('message', { body: data.body, me: true })
      socket.to(`user:${data.to}`).emit('message', {
        body: data.body,
        me: false,
      })
    } catch {
      socket.emit('error', 'The message cannot be sent.')
    }
  }
}
