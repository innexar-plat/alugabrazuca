import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { LandingController } from "./landing.controller";
import { LandingService } from "./landing.service";

describe("LandingController", () => {
  let controller: LandingController;

  const mockService = {
    getFeatured: vi.fn(),
    getCities: vi.fn(),
    getStats: vi.fn(),
    getTestimonials: vi.fn(),
    submitContact: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LandingController],
      providers: [{ provide: LandingService, useValue: mockService }],
    }).compile();

    controller = module.get(LandingController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getFeatured", () => {
    it("should delegate to service.getFeatured", async () => {
      const expected = { data: [{ id: "1", title: "Room" }] };
      mockService.getFeatured.mockResolvedValue(expected);

      const result = await controller.getFeatured();

      expect(result).toBe(expected);
      expect(mockService.getFeatured).toHaveBeenCalledTimes(1);
    });
  });

  describe("getCities", () => {
    it("should delegate to service.getCities", async () => {
      const expected = { data: [{ city: "Orlando", count: 5 }] };
      mockService.getCities.mockResolvedValue(expected);

      const result = await controller.getCities();

      expect(result).toBe(expected);
      expect(mockService.getCities).toHaveBeenCalledTimes(1);
    });
  });

  describe("getStats", () => {
    it("should delegate to service.getStats", async () => {
      const expected = {
        data: {
          activeListings: 10,
          totalCities: 3,
          totalUsers: 50,
          totalReviews: 0,
        },
      };
      mockService.getStats.mockResolvedValue(expected);

      const result = await controller.getStats();

      expect(result).toBe(expected);
      expect(mockService.getStats).toHaveBeenCalledTimes(1);
    });
  });

  describe("getTestimonials", () => {
    it("should delegate to service.getTestimonials", async () => {
      const expected = { data: [{ id: "1", name: "Ana", text: "Great!" }] };
      mockService.getTestimonials.mockResolvedValue(expected);

      const result = await controller.getTestimonials();

      expect(result).toBe(expected);
      expect(mockService.getTestimonials).toHaveBeenCalledTimes(1);
    });
  });

  describe("submitContact", () => {
    it("should delegate to service.submitContact with dto", async () => {
      const dto = {
        name: "João",
        email: "joao@test.com",
        subject: "Dúvida",
        message: "Gostaria de saber mais sobre a plataforma.",
      };
      const expected = { message: "Message sent successfully" };
      mockService.submitContact.mockResolvedValue(expected);

      const result = await controller.submitContact(dto);

      expect(result).toBe(expected);
      expect(mockService.submitContact).toHaveBeenCalledWith(dto);
    });
  });
});
