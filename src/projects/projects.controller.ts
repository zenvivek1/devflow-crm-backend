import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { QueryProjectDto } from './dto/query-project.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  type CurrentUserDto,
} from '../common/decorators/current-user.decorator';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new project' })
  create(
    @CurrentUser() user: CurrentUserDto,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    return this.projectsService.create(user.organizationId, createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all projects with stage/client filtering' })
  findAll(
    @CurrentUser() user: CurrentUserDto,
    @Query() query: QueryProjectDto,
  ) {
    return this.projectsService.findAll(user.organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project workspace details by ID' })
  findOne(@CurrentUser() user: CurrentUserDto, @Param('id') id: string) {
    return this.projectsService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project status, stage, or properties' })
  update(
    @CurrentUser() user: CurrentUserDto,
    @Param('id') id: string,
    @Body() updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(
      user.organizationId,
      id,
      updateProjectDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  remove(@CurrentUser() user: CurrentUserDto, @Param('id') id: string) {
    return this.projectsService.remove(user.organizationId, id);
  }
}
