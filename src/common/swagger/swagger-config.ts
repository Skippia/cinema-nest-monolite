import { NestExpressApplication } from '@nestjs/platform-express'
import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger'
import fs from 'fs/promises'
import path from 'path'

export async function initSwagger(app: NestExpressApplication, globalPrefix: string) {
  const config = new DocumentBuilder()
    .setTitle('Cinema')
    .setDescription('The Cinema API')
    .setVersion('1.0.0')
    .setBasePath(globalPrefix)
    .build()

  const document = SwaggerModule.createDocument(app, config)

  if (process.env.NODE_ENV === 'documentation') {
    await extractDocsJson(document)
  }

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
}

function extractDocsJson(document: OpenAPIObject) {
  return fs.writeFile(
    path.join(__dirname.replace('/dist/', '/'), 'swagger.json'),
    JSON.stringify(document),
  )
}
