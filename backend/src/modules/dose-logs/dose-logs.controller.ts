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

import { DoseLogsService } from './dose-logs.service';
import { CreateDoseLogDto } from './dto/create-dose-log.dto';
import { UpdateDoseLogDto } from './dto/update-dose-log.dto';
import { DoseLogEntity } from './entities/dose-log.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Dose Logs')
@ApiBearerAuth()
@Controller('dose-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DoseLogsController {
  constructor(private readonly doseLogsService: DoseLogsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.NURSE)
  @ApiOperation({ summary: 'Registrar una nueva dosis' })
  @ApiResponse({ status: 201, description: 'Registro de dosis creado exitosamente', type: DoseLogEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  create(@Body() dto: CreateDoseLogDto): Promise<DoseLogEntity> {
    return this.doseLogsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.PHYSICIAN, Role.NURSE)
  @ApiOperation({ summary: 'Obtener todos los registros de dosis' })
  @ApiResponse({ status: 200, description: 'Lista de registros de dosis', type: [DoseLogEntity] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  findAll(): Promise<DoseLogEntity[]> {
    return this.doseLogsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PHYSICIAN, Role.NURSE)
  @ApiOperation({ summary: 'Obtener un registro de dosis por ID' })
  @ApiParam({ name: 'id', description: 'UUID del registro de dosis' })
  @ApiResponse({ status: 200, description: 'Registro de dosis encontrado', type: DoseLogEntity })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Registro de dosis no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<DoseLogEntity> {
    return this.doseLogsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.NURSE)
  @ApiOperation({ summary: 'Actualizar un registro de dosis' })
  @ApiParam({ name: 'id', description: 'UUID del registro de dosis' })
  @ApiResponse({ status: 200, description: 'Registro de dosis actualizado exitosamente', type: DoseLogEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Registro de dosis no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDoseLogDto,
  ): Promise<DoseLogEntity> {
    return this.doseLogsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un registro de dosis' })
  @ApiParam({ name: 'id', description: 'UUID del registro de dosis' })
  @ApiResponse({ status: 200, description: 'Registro de dosis eliminado exitosamente', type: DoseLogEntity })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Registro de dosis no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<DoseLogEntity> {
    return this.doseLogsService.remove(id);
  }
}
