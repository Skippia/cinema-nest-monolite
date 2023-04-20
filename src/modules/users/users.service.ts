import { CreateUserDto } from './dto/create-user.dto'
import { Injectable, NotFoundException } from '@nestjs/common'
import { User, Prisma, AuthProviderEnum } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { HASH_SALT } from '../auth-jwt/auth-jwt.constants'
import { PrismaService } from '../prisma/prisma.service'
import { S3Service } from '../s3/s3.service'
import { Express } from 'express'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly s3Service: S3Service) {}

  async findAllUsers(where?: Prisma.MovieSessionWhereInput): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      where,
    })

    return users
  }

  async findOneUser(uniqueCriteria: Prisma.UserWhereUniqueInput): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: uniqueCriteria,
    })

    return user
  }

  async createUser(dto: Partial<CreateUserDto> & { provider: AuthProviderEnum }): Promise<User> {
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

  async updateUserAvatar(userId: number, file: Express.Multer.File): Promise<User | null> {
    // 1. Get user

    const user = await this.prisma.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    })

    // 2. If avatar already exists - remove old

    if (user?.avatar) {
      const fileName = this.getFileNameFromAvatarUrl(user.avatar)
      await this.s3Service.deleteAvatarFile(fileName)
    }
    // 3. If avatar doesn't exist - do nothing

    // 4. Add new avatar and update user db

    const bucketKey = `${file.fieldname}${Date.now()}`

    await this.s3Service.uploadFile(file, bucketKey)
    const avatarUrl = this.s3Service.getFileURL(bucketKey)

    const updadedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatar: avatarUrl,
      },
    })

    return updadedUser
  }

  async deleteUserAvatar(userId: number): Promise<User> {
    const user = await this.findOneUser({ id: userId })

    if (!user?.avatar) {
      throw new NotFoundException(`User with id ${userId} not found or doesn't have avatar`)
    }

    // 1. Get filename for deleting
    const fileName = this.getFileNameFromAvatarUrl(user.avatar)

    // 2. Delete this file from bucket
    await this.s3Service.deleteAvatarFile(fileName)

    // 3. Update user db
    const updadedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatar: null,
      },
    })

    return updadedUser
  }

  getFileNameFromAvatarUrl(avatarUrl: string) {
    return avatarUrl?.split('/')?.at(-1) as string
  }
}
