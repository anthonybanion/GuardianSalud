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

import { MedicationsService } from './medications.service';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { MedicationEntity } from './entities/medication.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Medications')
@ApiBearerAuth()
@Controller('medications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear un nuevo medicamento' })
  @ApiResponse({ status: 201, description: 'Medicamento creado exitosamente', type: MedicationEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  create(@Body() dto: CreateMedicationDto): Promise<MedicationEntity> {
    return this.medicationsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.PHYSICIAN)
  @ApiOperation({ summary: 'Obtener todos los medicamentos' })
  @ApiResponse({ status: 200, description: 'Lista de medicamentos', type: [MedicationEntity] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  findAll(): Promise<MedicationEntity[]> {
    return this.medicationsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PHYSICIAN)
  @ApiOperation({ summary: 'Obtener un medicamento por ID' })
  @ApiParam({ name: 'id', description: 'UUID del medicamento' })
  @ApiResponse({ status: 200, description: 'Medicamento encontrado', type: MedicationEntity })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Medicamento no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<MedicationEntity> {
    return this.medicationsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar un medicamento' })
  @ApiParam({ name: 'id', description: 'UUID del medicamento' })
  @ApiResponse({ status: 200, description: 'Medicamento actualizado exitosamente', type: MedicationEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Medicamento no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMedicationDto,
  ): Promise<MedicationEntity> {
    return this.medicationsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar un medicamento' })
  @ApiParam({ name: 'id', description: 'UUID del medicamento' })
  @ApiResponse({ status: 200, description: 'Medicamento eliminado exitosamente', type: MedicationEntity })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Medicamento no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<MedicationEntity> {
    return this.medicationsService.remove(id);
  }
}
