import { BadRequestException, Injectable } from '@nestjs/common'
import { User } from '@prisma/client'
import { nanoid } from 'nanoid'
import { shuffledSearch } from 'svelte-tenor/api'
import { PrismaService } from '../prisma.service.js'
import { CreateUserDto } from './user.dto.js'

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
    // Parallelize creation tasks
    const [user, gif] = await Promise.all([
      // Create a new user
      this.prismaService.user.create({
        data: { name, displayName, token: nanoid() },
      }),
      // Welcome them with a GIF
      shuffledSearch({
        key: process.env.VITE_TENOR_KEY,
        q: 'hello',
        limit: 1,
        safety: 'high',
      }).then(({ results }) => results[0]),
    ])
    await this.prismaService.message.createMany({
      data: [
        {
          fromId: 1,
          toId: user.id,
          gif: true,
          body: JSON.stringify(gif),
        },
        {
          fromId: 1,
          toId: user.id,
          body: 'Welcome to Bastion, the most secure messaging app!',
        },
        {
          fromId: 1,
          toId: user.id,
          body: 'Make yourself at home by setting up an avatar.',
        },
        {
          fromId: 1,
          toId: user.id,
          body: `Current server version: VEhDb24yMntHTH5+SEYhfQ==.`,
        },
      ],
    })
    return user
  }
}
