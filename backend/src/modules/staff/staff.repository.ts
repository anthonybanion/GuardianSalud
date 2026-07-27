import { Injectable } from '@nestjs/common';
import { Prisma, Staff } from '@prisma/client';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class StaffRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.StaffCreateInput): Promise<Staff> {
    return this.prisma.staff.create({ data });
  }

  async findAll(): Promise<Staff[]> {
    return this.prisma.staff.findMany();
  }

  async findById(id: string): Promise<Staff | null> {
    return this.prisma.staff.findUnique({ where: { id } });
  }

  async findByUserId(userId: string): Promise<Staff | null> {
    return this.prisma.staff.findUnique({ where: { userId } });
  }

  async update(id: string, data: Prisma.StaffUpdateInput): Promise<Staff> {
    return this.prisma.staff.update({ where: { id }, data });
  }

  async delete(id: string): Promise<Staff> {
    return this.prisma.staff.delete({ where: { id } });
  }
}
