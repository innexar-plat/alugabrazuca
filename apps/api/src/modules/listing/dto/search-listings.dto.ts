import {
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  IsEnum,
  IsDateString,
  Min,
  Max,
  IsNumber,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  ListingType,
  RoomSize,
  BedType,
  BathroomType,
  KitchenAccess,
  LaundryAccess,
} from '@prisma/client';

export class SearchListingsDto {
  // ── Pagination ──
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  // ── Sort ──
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsString()
  order?: 'asc' | 'desc' = 'desc';

  // ── Text search ──
  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.trim() : value)
  query?: string;

  // ── Location ──
  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  // ── Price ──
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  utilitiesIncluded?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  internetIncluded?: boolean;

  // ── Room ──
  @IsOptional()
  @IsEnum(ListingType)
  listingType?: ListingType;

  @IsOptional()
  @IsEnum(RoomSize)
  roomSize?: RoomSize;

  @IsOptional()
  @IsEnum(BedType)
  bedType?: BedType;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isFurnished?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasWindow?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasLock?: boolean;

  // ── Bathroom ──
  @IsOptional()
  @IsEnum(BathroomType)
  bathroomType?: BathroomType;

  // ── Kitchen & Laundry ──
  @IsOptional()
  @IsEnum(KitchenAccess)
  kitchenAccess?: KitchenAccess;

  @IsOptional()
  @IsEnum(LaundryAccess)
  laundryAccess?: LaundryAccess;

  // ── Rules ──
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  allowsPets?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  allowsSmoking?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  allowsCouples?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  allowsChildren?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  lgbtFriendly?: boolean;

  // ── Availability ──
  @IsOptional()
  @IsDateString()
  availableFrom?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  minimumStayMax?: number;

  // ── Other ──
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasParking?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasPool?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  hasContract?: boolean;
}
