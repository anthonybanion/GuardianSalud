import { Injectable } from '@nestjs/common';
import { Resident } from '@prisma/client';

import { ResidentsRepository } from './residents.repository';
import { CreateResidentDto } from './dto/create-resident.dto';
import { UpdateResidentDto } from './dto/update-resident.dto';
import { ResidentEntity } from './entities/resident.entity';
import { NotFoundError } from '../../common/errors/not-found.error';
import { mapPrismaError } from '../../common/errors/prisma-error.mapper';

@Injectable()
export class ResidentsService {
  constructor(private readonly residentsRepository: ResidentsRepository) {}

  async create(dto: CreateResidentDto): Promise<ResidentEntity> {
    try {
      const resident = await this.residentsRepository.create({
        nickname: dto.nickname,
        roomLocation: dto.room_location,
        medicalCondition: dto.medical_condition ?? null,
        diet: dto.diet ?? null,
        allergies: dto.allergies ?? null,
        specialCare: dto.special_care ?? null,
      });

      return this.toResponse(resident);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findAll(): Promise<ResidentEntity[]> {
    const residents = await this.residentsRepository.findAll();
    return residents.map((resident) => this.toResponse(resident));
  }

  async findOne(id: string): Promise<ResidentEntity> {
    const resident = await this.residentsRepository.findById(id);

    if (!resident) {
      throw new NotFoundError('Residente', id);
    }

    return this.toResponse(resident);
  }

  async update(id: string, dto: UpdateResidentDto): Promise<ResidentEntity> {
    const existingResident = await this.residentsRepository.findById(id);

    if (!existingResident) {
      throw new NotFoundError('Residente', id);
    }

    const updateData: Record<string, unknown> = {};

    if (dto.nickname !== undefined) {
      updateData.nickname = dto.nickname;
    }

    if (dto.room_location !== undefined) {
      updateData.roomLocation = dto.room_location;
    }

    if (dto.medical_condition !== undefined) {
      updateData.medicalCondition = dto.medical_condition;
    }

    if (dto.diet !== undefined) {
      updateData.diet = dto.diet;
    }

    if (dto.allergies !== undefined) {
      updateData.allergies = dto.allergies;
    }

    if (dto.special_care !== undefined) {
      updateData.specialCare = dto.special_care;
    }

    try {
      const resident = await this.residentsRepository.update(id, updateData);
      return this.toResponse(resident);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async remove(id: string): Promise<ResidentEntity> {
    const existingResident = await this.residentsRepository.findById(id);

    if (!existingResident) {
      throw new NotFoundError('Residente', id);
    }

    try {
      const resident = await this.residentsRepository.delete(id);
      return this.toResponse(resident);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  private toResponse(resident: Resident): ResidentEntity {
    const response = new ResidentEntity();
    response.id = resident.id;
    response.nickname = resident.nickname;
    response.room_location = resident.roomLocation;
    response.medical_condition = resident.medicalCondition;
    response.diet = resident.diet;
    response.allergies = resident.allergies;
    response.special_care = resident.specialCare;
    return response;
  }
}
