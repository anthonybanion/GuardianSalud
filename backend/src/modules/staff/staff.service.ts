import { Injectable } from '@nestjs/common';
import { Staff } from '@prisma/client';

import { StaffRepository } from './staff.repository';
import { UsersService } from '../users/users.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { StaffEntity } from './entities/staff.entity';
import { NotFoundError } from '../../common/errors/not-found.error';
import { DuplicateError } from '../../common/errors/duplicate.error';
import { mapPrismaError } from '../../common/errors/prisma-error.mapper';

@Injectable()
export class StaffService {
  constructor(
    private readonly staffRepository: StaffRepository,
    private readonly usersService: UsersService,
  ) {}

  async create(dto: CreateStaffDto): Promise<StaffEntity> {
    // Validar que el usuario exista (lanza NotFoundError si no existe)
    await this.usersService.findById(dto.user_id);

    // Validar que no exista ya un staff para ese usuario
    const existingStaff = await this.staffRepository.findByUserId(dto.user_id);
    if (existingStaff) {
      throw new DuplicateError('Ya existe un staff asociado a este usuario', {
        fields: ['user_id'],
      });
    }

    try {
      const staff = await this.staffRepository.create({
        user: { connect: { id: dto.user_id } },
        specialties: dto.specialties ?? null,
        preferredShift: dto.preferred_shift ?? null,
      });

      return this.toResponse(staff);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findAll(): Promise<StaffEntity[]> {
    const staffList = await this.staffRepository.findAll();
    return staffList.map((staff) => this.toResponse(staff));
  }

  async findOne(id: string): Promise<StaffEntity> {
    const staff = await this.staffRepository.findById(id);

    if (!staff) {
      throw new NotFoundError('Staff', id);
    }

    return this.toResponse(staff);
  }

  async update(id: string, dto: UpdateStaffDto): Promise<StaffEntity> {
    const existingStaff = await this.staffRepository.findById(id);

    if (!existingStaff) {
      throw new NotFoundError('Staff', id);
    }

    const updateData: Record<string, unknown> = {};

    if (dto.specialties !== undefined) {
      updateData.specialties = dto.specialties;
    }

    if (dto.preferred_shift !== undefined) {
      updateData.preferredShift = dto.preferred_shift;
    }

    try {
      const staff = await this.staffRepository.update(id, updateData);
      return this.toResponse(staff);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async remove(id: string): Promise<StaffEntity> {
    const existingStaff = await this.staffRepository.findById(id);

    if (!existingStaff) {
      throw new NotFoundError('Staff', id);
    }

    try {
      const staff = await this.staffRepository.delete(id);
      return this.toResponse(staff);
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  private toResponse(staff: Staff): StaffEntity {
    const response = new StaffEntity();
    response.id = staff.id;
    response.user_id = staff.userId;
    response.specialties = staff.specialties;
    response.preferred_shift = staff.preferredShift;
    return response;
  }
}
