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
    this.bucket = this.config.get<string>('YC_BUCKET')
    this.region = this.config.get<string>('YC_REGION')
    this.endpoint = this.config.get<string>('YC_ENDPOINT')
    this.accessKeyId = this.config.get<string>('YC_ACCESS_KEY_ID')
    this.secretAccessKey = this.config.get<string>('YC_SECRET_ACCESS_KEY')

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

      const url = this.getFileURL(fileName)
      return url
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
    callback,
  }: {
    trailerUrl: string
    fileName: string
    folderPath: string
    callback: (...args: any[]) => Promise<string | undefined>
  }): Promise<string | undefined> {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(trailerUrl)
        .on('end', async () => {
          // Screenshot was saved and file is available for reading - run callback
          const generatedLink = await callback()

          resolve(generatedLink)
        })
        .on('error', function (err: any) {
          console.error('error ', err)
          reject()
        })
        .takeScreenshots(
          {
            filename: fileName,
            timemarks: [10],
          },
          folderPath,
        )
    })
  }

  async uploadImagePreviewImageFromTrailer({
    folderPath,
    fileName,
  }: {
    folderPath: string
    fileName: string
  }): Promise<string | undefined> {
    // 1. Get full path to file that should be uploaded
    const filePath = path.join(folderPath, fileName)

    const data = await fs.readFile(filePath)

    // 2. Create an Express.Multer.File object from the buffer
    const file = {
      fieldname: 'file',
      originalname: fileName,
      encoding: 'utf-8',
      mimetype: 'image/png',
      buffer: data,
      size: data.length,
    }

    // 3. Upload file to yandex cloud storage
    const loadedUrl = await this.uploadFile(file as Express.Multer.File, fileName)

    return loadedUrl
  }
}
