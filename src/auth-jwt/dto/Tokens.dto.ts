import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'
import { Tokens } from '../types/tokens.type'

export class TokensDto implements Tokens {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImVtYWlsIjoicG9ja2V0Ym9vay5sb3ZlMjRAZ21haWwuY29tIiwiaWF0IjoxNjgwODUyMTU1LCJleHAiOjE2ODA4NTMwNTV9.9haC3E99PfWNdzovmGgH01EowKfKmu60iFo9dJREpTE',
  })
  access_token: string

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImVtYWlsIjoicG9ja2V0Ym9vay5sb3ZlMjRAZ21haWwuY29tIiwiaWF0IjoxNjgwODUyMTU1LCJleHAiOjE2ODE0NTY5NTV9.5L3wOD1Mfit4sbkootrCXXi1_WVv-hMH2skAtxVM1gs',
  })
  refresh_token: string
}
