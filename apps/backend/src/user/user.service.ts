import { BadRequestException, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import { nanoid } from 'nanoid'
import { CreateUserDto } from './user.dto'

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async register({ name, displayName }: CreateUserDto): Promise<User> {
    if (await this.prismaService.user.findUnique({ where: { name } })) {
      throw new BadRequestException(['name already taken'])
    }
    return this.prismaService.user.create({
      data: {
        name,
        displayName,
        token: nanoid(),
      },
    })
  }
}
