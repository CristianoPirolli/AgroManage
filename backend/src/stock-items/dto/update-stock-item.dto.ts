import { IsNumber, IsOptional, IsString, Length, Min } from 'class-validator';

export class UpdateStockItemDto {
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 80)
  category?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  unit?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minimumQuantity?: number;
}
