import {
  BadRequestException,
  UnauthorizedException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WsException,
} from '@nestjs/websockets'
import { default as cookieParser } from 'cookie-parser'
import { Server, Socket } from 'socket.io'
import { gifDetails } from 'svelte-tenor/api'
import { UserService } from '../user/user.service.js'
import { CreateMessageDto } from './message.dto.js'
import { MessageService } from './message.service.js'

@WebSocketGateway({
  path: '/api/socket.io',
  // Block CORS (Cross-Origin Resource Sharing) in production
  cors: { origin: process.env.NODE_ENV !== 'production' },
})
@UsePipes(
  new ValidationPipe({
    // ValidationPipe produces BadRequestExceptions by default
    exceptionFactory: (errors) =>
      new WsException(
        errors.flatMap(({ constraints = {} }) => Object.values(constraints)),
      ),
  }),
)
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
    @MessageBody() { toId, gif, body }: CreateMessageDto,
    @ConnectedSocket() socket: Socket,
  ) {
    try {
      if (gif) {
        const details = (
          await gifDetails({ key: process.env.VITE_TENOR_KEY, ids: [body] })
        ).results
        if (details.length !== 1) throw new BadRequestException()
        body = JSON.stringify(details[0])
      }
      const message = await this.messageService.createMessage({
        fromId: socket.user.id,
        toId,
        gif,
        body,
      })
      socket.emit('message', { contact: message.to, gif, body, me: true })
      socket.to(`user:${toId}`).emit('message', {
        contact: {
          id: socket.user.id,
          name: socket.user.name,
          displayName: socket.user.displayName,
        },
        gif,
        body,
        me: false,
      })
    } catch (e: any) {
      console.error(e.message)
      socket.emit('error', 'The message cannot be sent.')
    }
  }
}
