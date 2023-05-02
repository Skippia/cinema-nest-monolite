/* eslint-disable @typescript-eslint/ban-types */
import fs from 'fs/promises'
import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3'
import path from 'path'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpeg = require('fluent-ffmpeg')

@Injectable()
export class S3Service {
  private readonly region: string
  private readonly bucket: string
  private readonly endpoint: string
  private readonly accessKeyId: string
  private readonly secretAccessKey: string
  private readonly s3: S3Client

  constructor(private readonly config: ConfigService) {
    this.bucket = this.config.get<string>('YC_BUCKET') || 'bucket-midapa'
    this.region = this.config.get<string>('YC_REGION') || 'ru-central1-a'
    this.endpoint = this.config.get<string>('YC_ENDPOINT') || 'https://storage.yandexcloud.net'
    this.accessKeyId = this.config.get<string>('YC_ACCESS_KEY_ID') || 'YCAJEUe6itia3Bq9hQltVZav8'
    this.secretAccessKey =
      this.config.get<string>('YC_SECRET_ACCESS_KEY') || 'YCOkPbcz8mqqXvt_nq3x42OH8XTl9Ebwu-Wgvquh'

    this.s3 = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      credentials: {
        accessKeyId: this.accessKeyId,
        secretAccessKey: this.secretAccessKey,
      },
    })
  }

  generateFileNameFromTrailerUrl(trailerUrl: string) {
    const trailerName = this.getFileNameFromUrl(trailerUrl)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [name, _] = trailerName.split('.')
    return `${name}-img-preview.png`
  }

  async uploadFile(file: Express.Multer.File, fileName: string): Promise<string> {
    const input: PutObjectCommandInput = {
      Body: file.buffer,
      Bucket: this.bucket,
      Key: fileName,
      ContentType: file.mimetype,
    }

    try {
      await this.s3.send(new PutObjectCommand(input))

      const avatarUrl = this.getFileURL(fileName)
      return avatarUrl
    } catch (err) {
      console.log('Cannot save file to s3,', err)
      throw err
    }
  }

  async deleteAvatarFile(avatarUrl: string) {
    const keyFileInBucket = this.getFileNameFromUrl(avatarUrl)

    const input = {
      Bucket: this.bucket,
      Key: keyFileInBucket,
    }

    try {
      const response: DeleteObjectCommandOutput = await this.s3.send(new DeleteObjectCommand(input))
      return response
    } catch (err) {
      console.log('Cannot delete file from s3,', err)
      throw err
    }
  }

  getFileNameFromUrl(avatarUrl: string) {
    return decodeURIComponent(avatarUrl?.split('/')?.at(-1) as string)
  }

  getFileURL(keyFileInBucket: string) {
    return `${this.endpoint}/${this.bucket}/${encodeURIComponent(keyFileInBucket)}`
  }

  downloadVideoAndSaveInFolder({
    trailerUrl,
    fileName,
    folderPath,
  }: {
    trailerUrl: string
    fileName: string
    folderPath: string
  }) {
    ffmpeg()
      .input(trailerUrl)
      .on('filenames', (filenames: any) => console.log('Filenames', filenames))
      .on('end', function () {
        console.log('Screenshots taken')
      })
      .on('error', function (err: any) {
        console.error('error ', err)
      })
      .takeScreenshots(
        {
          filename: fileName,
          timemarks: [10],
        },
        folderPath,
      )
  }

  async uploadImagePreviewImageFromTrailer({
    folderPath,
    fileName,
  }: {
    folderPath: string
    fileName: string
  }): Promise<string> {
    const debounce = (fn: Function, ms = 300): any => {
      let timeoutId: ReturnType<typeof setTimeout>
      return function (this: any, ...args: any[]) {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => fn.apply(this, args), ms)
      }
    }

    async function createPath(path: string) {
      try {
        await fs.access(path)
      } catch (err) {
        if ((err as any)?.code === 'ENOENT') {
          // check if directory doesn't exist
          await fs.mkdir(path, { recursive: true })
        } else {
          throw err // re-throw the error if it's not "directory doesn't exist"
        }
      }
    }

    await createPath(folderPath)

    //@ts-expect-error 123
    for await (const { filename } of debounce(fs.watch(folderPath))) {
      // 1. If right file was added to tracked folder
      if (filename === fileName) {
        // 2. Get full path to file that should be uploaded
        const filePath = path.join(folderPath, fileName)

        const data = await fs.readFile(filePath)

        // 3. Create an Express.Multer.File object from the buffer
        const file = {
          fieldname: 'file',
          originalname: fileName,
          encoding: 'utf-8',
          mimetype: 'image/png',
          buffer: data,
          size: data.length,
        }

        // 4. Upload file to yandex cloud storage
        await this.uploadFile(file as Express.Multer.File, fileName)

        break
      }
    }
    // 5. Generate url link based on filename
    const fileUrl = this.getFileURL(fileName)

    return fileUrl
  }
}
