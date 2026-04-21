import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import {
  RegisterDto,
  LoginDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "./dto";
import { JwtAuthGuard, GoogleAuthGuard } from "./guards";
import { CurrentUser } from "./decorators";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post("register")
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
    const userAgent = req.headers["user-agent"];

    const result = await this.authService.login(dto, ip, userAgent);

    // Set refresh token as httpOnly cookie
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: this.config.get("APP_ENV") === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/api/v1/auth",
    });

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  @Post("logout")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser("id") userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logout(userId);
    res.clearCookie("refreshToken", { path: "/api/v1/auth" });
    return result;
  }

  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return { statusCode: 401, message: "Refresh token not found" };
    }

    const tokens = await this.authService.refreshAccessToken(refreshToken);

    res.cookie("refreshToken", tokens.refreshToken, {
      httpOnly: true,
      secure: this.config.get("APP_ENV") === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/v1/auth",
    });

    return { accessToken: tokens.accessToken };
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Get("verify-email/:token")
  async verifyEmail(@Param("token") token: string) {
    return this.authService.verifyEmail(token);
  }

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  googleAuth() {
    // Guard redirects to Google
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  async googleCallback(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const profile = req.user as {
      providerId: string;
      email: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };

    const result = await this.authService.googleLogin(profile);

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: this.config.get("APP_ENV") === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/api/v1/auth",
    });

    // Redirect to frontend with access token
    const frontendUrl = this.config.get("APP_URL", "http://localhost:3000");
    res.redirect(`${frontendUrl}/auth/callback?token=${result.accessToken}`);
  }
}
