import { CreateUserDto } from './dto/create-user.dto'
import { BadRequestException, Injectable } from '@nestjs/common'
import { User, Prisma, AuthProviderEnum } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import { HASH_SALT } from '../auth-jwt/auth-jwt.constants'
import { PrismaService } from '../prisma/prisma.service'
import { S3Service } from '../s3/s3.service'

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

  async createUser(
    dto: Partial<CreateUserDto> & { provider: AuthProviderEnum; avatar?: string },
  ): Promise<User> {
    const { email, username, firstName, lastName, gender, language, password, provider, avatar } =
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
        hashedPassword,
        provider,
        avatar,
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
      await this.s3Service.deleteAvatarFile(user.avatar)
    }
    // 3. If avatar doesn't exist - do nothing

    // 4. Add new avatar and update user db

    const fileName = `${file.fieldname}${Date.now()}`

    const avatarUrl = await this.s3Service.uploadFile(file, fileName)

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
      throw new BadRequestException(`User with id ${userId} not found or doesn't have avatar`)
    }

    // 1. Delete this file from bucket
    await this.s3Service.deleteAvatarFile(user.avatar)

    // 2. Update user db
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

  async updateUserFirstName(userId: number, newfirstName: string) {
    const updadedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        firstName: newfirstName,
      },
    })

    return updadedUser
  }

  async updateUserLastName(userId: number, newlastName: string) {
    const updadedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastName: newlastName,
      },
    })

    return updadedUser
  }

  async updateUserUsername(userId: number, newUsername: string) {
    const updadedUser = await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: newUsername,
      },
    })

    return updadedUser
  }

  async deleteUserAccount(userId: number): Promise<User> {
    // 1. Remove account
    const deletedUser = await this.prisma.user.delete({
      where: {
        id: userId,
      },
    })

    // 2. Avatar exists - remove it from yandex cloud
    if (deletedUser.avatar) {
      await this.s3Service.deleteAvatarFile(deletedUser.avatar)
    }

    return deletedUser
  }
}
