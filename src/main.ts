import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module'
import cookieParser from 'cookie-parser'

async function bootstrap() {
  const globalPrefix = 'api/v1'
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
    methods: ['POST', 'GET', 'HEAD', 'PATCH', 'DELETE', 'OPTIONS'],
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

  const config = new DocumentBuilder()
    .setTitle('Modsen Cinema')
    .setDescription('The Cinema API')
    .setVersion('1.0.0')
    .setBasePath(globalPrefix)
    .build()

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('docs', app, document, {
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
    ],
  })

  await app.listen(5000)
}

bootstrap()
