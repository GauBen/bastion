import { BadRequestException, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import { nanoid } from 'nanoid'
import { CreateUserDto } from './user.dto'

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async fromToken(token: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { token } })
  }

  async getContacts(user: User) {
    return this.prismaService.user.findMany({
      where: {
        OR: [
          { messagesReceived: { some: { from: user } } },
          { messagesSent: { some: { to: user } } },
        ],
      },
      select: { id: true, name: true, displayName: true },
    })
  }

  async register({ name, displayName }: CreateUserDto): Promise<User> {
    if (await this.prismaService.user.findUnique({ where: { name } })) {
      throw new BadRequestException(['name already taken'])
    }
    const user = await this.prismaService.user.create({
      data: { name, displayName, token: nanoid() },
    })
    await this.prismaService.message.create({
      data: {
        body: 'Welcome to Bastion, the most secure messaging app!',
        from: { connect: { id: 1 } },
        to: { connect: { id: user.id } },
      },
    })
    return user
  }
}
