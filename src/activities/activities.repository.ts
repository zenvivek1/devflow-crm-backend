import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, Activity } from '@prisma/client';

@Injectable()
export class ActivitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.ActivityCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Activity> {
    const db = tx || this.prisma;
    return db.activity.create({ data });
  }
}
