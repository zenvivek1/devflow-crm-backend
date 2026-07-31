import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, Client } from '@prisma/client';

@Injectable()
export class ClientsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.ClientUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Client> {
    const db = tx || this.prisma;
    return db.client.create({ data });
  }

  async findMany(args: Prisma.ClientFindManyArgs): Promise<Client[]> {
    return this.prisma.client.findMany(args);
  }

  async count(args: Prisma.ClientCountArgs): Promise<number> {
    return this.prisma.client.count(args);
  }

  async findUnique(args: Prisma.ClientFindUniqueArgs): Promise<Client | null> {
    return this.prisma.client.findUnique(args);
  }

  async update(
    args: {
      where: Prisma.ClientWhereUniqueInput;
      data: Prisma.ClientUncheckedUpdateInput;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<Client> {
    const db = tx || this.prisma;
    return db.client.update(args);
  }

  async delete(
    args: Prisma.ClientDeleteArgs,
    tx?: Prisma.TransactionClient,
  ): Promise<Client> {
    const db = tx || this.prisma;
    return db.client.delete(args);
  }
}
