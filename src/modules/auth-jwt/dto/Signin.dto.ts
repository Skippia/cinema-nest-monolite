import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { ISigninDto } from '../types'

export class SigninDto implements ISigninDto {
  @IsEmail()
  @ApiProperty({ example: 'pocketbook.love24@gmail.com' })
  email: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'midapa' })
  password: string
}
