import { Injectable } from '@nestjs/common';
import { Prisma, TreatmentAssignment } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TreatmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.TreatmentAssignmentCreateInput): Promise<TreatmentAssignment> {
    return this.prisma.treatmentAssignment.create({ data });
  }

  async findAll(): Promise<TreatmentAssignment[]> {
    return this.prisma.treatmentAssignment.findMany();
  }

  async findById(id: string): Promise<TreatmentAssignment | null> {
    return this.prisma.treatmentAssignment.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.TreatmentAssignmentUpdateInput): Promise<TreatmentAssignment> {
    return this.prisma.treatmentAssignment.update({ where: { id }, data });
  }

  async delete(id: string): Promise<TreatmentAssignment> {
    return this.prisma.treatmentAssignment.delete({ where: { id } });
  }
}
