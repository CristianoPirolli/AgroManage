import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { ExpenseCategory } from '../../generated/prisma/enums.js';

export class UpdateExpenseDto {
  @IsOptional()
  @IsString()
  @Length(2, 200)
  description?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @IsOptional()
  @IsDateString()
  date?: string;
}
