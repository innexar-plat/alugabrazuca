import {
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsArray,
  IsDateString,
  MinLength,
  MaxLength,
  Min,
  Max,
  IsInt,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import {
  PropertyType,
  ListingType,
  RoomSize,
  BedType,
  BathroomType,
  KitchenAccess,
  LaundryAccess,
  ParkingType,
  PetPolicy,
  SmokingPolicy,
  VisitorPolicy,
  Currency,
} from "@prisma/client";

@ValidatorConstraint({ name: "isAfterField", async: false })
class IsAfterAvailableFrom implements ValidatorConstraintInterface {
  validate(value: string, args: ValidationArguments) {
    const obj = args.object as any;
    if (!value || !obj.availableFrom) return true;
    return new Date(value) >= new Date(obj.availableFrom);
  }
  defaultMessage() {
    return "availableTo must be equal to or after availableFrom";
  }
}

export class CreateListingDto {
  // ── Basic ──
  @IsString()
  @MinLength(10)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(50)
  @MaxLength(2000)
  description!: string;

  @IsEnum(PropertyType)
  propertyType!: PropertyType;

  @IsEnum(ListingType)
  listingType!: ListingType;

  // ── Location ──
  @IsString()
  @MaxLength(50)
  country!: string;

  @IsString()
  @MaxLength(50)
  state!: string;

  @IsString()
  @MaxLength(100)
  city!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  neighborhood?: string;

  @IsString()
  @MaxLength(20)
  zipCode!: string;

  @IsString()
  @MaxLength(255)
  streetAddress!: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nearbyLocations?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(255)
  publicTransport?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  distanceToDowntown?: string;

  // ── Room ──
  @IsEnum(RoomSize)
  roomSize!: RoomSize;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  roomSizeSqft?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  floorLevel?: number;

  @IsBoolean()
  hasWindow!: boolean;

  @IsBoolean()
  hasCloset!: boolean;

  @IsBoolean()
  hasLock!: boolean;

  @IsBoolean()
  isFurnished!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  naturalLight?: string;

  @IsEnum(BedType)
  bedType!: BedType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  @Type(() => Number)
  bedCount?: number;

  @IsOptional()
  @IsBoolean()
  bedsheetsProvided?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roomFurniture?: string[];

  // ── Bathroom ──
  @IsEnum(BathroomType)
  bathroomType!: BathroomType;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  bathroomCount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  sharedWithCount?: number;

  @IsOptional()
  @IsBoolean()
  hasBathtub?: boolean;

  @IsOptional()
  @IsBoolean()
  hasShower?: boolean;

  @IsOptional()
  @IsBoolean()
  hasBidet?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  hotWater?: string;

  @IsOptional()
  @IsBoolean()
  towelsProvided?: boolean;

  // ── Kitchen ──
  @IsEnum(KitchenAccess)
  kitchenAccess!: KitchenAccess;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  kitchenSchedule?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kitchenAppliances?: string[];

  @IsOptional()
  @IsBoolean()
  hasOwnCabinetSpace?: boolean;

  @IsOptional()
  @IsBoolean()
  hasOwnFridgeSpace?: boolean;

  // ── Laundry ──
  @IsEnum(LaundryAccess)
  laundryAccess!: LaundryAccess;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  laundryFrequency?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  laundryCost?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  laundryCostAmount?: number;

  @IsOptional()
  @IsBoolean()
  hasDryer?: boolean;

  @IsOptional()
  @IsBoolean()
  hasIron?: boolean;

  // ── Living & Parking ──
  @IsOptional()
  @IsBoolean()
  livingRoomAccess?: boolean;

  @IsOptional()
  @IsBoolean()
  livingRoomShared?: boolean;

  @IsEnum(ParkingType)
  parkingType!: ParkingType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  parkingCost?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  parkingSpaces?: number;

  // ── Outdoor ──
  @IsOptional()
  @IsBoolean()
  hasBackyard?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPatio?: boolean;

  @IsOptional()
  @IsBoolean()
  hasBalcony?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPool?: boolean;

  @IsOptional()
  @IsBoolean()
  hasBBQArea?: boolean;

  // ── Amenities ──
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  // ── Price ──
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  pricePerMonth!: number;

  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  securityDeposit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  depositMonths?: number;

  @IsBoolean()
  utilitiesIncluded!: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  utilitiesEstimate?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  utilitiesDetails?: string;

  @IsBoolean()
  internetIncluded!: boolean;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Type(() => Number)
  minimumStay?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  maximumStay?: number;

  @IsDateString()
  availableFrom!: string;

  @IsOptional()
  @IsDateString()
  @Validate(IsAfterAvailableFrom)
  availableTo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paymentMethods?: string[];

  @IsOptional()
  @IsBoolean()
  priceNegotiable?: boolean;

  // ── House Rules ──
  @IsEnum(PetPolicy)
  allowsPets!: PetPolicy;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  petDeposit?: number;

  @IsEnum(SmokingPolicy)
  allowsSmoking!: SmokingPolicy;

  @IsBoolean()
  allowsCouples!: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  coupleExtraCharge?: number;

  @IsBoolean()
  allowsChildren!: boolean;

  @IsEnum(VisitorPolicy)
  allowsVisitors!: VisitorPolicy;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  quietHours?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  @Type(() => Number)
  maxOccupants?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @Transform(({ value }) =>
    typeof value === "string" ? value.replace(/<[^>]*>/g, "") : value,
  )
  additionalRules?: string;

  // ── Tenant Preferences ──
  @IsOptional()
  @IsString()
  @MaxLength(10)
  preferredGender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  preferredAge?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  preferredOccupation?: string;

  @IsOptional()
  @IsBoolean()
  lgbtFriendly?: boolean;

  @IsOptional()
  @IsBoolean()
  prefersBrazilian?: boolean;

  // ── Housing Info ──
  @IsInt()
  @Min(1)
  @Type(() => Number)
  totalRooms!: number;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  totalBathrooms!: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  currentOccupants!: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  occupantsGender?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  occupantsDescription?: string;

  @IsBoolean()
  hostLivesIn!: boolean;

  @IsBoolean()
  hasContract!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  contractType?: string;

  // ── Media ──
  @IsOptional()
  @IsString()
  @MaxLength(500)
  videoUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  virtualTourUrl?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  coverPhotoIndex?: number;
}
