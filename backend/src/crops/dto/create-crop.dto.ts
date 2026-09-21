import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { CropStatus } from '../../generated/prisma/enums.js';

export class CreateCropDto {
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsNumber()
  @IsPositive()
  plantedArea!: number;

  @IsDateString()
  plantingDate!: string;

  @IsOptional()
  @IsDateString()
  expectedHarvestDate?: string;

  @IsOptional()
  @IsEnum(CropStatus)
  status?: CropStatus;

  @IsInt()
  @IsPositive()
  propertyId!: number;
}
