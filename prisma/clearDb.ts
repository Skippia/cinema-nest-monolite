import { ValidationPipe } from '@nestjs/common'
import { NestApplication } from '@nestjs/core'
import { TestingModule, Test } from '@nestjs/testing'
import { PrismaClient } from '@prisma/client'
import { AppModule } from '../src/app.module'
import { PrismaService } from '../src/modules/prisma/prisma.service'

const prisma = new PrismaClient() as PrismaService

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let prismaInApp: PrismaService
let app: NestApplication

async function createApp() {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile()

  app = moduleFixture.createNestApplication()
  prismaInApp = app.get<PrismaService>(PrismaService)

  app.useGlobalPipes(new ValidationPipe())

  await app.init()
}

async function main() {
  await createApp()
  async function clearDb() {
    await prismaInApp.clearDatabase()
  }

  await clearDb()
}
// execute the main function
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect()
  })
