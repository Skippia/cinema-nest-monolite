import { HallTypeEnum } from './../../../src/modules/seats-in-cinema-hall/utils/types/Enum'
import { INestApplication } from '@nestjs/common'

import request from 'supertest'
import { Cinema, CinemaHall } from '@prisma/client'
import {
  seatsSchemaInput1,
  seatsSchemaInput2,
  seatsSchemaInput3,
} from '../../../src/modules/seats-in-cinema-hall/tests/seats-in-cinema.mocks'

export async function createCinemaHalls(
  app: INestApplication,
  cookies: string[],
  cinema1: Cinema,
  cinema2: Cinema,
) {
  const cinemaHallData1Cinema1 = {
    cinemaId: cinema1.id,
    data: {
      name: `Hall ${cinema1.name} #1`,
      hallType: HallTypeEnum['2D'],
      ...seatsSchemaInput1,
    },
  }

  const cinemaHallData2Cinema1 = {
    cinemaId: cinema1.id,
    data: {
      name: `Hall ${cinema1.name} #2`,
      hallType: HallTypeEnum['2D'],
      ...seatsSchemaInput2,
    },
  }

  const cinemaHallData3Cinema1 = {
    cinemaId: cinema1.id,
    data: {
      name: `Hall ${cinema1.name} #3`,
      hallType: HallTypeEnum['3D'],
      ...seatsSchemaInput3,
    },
  }

  const cinemaHallData1Cinema2 = {
    cinemaId: cinema2.id,
    data: {
      name: `Hall ${cinema2.name} #21`,
      hallType: HallTypeEnum['2D'],
      ...seatsSchemaInput1,
    },
  }

  const cinemaHallsData = [
    cinemaHallData1Cinema1,
    cinemaHallData2Cinema1,
    cinemaHallData3Cinema1,
    cinemaHallData1Cinema2,
  ]

  const cinemaHalls = [] as CinemaHall[]

  for (const cinemaHallData of cinemaHallsData) {
    const { body } = await request(app.getHttpServer())
      .post(`/cinema-hall/${cinemaHallData.cinemaId}`)
      .set('Cookie', cookies)
      .send({ ...cinemaHallData.data })

    cinemaHalls.push(body)
  }

  return cinemaHalls
}
