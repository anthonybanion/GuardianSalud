import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { DoseStatus } from '@prisma/client';

export class CreateDoseLogDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del tratamiento',
  })
  @IsNotEmpty({ message: 'El treatment_id es obligatorio' })
  @IsUUID('4', { message: 'El treatment_id debe ser un UUID válido' })
  treatment_id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID del residente',
  })
  @IsNotEmpty({ message: 'El resident_id es obligatorio' })
  @IsUUID('4', { message: 'El resident_id debe ser un UUID válido' })
  resident_id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'ID del staff que administra',
  })
  @IsNotEmpty({ message: 'El staff_id es obligatorio' })
  @IsUUID('4', { message: 'El staff_id debe ser un UUID válido' })
  staff_id: string;

  @ApiProperty({
    example: '2026-07-28T08:00:00.000Z',
    description: 'Fecha y hora programada de la dosis',
  })
  @IsNotEmpty({ message: 'La fecha programada es obligatoria' })
  @IsISO8601({}, { message: 'La fecha programada debe ser una fecha ISO 8601 válida' })
  scheduled_at: string;

  @ApiProperty({
    example: '2026-07-28T08:15:00.000Z',
    description: 'Fecha y hora real de administración',
    required: false,
  })
  @IsOptional()
  @IsISO8601({}, { message: 'La fecha de administración debe ser una fecha ISO 8601 válida' })
  administered_at?: string;

  @ApiProperty({
    example: 'PENDING',
    description: 'Estado de la dosis',
    enum: DoseStatus,
  })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsEnum(DoseStatus, {
    message: 'El estado debe ser PENDING, APPLIED u OMITTED',
  })
  status: DoseStatus;

  @ApiProperty({
    example: 'Paciente con náuseas',
    description: 'Motivo de omisión',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El motivo de omisión debe ser un texto' })
  omission_reason?: string;
}
