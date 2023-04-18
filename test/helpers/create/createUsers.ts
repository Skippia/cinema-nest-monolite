import * as bcrypt from 'bcrypt'
import { AuthProviderEnum, User } from '@prisma/client'
import { PrismaService } from '../../../src/modules/prisma/prisma.service'

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
      provider: AuthProviderEnum.LOCAL,
    },
  })
}
