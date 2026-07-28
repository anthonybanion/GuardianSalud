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

import { TreatmentsService } from './treatments.service';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { TreatmentEntity } from './entities/treatment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Treatments')
@ApiBearerAuth()
@Controller('treatments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.PHYSICIAN)
  @ApiOperation({ summary: 'Crear un nuevo tratamiento' })
  @ApiResponse({ status: 201, description: 'Tratamiento creado exitosamente', type: TreatmentEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  create(@Body() dto: CreateTreatmentDto): Promise<TreatmentEntity> {
    return this.treatmentsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.PHYSICIAN, Role.NURSE)
  @ApiOperation({ summary: 'Obtener todos los tratamientos' })
  @ApiResponse({ status: 200, description: 'Lista de tratamientos', type: [TreatmentEntity] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  findAll(): Promise<TreatmentEntity[]> {
    return this.treatmentsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PHYSICIAN, Role.NURSE)
  @ApiOperation({ summary: 'Obtener un tratamiento por ID' })
  @ApiParam({ name: 'id', description: 'UUID del tratamiento' })
  @ApiResponse({ status: 200, description: 'Tratamiento encontrado', type: TreatmentEntity })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<TreatmentEntity> {
    return this.treatmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.PHYSICIAN)
  @ApiOperation({ summary: 'Actualizar un tratamiento' })
  @ApiParam({ name: 'id', description: 'UUID del tratamiento' })
  @ApiResponse({ status: 200, description: 'Tratamiento actualizado exitosamente', type: TreatmentEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTreatmentDto,
  ): Promise<TreatmentEntity> {
    return this.treatmentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un tratamiento' })
  @ApiParam({ name: 'id', description: 'UUID del tratamiento' })
  @ApiResponse({ status: 200, description: 'Tratamiento eliminado exitosamente', type: TreatmentEntity })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Tratamiento no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<TreatmentEntity> {
    return this.treatmentsService.remove(id);
  }
}
