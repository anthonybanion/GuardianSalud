import { Injectable } from '@nestjs/common';
import { Medication } from '@prisma/client';

import { MedicationsRepository } from './medications.repository';
import { CreateMedicationDto } from './dto/create-medication.dto';
import { UpdateMedicationDto } from './dto/update-medication.dto';
import { MedicationEntity } from './entities/medication.entity';
import { NotFoundError } from '../../common/errors/not-found.error';
import { mapPrismaError } from '../../common/errors/prisma-error.mapper';

@Injectable()
export class MedicationsService {
  constructor(private readonly medicationsRepository: MedicationsRepository) {}

  async create(dto: CreateMedicationDto): Promise<MedicationEntity> {
    try {
      const medication = await this.medicationsRepository.create({
        commercialName: dto.commercial_name,
        activeIngredient: dto.active_ingredient ?? null,
        concentration: dto.concentration ?? null,
        presentation: dto.presentation ?? null,
        administrationRoute: dto.administration_route,
        ...(dto.current_stock !== undefined && { currentStock: dto.current_stock }),
        ...(dto.minimum_stock !== undefined && { minimumStock: dto.minimum_stock }),
      });

      return this.toResponse(medication);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findAll(): Promise<MedicationEntity[]> {
    const medications = await this.medicationsRepository.findAll();
    return medications.map((medication) => this.toResponse(medication));
  }

  async findOne(id: string): Promise<MedicationEntity> {
    const medication = await this.medicationsRepository.findById(id);

    if (!medication) {
      throw new NotFoundError('Medicamento', id);
    }

    return this.toResponse(medication);
  }

  async update(id: string, dto: UpdateMedicationDto): Promise<MedicationEntity> {
    const existingMedication = await this.medicationsRepository.findById(id);

    if (!existingMedication) {
      throw new NotFoundError('Medicamento', id);
    }

    const updateData: Record<string, unknown> = {};

    if (dto.commercial_name !== undefined) {
      updateData.commercialName = dto.commercial_name;
    }

    if (dto.active_ingredient !== undefined) {
      updateData.activeIngredient = dto.active_ingredient;
    }

    if (dto.concentration !== undefined) {
      updateData.concentration = dto.concentration;
    }

    if (dto.presentation !== undefined) {
      updateData.presentation = dto.presentation;
    }

    if (dto.administration_route !== undefined) {
      updateData.administrationRoute = dto.administration_route;
    }

    if (dto.current_stock !== undefined) {
      updateData.currentStock = dto.current_stock;
    }

    if (dto.minimum_stock !== undefined) {
      updateData.minimumStock = dto.minimum_stock;
    }

    try {
      const medication = await this.medicationsRepository.update(id, updateData);
      return this.toResponse(medication);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async remove(id: string): Promise<MedicationEntity> {
    const existingMedication = await this.medicationsRepository.findById(id);

    if (!existingMedication) {
      throw new NotFoundError('Medicamento', id);
    }

    try {
      const medication = await this.medicationsRepository.delete(id);
      return this.toResponse(medication);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  private toResponse(medication: Medication): MedicationEntity {
    const response = new MedicationEntity();
    response.id = medication.id;
    response.commercial_name = medication.commercialName;
    response.active_ingredient = medication.activeIngredient;
    response.concentration = medication.concentration;
    response.presentation = medication.presentation;
    response.administration_route = medication.administrationRoute;
    response.current_stock = medication.currentStock;
    response.minimum_stock = medication.minimumStock;
    return response;
  }
}
