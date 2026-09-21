import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { CreateCropDto } from './dto/create-crop.dto.js';
import { UpdateCropDto } from './dto/update-crop.dto.js';

@Injectable()
export class CropsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string, propertyId?: number) {
    return this.prisma.crop.findMany({
      where: {
        property: { userId },
        ...(propertyId && { propertyId }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: string) {
    const crop = await this.prisma.crop.findFirst({
      where: { id, property: { userId } },
    });
    if (!crop) {
      throw new NotFoundException('Cultura não encontrada');
    }
    return crop;
  }

  async create(dto: CreateCropDto, userId: string) {
    await this.assertPropertyOwnership(dto.propertyId, userId);
    return this.prisma.crop.create({
      data: {
        ...dto,
        plantingDate: new Date(dto.plantingDate),
        expectedHarvestDate: dto.expectedHarvestDate ? new Date(dto.expectedHarvestDate) : undefined,
      },
    });
  }

  async update(id: number, dto: UpdateCropDto, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.crop.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.plantingDate && { plantingDate: new Date(dto.plantingDate) }),
        ...(dto.expectedHarvestDate && { expectedHarvestDate: new Date(dto.expectedHarvestDate) }),
      },
    });
  }

  async remove(id: number, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.crop.delete({ where: { id } });
    return { id };
  }

  private async assertPropertyOwnership(propertyId: number, userId: string) {
    const property = await this.prisma.property.findFirst({ where: { id: propertyId, userId } });
    if (!property) {
      throw new NotFoundException('Propriedade não encontrada');
    }
  }
}
