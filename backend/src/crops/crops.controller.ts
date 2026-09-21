import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CropsService } from './crops.service.js';
import { CreateCropDto } from './dto/create-crop.dto.js';
import { UpdateCropDto } from './dto/update-crop.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';

@UseGuards(JwtAuthGuard)
@Controller('crops')
export class CropsController {
  constructor(private readonly cropsService: CropsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query('propertyId') propertyId?: string) {
    return this.cropsService.findAll(user.id, propertyId ? Number(propertyId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.cropsService.findOne(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateCropDto, @CurrentUser() user: AuthenticatedUser) {
    return this.cropsService.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCropDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.cropsService.update(id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.cropsService.remove(id, user.id);
  }
}
