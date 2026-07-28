import { Injectable } from '@nestjs/common';
import { DoseLog } from '@prisma/client';

import { DoseLogsRepository } from './dose-logs.repository';
import { CreateDoseLogDto } from './dto/create-dose-log.dto';
import { UpdateDoseLogDto } from './dto/update-dose-log.dto';
import { DoseLogEntity } from './entities/dose-log.entity';
import { NotFoundError } from '../../common/errors/not-found.error';
import { mapPrismaError } from '../../common/errors/prisma-error.mapper';

@Injectable()
export class DoseLogsService {
  constructor(private readonly doseLogsRepository: DoseLogsRepository) {}

  async create(dto: CreateDoseLogDto): Promise<DoseLogEntity> {
    try {
      const doseLog = await this.doseLogsRepository.create({
        treatment: { connect: { id: dto.treatment_id } },
        resident: { connect: { id: dto.resident_id } },
        staff: { connect: { id: dto.staff_id } },
        scheduledAt: new Date(dto.scheduled_at),
        ...(dto.administered_at !== undefined && { administeredAt: new Date(dto.administered_at) }),
        status: dto.status,
        omissionReason: dto.omission_reason ?? null,
      });

      return this.toResponse(doseLog);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findAll(): Promise<DoseLogEntity[]> {
    const doseLogs = await this.doseLogsRepository.findAll();
    return doseLogs.map((doseLog) => this.toResponse(doseLog));
  }

  async findOne(id: string): Promise<DoseLogEntity> {
    const doseLog = await this.doseLogsRepository.findById(id);

    if (!doseLog) {
      throw new NotFoundError('Registro de dosis', id);
    }

    return this.toResponse(doseLog);
  }

  async update(id: string, dto: UpdateDoseLogDto): Promise<DoseLogEntity> {
    const existingDoseLog = await this.doseLogsRepository.findById(id);

    if (!existingDoseLog) {
      throw new NotFoundError('Registro de dosis', id);
    }

    const updateData: Record<string, unknown> = {};

    if (dto.staff_id !== undefined) {
      updateData.staff = { connect: { id: dto.staff_id } };
    }

    if (dto.scheduled_at !== undefined) {
      updateData.scheduledAt = new Date(dto.scheduled_at);
    }

    if (dto.administered_at !== undefined) {
      updateData.administeredAt = new Date(dto.administered_at);
    }

    if (dto.status !== undefined) {
      updateData.status = dto.status;
    }

    if (dto.omission_reason !== undefined) {
      updateData.omissionReason = dto.omission_reason;
    }

    try {
      const doseLog = await this.doseLogsRepository.update(id, updateData);
      return this.toResponse(doseLog);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async remove(id: string): Promise<DoseLogEntity> {
    const existingDoseLog = await this.doseLogsRepository.findById(id);

    if (!existingDoseLog) {
      throw new NotFoundError('Registro de dosis', id);
    }

    try {
      const doseLog = await this.doseLogsRepository.delete(id);
      return this.toResponse(doseLog);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  private toResponse(doseLog: DoseLog): DoseLogEntity {
    const response = new DoseLogEntity();
    response.id = doseLog.id;
    response.treatment_id = doseLog.treatmentId;
    response.resident_id = doseLog.residentId;
    response.staff_id = doseLog.staffId;
    response.scheduled_at = doseLog.scheduledAt.toISOString();
    response.administered_at = doseLog.administeredAt?.toISOString() ?? null;
    response.status = doseLog.status;
    response.omission_reason = doseLog.omissionReason;
    return response;
  }
}
