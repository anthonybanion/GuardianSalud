import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ShiftType } from '@prisma/client';

export class CreateStaffDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID del usuario asociado',
  })
  @IsNotEmpty({ message: 'El user_id es obligatorio' })
  @IsUUID('4', { message: 'El user_id debe ser un UUID válido' })
  user_id: string;

  @ApiProperty({
    example: 'Cardiología, Medicina interna',
    description: 'Especialidades del personal',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Las especialidades deben ser un texto' })
  specialties?: string;

  @ApiProperty({
    example: 'MORNING',
    description: 'Turno preferido',
    enum: ShiftType,
    required: false,
  })
  @IsOptional()
  @IsEnum(ShiftType, {
    message: 'El turno debe ser MORNING, AFTERNOON o NIGHT',
  })
  preferred_shift?: ShiftType;
}
