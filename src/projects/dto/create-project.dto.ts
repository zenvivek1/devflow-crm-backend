import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { ProjectStage, ProjectType, Priority } from '@prisma/client';

export class CreateProjectDto {
  @IsUUID()
  @IsNotEmpty()
  clientId!: string;

  @IsString()
  @IsOptional()
  techStack?: string;

  @IsUrl()
  @IsOptional()
  githubRepoUrl?: string;

  @IsUrl()
  @IsOptional()
  stagingUrl?: string;

  @IsUrl()
  @IsOptional()
  productionUrl?: string;

  @IsUrl()
  @IsOptional()
  apiDocsUrl?: string;

  @IsString()
  @IsOptional()
  hostingProvider?: string;

  @IsEnum(ProjectStage)
  @IsOptional()
  stage?: ProjectStage;

  @IsNumber()
  @IsOptional()
  budget?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsEnum(ProjectType)
  @IsOptional()
  projectType?: ProjectType;

  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority;

  @IsString()
  @IsOptional()
  deadline?: string;

  @IsString()
  @IsOptional()
  nextMeetingAt?: string;
}
