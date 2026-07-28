import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateTreatmentDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del residente',
  })
  @IsNotEmpty({ message: 'El resident_id es obligatorio' })
  @IsUUID('4', { message: 'El resident_id debe ser un UUID válido' })
  resident_id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'ID del medicamento',
  })
  @IsNotEmpty({ message: 'El medication_id es obligatorio' })
  @IsUUID('4', { message: 'El medication_id debe ser un UUID válido' })
  medication_id: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440002',
    description: 'ID del médico que prescribe',
  })
  @IsNotEmpty({ message: 'El prescribed_by es obligatorio' })
  @IsUUID('4', { message: 'El prescribed_by debe ser un UUID válido' })
  prescribed_by: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440003',
    description: 'ID del enfermero asignado',
  })
  @IsNotEmpty({ message: 'El assigned_staff_id es obligatorio' })
  @IsUUID('4', { message: 'El assigned_staff_id debe ser un UUID válido' })
  assigned_staff_id: string;

  @ApiProperty({
    example: '500mg cada 8 horas',
    description: 'Dosis prescrita',
  })
  @IsNotEmpty({ message: 'La dosis prescrita es obligatoria' })
  @IsString({ message: 'La dosis prescrita debe ser un texto' })
  @MaxLength(50, { message: 'La dosis prescrita no debe exceder 50 caracteres' })
  prescribed_dose: string;

  @ApiProperty({
    example: 8,
    description: 'Frecuencia en horas',
  })
  @IsNotEmpty({ message: 'La frecuencia en horas es obligatoria' })
  @IsInt({ message: 'La frecuencia debe ser un número entero' })
  @Min(1, { message: 'La frecuencia debe ser al menos 1 hora' })
  frequency_hours: number;

  @ApiProperty({
    example: '08:00',
    description: 'Hora de inicio del tratamiento (formato HH:mm)',
  })
  @IsNotEmpty({ message: 'La hora de inicio es obligatoria' })
  @IsString({ message: 'La hora de inicio debe ser un texto' })
  start_time: string;

  @ApiProperty({
    example: false,
    description: 'Indica si el tratamiento es crítico',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo is_critical debe ser un valor booleano' })
  is_critical?: boolean;

  @ApiProperty({
    example: 'Administrar con alimentos',
    description: 'Instrucciones generadas por IA',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las instrucciones de IA deben ser un texto' })
  ai_instructions?: string;

  @ApiProperty({
    example: false,
    description: 'Indica si el tratamiento es temporal',
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo is_temporary debe ser un valor booleano' })
  is_temporary?: boolean;
}
