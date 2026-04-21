import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { PrismaService } from "../../prisma/prisma.service";

// Mock bcrypt
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("$2b$12$hashedPassword"),
    compare: vi.fn().mockResolvedValue(true),
  },
  hash: vi.fn().mockResolvedValue("$2b$12$hashedPassword"),
  compare: vi.fn().mockResolvedValue(true),
}));

import * as bcrypt from "bcrypt";

const mockUser = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  email: "test@example.com",
  firstName: "John",
  lastName: "Doe",
  passwordHash: "$2b$12$hashedPassword",
  role: "tenant",
  status: "active",
  emailVerified: true,
  provider: "email",
  providerId: null,
  avatarUrl: null,
  bio: null,
  phone: null,
  whatsapp: null,
  nationality: null,
  languages: [],
  currentCity: null,
  currentCountry: null,
  preferredLang: "pt",
  displayName: null,
  isVerified: false,
  createdAt: new Date(),
  lastLoginAt: null,
  deletedAt: null,
};

describe("AuthService", () => {
  let service: AuthService;

  const mockPrisma = {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    refreshToken: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    passwordReset: {
      create: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
    loginAttempt: {
      count: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  const mockJwt = {
    sign: vi.fn().mockReturnValue("jwt-token"),
    verify: vi.fn(),
  };

  const mockConfig = {
    get: vi.fn().mockReturnValue("test-value"),
    getOrThrow: vi.fn().mockReturnValue("jwt-secret-test"),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwt },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  // ── register() ──

  describe("register", () => {
    it("should register a new user successfully", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.register({
        firstName: "John",
        lastName: "Doe",
        email: "test@example.com",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        acceptTerms: true,
      });

      expect(result.message).toBe(
        "Registration successful. Please verify your email.",
      );
      expect(result.userId).toBe(mockUser.id);
      expect(mockPrisma.user.create).toHaveBeenCalledOnce();
    });

    it("should throw BadRequestException when terms not accepted", async () => {
      await expect(
        service.register({
          firstName: "John",
          lastName: "Doe",
          email: "test@example.com",
          password: "Test@1234",
          confirmPassword: "Test@1234",
          acceptTerms: false,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw ConflictException when email already exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          firstName: "John",
          lastName: "Doe",
          email: "test@example.com",
          password: "Test@1234",
          confirmPassword: "Test@1234",
          acceptTerms: true,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("should lowercase email before saving", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      await service.register({
        firstName: "John",
        lastName: "Doe",
        email: "TEST@EXAMPLE.COM",
        password: "Test@1234",
        confirmPassword: "Test@1234",
        acceptTerms: true,
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { email: "test@example.com" },
        }),
      );
    });
  });

  // ── login() ──

  describe("login", () => {
    it("should login successfully with valid credentials", async () => {
      mockPrisma.loginAttempt.count.mockResolvedValue(0);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.loginAttempt.create.mockResolvedValue({});
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.login(
        { email: "test@example.com", password: "Test@1234" },
        "127.0.0.1",
        "Mozilla/5.0",
      );

      expect(result.accessToken).toBe("jwt-token");
      expect(result.user.email).toBe("test@example.com");
    });

    it("should throw UnauthorizedException when user not found", async () => {
      mockPrisma.loginAttempt.count.mockResolvedValue(0);
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.loginAttempt.create.mockResolvedValue({});

      await expect(
        service.login(
          { email: "wrong@example.com", password: "Test@1234" },
          "127.0.0.1",
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException when password is wrong", async () => {
      mockPrisma.loginAttempt.count.mockResolvedValue(0);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.loginAttempt.create.mockResolvedValue({});
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

      await expect(
        service.login(
          { email: "test@example.com", password: "WrongPass@1" },
          "127.0.0.1",
        ),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw ForbiddenException when email not verified", async () => {
      mockPrisma.loginAttempt.count.mockResolvedValue(0);
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        emailVerified: false,
      });
      mockPrisma.loginAttempt.create.mockResolvedValue({});

      await expect(
        service.login(
          { email: "test@example.com", password: "Test@1234" },
          "127.0.0.1",
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw ForbiddenException when account suspended", async () => {
      mockPrisma.loginAttempt.count.mockResolvedValue(0);
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        status: "suspended",
      });
      mockPrisma.loginAttempt.create.mockResolvedValue({});

      await expect(
        service.login(
          { email: "test@example.com", password: "Test@1234" },
          "127.0.0.1",
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should throw ForbiddenException when rate limit exceeded", async () => {
      mockPrisma.loginAttempt.count.mockResolvedValue(5);

      await expect(
        service.login(
          { email: "test@example.com", password: "Test@1234" },
          "127.0.0.1",
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it("should record failed login attempt when password wrong", async () => {
      mockPrisma.loginAttempt.count.mockResolvedValue(0);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.loginAttempt.create.mockResolvedValue({});
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

      await expect(
        service.login(
          { email: "test@example.com", password: "WrongPass@1" },
          "127.0.0.1",
        ),
      ).rejects.toThrow();

      expect(mockPrisma.loginAttempt.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: "test@example.com",
            success: false,
          }),
        }),
      );
    });
  });

  // ── logout() ──

  describe("logout", () => {
    it("should revoke all refresh tokens for user", async () => {
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 2 });

      const result = await service.logout(mockUser.id);

      expect(result.message).toBe("Logged out successfully");
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id, isRevoked: false },
        data: { isRevoked: true },
      });
    });
  });

  // ── refreshAccessToken() ──

  describe("refreshAccessToken", () => {
    it("should rotate tokens successfully", async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        id: "token-id",
        tokenHash: "hash",
        expiresAt: new Date(Date.now() + 86400000),
        isRevoked: false,
        user: mockUser,
      });
      mockPrisma.refreshToken.update.mockResolvedValue({});
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.refreshAccessToken("raw-refresh-token");

      expect(result.accessToken).toBe("jwt-token");
      expect(result.refreshToken).toBeDefined();
      expect(mockPrisma.refreshToken.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isRevoked: true } }),
      );
    });

    it("should throw UnauthorizedException when token not found", async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue(null);

      await expect(service.refreshAccessToken("invalid-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw UnauthorizedException when token expired", async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        id: "token-id",
        expiresAt: new Date(Date.now() - 86400000),
        isRevoked: false,
        user: mockUser,
      });

      await expect(service.refreshAccessToken("expired-token")).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it("should throw ForbiddenException when user account suspended", async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue({
        id: "token-id",
        expiresAt: new Date(Date.now() + 86400000),
        isRevoked: false,
        user: { ...mockUser, status: "suspended" },
      });

      await expect(service.refreshAccessToken("some-token")).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── verifyEmail() ──

  describe("verifyEmail", () => {
    it("should verify email successfully", async () => {
      mockJwt.verify.mockReturnValue({
        sub: mockUser.id,
        type: "email_verification",
      });
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        emailVerified: false,
      });
      mockPrisma.user.update.mockResolvedValue({});

      const result = await service.verifyEmail("valid-token");

      expect(result.message).toBe("Email verified successfully");
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { emailVerified: true } }),
      );
    });

    it("should return already verified message when email already verified", async () => {
      mockJwt.verify.mockReturnValue({
        sub: mockUser.id,
        type: "email_verification",
      });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.verifyEmail("valid-token");

      expect(result.message).toBe("Email already verified");
    });

    it("should throw BadRequestException when token is invalid", async () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error();
      });

      await expect(service.verifyEmail("invalid-token")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException when token type is wrong", async () => {
      mockJwt.verify.mockReturnValue({ sub: mockUser.id, type: "wrong_type" });

      await expect(service.verifyEmail("wrong-type-token")).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw NotFoundException when user not found", async () => {
      mockJwt.verify.mockReturnValue({
        sub: "nonexistent",
        type: "email_verification",
      });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.verifyEmail("valid-token")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── forgotPassword() ──

  describe("forgotPassword", () => {
    it("should create password reset token when user exists", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.passwordReset.create.mockResolvedValue({});

      const result = await service.forgotPassword("test@example.com");

      expect(result.message).toContain("If an account with that email exists");
      expect(mockPrisma.passwordReset.create).toHaveBeenCalledOnce();
    });

    it("should return same message when user does not exist (anti-enumeration)", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword("nonexistent@example.com");

      expect(result.message).toContain("If an account with that email exists");
      expect(mockPrisma.passwordReset.create).not.toHaveBeenCalled();
    });
  });

  // ── resetPassword() ──

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      mockPrisma.passwordReset.findFirst.mockResolvedValue({
        id: "reset-id",
        userId: mockUser.id,
        tokenHash: "hash",
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      });
      mockPrisma.$transaction.mockResolvedValue([]);

      const result = await service.resetPassword({
        token: "valid-reset-token",
        password: "NewPass@123",
        confirmPassword: "NewPass@123",
      });

      expect(result.message).toBe("Password reset successfully");
    });

    it("should throw BadRequestException when token invalid", async () => {
      mockPrisma.passwordReset.findFirst.mockResolvedValue(null);

      await expect(
        service.resetPassword({
          token: "invalid-token",
          password: "NewPass@123",
          confirmPassword: "NewPass@123",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException when token expired", async () => {
      mockPrisma.passwordReset.findFirst.mockResolvedValue({
        id: "reset-id",
        userId: mockUser.id,
        expiresAt: new Date(Date.now() - 3600000),
        usedAt: null,
      });

      await expect(
        service.resetPassword({
          token: "expired-token",
          password: "NewPass@123",
          confirmPassword: "NewPass@123",
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── googleLogin() ──

  describe("googleLogin", () => {
    it("should create new user for first-time Google login", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.googleLogin({
        providerId: "google-123",
        email: "test@gmail.com",
        firstName: "John",
        lastName: "Doe",
      });

      expect(result.accessToken).toBe("jwt-token");
      expect(mockPrisma.user.create).toHaveBeenCalledOnce();
    });

    it("should link Google to existing email account", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        provider: "email",
        providerId: null,
      });
      mockPrisma.user.update.mockResolvedValue(mockUser);
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await service.googleLogin({
        providerId: "google-123",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
      });

      expect(result.accessToken).toBe("jwt-token");
      // Should update to link google
      expect(mockPrisma.user.update).toHaveBeenCalled();
    });
  });

  // ── getProfile() ──

  describe("getProfile", () => {
    it("should return user profile", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser.id);

      expect(result.email).toBe("test@example.com");
    });

    it("should throw NotFoundException when user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile("nonexistent-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── getPublicProfile() ──

  describe("getPublicProfile", () => {
    it("should return public profile data", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: mockUser.id,
        firstName: mockUser.firstName,
        displayName: null,
        avatarUrl: null,
        bio: null,
        languages: [],
        isVerified: false,
        createdAt: mockUser.createdAt,
      });

      const result = await service.getPublicProfile(mockUser.id);

      expect(result.id).toBe(mockUser.id);
    });

    it("should throw NotFoundException when user not found or inactive", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getPublicProfile("nonexistent-id")).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ── updateProfile() ──

  describe("updateProfile", () => {
    it("should update profile successfully", async () => {
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        firstName: "Jane",
      });

      const result = await service.updateProfile(mockUser.id, {
        firstName: "Jane",
      });

      expect(result.firstName).toBe("Jane");
    });

    it("should sanitize bio field to prevent XSS", async () => {
      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        bio: "&lt;script&gt;alert()&lt;/script&gt;",
      });

      await service.updateProfile(mockUser.id, {
        bio: "<script>alert()</script>",
      });

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            bio: "&lt;script&gt;alert()&lt;/script&gt;",
          }),
        }),
      );
    });
  });

  // ── changePassword() ──

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        passwordHash: "$2b$12$hashedPassword",
      });
      mockPrisma.user.update.mockResolvedValue({});
      mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.changePassword(mockUser.id, {
        currentPassword: "OldPass@123",
        newPassword: "NewPass@456",
        confirmPassword: "NewPass@456",
      });

      expect(result.message).toBe("Password changed successfully");
      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalled();
    });

    it("should throw BadRequestException for OAuth accounts without password", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ passwordHash: null });

      await expect(
        service.changePassword(mockUser.id, {
          currentPassword: "OldPass@123",
          newPassword: "NewPass@456",
          confirmPassword: "NewPass@456",
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw UnauthorizedException when current password wrong", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        passwordHash: "$2b$12$hashedPassword",
      });
      vi.mocked(bcrypt.compare).mockResolvedValueOnce(false as never);

      await expect(
        service.changePassword(mockUser.id, {
          currentPassword: "WrongPass@1",
          newPassword: "NewPass@456",
          confirmPassword: "NewPass@456",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
