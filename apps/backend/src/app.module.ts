import { Module } from '@nestjs/common'
import { AppController } from './app.controller.js'
import { ImageService } from './image/image.service.js'
import { MessageGateway } from './message/message.gateway.js'
import { MessageService } from './message/message.service.js'
import { PrismaService } from './prisma.service.js'
import { UserService } from './user/user.service.js'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [
    MessageGateway,
    ImageService,
    MessageService,
    PrismaService,
    UserService,
  ],
})
export class AppModule {}
