import { IsInt, IsNumber, IsPositive, IsString, Length, Min } from 'class-validator';

export class CreateStockItemDto {
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsString()
  @Length(2, 80)
  category!: string;

  @IsNumber()
  @Min(0)
  quantity!: number;

  @IsString()
  @Length(1, 20)
  unit!: string;

  @IsNumber()
  @Min(0)
  minimumQuantity!: number;

  @IsInt()
  @IsPositive()
  propertyId!: number;
}
