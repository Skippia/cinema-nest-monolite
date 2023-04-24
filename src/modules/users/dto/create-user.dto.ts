import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { GenderEnum, LanguageEnum, Prisma } from '@prisma/client'
import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator'

export class CreateUserDto implements Omit<Prisma.UserCreateInput, 'provider'> {
  @IsEmail()
  @ApiProperty({ example: 'pocketbook.love24@gmail.com' })
  email: string

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

  @IsString()
  @ApiProperty({ example: 'midapa' })
  password: string

  @IsOptional()
  @IsEnum(GenderEnum)
  @ApiPropertyOptional({ enum: GenderEnum, example: GenderEnum.MALE })
  gender?: GenderEnum

  @IsOptional()
  @IsEnum(LanguageEnum)
  @ApiPropertyOptional({ enum: LanguageEnum, example: LanguageEnum.EN })
  language?: LanguageEnum
}
