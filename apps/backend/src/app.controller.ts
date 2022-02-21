import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  StreamableFile,
  UnauthorizedException,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { Request } from 'express'
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

  @Get('/me/')
  async getUser(@Req() request: Request): Promise<User> {
    const { token } = request.cookies
    if (!token) throw new UnauthorizedException()
    const user = await this.userService.fromToken(token)
    if (!user) throw new UnauthorizedException()
    return user
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
