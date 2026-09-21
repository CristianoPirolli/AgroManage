import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { CreateActivityDto } from './dto/create-activity.dto.js';
import { UpdateActivityDto } from './dto/update-activity.dto.js';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string, propertyId?: number) {
    return this.prisma.activity.findMany({
      where: {
        property: { userId },
        ...(propertyId && { propertyId }),
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: number, userId: string) {
    const activity = await this.prisma.activity.findFirst({
      where: { id, property: { userId } },
    });
    if (!activity) {
      throw new NotFoundException('Atividade não encontrada');
    }
    return activity;
  }

  async create(dto: CreateActivityDto, userId: string) {
    await this.assertPropertyOwnership(dto.propertyId, userId);
    if (dto.cropId) {
      await this.assertCropBelongsToProperty(dto.cropId, dto.propertyId);
    }
    return this.prisma.activity.create({
      data: { ...dto, date: new Date(dto.date) },
    });
  }

  async update(id: number, dto: UpdateActivityDto, userId: string) {
    const current = await this.findOne(id, userId);
    if (dto.cropId) {
      await this.assertCropBelongsToProperty(dto.cropId, current.propertyId);
    }
    return this.prisma.activity.update({
      where: { id },
      data: { ...dto, ...(dto.date && { date: new Date(dto.date) }) },
    });
  }

  async remove(id: number, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.activity.delete({ where: { id } });
    return { id };
  }

  private async assertPropertyOwnership(propertyId: number, userId: string) {
    const property = await this.prisma.property.findFirst({ where: { id: propertyId, userId } });
    if (!property) {
      throw new NotFoundException('Propriedade não encontrada');
    }
  }

  private async assertCropBelongsToProperty(cropId: number, propertyId: number) {
    const crop = await this.prisma.crop.findFirst({ where: { id: cropId, propertyId } });
    if (!crop) {
      throw new BadRequestException('Cultura não pertence a essa propriedade');
    }
  }
}
