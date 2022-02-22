import pkg from '@prisma/client'
const { PrismaClient } = pkg
import { nanoid } from 'nanoid'

const seed = async (prisma) =>
  prisma.user.create({
    data: {
      name: 'bastion',
      displayName: 'Bastion',
      token: nanoid(),
    },
  })

seed(new PrismaClient()).catch((error) => {
  console.error(error)
})
