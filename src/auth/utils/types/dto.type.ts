import { Gender, Language } from '@prisma/client'

export interface ISigninDto {
  email: string
  password: string
}

export interface ISignupDto extends ISigninDto {
  name: string
  lastName: string
  gender: Gender
  language: Language
}
