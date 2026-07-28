import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateMedicationDto {
  @ApiProperty({
    example: 'Paracetamol 500mg',
    description: 'Nombre comercial del medicamento',
  })
  @IsNotEmpty({ message: 'El nombre comercial es obligatorio' })
  @IsString({ message: 'El nombre comercial debe ser un texto' })
  @MaxLength(100, { message: 'El nombre comercial no debe exceder 100 caracteres' })
  commercial_name: string;

  @ApiProperty({
    example: 'Paracetamol',
    description: 'Principio activo',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El principio activo debe ser un texto' })
  @MaxLength(100, { message: 'El principio activo no debe exceder 100 caracteres' })
  active_ingredient?: string;

  @ApiProperty({
    example: '500mg',
    description: 'Concentración del medicamento',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La concentración debe ser un texto' })
  @MaxLength(50, { message: 'La concentración no debe exceder 50 caracteres' })
  concentration?: string;

  @ApiProperty({
    example: 'Tableta',
    description: 'Presentación del medicamento',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La presentación debe ser un texto' })
  @MaxLength(50, { message: 'La presentación no debe exceder 50 caracteres' })
  presentation?: string;

  @ApiProperty({
    example: 'Oral',
    description: 'Vía de administración',
  })
  @IsNotEmpty({ message: 'La vía de administración es obligatoria' })
  @IsString({ message: 'La vía de administración debe ser un texto' })
  @MaxLength(50, { message: 'La vía de administración no debe exceder 50 caracteres' })
  administration_route: string;

  @ApiProperty({
    example: 50,
    description: 'Stock actual del medicamento',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El stock actual debe ser un número entero' })
  @Min(0, { message: 'El stock actual no puede ser negativo' })
  current_stock?: number;

  @ApiProperty({
    example: 10,
    description: 'Stock mínimo requerido',
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El stock mínimo debe ser un número entero' })
  @Min(0, { message: 'El stock mínimo no puede ser negativo' })
  minimum_stock?: number;
}
