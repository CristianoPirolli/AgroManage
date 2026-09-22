import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { CreateExpenseDto } from './dto/create-expense.dto.js';
import { UpdateExpenseDto } from './dto/update-expense.dto.js';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string, propertyId?: number) {
    return this.prisma.expense.findMany({
      where: {
        property: { userId },
        ...(propertyId && { propertyId }),
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number, userId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, property: { userId } },
    });
    if (!expense) {
      throw new NotFoundException('Despesa não encontrada');
    }
    return expense;
  }

  async create(dto: CreateExpenseDto, userId: string) {
    await this.assertPropertyOwnership(dto.propertyId, userId);
    return this.prisma.expense.create({
      data: { ...dto, date: new Date(dto.date) },
    });
  }

  async update(id: number, dto: UpdateExpenseDto, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.expense.update({
      where: { id },
      data: { ...dto, ...(dto.date && { date: new Date(dto.date) }) },
    });
  }

  async remove(id: number, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.expense.delete({ where: { id } });
    return { id };
  }

  private async assertPropertyOwnership(propertyId: number, userId: string) {
    const property = await this.prisma.property.findFirst({ where: { id: propertyId, userId } });
    if (!property) {
      throw new NotFoundException('Propriedade não encontrada');
    }
  }
}
