import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
  checkHealth(): string {
    return 'healthcheck'
  }
}
