import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthController } from './health.controller.js';
import { AuthModule } from './auth/auth.module.js';
import { PropertiesModule } from './properties/properties.module.js';
import { CropsModule } from './crops/crops.module.js';
import { ActivitiesModule } from './activities/activities.module.js';
import { StockItemsModule } from './stock-items/stock-items.module.js';
import { ExpensesModule } from './expenses/expenses.module.js';
import { env } from './config/env.js';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: env.JWT_SECRET,
      signOptions: { expiresIn: '7d' },
    }),
    AuthModule,
    PropertiesModule,
    CropsModule,
    ActivitiesModule,
    StockItemsModule,
    ExpensesModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
