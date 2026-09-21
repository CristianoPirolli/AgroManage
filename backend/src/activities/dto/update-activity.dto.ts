import { IsDateString, IsInt, IsNumber, IsOptional, IsPositive, IsString, Length } from 'class-validator';

export class UpdateActivityDto {
  @IsOptional()
  @IsString()
  @Length(2, 150)
  title?: string;

  @IsOptional()
  @IsString()
  @Length(0, 2000)
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  cost?: number;

  @IsOptional()
  @IsString()
  @Length(2, 80)
  category?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  cropId?: number;
}
