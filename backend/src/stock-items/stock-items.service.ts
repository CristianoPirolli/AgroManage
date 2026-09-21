import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { CreateStockItemDto } from './dto/create-stock-item.dto.js';
import { UpdateStockItemDto } from './dto/update-stock-item.dto.js';

@Injectable()
export class StockItemsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string, propertyId?: number) {
    return this.prisma.stockItem.findMany({
      where: {
        property: { userId },
        ...(propertyId && { propertyId }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: string) {
    const stockItem = await this.prisma.stockItem.findFirst({
      where: { id, property: { userId } },
    });
    if (!stockItem) {
      throw new NotFoundException('Item de estoque não encontrado');
    }
    return stockItem;
  }

  async create(dto: CreateStockItemDto, userId: string) {
    await this.assertPropertyOwnership(dto.propertyId, userId);
    return this.prisma.stockItem.create({ data: dto });
  }

  async update(id: number, dto: UpdateStockItemDto, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.stockItem.update({ where: { id }, data: dto });
  }

  async remove(id: number, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.stockItem.delete({ where: { id } });
    return { id };
  }

  private async assertPropertyOwnership(propertyId: number, userId: string) {
    const property = await this.prisma.property.findFirst({ where: { id: propertyId, userId } });
    if (!property) {
      throw new NotFoundException('Propriedade não encontrada');
    }
  }
}
