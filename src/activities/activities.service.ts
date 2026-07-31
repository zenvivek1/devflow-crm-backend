import { Injectable } from '@nestjs/common';
import { ActivitiesRepository } from './activities.repository';

@Injectable()
export class ActivitiesService {
  constructor(private readonly activitiesRepository: ActivitiesRepository) {}

  /**
   * Use this when NOT inside a transaction to log an activity.
   */
  async log(
    organizationId: string,
    action: string,
    meta?: any,
    clientId?: string,
    projectId?: string,
  ) {
    return this.activitiesRepository.create({
      organization: { connect: { id: organizationId } },
      action,
      meta: meta || undefined,
      client: clientId ? { connect: { id: clientId } } : undefined,
      project: projectId ? { connect: { id: projectId } } : undefined,
    });
  }

  /**
   * Use this inside a transaction, passing the transaction client (tx).
   */
  async logWithTx(
    tx: any,
    organizationId: string,
    action: string,
    meta?: any,
    clientId?: string,
    projectId?: string,
  ) {
    return this.activitiesRepository.create(
      {
        organization: { connect: { id: organizationId } },
        action,
        meta: meta || undefined,
        client: clientId ? { connect: { id: clientId } } : undefined,
        project: projectId ? { connect: { id: projectId } } : undefined,
      },
      tx,
    );
  }
}
