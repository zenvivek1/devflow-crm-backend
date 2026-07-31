import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from '../database/prisma.module';
import { ActivitiesModule } from '../activities/activities.module';
import { ProjectsRepository } from './projects.repository';

@Module({
  imports: [PrismaModule, ActivitiesModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsRepository],
  exports: [ProjectsRepository],
})
export class ProjectsModule {}
