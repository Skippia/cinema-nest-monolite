import { INestApplication } from '@nestjs/common'
import {
  seatsSchemaInput1,
  seatsSchemaInput2,
  seatsSchemaInput3,
} from 'src/modules/seats-in-cinema/tests/seats-in-cinema.mocks'
import request from 'supertest'

export async function createSeatingCinemaSchemas(app: INestApplication) {
  // Seating schema for cinema1
  await request(app.getHttpServer())
    .post('/seats-in-cinema/1')
    .send({ ...seatsSchemaInput1 })

  // Seating schema for cinema2
  await request(app.getHttpServer())
    .post('/seats-in-cinema/2')
    .send({ ...seatsSchemaInput2 })

  // Seating schema for cinema3
  await request(app.getHttpServer())
    .post('/seats-in-cinema/3')
    .send({ ...seatsSchemaInput3 })
}
