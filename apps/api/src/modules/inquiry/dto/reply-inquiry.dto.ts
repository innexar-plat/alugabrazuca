import { IsString, MinLength, MaxLength } from "class-validator";

export class ReplyInquiryDto {
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  message!: string;
}
