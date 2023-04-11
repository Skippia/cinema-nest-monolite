import { PrismaService } from '../../src/prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { User } from '@prisma/client'

export async function createUsers(prisma: PrismaService): Promise<User> {
  return await prisma.user.create({
    data: {
      email: 'pocketbook.love24@gmail.com',
      firstName: 'John',
      lastName: 'Doe',
      hashedPassword: bcrypt.hashSync('midapa', 10),
      role: 'USER',
      gender: 'MALE',
      language: 'EN',
    },
  })
}
