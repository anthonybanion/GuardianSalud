import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';

import { StaffService } from './staff.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffEntity } from './entities/staff.entity';

@ApiTags('Staff')
@Controller('staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo staff' })
  @ApiResponse({ status: 201, description: 'Staff creado exitosamente', type: StaffEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiResponse({ status: 409, description: 'Ya existe un staff para este usuario' })
  create(@Body() dto: CreateStaffDto): Promise<StaffEntity> {
    return this.staffService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los staff' })
  @ApiResponse({ status: 200, description: 'Lista de staff', type: [StaffEntity] })
  findAll(): Promise<StaffEntity[]> {
    return this.staffService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un staff por ID' })
  @ApiParam({ name: 'id', description: 'UUID del staff' })
  @ApiResponse({ status: 200, description: 'Staff encontrado', type: StaffEntity })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  @ApiResponse({ status: 404, description: 'Staff no encontrado' })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<StaffEntity> {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un staff' })
  @ApiParam({ name: 'id', description: 'UUID del staff' })
  @ApiResponse({ status: 200, description: 'Staff actualizado exitosamente', type: StaffEntity })
  @ApiResponse({ status: 400, description: 'Datos de entrada inválidos' })
  @ApiResponse({ status: 404, description: 'Staff no encontrado' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStaffDto,
  ): Promise<StaffEntity> {
    return this.staffService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un staff' })
  @ApiParam({ name: 'id', description: 'UUID del staff' })
  @ApiResponse({ status: 200, description: 'Staff eliminado exitosamente', type: StaffEntity })
  @ApiResponse({ status: 400, description: 'ID con formato inválido' })
  @ApiResponse({ status: 404, description: 'Staff no encontrado' })
  remove(@Param('id', ParseUUIDPipe) id: string): Promise<StaffEntity> {
    return this.staffService.remove(id);
  }
}
