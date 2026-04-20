import {
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.replace(/[\s()\-./]/g, '') : value)
  @Matches(/^\+\d{7,15}$/, {
    message: 'phone must be in international format (e.g. +14079855662)',
  })
  phone?: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => typeof value === 'string' ? value.replace(/[\s()\-./]/g, '') : value)
  @Matches(/^\+\d{7,15}$/, {
    message: 'whatsapp must be in international format (e.g. +14079855662)',
  })
  whatsapp?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  nationality?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(100)
  currentCity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  currentCountry?: string;

  @IsOptional()
  @IsEnum(['pt', 'en', 'es'])
  preferredLang?: 'pt' | 'en' | 'es';
}
