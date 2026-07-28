import { Injectable } from '@nestjs/common';
import { Prisma, Medication } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MedicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MedicationCreateInput): Promise<Medication> {
    return this.prisma.medication.create({ data });
  }

  async findAll(): Promise<Medication[]> {
    return this.prisma.medication.findMany();
  }

  async findById(id: string): Promise<Medication | null> {
    return this.prisma.medication.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.MedicationUpdateInput): Promise<Medication> {
    return this.prisma.medication.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Medication> {
    return this.prisma.medication.delete({ where: { id } });
  }
}
