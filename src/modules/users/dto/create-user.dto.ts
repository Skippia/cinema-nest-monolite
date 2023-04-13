import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { AuthProviderEnum, GenderEnum, LanguageEnum, Prisma } from '@prisma/client'
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator'

export class CreateUserDto implements Prisma.UserCreateInput {
  @IsOptional()
  @IsEmail()
  @ApiPropertyOptional({ example: 'john@example.com' })
  email?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'johndoe24' })
  username?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'John' })
  firstName?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'password123' })
  password?: string

  @IsOptional()
  @IsEnum(GenderEnum)
  @ApiPropertyOptional({ enum: GenderEnum, example: GenderEnum.MALE })
  gender?: GenderEnum

  @IsOptional()
  @IsEnum(LanguageEnum)
  @ApiPropertyOptional({ enum: LanguageEnum, example: LanguageEnum.EN })
  language?: LanguageEnum

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  avatar?: string

  @IsEnum(AuthProviderEnum)
  @ApiProperty({ enum: AuthProviderEnum, example: AuthProviderEnum.LOCAL })
  provider: AuthProviderEnum
}
