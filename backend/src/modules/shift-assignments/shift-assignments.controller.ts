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

import { ShiftAssignmentsService } from './shift-assignments.service';
import { CreateShiftAssignmentDto } from './dto/create-shift-assignment.dto';
import { UpdateShiftAssignmentDto } from './dto/update-shift-assignment.dto';
import { ShiftAssignmentEntity } from './entities/shift-assignment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@ApiTags('Shift Assignments')
@ApiBearerAuth()
@Controller('shift-assignments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ShiftAssignmentsController {
  constructor(private readonly shiftAssignmentsService: ShiftAssignmentsService) {}

  @Post()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Crear una nueva asignación de turno' })
  @ApiResponse({ status: 201, description: 'Asignación de turno creada exitosamente', type: ShiftAssignmentEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  create(@Body() dto: CreateShiftAssignmentDto): Promise<ShiftAssignmentEntity> {
    return this.shiftAssignmentsService.create(dto);
  }

  @Get()
  @Roles(Role.ADMIN, Role.PHYSICIAN, Role.NURSE)
  @ApiOperation({ summary: 'Obtener todas las asignaciones de turno' })
  @ApiResponse({ status: 200, description: 'Lista de asignaciones de turno', type: [ShiftAssignmentEntity] })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  findAll(): Promise<ShiftAssignmentEntity[]> {
    return this.shiftAssignmentsService.findAll();
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.PHYSICIAN, Role.NURSE)
  @ApiOperation({ summary: 'Obtener una asignación de turno por ID' })
  @ApiParam({ name: 'id', description: 'UUID de la asignación de turno' })
  @ApiResponse({ status: 200, description: 'Asignación de turno encontrada', type: ShiftAssignmentEntity })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Asignación de turno no encontrada' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<ShiftAssignmentEntity> {
    return this.shiftAssignmentsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Actualizar una asignación de turno' })
  @ApiParam({ name: 'id', description: 'UUID de la asignación de turno' })
  @ApiResponse({ status: 200, description: 'Asignación de turno actualizada exitosamente', type: ShiftAssignmentEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Asignación de turno no encontrada' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShiftAssignmentDto,
  ): Promise<ShiftAssignmentEntity> {
    return this.shiftAssignmentsService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Eliminar una asignación de turno' })
  @ApiParam({ name: 'id', description: 'UUID de la asignación de turno' })
  @ApiResponse({ status: 200, description: 'Asignación de turno eliminada exitosamente', type: ShiftAssignmentEntity })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene permisos' })
  @ApiResponse({ status: 404, description: 'Asignación de turno no encontrada' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<ShiftAssignmentEntity> {
    return this.shiftAssignmentsService.remove(id);
  }
}
