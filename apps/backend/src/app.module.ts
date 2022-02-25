import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { MessageGateway } from './message.gateway'
import { PrismaService } from './prisma.service'
import { UserService } from './user/user.service'

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, PrismaService, UserService, MessageGateway],
})
export class AppModule {}
