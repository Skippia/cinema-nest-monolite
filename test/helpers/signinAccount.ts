import { INestApplication } from '@nestjs/common'
import * as request from 'supertest'

export async function signinAccount(app: INestApplication): Promise<string[]> {
  const credentials = {
    email: 'pocketbook.love24@gmail.com',
    password: 'midapa',
  }

  const { header } = await request(app.getHttpServer())
    .post('/auth/local/signin')
    .send({ ...credentials })

  const _cookies = header['set-cookie'] as string[]

  return _cookies
}
