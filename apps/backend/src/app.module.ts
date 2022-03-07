import { Module, ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { default as cookieParser } from 'cookie-parser'
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

export const bootstrap = async () => {
  const app = await NestFactory.create(AppModule)
  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe())
  return app
}
