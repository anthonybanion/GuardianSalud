import { Injectable } from '@nestjs/common';
import { Prisma, ShiftAssignment } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ShiftAssignmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.ShiftAssignmentCreateInput): Promise<ShiftAssignment> {
    return this.prisma.shiftAssignment.create({ data });
  }

  async findAll(): Promise<ShiftAssignment[]> {
    return this.prisma.shiftAssignment.findMany();
  }

  async findById(id: string): Promise<ShiftAssignment | null> {
    return this.prisma.shiftAssignment.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.ShiftAssignmentUpdateInput): Promise<ShiftAssignment> {
    return this.prisma.shiftAssignment.update({ where: { id }, data });
  }

  async delete(id: string): Promise<ShiftAssignment> {
    return this.prisma.shiftAssignment.delete({ where: { id } });
  }
}
