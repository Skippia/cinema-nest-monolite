import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { ISigninDto } from '../types/dto.type'

export class SigninDto implements ISigninDto {
  @IsEmail()
  @ApiProperty({ example: 'john@example.com' })
  email: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ example: 'password123' })
  password: string
}
