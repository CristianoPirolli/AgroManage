import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { env } from '../config/env.js';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleDestroy {
  constructor() {
    const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
    super({ adapter });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
