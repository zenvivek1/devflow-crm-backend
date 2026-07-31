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
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { QueryClientDto } from './dto/query-client.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  CurrentUser,
  type CurrentUserDto,
} from '../common/decorators/current-user.decorator';

@ApiTags('Clients')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new client' })
  create(
    @CurrentUser() user: CurrentUserDto,
    @Body() createClientDto: CreateClientDto,
  ) {
    return this.clientsService.create(user.organizationId, createClientDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all clients with optional filtering/pagination' })
  findAll(@CurrentUser() user: CurrentUserDto, @Query() query: QueryClientDto) {
    return this.clientsService.findAll(user.organizationId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get client details by ID' })
  findOne(@CurrentUser() user: CurrentUserDto, @Param('id') id: string) {
    return this.clientsService.findOne(user.organizationId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update client details' })
  update(
    @CurrentUser() user: CurrentUserDto,
    @Param('id') id: string,
    @Body() updateClientDto: UpdateClientDto,
  ) {
    return this.clientsService.update(user.organizationId, id, updateClientDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a client' })
  remove(@CurrentUser() user: CurrentUserDto, @Param('id') id: string) {
    return this.clientsService.remove(user.organizationId, id);
  }
}
