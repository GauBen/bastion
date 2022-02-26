import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import client from '@prisma/client'

@Injectable()
export class PrismaService
  extends client.PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
