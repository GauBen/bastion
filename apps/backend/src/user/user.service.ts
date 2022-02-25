import { BadRequestException, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { nanoid } from 'nanoid'
import { PrismaService } from '../prisma.service'
import { CreateUserDto } from './user.dto'

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async fromToken(token: string): Promise<User | null> {
    return this.prismaService.user.findUnique({ where: { token } })
  }

  async fromName(name: string) {
    return this.prismaService.user.findUnique({
      where: { name },
      select: { id: true, name: true, displayName: true },
    })
  }

  async getContacts(user: User) {
    // This query is too complex to be written with Prisma API
    return this.prismaService.$queryRaw<
      Array<{ id: number; name: string; displayName: string }>
    >`
      SELECT id, MAX(name) AS name, MAX("displayName") AS "displayName"
      -- Get users who sent and received messages to 'user'
      FROM (
        -- 'user' is the recipient
        SELECT * FROM "User"
        INNER JOIN (SELECT "toId", MAX(id) AS last FROM "Message" WHERE "fromId" = ${user.id} GROUP BY "toId") t ON "User".id = t."toId"
        UNION
        -- 'user' is the issuer
        SELECT * FROM "User"
        INNER JOIN (SELECT "fromId", MAX(id) AS last FROM "Message" WHERE "toId" = ${user.id} GROUP BY "fromId") t ON "User".id = t."fromId"
      ) t
      -- Order them by last message first
      GROUP BY id
      ORDER BY MAX(last) DESC
    `
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
