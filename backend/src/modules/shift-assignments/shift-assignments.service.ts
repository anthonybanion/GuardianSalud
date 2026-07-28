import { Injectable } from '@nestjs/common';
import { ShiftAssignment } from '@prisma/client';

import { ShiftAssignmentsRepository } from './shift-assignments.repository';
import { CreateShiftAssignmentDto } from './dto/create-shift-assignment.dto';
import { UpdateShiftAssignmentDto } from './dto/update-shift-assignment.dto';
import { ShiftAssignmentEntity } from './entities/shift-assignment.entity';
import { NotFoundError } from '../../common/errors/not-found.error';
import { mapPrismaError } from '../../common/errors/prisma-error.mapper';

@Injectable()
export class ShiftAssignmentsService {
  constructor(private readonly shiftAssignmentsRepository: ShiftAssignmentsRepository) {}

  async create(dto: CreateShiftAssignmentDto): Promise<ShiftAssignmentEntity> {
    try {
      const shiftAssignment = await this.shiftAssignmentsRepository.create({
        staff: { connect: { id: dto.staff_id } },
        shiftType: dto.shift_type,
        shiftDate: this.parseDate(dto.shift_date),
        assignedArea: dto.assigned_area ?? null,
      });

      return this.toResponse(shiftAssignment);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findAll(): Promise<ShiftAssignmentEntity[]> {
    const shiftAssignments = await this.shiftAssignmentsRepository.findAll();
    return shiftAssignments.map((sa) => this.toResponse(sa));
  }

  async findOne(id: string): Promise<ShiftAssignmentEntity> {
    const shiftAssignment = await this.shiftAssignmentsRepository.findById(id);

    if (!shiftAssignment) {
      throw new NotFoundError('Asignación de turno', id);
    }

    return this.toResponse(shiftAssignment);
  }

  async update(id: string, dto: UpdateShiftAssignmentDto): Promise<ShiftAssignmentEntity> {
    const existingShiftAssignment = await this.shiftAssignmentsRepository.findById(id);

    if (!existingShiftAssignment) {
      throw new NotFoundError('Asignación de turno', id);
    }

    const updateData: Record<string, unknown> = {};

    if (dto.shift_type !== undefined) {
      updateData.shiftType = dto.shift_type;
    }

    if (dto.shift_date !== undefined) {
      updateData.shiftDate = this.parseDate(dto.shift_date);
    }

    if (dto.assigned_area !== undefined) {
      updateData.assignedArea = dto.assigned_area;
    }

    try {
      const shiftAssignment = await this.shiftAssignmentsRepository.update(id, updateData);
      return this.toResponse(shiftAssignment);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async remove(id: string): Promise<ShiftAssignmentEntity> {
    const existingShiftAssignment = await this.shiftAssignmentsRepository.findById(id);

    if (!existingShiftAssignment) {
      throw new NotFoundError('Asignación de turno', id);
    }

    try {
      const shiftAssignment = await this.shiftAssignmentsRepository.delete(id);
      return this.toResponse(shiftAssignment);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  private toResponse(shiftAssignment: ShiftAssignment): ShiftAssignmentEntity {
    const response = new ShiftAssignmentEntity();
    response.id = shiftAssignment.id;
    response.staff_id = shiftAssignment.staffId;
    response.shift_type = shiftAssignment.shiftType;
    response.shift_date = this.formatDate(shiftAssignment.shiftDate);
    response.assigned_area = shiftAssignment.assignedArea;
    return response;
  }

  private parseDate(date: string): Date {
    return new Date(date + 'T00:00:00.000Z');
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
