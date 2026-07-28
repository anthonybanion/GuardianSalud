import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateResidentDto {
  @ApiProperty({
    example: 'Don Carlos',
    description: 'Nombre o apodo del residente',
  })
  @IsNotEmpty({ message: 'El nickname es obligatorio' })
  @IsString({ message: 'El nickname debe ser un texto' })
  @MaxLength(100, { message: 'El nickname no debe exceder 100 caracteres' })
  nickname: string;

  @ApiProperty({
    example: 'Habitación 12-A',
    description: 'Ubicación de la habitación',
  })
  @IsNotEmpty({ message: 'La ubicación es obligatoria' })
  @IsString({ message: 'La ubicación debe ser un texto' })
  @MaxLength(50, { message: 'La ubicación no debe exceder 50 caracteres' })
  room_location: string;

  @ApiProperty({
    example: 'Diabetes tipo 2',
    description: 'Condición médica principal',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La condición médica debe ser un texto' })
  @MaxLength(150, { message: 'La condición médica no debe exceder 150 caracteres' })
  medical_condition?: string;

  @ApiProperty({
    example: 'Baja en sodio',
    description: 'Dieta del residente',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La dieta debe ser un texto' })
  @MaxLength(100, { message: 'La dieta no debe exceder 100 caracteres' })
  diet?: string;

  @ApiProperty({
    example: 'Penicilina, Ibuprofeno',
    description: 'Alergias conocidas',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las alergias deben ser un texto' })
  allergies?: string;

  @ApiProperty({
    example: 'Requiere asistencia para caminar',
    description: 'Cuidados especiales requeridos',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Los cuidados especiales deben ser un texto' })
  special_care?: string;
}
