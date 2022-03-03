import { Injectable, NotFoundException } from '@nestjs/common'
import { Message, Prisma, User } from '@prisma/client'
import { shuffledSearch } from 'svelte-tenor/api'
import { PrismaService } from '../prisma.service.js'
import { UserService } from '../user/user.service.js'

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
      ORDER BY id ASC, me DESC
    `
    return { contact, messages }
  }

  async createMessage(data: Prisma.MessageUncheckedCreateInput) {
    return this.prismaService.message.create({
      data,
      include: { to: { select: { id: true, name: true, displayName: true } } },
    })
  }

  async handleBotMessage(
    message: Message & {
      to: { id: number; name: string; displayName: string }
    },
  ) {
    if (
      Buffer.from(message.body).toString('base64') ===
      'VEhDb24yMntCQURfSEFCSVRTX0ZFQVRVUklOR19CTVRIfQ=='
    ) {
      return this.createMessage({
        fromId: 1,
        toId: message.fromId,
        body: "That's a nice flag you have there!",
      })
    } else if (message.body.toLowerCase().includes('flag')) {
      return this.createMessage({
        fromId: 1,
        toId: message.fromId,
        body: 'There is no flag here.',
      })
    } else if (message.gif) {
      const gif = await shuffledSearch({
        key: process.env.VITE_TENOR_KEY,
        q: 'hello robot',
        limit: 1,
        safety: 'high',
      }).then(({ results }) => results[0])
      return this.createMessage({
        fromId: 1,
        toId: message.fromId,
        gif: true,
        body: JSON.stringify(gif),
      })
    }
    return this.createMessage({
      fromId: 1,
      toId: message.fromId,
      body: "Sorry, I don't understand your message.",
    })
  }
}
