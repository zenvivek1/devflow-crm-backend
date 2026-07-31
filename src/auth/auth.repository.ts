import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { Prisma, User, Organization } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUniqueUser(args: Prisma.UserFindUniqueArgs): Promise<User | null> {
    return this.prisma.user.findUnique(args);
  }

  async updateUser(args: Prisma.UserUpdateArgs): Promise<User> {
    return this.prisma.user.update(args);
  }

  async createOrganization(
    args: Prisma.OrganizationCreateArgs,
    tx?: Prisma.TransactionClient,
  ): Promise<Organization> {
    const db = tx || this.prisma;
    return db.organization.create(args);
  }

  async createUser(
    args: Prisma.UserCreateArgs,
    tx?: Prisma.TransactionClient,
  ): Promise<User> {
    const db = tx || this.prisma;
    return db.user.create(args);
  }
}
