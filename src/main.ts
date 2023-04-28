import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { AppModule } from './app.module'
import cookieParser from 'cookie-parser'
import { initSwagger } from './common/swagger/swagger-config'

const globalPrefix = 'api/v1'

async function bootstrap() {
  const app: NestExpressApplication = await NestFactory.create(AppModule)

  const whitelist = ['http://localhost:3000', 'http://localhost:3333', 'http://localhost:4000']

  app.enableCors({
    credentials: true,
    origin: function (origin, callback) {
      if (
        !origin ||
        whitelist.indexOf(origin) !== -1 ||
        /https?:\/\/(([a-z0-9-]+\.)?vercel\.app)$/i
      ) {
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
    },
    methods: ['POST', 'GET', 'HEAD', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Origin',
      'Access-Control-Allow-Origin',
      'Accept',
      'Options',
      'X-Requested-With',
    ],
  })

  app.use(cookieParser())
  app.useGlobalPipes(new ValidationPipe())
  app.setGlobalPrefix(globalPrefix)

  await initSwagger(app, globalPrefix)

  await app.listen(5000)
}

bootstrap()
