import { IsOptional, IsString, MaxLength } from "class-validator";

export class RejectInquiryDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}
