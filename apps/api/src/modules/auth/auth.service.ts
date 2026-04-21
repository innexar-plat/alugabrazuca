import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import * as crypto from "crypto";
import { PrismaService } from "../../prisma/prisma.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { JwtPayload } from "./strategies/jwt.strategy";

const BCRYPT_SALT_ROUNDS = 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_BLOCK_MINUTES = 15;
const REFRESH_TOKEN_DAYS = 7;
const PASSWORD_RESET_HOURS = 1;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  // ─── Register ──────────────────────────────────────────────────────

  async register(dto: RegisterDto) {
    if (!dto.acceptTerms) {
      throw new BadRequestException("You must accept the terms of service");
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email.toLowerCase(),
        passwordHash,
        phone: dto.phone,
      },
    });

    // TODO: Enviar e-mail de verificação (módulo de email futuro)
    const emailToken = this.generateEmailVerificationToken(user.id);

    return {
      message: "Registration successful. Please verify your email.",
      userId: user.id,
      emailVerificationToken: emailToken, // Temporário — em prod vai por e-mail
    };
  }

  // ─── Login ─────────────────────────────────────────────────────────

  async login(dto: LoginDto, ip: string, userAgent?: string) {
    const email = dto.email.toLowerCase();

    // Check rate limiting
    await this.checkLoginRateLimit(email);

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      await this.recordLoginAttempt(email, ip, false, userAgent);
      throw new UnauthorizedException("Invalid email or password");
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      await this.recordLoginAttempt(email, ip, false, userAgent);
      throw new UnauthorizedException("Invalid email or password");
    }

    if (!user.emailVerified) {
      throw new ForbiddenException(
        "Email not verified. Please check your inbox.",
      );
    }

    if (user.status !== "active") {
      throw new ForbiddenException("Account is suspended or banned");
    }

    await this.recordLoginAttempt(email, ip, true, userAgent);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  // ─── Logout ────────────────────────────────────────────────────────

  async logout(userId: string) {
    // Revoke all refresh tokens for this user
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });
    return { message: "Logged out successfully" };
  }

  // ─── Refresh Token ─────────────────────────────────────────────────

  async refreshAccessToken(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);

    const stored = await this.prisma.refreshToken.findFirst({
      where: { tokenHash, isRevoked: false },
      include: { user: true },
    });

    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException("Invalid or expired refresh token");
    }

    if (stored.user.status !== "active") {
      throw new ForbiddenException("Account is suspended or banned");
    }

    // Rotate: revoke old, create new
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { isRevoked: true },
    });

    const tokens = await this.generateTokens(
      stored.user.id,
      stored.user.email,
      stored.user.role,
    );

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  // ─── Verify Email ──────────────────────────────────────────────────

  async verifyEmail(token: string) {
    let payload: { sub: string; type: string };
    try {
      payload = this.jwt.verify(token, {
        secret: this.config.getOrThrow<string>("JWT_SECRET"),
      });
    } catch {
      throw new BadRequestException("Invalid or expired verification token");
    }

    if (payload.type !== "email_verification") {
      throw new BadRequestException("Invalid token type");
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    if (user.emailVerified) {
      return { message: "Email already verified" };
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    return { message: "Email verified successfully" };
  }

  // ─── Forgot Password ──────────────────────────────────────────────

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return {
        message:
          "If an account with that email exists, a reset link has been sent.",
      };
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawToken);

    await this.prisma.passwordReset.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + PASSWORD_RESET_HOURS * 60 * 60 * 1000),
      },
    });

    // TODO: Enviar e-mail com link de reset (módulo de email futuro)
    return {
      message:
        "If an account with that email exists, a reset link has been sent.",
      resetToken: rawToken, // Temporário — em prod vai por e-mail
    };
  }

  // ─── Reset Password ───────────────────────────────────────────────

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);

    const resetRecord = await this.prisma.passwordReset.findFirst({
      where: { tokenHash, usedAt: null },
    });

    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    await this.prisma.$transaction([
      // Update password
      this.prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      // Mark token as used
      this.prisma.passwordReset.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
      // Revoke all refresh tokens
      this.prisma.refreshToken.updateMany({
        where: { userId: resetRecord.userId },
        data: { isRevoked: true },
      }),
    ]);

    return { message: "Password reset successfully" };
  }

  // ─── Google OAuth ──────────────────────────────────────────────────

  async googleLogin(profile: {
    providerId: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  }) {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email.toLowerCase() },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email.toLowerCase(),
          provider: "google",
          providerId: profile.providerId,
          avatarUrl: profile.avatarUrl,
          emailVerified: true, // Google verified
        },
      });
    } else if (user.provider === "email" && !user.providerId) {
      // Link Google account to existing email account
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          providerId: profile.providerId,
          emailVerified: true,
          avatarUrl: user.avatarUrl || profile.avatarUrl,
        },
      });
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const tokens = await this.generateTokens(user.id, user.email, user.role);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    };
  }

  // ─── Profile ───────────────────────────────────────────────────────

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        email: true,
        phone: true,
        whatsapp: true,
        avatarUrl: true,
        bio: true,
        nationality: true,
        languages: true,
        currentCity: true,
        currentCountry: true,
        preferredLang: true,
        role: true,
        status: true,
        isVerified: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async getPublicProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId, deletedAt: null, status: "active" },
      select: {
        id: true,
        displayName: true,
        firstName: true,
        avatarUrl: true,
        bio: true,
        languages: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    // Sanitize bio to prevent XSS
    if (dto.bio) {
      dto.bio = this.sanitizeText(dto.bio);
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        displayName: true,
        email: true,
        phone: true,
        whatsapp: true,
        avatarUrl: true,
        bio: true,
        nationality: true,
        languages: true,
        currentCity: true,
        currentCountry: true,
        preferredLang: true,
        role: true,
      },
    });

    return user;
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user || !user.passwordHash) {
      throw new BadRequestException(
        "Cannot change password for OAuth accounts",
      );
    }

    const isValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!isValid) {
      throw new UnauthorizedException("Current password is incorrect");
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, BCRYPT_SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all refresh tokens for security
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    return { message: "Password changed successfully" };
  }

  // ─── Private Helpers ───────────────────────────────────────────────

  private async generateTokens(userId: string, email: string, role: string) {
    const payload: JwtPayload = { sub: userId, email, role };

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>("JWT_SECRET"),
      expiresIn: this.config.get("JWT_EXPIRES_IN", "15m"),
    });

    const rawRefreshToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = this.hashToken(rawRefreshToken);

    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(
          Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
        ),
      },
    });

    return { accessToken, refreshToken: rawRefreshToken };
  }

  private generateEmailVerificationToken(userId: string): string {
    return this.jwt.sign(
      { sub: userId, type: "email_verification" },
      {
        secret: this.config.getOrThrow<string>("JWT_SECRET"),
        expiresIn: "24h",
      },
    );
  }

  private hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  private async checkLoginRateLimit(email: string) {
    const since = new Date(Date.now() - LOGIN_BLOCK_MINUTES * 60 * 1000);

    const failedAttempts = await this.prisma.loginAttempt.count({
      where: {
        email,
        success: false,
        createdAt: { gte: since },
      },
    });

    if (failedAttempts >= MAX_LOGIN_ATTEMPTS) {
      throw new ForbiddenException(
        `Too many login attempts. Please try again in ${LOGIN_BLOCK_MINUTES} minutes.`,
      );
    }
  }

  private async recordLoginAttempt(
    email: string,
    ipAddress: string,
    success: boolean,
    userAgent?: string,
  ) {
    await this.prisma.loginAttempt.create({
      data: { email, ipAddress, success, userAgent },
    });
  }

  private sanitizeText(text: string): string {
    return text
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;");
  }
}
