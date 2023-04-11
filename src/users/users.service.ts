import { CreateUserDto } from './dto/CreateUser.dto'
import { ForbiddenException, Injectable } from '@nestjs/common'
import { User, Prisma } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import * as bcrypt from 'bcrypt'
import { HASH_SALT } from '../auth-jwt/auth-jwt.constants'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findUser(uniqueCriteria: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return await this.prisma.user.findUnique({
      where: uniqueCriteria,
    })
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const { email, firstName, lastName, gender, language, password, avatar } = dto
    let hashedPassword: string | undefined = undefined

    if (password) {
      hashedPassword = bcrypt.hashSync(password, HASH_SALT)
    }

    const newUser = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        gender,
        language,
        avatar,
        hashedPassword,
      },
    })

    return newUser
  }

  async getUserIfRefreshTokenMatches(userId: number, refreshToken: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
    })

    if (!user) {
      throw new ForbiddenException('Access Denied')
    }

    const userRtToken = await this.prisma.rTSession.findFirst({
      where: {
        userId,
      },
    })

    // Check if RT exists
    if (!userRtToken) throw new ForbiddenException('RT is not exist')

    // Check if RT is valid
    const areRtMatch = await bcrypt.compare(refreshToken, userRtToken.hashedRt)

    if (!areRtMatch) throw new ForbiddenException('Access Denied')

    return user
  }
}
