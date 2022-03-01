import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common'
import { User } from '@prisma/client'
import { Request, Response, Express } from 'express'
import { GenerateImageParams, GetImageParams } from './image/image.dto.js'
import { ImageService } from './image/image.service.js'
import { MessageService } from './message/message.service.js'
import { CreateUserDto } from './user/user.dto.js'
import { UserService } from './user/user.service.js'
import { FileInterceptor } from '@nestjs/platform-express'
import path from 'path'
import * as fs from 'fs/promises'

const __dirname = new URL('.', import.meta.url).pathname

@Controller('/api')
export class AppController {
  constructor(
    private readonly imageService: ImageService,
    private readonly messageService: MessageService,
    private readonly userService: UserService,
  ) {}

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
    const user = await this.getUser(request)
    return this.userService.getContacts(user)
  }

  @Get('/user/:name')
  async getUserFromName(@Param('name') name: string) {
    const user = await this.userService.fromName(name)
    if (!user) throw new NotFoundException()
    return user
  }

  @Get('/chat/:name')
  async getMessages(@Req() request: Request, @Param('name') name: string) {
    const user = await this.getUser(request)
    return this.messageService.getChat(user, name)
  }

  @Post('/register')
  async register(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.register(createUserDto)
  }

  @Post('/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    console.log(file)
    // Get current user name
    const username = await (await this.getUser(request)).name
    // Generate the filepath for the storage of the profile picture
    const extension = path.extname(file.originalname)
    var filepath = `${__dirname}../../../storage/profile-pictures/${username}${extension}`

    fs.writeFile(filepath, file.buffer)
    // Give back the uploaded filename
    return { file: `${username}${extension}` }
  }

  @Get('/image')
  getImage(
    @Res({ passthrough: true }) response: Response,
    @Query() { name, accept }: GetImageParams,
  ) {
    try {
      return this.imageService.getImage(name, accept.split(','))
    } catch {
      response.redirect(
        `./image-generator?${new URLSearchParams({
          name,
          font: 'Gilroy-ExtraBold',
        })}`,
      )
      response.end()
    }
  }

  @Get('/image-generator')
  generateImage(@Query() { name, font }: GenerateImageParams) {
    return this.imageService.generateImage(name, font)
  }
}
