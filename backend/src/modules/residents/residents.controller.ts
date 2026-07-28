import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';

import { ResidentsService } from './residents.service';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { ResidentEntity } from './entities/resident.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Residents')
@ApiBearerAuth()
@Controller('residents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ResidentsController {
  constructor(private readonly residentsService: ResidentsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo residente' })
  @ApiResponse({ status: 201, description: 'Residente creado exitosamente', type: ResidentEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  create(@Body() dto: CreateResidentDto): Promise<ResidentEntity> {
    return this.residentsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.PHYSICIAN, Role.NURSE)
  @ApiOperation({ summary: 'Obtener todos los residentes' })
  @ApiResponse({ status: 200, description: 'Lista de residentes', type: [ResidentEntity] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  findAll(): Promise<ResidentEntity[]> {
    return this.residentsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PHYSICIAN, Role.NURSE)
  @ApiOperation({ summary: 'Obtener un residente por ID' })
  @ApiParam({ name: 'id', description: 'UUID del residente' })
  @ApiResponse({ status: 200, description: 'Residente encontrado', type: ResidentEntity })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Residente no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ResidentEntity> {
    return this.residentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar un residente' })
  @ApiParam({ name: 'id', description: 'UUID del residente' })
  @ApiResponse({ status: 200, description: 'Residente actualizado exitosamente', type: ResidentEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Residente no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateResidentDto,
  ): Promise<ResidentEntity> {
    return this.residentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un residente' })
  @ApiParam({ name: 'id', description: 'UUID del residente' })
  @ApiResponse({ status: 200, description: 'Residente eliminado exitosamente', type: ResidentEntity })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Residente no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<ResidentEntity> {
    return this.residentsService.remove(id);
  }
}
