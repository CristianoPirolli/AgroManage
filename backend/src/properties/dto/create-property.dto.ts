import { IsNumber, IsOptional, IsPositive, IsString, Length } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  @Length(2, 120)
  name!: string;

  @IsOptional()
  @IsString()
  @Length(2, 200)
  location?: string;

  @IsString()
  @Length(2, 100)
  city!: string;

  @IsString()
  @Length(2, 2)
  state!: string;

  @IsNumber()
  @IsPositive()
  totalArea!: number;
}
