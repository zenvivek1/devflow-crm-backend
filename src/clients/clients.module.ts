import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';
import { ClientsController } from './clients.controller';
import { PrismaModule } from '../database/prisma.module';
import { ActivitiesModule } from '../activities/activities.module';
import { ClientsRepository } from './clients.repository';

@Module({
  imports: [PrismaModule, ActivitiesModule],
  controllers: [ClientsController],
  providers: [ClientsService, ClientsRepository],
})
export class ClientsModule {}
