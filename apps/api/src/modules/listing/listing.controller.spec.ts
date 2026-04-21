import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException } from "@nestjs/common";
import { ListingController } from "./listing.controller";
import { ListingService } from "./listing.service";

describe("ListingController", () => {
  let controller: ListingController;

  const mockListingService = {
    create: vi.fn(),
    findOne: vi.fn(),
    findMyListings: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    publish: vi.fn(),
    pause: vi.fn(),
    resume: vi.fn(),
    markRented: vi.fn(),
    addPhoto: vi.fn(),
    removePhoto: vi.fn(),
    reorderPhotos: vi.fn(),
  };

  const USER_ID = "user-uuid";
  const LISTING_ID = "listing-uuid";

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListingController],
      providers: [{ provide: ListingService, useValue: mockListingService }],
    }).compile();

    controller = module.get<ListingController>(ListingController);
  });

  // ── CRUD ──

  describe("create", () => {
    it("should delegate to listingService.create", async () => {
      const dto = { title: "Room", pricePerMonth: 800 } as any;
      mockListingService.create.mockResolvedValue({ data: { id: LISTING_ID } });

      const result = await controller.create(USER_ID, dto);

      expect(mockListingService.create).toHaveBeenCalledWith(USER_ID, dto);
      expect(result.data.id).toBe(LISTING_ID);
    });
  });

  describe("findMyListings", () => {
    it("should delegate to listingService.findMyListings", async () => {
      const query = { page: 1, limit: 10 };
      mockListingService.findMyListings.mockResolvedValue({
        data: [],
        meta: {},
      });

      await controller.findMyListings(USER_ID, query as any);

      expect(mockListingService.findMyListings).toHaveBeenCalledWith(
        USER_ID,
        query,
      );
    });
  });

  describe("findOne", () => {
    it("should delegate to listingService.findOne (public)", async () => {
      mockListingService.findOne.mockResolvedValue({
        data: { id: LISTING_ID },
      });

      const result = await controller.findOne(LISTING_ID);

      expect(mockListingService.findOne).toHaveBeenCalledWith(LISTING_ID);
    });
  });

  describe("update", () => {
    it("should delegate to listingService.update", async () => {
      const dto = { title: "Updated" } as any;
      mockListingService.update.mockResolvedValue({ data: { id: LISTING_ID } });

      await controller.update(LISTING_ID, USER_ID, dto);

      expect(mockListingService.update).toHaveBeenCalledWith(
        LISTING_ID,
        USER_ID,
        dto,
      );
    });
  });

  describe("remove", () => {
    it("should delegate to listingService.remove", async () => {
      mockListingService.remove.mockResolvedValue({ message: "deleted" });

      await controller.remove(LISTING_ID, USER_ID);

      expect(mockListingService.remove).toHaveBeenCalledWith(
        LISTING_ID,
        USER_ID,
      );
    });
  });

  // ── Lifecycle ──

  describe("publish", () => {
    it("should delegate to listingService.publish", async () => {
      mockListingService.publish.mockResolvedValue({
        data: { status: "pending_review" },
      });

      await controller.publish(LISTING_ID, USER_ID);

      expect(mockListingService.publish).toHaveBeenCalledWith(
        LISTING_ID,
        USER_ID,
      );
    });
  });

  describe("pause", () => {
    it("should delegate to listingService.pause", async () => {
      mockListingService.pause.mockResolvedValue({
        data: { status: "paused" },
      });

      await controller.pause(LISTING_ID, USER_ID);

      expect(mockListingService.pause).toHaveBeenCalledWith(
        LISTING_ID,
        USER_ID,
      );
    });
  });

  describe("resume", () => {
    it("should delegate to listingService.resume", async () => {
      mockListingService.resume.mockResolvedValue({
        data: { status: "active" },
      });

      await controller.resume(LISTING_ID, USER_ID);

      expect(mockListingService.resume).toHaveBeenCalledWith(
        LISTING_ID,
        USER_ID,
      );
    });
  });

  describe("markRented", () => {
    it("should delegate to listingService.markRented", async () => {
      mockListingService.markRented.mockResolvedValue({
        data: { status: "rented" },
      });

      await controller.markRented(LISTING_ID, USER_ID);

      expect(mockListingService.markRented).toHaveBeenCalledWith(
        LISTING_ID,
        USER_ID,
      );
    });
  });

  // ── Photos ──

  describe("addPhoto", () => {
    it("should delegate to listingService.addPhoto", async () => {
      const body = {
        url: "http://img.com/1.jpg",
        thumbnailUrl: "http://img.com/1-t.jpg",
        caption: "Room",
      };
      mockListingService.addPhoto.mockResolvedValue({
        data: { id: "photo-1" },
      });

      await controller.addPhoto(LISTING_ID, USER_ID, body);

      expect(mockListingService.addPhoto).toHaveBeenCalledWith(
        LISTING_ID,
        USER_ID,
        body.url,
        body.thumbnailUrl,
        body.caption,
      );
    });

    it("should throw BadRequestException when url missing", () => {
      const body = { url: "", thumbnailUrl: "http://img.com/1-t.jpg" } as any;

      expect(() => controller.addPhoto(LISTING_ID, USER_ID, body)).toThrow(
        BadRequestException,
      );
    });
  });

  describe("removePhoto", () => {
    it("should delegate to listingService.removePhoto", async () => {
      mockListingService.removePhoto.mockResolvedValue({ message: "deleted" });

      await controller.removePhoto(LISTING_ID, "photo-1", USER_ID);

      expect(mockListingService.removePhoto).toHaveBeenCalledWith(
        LISTING_ID,
        "photo-1",
        USER_ID,
      );
    });
  });

  describe("reorderPhotos", () => {
    it("should delegate to listingService.reorderPhotos", async () => {
      const dto = { photoIds: ["b", "a"] };
      mockListingService.reorderPhotos.mockResolvedValue({ data: [] });

      await controller.reorderPhotos(LISTING_ID, USER_ID, dto as any);

      expect(mockListingService.reorderPhotos).toHaveBeenCalledWith(
        LISTING_ID,
        USER_ID,
        ["b", "a"],
      );
    });
  });
});
