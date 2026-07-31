import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ActivitiesService } from '../activities/activities.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { ProjectsRepository } from './projects.repository';

@Injectable()
export class ProjectsService {
  constructor(
    private readonly projectsRepository: ProjectsRepository,
    private readonly prisma: PrismaService,
    private readonly activitiesService: ActivitiesService,
  ) {}

  async create(organizationId: string, dto: CreateProjectDto) {
    // Validate client belongs to the organization
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId, organizationId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const project = await this.projectsRepository.create(
        {
          organizationId,
          ...dto,
          budget: dto.budget ? dto.budget : null,
        },
        tx,
      );

      await this.activitiesService.logWithTx(
        tx,
        organizationId,
        'project.created',
        { projectId: project.id },
        client.id,
        project.id,
      );

      return project;
    });
  }

  async findAll(organizationId: string, query: QueryProjectDto) {
    const { page = 1, limit = 20, search, clientId } = query;
    const skip = (page - 1) * limit;

    const where: any = { organizationId };

    if (clientId) {
      where.clientId = clientId;
    }

    if (search) {
      where.OR = [
        { techStack: { contains: search, mode: 'insensitive' } },
        { hostingProvider: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.projectsRepository.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { client: { select: { name: true } } },
      }),
      this.projectsRepository.count({ where }),
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
    const project = await this.projectsRepository.findUnique({
      where: {
        id,
        organizationId,
      },
      include: { client: true },
    });

    if (!project) {
      throw new NotFoundException(`Project not found`);
    }

    return project;
  }

  async update(organizationId: string, id: string, dto: UpdateProjectDto) {
    const project = await this.findOne(organizationId, id);

    return this.prisma.$transaction(async (tx) => {
      const updatedProject = await this.projectsRepository.update(
        {
          where: {
            id: project.id,
            organizationId,
          },
          data: {
            ...dto,
            budget: dto.budget ? dto.budget : project.budget,
          },
        },
        tx,
      );

      await this.activitiesService.logWithTx(
        tx,
        organizationId,
        'project.updated',
        { updatedFields: Object.keys(dto) },
        project.clientId,
        project.id,
      );

      return updatedProject;
    });
  }

  async remove(organizationId: string, id: string) {
    const project = await this.findOne(organizationId, id);

    return this.prisma.$transaction(async (tx) => {
      await this.projectsRepository.delete(
        {
          where: {
            id: project.id,
            organizationId,
          },
        },
        tx,
      );

      await this.activitiesService.logWithTx(
        tx,
        organizationId,
        'project.deleted',
        { projectId: project.id },
        project.clientId,
        project.id,
      );

      return { message: 'Project deleted successfully' };
    });
  }
}
