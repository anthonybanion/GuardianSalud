import { Injectable } from '@nestjs/common';
import { Prisma, Resident } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ResidentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ResidentCreateInput): Promise<Resident> {
    return this.prisma.resident.create({ data });
  }

  async findAll(): Promise<Resident[]> {
    return this.prisma.resident.findMany();
  }

  async findById(id: string): Promise<Resident | null> {
    return this.prisma.resident.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.ResidentUpdateInput): Promise<Resident> {
    return this.prisma.resident.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Resident> {
    return this.prisma.resident.delete({ where: { id } });
  }
}
