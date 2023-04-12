import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from '@nestjs/common'
// import { plainToInstance } from 'class-transformer'
import { map, Observable } from 'rxjs'

type ClassConstructor<T = unknown> = new (...args: any[]) => T

export function Serialize<T>(dto: ClassConstructor<T>) {
  return UseInterceptors(new SerializeInterceptor(dto))
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private dto: any) {}

  intercept(_context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data: object | object[]) => {
        /*   return plainToInstance(this.dto, data, {
          excludeExtraneousValues: true,
        }) */
        return Array.isArray(data) ? data.map((el) => new this.dto(el)) : new this.dto(data)
      }),
    )
  }
}
