import { Module } from '@nestjs/common';
import { StockItemsController } from './stock-items.controller.js';
import { StockItemsService } from './stock-items.service.js';

@Module({
  controllers: [StockItemsController],
  providers: [StockItemsService],
})
export class StockItemsModule {}
