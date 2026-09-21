import { IsNumber, IsOptional, IsPositive, IsString, Length } from 'class-validator';

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  @Length(2, 120)
  name?: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  location?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  city?: string;

  @IsOptional()
  @IsString()
  @Length(2, 2)
  state?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  totalArea?: number;
}
