import {
  IsEnum,
  IsString,
  MinLength,
  MaxLength,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsUUID,
} from "class-validator";
import { InquiryType } from "@prisma/client";

export class CreateInquiryDto {
  @IsUUID()
  listingId!: string;

  @IsEnum(InquiryType)
  type!: InquiryType;

  @IsString()
  @MinLength(20)
  @MaxLength(1000)
  message!: string;

  @IsOptional()
  @IsDateString()
  moveInDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  stayDuration?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  occupants?: number;

  @IsOptional()
  @IsBoolean()
  hasPets?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  petDetails?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  occupation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  aboutMe?: string;
}
