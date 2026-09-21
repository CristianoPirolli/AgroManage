import { IsDateString, IsEnum, IsNumber, IsOptional, IsPositive, IsString, Length } from 'class-validator';
import { CropStatus } from '../../generated/prisma/enums.js';

export class UpdateCropDto {
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  plantedArea?: number;

  @IsOptional()
  @IsDateString()
  plantingDate?: string;

  @IsOptional()
  @IsDateString()
  expectedHarvestDate?: string;

  @IsOptional()
  @IsEnum(CropStatus)
  status?: CropStatus;
}
