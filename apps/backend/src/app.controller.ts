import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
  UnauthorizedException,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { IsString } from 'class-validator'
import { Request, Response } from 'express'
import { createReadStream, existsSync } from 'fs'
import { AppService } from './app.service'
import { CreateUserDto } from './user/user.dto'
import { UserService } from './user/user.service'

class GetImageParams {
  @IsString()
  name!: string

  @IsString()
  accept!: string
}

class GenerateImageParams {
  @IsString()
  name!: string

  @IsString()
  font!: string
}

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

  @Get('/me')
  async getUser(@Req() request: Request): Promise<User> {
    const { token } = request.cookies
    if (!token) throw new UnauthorizedException()
    const user = await this.userService.fromToken(token)
    if (!user) throw new UnauthorizedException()
    return user
  }

  @Get('/contacts')
  async getContacts(@Req() request: Request) {
    const { token } = request.cookies
    if (!token) throw new UnauthorizedException()
    const user = await this.userService.fromToken(token)
    if (!user) throw new UnauthorizedException()
    return this.userService.getContacts(user)
  }

  @Post('/register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.register(createUserDto)
  }

  @Get('/image')
  getImage(
    @Query() { name, accept }: GetImageParams,
    @Res({ passthrough: true }) response: Response,
  ) {
    for (const extension of accept.split(',')) {
      const filename = `${__dirname}/../../../storage/profile-pictures/${name}.${extension}`
      if (existsSync(filename))
        return new StreamableFile(createReadStream(filename), {
          type: `image/${extension}`,
        })
    }
    response.redirect(
      `./image-generator?${new URLSearchParams({
        name,
        font: 'Gilroy-ExtraBold',
      })}`,
    )
    response.end()
  }

  @Get('/image-generator')
  generateImage(@Query() { name, font }: GenerateImageParams) {
    return new StreamableFile(this.appService.getImage(name, font), {
      type: 'image/png',
    })
  }
}
