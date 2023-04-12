import { INestApplication } from '@nestjs/common'
import request from 'supertest'
import {
  seatsSchemaInput1,
  seatsSchemaInput2,
  seatsSchemaInput3,
} from '../../mocks/seats-in-cinema.mocks'

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
