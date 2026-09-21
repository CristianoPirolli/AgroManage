import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service.js';
import { CreatePropertyDto } from './dto/create-property.dto.js';
import { UpdatePropertyDto } from './dto/update-property.dto.js';

@Injectable()
export class PropertiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.property.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number, userId: string) {
    const property = await this.prisma.property.findFirst({ where: { id, userId } });
    if (!property) {
      throw new NotFoundException('Propriedade não encontrada');
    }
    return property;
  }

  create(dto: CreatePropertyDto, userId: string) {
    return this.prisma.property.create({ data: { ...dto, userId } });
  }

  async update(id: number, dto: UpdatePropertyDto, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.property.update({ where: { id }, data: dto });
  }

  async remove(id: number, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.property.delete({ where: { id } });
    return { id };
  }
}
