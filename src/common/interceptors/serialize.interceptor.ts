import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from '@nestjs/common'
// import { plainToInstance } from 'class-transformer'
import { map, Observable } from 'rxjs'

type ClassConstructor<T = unknown> = new (...args: any[]) => T

export function Serialize<T>(entity: ClassConstructor<T>) {
  return UseInterceptors(new SerializeInterceptor(entity))
}

export class SerializeInterceptor implements NestInterceptor {
  constructor(private entity: any) {}

  intercept(_context: ExecutionContext, handler: CallHandler): Observable<any> {
    return handler.handle().pipe(
      map((data: object | object[]) => {
        /*   return plainToInstance(this.entity, data, {
          excludeExtraneousValues: true,
        }) */
        return Array.isArray(data) ? data.map((el) => new this.entity(el)) : new this.entity(data)
      }),
    )
  }
}
