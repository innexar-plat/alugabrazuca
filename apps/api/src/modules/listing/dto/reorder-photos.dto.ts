import { IsArray, IsInt, Min, ArrayMinSize } from "class-validator";
import { Type } from "class-transformer";

export class ReorderPhotosDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Type(() => Number)
  photoIds!: string[];
}
