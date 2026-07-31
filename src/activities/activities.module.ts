import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { PrismaModule } from '../database/prisma.module';
import { ActivitiesRepository } from './activities.repository';

@Module({
  imports: [PrismaModule],
  providers: [ActivitiesService, ActivitiesRepository],
  exports: [ActivitiesService, ActivitiesRepository],
})
export class ActivitiesModule {}
