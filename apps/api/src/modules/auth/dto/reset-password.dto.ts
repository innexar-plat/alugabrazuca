import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';
import { Match } from '../decorators/match.decorator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message:
      'password must contain at least 1 uppercase letter, 1 number, and 1 special character',
  })
  password!: string;

  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'confirmPassword must match password' })
  confirmPassword!: string;
}
