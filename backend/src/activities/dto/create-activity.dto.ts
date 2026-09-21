import { IsDateString, IsInt, IsNumber, IsOptional, IsPositive, IsString, Length } from 'class-validator';

export class CreateActivityDto {
  @IsString()
  @Length(2, 150)
  title!: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @IsDateString()
  date!: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  cost?: number;

  @IsString()
  @Length(2, 80)
  category!: string;

  @IsInt()
  @IsPositive()
  propertyId!: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  cropId?: number;
}
