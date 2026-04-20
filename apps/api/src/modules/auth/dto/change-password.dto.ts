import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { Match } from '../decorators/match.decorator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message:
      'newPassword must contain at least 1 uppercase letter, 1 number, and 1 special character',
  })
  newPassword!: string;

  @IsString()
  @IsNotEmpty()
  @Match('newPassword', { message: 'confirmPassword must match newPassword' })
  confirmPassword!: string;
}
