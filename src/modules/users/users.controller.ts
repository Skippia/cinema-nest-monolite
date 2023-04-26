import { S3Service } from './../s3/s3.service'
import { UserEntity } from './entity/user.entity'
import { ApiTags, ApiOperation, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { Express } from 'express'
import { UsersService } from './users.service'
import {
  Controller,
  UploadedFile,
  UseFilters,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
  Delete,
  Put,
  Res,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common'
import { GetCurrentUserId } from '../auth-jwt/decorators'
import { User } from '@prisma/client'
import { Serialize } from '../../common/interceptors'
import { AtGuard } from '../auth-jwt/guards'
import { Response } from 'express'
import { logoutFromSystem } from '../auth-jwt/helpers'
import { ApiImageFile } from '../../common/file'


@Controller('users')
@ApiTags('Users')
@UseGuards(AtGuard)
@UseFilters(PrismaClientExceptionFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly s3Service: S3Service) {}

  // TODO: admin only
  @Get()
  @ApiOperation({
    description: 'Get all users',
  })
  @Serialize(UserEntity)
  @ApiOkResponse({ type: UserEntity, isArray: true })
  async getAllUsers(): Promise<User[]> {
    const users = await this.usersService.findAllUsers()

    return users
  }

  @Get('current')
  @ApiOperation({
    description: 'Get current user',
  })
  @Serialize(UserEntity)
  @ApiOkResponse({ type: UserEntity })
  async findCurrentUser(@GetCurrentUserId() userId: number): Promise<User | null | any> {
    const user = await this.usersService.findOneUser({ id: userId })

    return user
  }

  // TODO: admin only
  @Get(':userId')
  @ApiOperation({
    description: 'Get user by userId',
  })
  @Serialize(UserEntity)
  @ApiOkResponse({ type: UserEntity })
  async findOneUserById(@Param('userId', ParseIntPipe) userId: number): Promise<User | null> {
    const user = await this.usersService.findOneUser({ id: userId })

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`)
    }

    return user
  }

  @Put('avatar')
  @ApiOperation({
    description: 'Update avatar for current user',
  })
  @ApiOkResponse({ type: UserEntity })
  @ApiImageFile('avatar', true)
  @Serialize(UserEntity)
  async updateUserAvatar(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp)$/,
        })
        .addMaxSizeValidator({ maxSize: 1000000 })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    avatar: Express.Multer.File,
    @GetCurrentUserId() userId: number,
  ): Promise<User> {
    const updadedUser = await this.usersService.updateUserAvatar(userId, avatar)

    if (!updadedUser) {
      throw new NotFoundException(`Not found user with ${userId}`)
    }

    return updadedUser
  }

  @Delete('avatar')
  @ApiOperation({
    description: 'Delete avatar for current user',
  })
  @Serialize(UserEntity)
  @ApiCreatedResponse({ type: UserEntity })
  async deteteAvatarFile(@GetCurrentUserId() userId: number): Promise<User> {
    const updadedUser = await this.usersService.deleteUserAvatar(userId)

    return updadedUser
  }

  @Put('first-name/:newFirstName')
  @ApiOperation({
    description: 'Update first name for current user',
  })
  @ApiOkResponse({ type: UserEntity })
  @Serialize(UserEntity)
  async updateUserFirstName(
    @Param('newFirstName') newFirstName: string,
    @GetCurrentUserId() userId: number,
  ) {
    const updadedUser = await this.usersService.updateUserFirstName(userId, newFirstName)

    return updadedUser
  }

  @Put('last-name/:newLastName')
  @ApiOperation({
    description: 'Update last name for current user',
  })
  @ApiOkResponse({ type: UserEntity })
  @Serialize(UserEntity)
  async updateUserLastName(
    @Param('newLastName') newLastName: string,
    @GetCurrentUserId() userId: number,
  ) {
    const updadedUser = await this.usersService.updateUserLastName(userId, newLastName)

    return updadedUser
  }

  @Put('username/:newUsername')
  @ApiOperation({
    description: 'Update username for current user',
  })
  @ApiOkResponse({ type: UserEntity })
  @Serialize(UserEntity)
  async updateUserUsername(
    @Param('newUsername') newUsername: string,
    @GetCurrentUserId() userId: number,
  ) {
    const updadedUser = await this.usersService.updateUserUsername(userId, newUsername)

    return updadedUser
  }

  @Delete(':userId')
  @ApiOperation({
    description: 'Delete user account by admin',
  })
  @ApiOkResponse({ type: UserEntity })
  @Serialize(UserEntity)
  async deleteUserAccount(
    @Param('userId', ParseIntPipe) userId: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Delete account
    const deletedUser = await this.usersService.deleteUserAccount(userId)

    // Remove cookies (logout)
    logoutFromSystem(res)
    return deletedUser
  }

  // TODO: admin only
  @Delete()
  @ApiOperation({
    description: 'Delete user account by admin',
  })
  @ApiOkResponse({ type: UserEntity })
  @Serialize(UserEntity)
  async deleteUserAccountByAdmin(@GetCurrentUserId() userId: number) {
    const deletedUser = await this.usersService.deleteUserAccount(userId)

    return deletedUser
  }
}
