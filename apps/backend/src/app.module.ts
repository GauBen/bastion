import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MessageGateway } from './message/message.gateway'
import { MessageService } from './message/message.service'
import { PrismaService } from './prisma.service'
import { UserService } from './user/user.service'

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
