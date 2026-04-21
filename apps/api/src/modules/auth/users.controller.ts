import {
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
  Body,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards";
import { CurrentUser } from "./decorators";
import { UpdateProfileDto, ChangePasswordDto } from "./dto";

@Controller("users")
export class UsersController {
  constructor(private readonly authService: AuthService) {}

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser("id") userId: string) {
    return this.authService.getProfile(userId);
  }

  @Patch("me")
  @UseGuards(JwtAuthGuard)
  async updateProfile(
    @CurrentUser("id") userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, dto);
  }

  @Patch("me/password")
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @CurrentUser("id") userId: string,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }

  // TODO: POST me/avatar — upload (requer S3/MinIO integration)
  // TODO: DELETE me/avatar — remover foto

  @Get(":id/public")
  async getPublicProfile(@Param("id") id: string) {
    return this.authService.getPublicProfile(id);
  }
}
