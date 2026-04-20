import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { AuthService } from './auth.service';

describe('UsersController', () => {
  let controller: UsersController;

  const mockAuthService = {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    changePassword: vi.fn(),
    getPublicProfile: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  describe('getProfile', () => {
    it('should delegate to authService.getProfile', async () => {
      mockAuthService.getProfile.mockResolvedValue({ id: 'uid', email: 'j@e.com' });

      const result = await controller.getProfile('uid');

      expect(mockAuthService.getProfile).toHaveBeenCalledWith('uid');
      expect(result.id).toBe('uid');
    });
  });

  describe('updateProfile', () => {
    it('should delegate to authService.updateProfile', async () => {
      const dto = { firstName: 'Jane' };
      mockAuthService.updateProfile.mockResolvedValue({ id: 'uid', firstName: 'Jane' });

      const result = await controller.updateProfile('uid', dto);

      expect(mockAuthService.updateProfile).toHaveBeenCalledWith('uid', dto);
      expect(result.firstName).toBe('Jane');
    });
  });

  describe('changePassword', () => {
    it('should delegate to authService.changePassword', async () => {
      const dto = { currentPassword: 'Old@1234', newPassword: 'New@5678', confirmPassword: 'New@5678' };
      mockAuthService.changePassword.mockResolvedValue({ message: 'Password changed successfully' });

      const result = await controller.changePassword('uid', dto);

      expect(mockAuthService.changePassword).toHaveBeenCalledWith('uid', dto);
      expect(result.message).toBe('Password changed successfully');
    });
  });

  describe('getPublicProfile', () => {
    it('should delegate to authService.getPublicProfile', async () => {
      mockAuthService.getPublicProfile.mockResolvedValue({ id: 'uid', firstName: 'John' });

      const result = await controller.getPublicProfile('uid');

      expect(mockAuthService.getPublicProfile).toHaveBeenCalledWith('uid');
      expect(result.id).toBe('uid');
    });
  });
});
