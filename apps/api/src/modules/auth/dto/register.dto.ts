import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  IsBoolean,
} from "class-validator";
import { Transform } from "class-transformer";
import { Match } from "../decorators/match.decorator";

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message:
      "password must contain at least 1 uppercase letter, 1 number, and 1 special character",
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  @Match("password", { message: "confirmPassword must match password" })
  confirmPassword!: string;

  @IsOptional()
  @IsString()
  @Transform(({ value }) =>
    typeof value === "string" ? value.replace(/[\s()\-./]/g, "") : value,
  )
  @Matches(/^\+\d{7,15}$/, {
    message: "phone must be in international format (e.g. +14079855662)",
  })
  phone?: string;

  @IsBoolean()
  @IsNotEmpty()
  acceptTerms!: boolean;
}
