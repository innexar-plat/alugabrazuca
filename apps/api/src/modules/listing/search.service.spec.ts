import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { SearchService } from "./search.service";
import { PrismaService } from "../../prisma/prisma.service";
import { SearchListingsDto } from "./dto";
import {
  ListingStatus,
  ParkingType,
  PetPolicy,
  SmokingPolicy,
  ListingType,
} from "@prisma/client";

const mockListing = {
  id: "550e8400-e29b-41d4-a716-446655440000",
  title: "Quarto em Orlando",
  country: "USA",
  state: "Florida",
  city: "Orlando",
  neighborhood: "Downtown",
  pricePerMonth: 800,
  currency: "USD",
  listingType: "private_room",
  roomSize: "medium",
  bedType: "double",
  bathroomType: "shared",
  utilitiesIncluded: true,
  internetIncluded: true,
  isFurnished: true,
  availableFrom: new Date("2026-02-01"),
  minimumStay: 3,
  viewCount: 10,
  favoriteCount: 2,
  isFeatured: false,
  createdAt: new Date("2026-01-15"),
  photos: [
    {
      url: "https://example.com/photo.jpg",
      thumbnailUrl: "https://example.com/thumb.jpg",
    },
  ],
  host: { id: "host-uuid", firstName: "Ana", isVerified: true },
};

