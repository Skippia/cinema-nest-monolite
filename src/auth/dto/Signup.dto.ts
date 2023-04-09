import { ApiProperty } from '@nestjs/swagger'
import { Gender, Language } from '@prisma/client'
import { IsEnum, IsString } from 'class-validator'
import { ISignupDto } from '../utils/types/dto.type'
import { SigninDto } from './Signin.dto'

export class SignupDto extends SigninDto implements ISignupDto {
  @IsString()
  @ApiProperty({ example: 'John' })
  name: string

  @IsString()
  @ApiProperty({ example: 'Doe' })
  lastName: string

  @IsEnum(Gender)
  @ApiProperty({ enum: Gender, example: Gender.MALE })
  gender: Gender

  @IsEnum(Language)
  @ApiProperty({ enum: Language, example: Language.EN })
  language: Language
}
