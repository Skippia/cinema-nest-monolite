import { S3Service } from './../s3/s3.service'
import { AtGuard } from './../auth-jwt/guards/at.guard'
import { UserEntity } from './entity/user.entity'
import { ApiTags, ApiOperation, ApiCreatedResponse } from '@nestjs/swagger'
import { PrismaClientExceptionFilter } from '../prisma/prisma-client-exception'
import { Express } from 'express'
import { UsersService } from './users.service'
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  UseFilters,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
  NotFoundException,
  Delete,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { GetCurrentUserId } from '../auth-jwt/decorators'
import { User } from '@prisma/client'
import { Serialize } from 'src/common/interceptors'

@UseGuards(AtGuard)
@Controller('users')
@ApiTags('Users')
@UseFilters(PrismaClientExceptionFilter)
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly s3Service: S3Service) {}

  @Get()
  @ApiOperation({
    description: 'Get all users',
  })
  @Serialize(UserEntity)
  @ApiCreatedResponse({ type: UserEntity, isArray: true })
  async getAllUsers(): Promise<User[]> {
    const users = await this.usersService.findAllUsers()

    return users
  }

  @Get(':userId')
  @ApiOperation({
    description: 'Get user by userId',
  })
  @Serialize(UserEntity)
  @ApiCreatedResponse({ type: UserEntity })
  async findOneUserById(@Param('userId', ParseIntPipe) userId: number): Promise<User | null> {
    const user = await this.usersService.findOneUser({ id: userId })

    return user
  }

  @UseInterceptors(FileInterceptor('file'))
  @Post('avatar')
  @ApiOperation({
    description: 'Update avatar for current user',
  })
  @ApiCreatedResponse({ type: UserEntity })
  @Serialize(UserEntity)
  async updateUserAvatar(
    @UploadedFile() file: Express.Multer.File,
    @GetCurrentUserId() userId: number,
  ): Promise<User> {
    const updadedUser = await this.usersService.updateUserAvatar(userId, file)

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
}
