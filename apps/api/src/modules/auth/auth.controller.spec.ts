import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

describe("AuthController", () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    refreshAccessToken: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    verifyEmail: vi.fn(),
    googleLogin: vi.fn(),
  };

  const mockConfig = {
    get: vi.fn().mockReturnValue("development"),
  };

  const mockResponse = {
    cookie: vi.fn(),
    clearCookie: vi.fn(),
    redirect: vi.fn(),
  } as any;

  const mockRequest = {
    ip: "127.0.0.1",
    headers: { "user-agent": "Mozilla/5.0" },
    socket: { remoteAddress: "127.0.0.1" },
    cookies: {},
    user: null,
  } as any;

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfig },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe("register", () => {
    it("should delegate to authService.register", async () => {
      const dto = {
        firstName: "John",
        lastName: "Doe",
        email: "j@e.com",
        password: "P@ss1234",
        confirmPassword: "P@ss1234",
        acceptTerms: true,
      };
      mockAuthService.register.mockResolvedValue({
        message: "ok",
        userId: "id",
      });

      const result = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result.userId).toBe("id");
    });
  });

  describe("login", () => {
    it("should delegate to authService.login and set cookie", async () => {
      const dto = { email: "j@e.com", password: "P@ss1234" };
      mockAuthService.login.mockResolvedValue({
        accessToken: "at",
        refreshToken: "rt",
        user: { id: "id", email: "j@e.com" },
      });

      const result = await controller.login(dto, mockRequest, mockResponse);

      expect(mockAuthService.login).toHaveBeenCalledWith(
        dto,
        "127.0.0.1",
        "Mozilla/5.0",
      );
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "rt",
        expect.objectContaining({ httpOnly: true }),
      );
      expect(result.accessToken).toBe("at");
      // refreshToken should NOT be in response body (only cookie)
      expect(result).not.toHaveProperty("refreshToken");
    });
  });

  describe("logout", () => {
    it("should delegate to authService.logout and clear cookie", async () => {
      mockAuthService.logout.mockResolvedValue({
        message: "Logged out successfully",
      });

      const result = await controller.logout("user-id", mockResponse);

      expect(mockAuthService.logout).toHaveBeenCalledWith("user-id");
      expect(mockResponse.clearCookie).toHaveBeenCalledWith(
        "refreshToken",
        expect.any(Object),
      );
    });
  });

  describe("refresh", () => {
    it("should delegate to authService.refreshAccessToken", async () => {
      const reqWithCookie = { ...mockRequest, cookies: { refreshToken: "rt" } };
      mockAuthService.refreshAccessToken.mockResolvedValue({
        accessToken: "new-at",
        refreshToken: "new-rt",
      });

      const result = await controller.refresh(reqWithCookie, mockResponse);

      expect(mockAuthService.refreshAccessToken).toHaveBeenCalledWith("rt");
      expect(result.accessToken).toBe("new-at");
    });

    it("should return 401 message when no refresh token in cookie", async () => {
      const result = await controller.refresh(mockRequest, mockResponse);

      expect(result).toEqual({
        statusCode: 401,
        message: "Refresh token not found",
      });
    });
  });

  describe("forgotPassword", () => {
    it("should delegate to authService.forgotPassword", async () => {
      mockAuthService.forgotPassword.mockResolvedValue({ message: "sent" });

      const result = await controller.forgotPassword({ email: "j@e.com" });

      expect(mockAuthService.forgotPassword).toHaveBeenCalledWith("j@e.com");
    });
  });

  describe("resetPassword", () => {
    it("should delegate to authService.resetPassword", async () => {
      const dto = {
        token: "tok",
        password: "New@1234",
        confirmPassword: "New@1234",
      };
      mockAuthService.resetPassword.mockResolvedValue({ message: "ok" });

      await controller.resetPassword(dto);

      expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto);
    });
  });

  describe("verifyEmail", () => {
    it("should delegate to authService.verifyEmail", async () => {
      mockAuthService.verifyEmail.mockResolvedValue({ message: "verified" });

      const result = await controller.verifyEmail("some-token");

      expect(mockAuthService.verifyEmail).toHaveBeenCalledWith("some-token");
    });
  });

  describe("googleCallback", () => {
    it("should delegate to authService.googleLogin and redirect", async () => {
      const profile = {
        providerId: "g123",
        email: "john@gmail.com",
        firstName: "John",
        lastName: "Doe",
      };
      const reqWithUser = { ...mockRequest, user: profile };
      mockAuthService.googleLogin.mockResolvedValue({
        accessToken: "gat",
        refreshToken: "grt",
        user: { id: "id" },
      });
      mockConfig.get.mockReturnValue("http://localhost:3000");

      await controller.googleCallback(reqWithUser, mockResponse);

      expect(mockAuthService.googleLogin).toHaveBeenCalledWith(profile);
      expect(mockResponse.cookie).toHaveBeenCalled();
      expect(mockResponse.redirect).toHaveBeenCalledWith(
        "http://localhost:3000/auth/callback?token=gat",
      );
    });
  });
});
