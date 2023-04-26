import { ConfigService } from '@nestjs/config'
import { Injectable } from '@nestjs/common'
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
} from '@aws-sdk/client-s3'

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
    const keyFileInBucket = this.getFileNameFromAvatarUrl(avatarUrl)

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

  getFileNameFromAvatarUrl(avatarUrl: string) {
    return avatarUrl?.split('/')?.at(-1) as string
  }

  getFileURL(keyFileInBucket: string) {
    return `${this.endpoint}/${this.bucket}/${keyFileInBucket}`
  }
}
