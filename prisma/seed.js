import pkg from '@prisma/client'
const { PrismaClient } = pkg
import { nanoid } from 'nanoid'

const seed = async () => {
  const prisma = new PrismaClient()

  prisma.user.create({
    data: {
      name: 'bastion',
      displayName: 'Bastion',
      token: nanoid(),
    },
  })
}

seed().catch((error) => {
  console.error(error)
})
