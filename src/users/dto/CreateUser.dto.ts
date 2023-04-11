import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Gender, Language, Prisma } from '@prisma/client'
import { IsBoolean, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator'

export class CreateUserDto implements Prisma.UserCreateInput {
  @IsEmail()
  @ApiProperty({ example: 'john@example.com' })
  email: string

  @IsString()
  @ApiProperty({ example: 'John' })
  firstName: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ example: 'password123' })
  password?: string

  @IsOptional()
  @IsEnum(Gender)
  @ApiPropertyOptional({ enum: Gender, example: Gender.MALE })
  gender?: Gender

  @IsOptional()
  @IsEnum(Language)
  @ApiPropertyOptional({ enum: Language, example: Language.EN })
  language?: Language

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  isRegisteredWithGoogle?: boolean

  @IsOptional()
  @IsBoolean()
  @ApiPropertyOptional()
  avatar?: string
}
