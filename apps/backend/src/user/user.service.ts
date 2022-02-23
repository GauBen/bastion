import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Message, User } from '@prisma/client'
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
    // This query is too complex to be written with Prisma API
    return this.prismaService.$queryRaw<
      Array<{ id: number; name: string; displayName: string }>
    >`
      SELECT id, name, displayName
      -- Get users who sent and received messages to 'user'
      FROM (
        -- 'user' is the recipient
        SELECT * FROM User
        INNER JOIN (SELECT toId, MAX(id) AS last FROM Message WHERE fromId = ${user.id} GROUP BY toId) t ON User.id = t.toId
        UNION
        -- 'user' is the issuer
        SELECT * FROM User
        INNER JOIN (SELECT fromId, MAX(id) AS last FROM Message WHERE toId = ${user.id} GROUP BY fromId) t ON User.id = t.fromId
      ) t
      -- Order them by last message first
      ORDER BY last DESC
    `
  }

  async getChat(user: User, name: string) {
    const contact = await this.prismaService.user.findUnique({
      where: { name },
      select: { id: true, name: true, displayName: true },
    })
    if (!contact) throw new NotFoundException()
    const messages = await this.prismaService.$queryRaw<
      Message & { me: boolean }
    >`
      SELECT id, fromId, toId, gif, body, me
      FROM (
        SELECT id, fromId, toId, gif, body, true AS me FROM Message WHERE fromId = ${user.id} AND toId = ${contact.id}
        UNION
        SELECT id, fromId, toId, gif, body, false AS me FROM Message WHERE fromId = ${contact.id} AND toId = ${user.id}
      ) t
      -- Order them by first message first
      ORDER BY id ASC
    `
    return { contact, messages }
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
