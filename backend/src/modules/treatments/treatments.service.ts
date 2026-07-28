import { Injectable } from '@nestjs/common';
import { TreatmentAssignment } from '@prisma/client';

import { TreatmentsRepository } from './treatments.repository';
import { CreateTreatmentDto } from './dto/create-treatment.dto';
import { UpdateTreatmentDto } from './dto/update-treatment.dto';
import { TreatmentEntity } from './entities/treatment.entity';
import { NotFoundError } from '../../common/errors/not-found.error';
import { mapPrismaError } from '../../common/errors/prisma-error.mapper';

@Injectable()
export class TreatmentsService {
  constructor(private readonly treatmentsRepository: TreatmentsRepository) {}

  async create(dto: CreateTreatmentDto): Promise<TreatmentEntity> {
    try {
      const treatment = await this.treatmentsRepository.create({
        resident: { connect: { id: dto.resident_id } },
        medication: { connect: { id: dto.medication_id } },
        prescribedByStaff: { connect: { id: dto.prescribed_by } },
        assignedStaff: { connect: { id: dto.assigned_staff_id } },
        prescribedDose: dto.prescribed_dose,
        frequencyHours: dto.frequency_hours,
        startTime: this.parseTime(dto.start_time),
        ...(dto.is_critical !== undefined && { isCritical: dto.is_critical }),
        ...(dto.ai_instructions !== undefined && { aiInstructions: dto.ai_instructions }),
        ...(dto.is_temporary !== undefined && { isTemporary: dto.is_temporary }),
      });

      return this.toResponse(treatment);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findAll(): Promise<TreatmentEntity[]> {
    const treatments = await this.treatmentsRepository.findAll();
    return treatments.map((treatment) => this.toResponse(treatment));
  }

  async findOne(id: string): Promise<TreatmentEntity> {
    const treatment = await this.treatmentsRepository.findById(id);

    if (!treatment) {
      throw new NotFoundError('Tratamiento', id);
    }

    return this.toResponse(treatment);
  }

  async update(id: string, dto: UpdateTreatmentDto): Promise<TreatmentEntity> {
    const existingTreatment = await this.treatmentsRepository.findById(id);

    if (!existingTreatment) {
      throw new NotFoundError('Tratamiento', id);
    }

    const updateData: Record<string, unknown> = {};

    if (dto.assigned_staff_id !== undefined) {
      updateData.assignedStaff = { connect: { id: dto.assigned_staff_id } };
    }

    if (dto.prescribed_dose !== undefined) {
      updateData.prescribedDose = dto.prescribed_dose;
    }

    if (dto.frequency_hours !== undefined) {
      updateData.frequencyHours = dto.frequency_hours;
    }

    if (dto.start_time !== undefined) {
      updateData.startTime = this.parseTime(dto.start_time);
    }

    if (dto.is_critical !== undefined) {
      updateData.isCritical = dto.is_critical;
    }

    if (dto.ai_instructions !== undefined) {
      updateData.aiInstructions = dto.ai_instructions;
    }

    if (dto.is_temporary !== undefined) {
      updateData.isTemporary = dto.is_temporary;
    }

    try {
      const treatment = await this.treatmentsRepository.update(id, updateData);
      return this.toResponse(treatment);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async remove(id: string): Promise<TreatmentEntity> {
    const existingTreatment = await this.treatmentsRepository.findById(id);

    if (!existingTreatment) {
      throw new NotFoundError('Tratamiento', id);
    }

    try {
      const treatment = await this.treatmentsRepository.delete(id);
      return this.toResponse(treatment);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  private toResponse(treatment: TreatmentAssignment): TreatmentEntity {
    const response = new TreatmentEntity();
    response.id = treatment.id;
    response.resident_id = treatment.residentId;
    response.medication_id = treatment.medicationId;
    response.prescribed_by = treatment.prescribedBy;
    response.assigned_staff_id = treatment.assignedStaffId;
    response.prescribed_dose = treatment.prescribedDose;
    response.frequency_hours = treatment.frequencyHours;
    response.start_time = this.formatTime(treatment.startTime);
    response.is_critical = treatment.isCritical;
    response.ai_instructions = treatment.aiInstructions;
    response.is_temporary = treatment.isTemporary;
    return response;
  }

  private parseTime(time: string): Date {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date(1970, 0, 1, hours, minutes, 0);
    return date;
  }

  private formatTime(date: Date): string {
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
