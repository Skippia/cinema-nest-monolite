import { PrismaClient } from '@prisma/client'
import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(config: ConfigService) {
    super({
      datasources: {
        db: {
          url: config.get<string>('DATABASE_URL'),
        },
      },
    })
  }

  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close()
    })
  }

  async truncate() {
    const records = await this.$queryRawUnsafe<Array<any>>(`SELECT tablename
                                                          FROM pg_tables
                                                          WHERE schemaname = 'public'`)
    records.forEach((record) => this.truncateTable(record['tablename']))
  }

  async truncateTable(tablename: string) {
    if (tablename === undefined || tablename === '_prisma_migrations') {
      return
    }
    try {
      await this.$executeRawUnsafe(`TRUNCATE TABLE "public"."${tablename}" CASCADE;`)
    } catch (error: any) {
      if (error.meta.code === '40P01') {
        console.error('DEADLOCK OCCURED')
      } else {
        console.error('UNEXPECTED DB ERROR', error.meta)
      }
    }
  }

  async resetSequences() {
    const results = await this.$queryRawUnsafe<Array<any>>(
      `SELECT c.relname
       FROM pg_class AS c
                JOIN pg_namespace AS n ON c.relnamespace = n.oid
       WHERE c.relkind = 'S'
         AND n.nspname = 'public'`,
    )

    for (const record of results) {
      await this.$executeRawUnsafe(`ALTER SEQUENCE "public"."${record['relname']}" RESTART WITH 1;`)
    }
  }

  async clearDatabase() {
    await this.truncate()
    await this.resetSequences()
    await this.$disconnect()
  }
}
