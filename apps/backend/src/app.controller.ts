import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  StreamableFile,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { AppService } from './app.service'
import { CreateUserDto } from './user/user.dto'
import { UserService } from './user/user.service'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly userService: UserService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('/user/:token')
  async getUser(@Param('token') token: string): Promise<User | null> {
    return this.userService.fromToken(token)
  }

  @Post('/register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.register(createUserDto)
  }

  @Get('/image/:letter')
  getImage(@Param('letter') letter: string) {
    letter = `${letter}?`.at(0).toUpperCase()
    return new StreamableFile(this.appService.getImage(letter), {
      type: 'image/png',
      disposition: '',
    })
  }
}
