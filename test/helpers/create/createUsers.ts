import * as bcrypt from 'bcrypt'
import { AuthProviderEnum, RoleEnum, User } from '@prisma/client'
import { PrismaService } from '../../../src/modules/prisma/prisma.service'

export async function createUsers(prisma: PrismaService): Promise<User> {
  return await prisma.user.create({
    data: {
      email: 'admin@gmail.com',
      firstName: 'John',
      lastName: 'Doe',
      hashedPassword: bcrypt.hashSync('midapa', 10),
      role: RoleEnum.ADMIN,
      gender: 'MALE',
      language: 'EN',
      provider: AuthProviderEnum.LOCAL,
    },
  })
}
