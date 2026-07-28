import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ShiftType } from '@prisma/client';

export class CreateShiftAssignmentDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del staff asignado',
  })
  @IsNotEmpty({ message: 'El staff_id es obligatorio' })
  @IsUUID('4', { message: 'El staff_id debe ser un UUID válido' })
  staff_id: string;

  @ApiProperty({
    example: 'MORNING',
    description: 'Tipo de turno',
    enum: ShiftType,
  })
  @IsNotEmpty({ message: 'El tipo de turno es obligatorio' })
  @IsEnum(ShiftType, {
    message: 'El turno debe ser MORNING, AFTERNOON o NIGHT',
  })
  shift_type: ShiftType;

  @ApiProperty({
    example: '2026-07-28',
    description: 'Fecha del turno (formato YYYY-MM-DD)',
  })
  @IsNotEmpty({ message: 'La fecha del turno es obligatoria' })
  @IsDateString({}, { message: 'La fecha del turno debe ser una fecha válida (YYYY-MM-DD)' })
  shift_date: string;

  @ApiProperty({
    example: 'Pabellón Norte',
    description: 'Área asignada',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El área asignada debe ser un texto' })
  @MaxLength(100, { message: 'El área asignada no debe exceder 100 caracteres' })
  assigned_area?: string;
}
