import { describe, it, expect, beforeEach, vi } from "vitest";
import { Test, TestingModule } from "@nestjs/testing";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { InquiryService } from "./inquiry.service";
import { PrismaService } from "../../prisma/prisma.service";
import { InquiryStatus, InquiryType, ListingStatus } from "@prisma/client";

const TENANT_ID = "11111111-1111-1111-1111-111111111111";
const HOST_ID = "22222222-2222-2222-2222-222222222222";
const OTHER_ID = "33333333-3333-3333-3333-333333333333";
const LISTING_ID = "44444444-4444-4444-4444-444444444444";
const INQUIRY_ID = "55555555-5555-5555-5555-555555555555";

const mockListing = {
  id: LISTING_ID,
  hostId: HOST_ID,
  status: ListingStatus.active,
  title: "Cozy Room",
};

const mockInquiry = {
  id: INQUIRY_ID,
  listingId: LISTING_ID,
  tenantId: TENANT_ID,
  hostId: HOST_ID,
  type: InquiryType.info,
  status: InquiryStatus.pending,
  message: "Hi, I am interested in your room listing.",
  occupants: 1,
  hasPets: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  expiredAt: new Date(),
  acceptedAt: null,
  rejectedAt: null,
  cancelledAt: null,
  hostReply: null,
  rejectionReason: null,
  moveInDate: null,
  stayDuration: null,
  petDetails: null,
  occupation: null,
  aboutMe: null,
};

