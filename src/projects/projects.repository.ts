import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, Project } from '@prisma/client';

@Injectable()
export class ProjectsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Prisma.ProjectUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<Project> {
    const db = tx || this.prisma;
    return db.project.create({ data });
  }

  async findMany(args: Prisma.ProjectFindManyArgs): Promise<Project[]> {
    return this.prisma.project.findMany(args);
  }

  async count(args: Prisma.ProjectCountArgs): Promise<number> {
    return this.prisma.project.count(args);
  }

  async findUnique(
    args: Prisma.ProjectFindUniqueArgs,
  ): Promise<Project | null> {
    return this.prisma.project.findUnique(args);
  }

  async update(
    args: {
      where: Prisma.ProjectWhereUniqueInput;
      data: Prisma.ProjectUncheckedUpdateInput;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<Project> {
    const db = tx || this.prisma;
    return db.project.update(args);
  }

  async delete(
    args: Prisma.ProjectDeleteArgs,
    tx?: Prisma.TransactionClient,
  ): Promise<Project> {
    const db = tx || this.prisma;
    return db.project.delete(args);
  }
}
