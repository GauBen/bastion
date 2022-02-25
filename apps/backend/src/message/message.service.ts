import { Injectable, NotFoundException } from '@nestjs/common'
import { Message, Prisma, User } from '@prisma/client'
import { PrismaService } from '../prisma.service'
import { UserService } from '../user/user.service'

@Injectable()
export class MessageService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async getChat(user: User, name: string) {
    const contact = await this.userService.fromName(name)
    if (!contact) throw new NotFoundException()
    const messages = await this.prismaService.$queryRaw<
      Message & { me: boolean }
    >`
      SELECT id, "fromId", "toId", gif, body, me
      FROM (
        SELECT id, "fromId", "toId", gif, body, true AS me FROM "Message" WHERE "fromId" = ${user.id} AND "toId" = ${contact.id}
        UNION
        SELECT id, "fromId", "toId", gif, body, false AS me FROM "Message" WHERE "fromId" = ${contact.id} AND "toId" = ${user.id}
      ) t
      -- Order them by first message first
      ORDER BY id ASC
    `
    return { contact, messages }
  }

  async createMessage(data: Prisma.MessageUncheckedCreateInput) {
    return this.prismaService.message.create({ data })
  }
}
