import { Prisma, PrismaClient } from '@prisma/client';
import { INestApplication, Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super();
  }
}