describe("InquiryService", () => {
  let service: InquiryService;

  const mockPrisma = {
    listing: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    inquiry: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InquiryService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<InquiryService>(InquiryService);
  });

  // ── create ──────────────────────────────────────────────────────────

  describe("create", () => {
    const dto = {
      listingId: LISTING_ID,
      type: InquiryType.info,
      message: "Hi, I am interested in renting this room. Can I visit?",
    };

    it("should create an inquiry successfully", async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(mockListing);
      mockPrisma.inquiry.findUnique.mockResolvedValue(null);
      mockPrisma.inquiry.count.mockResolvedValue(0);
      mockPrisma.inquiry.create.mockResolvedValue({
        ...mockInquiry,
        listing: {},
        tenant: {},
        host: {},
      });
      mockPrisma.listing.update.mockResolvedValue({});

      const result = await service.create(TENANT_ID, dto);
      expect(result.data).toBeDefined();
      expect(mockPrisma.inquiry.create).toHaveBeenCalledOnce();
      expect(mockPrisma.listing.update).toHaveBeenCalledWith({
        where: { id: LISTING_ID },
        data: { inquiryCount: { increment: 1 } },
      });
    });

    it("should throw NotFoundException when listing not found", async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(null);
      await expect(service.create(TENANT_ID, dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw BadRequestException when listing is not active", async () => {
      mockPrisma.listing.findUnique.mockResolvedValue({
        ...mockListing,
        status: ListingStatus.paused,
      });
      await expect(service.create(TENANT_ID, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException when host tries to inquire own listing", async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(mockListing);
      await expect(service.create(HOST_ID, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException when inquiry already exists", async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(mockListing);
      mockPrisma.inquiry.findUnique.mockResolvedValue(mockInquiry);
      await expect(service.create(TENANT_ID, dto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw BadRequestException when max pending inquiries reached", async () => {
      mockPrisma.listing.findUnique.mockResolvedValue(mockListing);
      mockPrisma.inquiry.findUnique.mockResolvedValue(null);
      mockPrisma.inquiry.count.mockResolvedValue(10);
      await expect(service.create(TENANT_ID, dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── findSent ────────────────────────────────────────────────────────

  describe("findSent", () => {
    it("should return paginated sent inquiries", async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockInquiry], 1]);
      const result = await service.findSent(TENANT_ID);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  // ── findReceived ────────────────────────────────────────────────────

  describe("findReceived", () => {
    it("should return paginated received inquiries", async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockInquiry], 1]);
      const result = await service.findReceived(HOST_ID);
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  // ── findOne ─────────────────────────────────────────────────────────

  describe("findOne", () => {
    const fullInquiry = {
      ...mockInquiry,
      listing: {
        id: LISTING_ID,
        title: "Cozy Room",
        city: "Orlando",
        state: "FL",
        country: "US",
        streetAddress: "123 Main St",
        zipCode: "32801",
        pricePerMonth: 800,
        currency: "USD",
        photos: [],
        host: {
          id: HOST_ID,
          firstName: "Host",
          phone: "+1555",
          whatsapp: "+1555",
        },
      },
      tenant: {
        id: TENANT_ID,
        firstName: "Tenant",
        lastName: "User",
        avatarUrl: null,
        email: "tenant@test.com",
        phone: "+5511",
        whatsapp: "+5511",
      },
      host: {
        id: HOST_ID,
        firstName: "Host",
        lastName: "User",
        avatarUrl: null,
      },
    };

    it("should return inquiry for the tenant", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue(fullInquiry);
      const result = await service.findOne(INQUIRY_ID, TENANT_ID);
      expect(result.data).toBeDefined();
    });

    it("should return inquiry for the host", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue(fullInquiry);
      const result = await service.findOne(INQUIRY_ID, HOST_ID);
      expect(result.data).toBeDefined();
    });

    it("should hide sensitive address when not accepted", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue(fullInquiry);
      const result = await service.findOne(INQUIRY_ID, TENANT_ID);
      expect(
        (result.data.listing as Record<string, unknown>).streetAddress,
      ).toBeNull();
      expect(
        (result.data.listing as Record<string, unknown>).zipCode,
      ).toBeNull();
    });

    it("should throw NotFoundException when not found", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue(null);
      await expect(service.findOne(INQUIRY_ID, TENANT_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should throw ForbiddenException for unrelated user", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue(fullInquiry);
      await expect(service.findOne(INQUIRY_ID, OTHER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── accept ──────────────────────────────────────────────────────────

  describe("accept", () => {
    it("should accept a pending inquiry", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue(mockInquiry);
      mockPrisma.inquiry.update.mockResolvedValue({
        ...mockInquiry,
        status: InquiryStatus.accepted,
      });
      const result = await service.accept(INQUIRY_ID, HOST_ID);
      expect(result.data.status).toBe(InquiryStatus.accepted);
    });

    it("should throw ForbiddenException if not the host", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue(mockInquiry);
      await expect(service.accept(INQUIRY_ID, OTHER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw BadRequestException if not pending", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue({
        ...mockInquiry,
        status: InquiryStatus.accepted,
      });
      await expect(service.accept(INQUIRY_ID, HOST_ID)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ── reject ──────────────────────────────────────────────────────────

  describe("reject", () => {
    it("should reject a pending inquiry", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue(mockInquiry);
      mockPrisma.inquiry.update.mockResolvedValue({
        ...mockInquiry,
        status: InquiryStatus.rejected,
      });
      const result = await service.reject(INQUIRY_ID, HOST_ID, {
        reason: "Not a good fit",
      });
      expect(result.data.status).toBe(InquiryStatus.rejected);
    });

    it("should throw ForbiddenException if not the host", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue(mockInquiry);
      await expect(service.reject(INQUIRY_ID, OTHER_ID, {})).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  // ── reply ───────────────────────────────────────────────────────────

  describe("reply", () => {
    it("should add host reply", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue(mockInquiry);
      mockPrisma.inquiry.update.mockResolvedValue({
        ...mockInquiry,
        hostReply: "Sure, come visit!",
      });
      const result = await service.reply(INQUIRY_ID, HOST_ID, {
        message: "Sure, come visit!",
      });
      expect(result.data.hostReply).toBe("Sure, come visit!");
    });

    it("should throw BadRequestException when replying to a rejected inquiry", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue({
        ...mockInquiry,
        status: InquiryStatus.rejected,
      });
      await expect(
        service.reply(INQUIRY_ID, HOST_ID, { message: "text" }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── cancel ──────────────────────────────────────────────────────────

  describe("cancel", () => {
    it("should cancel a pending inquiry", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue(mockInquiry);
      mockPrisma.inquiry.update.mockResolvedValue({
        ...mockInquiry,
        status: InquiryStatus.cancelled,
      });
      const result = await service.cancel(INQUIRY_ID, TENANT_ID);
      expect(result.data.status).toBe(InquiryStatus.cancelled);
    });

    it("should throw ForbiddenException if not the tenant", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue(mockInquiry);
      await expect(service.cancel(INQUIRY_ID, OTHER_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it("should throw BadRequestException if not pending", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue({
        ...mockInquiry,
        status: InquiryStatus.accepted,
      });
      await expect(service.cancel(INQUIRY_ID, TENANT_ID)).rejects.toThrow(
        BadRequestException,
      );
    });

    it("should throw NotFoundException when inquiry not found", async () => {
      mockPrisma.inquiry.findUnique.mockResolvedValue(null);
      await expect(service.cancel(INQUIRY_ID, TENANT_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
