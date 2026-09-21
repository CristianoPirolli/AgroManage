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
import { StockItemsService } from './stock-items.service.js';
import { CreateStockItemDto } from './dto/create-stock-item.dto.js';
import { UpdateStockItemDto } from './dto/update-stock-item.dto.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';

@UseGuards(JwtAuthGuard)
@Controller('stock-items')
export class StockItemsController {
  constructor(private readonly stockItemsService: StockItemsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser, @Query('propertyId') propertyId?: string) {
    return this.stockItemsService.findAll(user.id, propertyId ? Number(propertyId) : undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.stockItemsService.findOne(id, user.id);
  }

  @Post()
  create(@Body() dto: CreateStockItemDto, @CurrentUser() user: AuthenticatedUser) {
    return this.stockItemsService.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateStockItemDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.stockItemsService.update(id, dto, user.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.stockItemsService.remove(id, user.id);
  }
}
