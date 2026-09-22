import { IsDateString, IsEnum, IsInt, IsNumber, IsPositive, IsString, Length } from 'class-validator';
import { ExpenseCategory } from '../../generated/prisma/enums.js';

export class CreateExpenseDto {
  @IsString()
  @Length(2, 200)
  description!: string;

  @IsNumber()
  @IsPositive()
  amount!: number;

  @IsEnum(ExpenseCategory)
  category!: ExpenseCategory;

  @IsDateString()
  date!: string;

  @IsInt()
  @IsPositive()
  propertyId!: number;
}
