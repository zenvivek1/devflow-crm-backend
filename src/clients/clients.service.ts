import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { ClientsRepository } from './clients.repository';

@Injectable()
export class ClientsService {
  constructor(
    private readonly clientsRepository: ClientsRepository,
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(organizationId: string, dto: CreateClientDto) {
    return this.prisma.$transaction(async (tx) => {
      const client = await this.clientsRepository.create(
        {
          organizationId,
          ...dto,
        },
        tx,
      );

      await this.activitiesService.logWithTx(
        tx,
        organizationId,
        'client.created',
        { name: client.name },
        client.id,
      );

      return client;
    });
  }

  async findAll(organizationId: string, query: QueryClientDto) {
    const { page = 1, limit = 20, search } = query;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { companyName: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.clientsRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.clientsRepository.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(organizationId: string, id: string) {
    const client = await this.clientsRepository.findUnique({
      where: {
        id,
        organizationId,
      },
    });

    if (!client) {
      throw new NotFoundException(`Client not found`);
    }

    return client;
  }

  async update(organizationId: string, id: string, dto: UpdateClientDto) {
    const client = await this.findOne(organizationId, id);

    return this.prisma.$transaction(async (tx) => {
      const updatedClient = await this.clientsRepository.update(
        {
          where: {
            id: client.id,
            organizationId,
          },
          data: dto,
        },
        tx,
      );

      await this.activitiesService.logWithTx(
        tx,
        organizationId,
        'client.updated',
        { updatedFields: Object.keys(dto) },
        client.id,
      );

      return updatedClient;
    });
  }

  async remove(organizationId: string, id: string) {
    const client = await this.findOne(organizationId, id);

    return this.prisma.$transaction(async (tx) => {
      await this.clientsRepository.delete(
        {
          where: {
            id: client.id,
            organizationId,
          },
        },
        tx,
      );

      await this.activitiesService.logWithTx(
        tx,
        organizationId,
        'client.deleted',
        { name: client.name },
        client.id,
      );

      return { message: 'Client deleted successfully' };
    });
  }
}
