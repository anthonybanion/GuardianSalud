import { Injectable } from '@nestjs/common';
import { Prisma, DoseLog } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DoseLogsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.DoseLogCreateInput): Promise<DoseLog> {
    return this.prisma.doseLog.create({ data });
  }

  async findAll(): Promise<DoseLog[]> {
    return this.prisma.doseLog.findMany();
  }

  async findById(id: string): Promise<DoseLog | null> {
    return this.prisma.doseLog.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.DoseLogUpdateInput): Promise<DoseLog> {
    return this.prisma.doseLog.update({ where: { id }, data });
  }

  async delete(id: string): Promise<DoseLog> {
    return this.prisma.doseLog.delete({ where: { id } });
  }
}
