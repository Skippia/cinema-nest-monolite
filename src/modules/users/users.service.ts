import { CreateUserDto } from './dto/create-user.dto'
import { Injectable } from '@nestjs/common'
import { User, Prisma } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { HASH_SALT } from '../auth-jwt/auth-jwt.constants'
import { PrismaService } from '../prisma/prisma.service'

// TODO: refactor github
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findUser(uniqueCriteria: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: uniqueCriteria,
    })
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const { email, username, firstName, lastName, gender, language, password, avatar, provider } =
      dto
    let hashedPassword: string | undefined = undefined

    if (password) {
      hashedPassword = bcrypt.hashSync(password, HASH_SALT)
    }

    const newUser = await this.prisma.user.create({
      data: {
        email,
        username,
        firstName,
        lastName,
        gender,
        language,
        avatar,
        hashedPassword,
        provider,
      },
    })

    return newUser
  }
}
