import { INestApplication, ValidationPipe } from '@nestjs/common'
import { TestingModule, Test } from '@nestjs/testing'
import cookieParser from 'cookie-parser'
import { PrismaService } from 'src/modules/prisma/prisma.service'
import { AppModule } from '../../../src/app.module'

export async function initApp(): Promise<[app: INestApplication, prisma: PrismaService]> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  const app = moduleFixture.createNestApplication()
  const prisma = app.get<PrismaService>(PrismaService)

  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe())

  await app.init()

  return [app, prisma]
}
