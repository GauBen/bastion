import { Module } from '@nestjs/common'
import { AppController } from './app.controller.js'
import { AppService } from './app.service.js'
import { MessageGateway } from './message/message.gateway.js'
import { MessageService } from './message/message.service.js'
import { PrismaService } from './prisma.service.js'
import { UserService } from './user/user.service.js'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    MessageGateway,
    AppService,
    MessageService,
    PrismaService,
    UserService,
  ],
})
export class AppModule {}
