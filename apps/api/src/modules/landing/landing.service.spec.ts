import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { LandingService } from "./landing.service";
import { PrismaService } from "../../prisma/prisma.service";

describe("LandingService", () => {
  let service: LandingService;

  const mockPrisma = {
    listing: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
      count: vi.fn(),
    },
    user: {
      count: vi.fn(),
    },
    contactMessage: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LandingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(LandingService);
  });

  // ── getFeatured ──────────────────────────────────

  describe("getFeatured", () => {
    it("should return featured listings when enough exist", async () => {
      const featured = Array.from({ length: 6 }, (_, i) => ({
        id: `id-${i}`,
        title: `Room ${i}`,
        isFeatured: true,
      }));
      mockPrisma.listing.findMany.mockResolvedValueOnce(featured);

      const result = await service.getFeatured();

      expect(result.data).toHaveLength(6);
      expect(mockPrisma.listing.findMany).toHaveBeenCalledTimes(1);
    });

    it("should fill with recent listings when not enough featured", async () => {
      const featured = [{ id: "featured-1", title: "Featured Room" }];
      const additional = Array.from({ length: 7 }, (_, i) => ({
        id: `additional-${i}`,
        title: `Room ${i}`,
      }));
      mockPrisma.listing.findMany
        .mockResolvedValueOnce(featured)
        .mockResolvedValueOnce(additional);

      const result = await service.getFeatured();

      expect(result.data).toHaveLength(8);
      expect(mockPrisma.listing.findMany).toHaveBeenCalledTimes(2);
    });

    it("should exclude already fetched featured IDs from additional query", async () => {
      mockPrisma.listing.findMany
        .mockResolvedValueOnce([{ id: "feat-1" }])
        .mockResolvedValueOnce([{ id: "add-1" }]);

      await service.getFeatured();

      const secondCall = mockPrisma.listing.findMany.mock.calls[1][0];
      expect(secondCall.where.id.notIn).toContain("feat-1");
    });

    it("should return empty data if no listings exist", async () => {
      mockPrisma.listing.findMany.mockResolvedValueOnce([]);
      mockPrisma.listing.findMany.mockResolvedValueOnce([]);

      const result = await service.getFeatured();

      expect(result.data).toHaveLength(0);
    });
  });

  // ── getCities ────────────────────────────────────

  describe("getCities", () => {
    it("should return grouped cities with count", async () => {
      const groups = [
        { country: "US", state: "FL", city: "Orlando", _count: { id: 15 } },
        { country: "US", state: "NJ", city: "Newark", _count: { id: 8 } },
      ];
      mockPrisma.listing.groupBy.mockResolvedValueOnce(groups);

      const result = await service.getCities();

      expect(result.data).toEqual([
        { country: "US", state: "FL", city: "Orlando", count: 15 },
        { country: "US", state: "NJ", city: "Newark", count: 8 },
      ]);
    });

    it("should return empty array when no active listings", async () => {
      mockPrisma.listing.groupBy.mockResolvedValueOnce([]);

      const result = await service.getCities();

      expect(result.data).toEqual([]);
    });

    it("should limit to 8 cities", async () => {
      mockPrisma.listing.groupBy.mockResolvedValueOnce([]);

      await service.getCities();

      expect(mockPrisma.listing.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({ take: 8 }),
      );
    });
  });

  // ── getStats ─────────────────────────────────────

  describe("getStats", () => {
    it("should return platform statistics", async () => {
      mockPrisma.$transaction.mockResolvedValueOnce([
        42, // activeListings
        [
          { city: "Orlando" },
          { city: "Miami" },
          { city: "Newark" },
          { city: "Boston" },
          { city: "Lisboa" },
        ], // cityGroups
        120, // totalUsers
      ]);

      const result = await service.getStats();

      expect(result.data).toEqual({
        activeListings: 42,
        totalCities: 5,
        totalUsers: 120,
        totalReviews: 0,
      });
    });

    it("should return zeros when no data", async () => {
      mockPrisma.$transaction.mockResolvedValueOnce([0, [], 0]);

      const result = await service.getStats();

      expect(result.data.activeListings).toBe(0);
      expect(result.data.totalCities).toBe(0);
      expect(result.data.totalUsers).toBe(0);
      expect(result.data.totalReviews).toBe(0);
    });
  });

  // ── getTestimonials ──────────────────────────────

  describe("getTestimonials", () => {
    it("should return placeholder testimonials", async () => {
      const result = await service.getTestimonials();

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toHaveProperty("id");
      expect(result.data[0]).toHaveProperty("name");
      expect(result.data[0]).toHaveProperty("city");
      expect(result.data[0]).toHaveProperty("text");
      expect(result.data[0]).toHaveProperty("rating");
    });

    it("should have valid ratings between 1-5", async () => {
      const result = await service.getTestimonials();

      for (const t of result.data) {
        expect(t.rating).toBeGreaterThanOrEqual(1);
        expect(t.rating).toBeLessThanOrEqual(5);
      }
    });
  });

  // ── submitContact ────────────────────────────────

  describe("submitContact", () => {
    const contactDto = {
      name: "João Silva",
      email: "joao@test.com",
      subject: "Dúvida sobre quartos",
      message: "Gostaria de mais informações sobre os quartos em Orlando.",
    };

    it("should create a contact message in the database", async () => {
      mockPrisma.contactMessage.create.mockResolvedValueOnce({
        id: "uuid-1",
        ...contactDto,
        createdAt: new Date(),
      });

      const result = await service.submitContact(contactDto);

      expect(mockPrisma.contactMessage.create).toHaveBeenCalledWith({
        data: {
          name: contactDto.name,
          email: contactDto.email,
          subject: contactDto.subject,
          message: contactDto.message,
        },
      });
      expect(result).toEqual({ message: "Message sent successfully" });
    });

    it("should propagate database errors", async () => {
      mockPrisma.contactMessage.create.mockRejectedValueOnce(
        new Error("DB error"),
      );

      await expect(service.submitContact(contactDto)).rejects.toThrow(
        "DB error",
      );
    });
  });
});