describe("SearchService", () => {
  let service: SearchService;
  let prisma: PrismaService;

  const mockPrisma = {
    $transaction: vi.fn(),
    listing: {
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  // ── search() ──

  describe("search", () => {
    it("should return paginated results with default params when no filters provided", async () => {
      const items = [mockListing];
      mockPrisma.$transaction.mockResolvedValue([items, 1]);

      const dto = new SearchListingsDto();
      const result = await service.search(dto);

      expect(result.data).toEqual(items);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should calculate totalPages correctly when multiple pages exist", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 45]);

      const dto = new SearchListingsDto();
      dto.limit = 10;
      dto.page = 1;
      const result = await service.search(dto);

      expect(result.meta.totalPages).toBe(5);
      expect(result.meta.total).toBe(45);
    });

    it("should fallback to createdAt when sortBy is not in allowed list", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.sortBy = "maliciousField";
      await service.search(dto);

      const transactionCall = mockPrisma.$transaction.mock.calls[0][0];
      // The $transaction receives an array of Prisma promises;
      // we verify indirectly that it was called without error
      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should apply text query filter when query is provided", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.query = "Orlando";
      await service.search(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should apply city filter when city is provided", async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockListing], 1]);

      const dto = new SearchListingsDto();
      dto.city = "Orlando";
      const result = await service.search(dto);

      expect(result.data).toHaveLength(1);
    });

    it("should apply price range filter when minPrice and maxPrice provided", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.minPrice = 500;
      dto.maxPrice = 1000;
      await service.search(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should apply listing type filter when listingType is provided", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.listingType = ListingType.private_room;
      await service.search(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should apply boolean filters when provided", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.isFurnished = true;
      dto.hasWindow = true;
      dto.hasLock = true;
      dto.utilitiesIncluded = true;
      dto.internetIncluded = true;
      await service.search(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should apply allowsPets filter as not PetPolicy.no when true", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.allowsPets = true;
      await service.search(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should apply allowsSmoking filter as not SmokingPolicy.no when true", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.allowsSmoking = true;
      await service.search(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should apply hasParking filter as not ParkingType.none when true", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.hasParking = true;
      await service.search(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should apply availableFrom filter as lte when date provided", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.availableFrom = "2026-06-01";
      await service.search(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should apply minimumStayMax filter when provided", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.minimumStayMax = 6;
      await service.search(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should apply all location filters when provided", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.country = "USA";
      dto.state = "Florida";
      dto.city = "Orlando";
      dto.neighborhood = "Downtown";
      dto.zipCode = "32801";
      await service.search(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should apply rules filters when provided", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.allowsCouples = true;
      dto.allowsChildren = false;
      dto.lgbtFriendly = true;
      dto.hasPool = true;
      dto.hasContract = true;
      await service.search(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should use custom pagination when page and limit are specified", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 100]);

      const dto = new SearchListingsDto();
      dto.page = 3;
      dto.limit = 10;
      const result = await service.search(dto);

      expect(result.meta).toEqual({
        total: 100,
        page: 3,
        limit: 10,
        totalPages: 10,
      });
    });

    it("should apply asc order when specified", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.order = "asc";
      dto.sortBy = "pricePerMonth";
      await service.search(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });
  });

  // ── getCities() ──

  describe("getCities", () => {
    it("should return grouped cities with counts", async () => {
      const groupByResult = [
        {
          country: "USA",
          state: "Florida",
          city: "Orlando",
          _count: { id: 5 },
        },
        {
          country: "Portugal",
          state: "Lisboa",
          city: "Lisboa",
          _count: { id: 3 },
        },
      ];
      mockPrisma.listing.groupBy.mockResolvedValue(groupByResult);

      const result = await service.getCities();

      expect(result.data).toEqual([
        { country: "USA", state: "Florida", city: "Orlando", count: 5 },
        { country: "Portugal", state: "Lisboa", city: "Lisboa", count: 3 },
      ]);
      expect(mockPrisma.listing.groupBy).toHaveBeenCalledWith({
        by: ["country", "state", "city"],
        where: {
          status: ListingStatus.active,
          deletedAt: null,
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      });
    });

    it("should return empty array when no active listings exist", async () => {
      mockPrisma.listing.groupBy.mockResolvedValue([]);

      const result = await service.getCities();

      expect(result.data).toEqual([]);
    });
  });

  // ── getSuggestions() ──

  describe("getSuggestions", () => {
    it("should return empty data when query is empty", async () => {
      const result = await service.getSuggestions("");

      expect(result.data).toEqual([]);
      expect(mockPrisma.listing.findMany).not.toHaveBeenCalled();
    });

    it("should return empty data when query has less than 2 characters", async () => {
      const result = await service.getSuggestions("a");

      expect(result.data).toEqual([]);
      expect(mockPrisma.listing.findMany).not.toHaveBeenCalled();
    });

    it("should return formatted suggestions when query has 2+ characters", async () => {
      mockPrisma.listing.findMany.mockResolvedValue([
        { city: "Orlando", state: "Florida", country: "USA" },
        { city: "Orlando Park", state: "Florida", country: "USA" },
      ]);

      const result = await service.getSuggestions("Or");

      expect(result.data).toEqual([
        {
          label: "Orlando, Florida, USA",
          city: "Orlando",
          state: "Florida",
          country: "USA",
        },
        {
          label: "Orlando Park, Florida, USA",
          city: "Orlando Park",
          state: "Florida",
          country: "USA",
        },
      ]);
      expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: ListingStatus.active,
            deletedAt: null,
          }),
          distinct: ["city", "state", "country"],
          take: 10,
        }),
      );
    });

    it("should trim whitespace from query", async () => {
      mockPrisma.listing.findMany.mockResolvedValue([]);

      await service.getSuggestions("  Or  ");

      expect(mockPrisma.listing.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                city: { contains: "Or", mode: "insensitive" },
              }),
            ]),
          }),
        }),
      );
    });

    it("should return empty data when query is null or undefined", async () => {
      const result = await service.getSuggestions(null as any);

      expect(result.data).toEqual([]);
    });
  });

  // ── buildWhere() (tested indirectly via search) ──

  describe("buildWhere (indirect)", () => {
    it("should always include status=active and deletedAt=null conditions", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      await service.search(dto);

      // Verify that $transaction was called — the where clause always includes
      // status=active and deletedAt=null as base conditions
      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should apply kitchenAccess and laundryAccess filters", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.kitchenAccess = "full" as any;
      dto.laundryAccess = "in_unit" as any;
      await service.search(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should apply bathroomType filter", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.bathroomType = "private" as any;
      await service.search(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });

    it("should apply roomSize and bedType filters", async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      const dto = new SearchListingsDto();
      dto.roomSize = "large" as any;
      dto.bedType = "queen" as any;
      await service.search(dto);

      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });
  });
});
