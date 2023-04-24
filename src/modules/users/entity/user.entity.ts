import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { User, AuthProviderEnum, GenderEnum, LanguageEnum, RoleEnum } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsInt, IsDate, IsString, IsEnum, IsOptional, IsEmail } from 'class-validator'
import { NullableToUndefinable } from '../../../common/types/utils'

export class UserEntity implements NullableToUndefinable<User> {
  constructor(user: User) {
    this.id = user.id
    this.role = user.role
    this.language = user.language
    this.provider = user.provider

    this.email = user.email ?? undefined
    this.username = user.username ?? undefined
    this.firstName = user.firstName ?? undefined
    this.lastName = user.lastName ?? undefined
    this.avatar = user.avatar ?? undefined
    this.hashedPassword = user?.hashedPassword ?? undefined
    this.gender = user.gender ?? undefined
  }

  @IsInt()
  @ApiProperty({ example: 1 })
  id: number

  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({ example: 'jonhdoe@gmail.com' })
  email: string | undefined

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: '' })
  username: string | undefined

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Jonh' })
  firstName: string | undefined

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Doe' })
  lastName: string | undefined

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    example: 'https://storage.yandexcloud.net/bucket-midapa/file1681995479808',
  })
  avatar: string | undefined

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'hashed-string' })
  hashedPassword: string | undefined

  @IsString()
  @IsEnum(RoleEnum)
  @ApiProperty({
    enumName: 'RoleEnum',
    enum: RoleEnum,
    example: RoleEnum.USER,
  })
  role: RoleEnum

  @IsOptional()
  @IsString()
  @IsEnum(GenderEnum)
  @ApiPropertyOptional({
    enumName: 'GenderEnum',
    enum: GenderEnum,
    example: GenderEnum,
  })
  gender: GenderEnum | undefined

  @IsString()
  @IsEnum(LanguageEnum)
  @ApiProperty({
    enumName: 'LanguageEnum',
    enum: LanguageEnum,
    example: LanguageEnum.EN,
  })
  language: LanguageEnum

  @IsString()
  @IsEnum(AuthProviderEnum)
  @ApiProperty({
    enumName: 'AuthProviderEnum',
    enum: AuthProviderEnum,
    example: AuthProviderEnum.LOCAL,
  })
  provider: AuthProviderEnum

  @Type(() => Date)
  @IsDate()
  @ApiProperty({ example: '2023-03-24T10:25:01.504Z' })
  createdAt: Date

  @Type(() => Date)
  @IsDate()
  @ApiProperty({ example: '2023-03-24T10:25:01.504Z' })
  updatedAt: Date
}
