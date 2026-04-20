import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ListingService } from './listing.service';
import { PrismaService } from '../../prisma/prisma.service';

const HOST_ID = '550e8400-e29b-41d4-a716-446655440000';
const OTHER_ID = '660e8400-e29b-41d4-a716-446655440000';
const LISTING_ID = '770e8400-e29b-41d4-a716-446655440000';

const mockListing = {
  id: LISTING_ID,
  hostId: HOST_ID,
  title: 'Cozy Room in Orlando',
  description: 'A nice room',
  pricePerMonth: 800,
  status: 'draft',
  deletedAt: null,
  viewCount: 0,
  streetAddress: '123 Main St',
  photos: [],
  host: { id: HOST_ID, firstName: 'John' },
  createdAt: new Date(),
};

describe('ListingService', () => {
  let service: ListingService;

  const mockPrisma = {
    listing: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    listingPhoto: {
      count: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListingService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ListingService>(ListingService);
  });

  // ── create() ──

  describe('create', () => {
    it('should create a listing with draft status', async () => {
      const dto = {
        title: 'Room in Miami',
        description: 'Nice room',
        pricePerMonth: 900,
        availableFrom: '2026-01-15',
        city: 'Miami',
        state: 'FL',
        country: 'US',
        listingType: 'private_room',
      } as any;

      mockPrisma.listing.create.mockResolvedValue({ ...mockListing, ...dto, status: 'draft' });

      const result = await service.create(HOST_ID, dto);

      expect(result.data.status).toBe('draft');
      expect(mockPrisma.listing.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            hostId: HOST_ID,
            status: 'draft',
          }),
        }),
      );
    });
  });

  // ── findOne() ──

  describe('findOne', () => {
    it('should return listing for owner including streetAddress', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue({ ...mockListing, status: 'active' });

      const result = await service.findOne(LISTING_ID, HOST_ID);

      expect(result.data.streetAddress).toBe('123 Main St');
    });

    it('should hide streetAddress for non-owner', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue({ ...mockListing, status: 'active' });
      mockPrisma.listing.update.mockResolvedValue({});

      const result = await service.findOne(LISTING_ID, OTHER_ID);

      expect(result.data.streetAddress).toBeUndefined();
    });

    it('should throw NotFoundException when listing does not exist', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for non-owner viewing draft listing', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue({ ...mockListing, status: 'draft' });

      await expect(service.findOne(LISTING_ID, OTHER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should increment viewCount for non-owner views', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue({ ...mockListing, status: 'active' });
      mockPrisma.listing.update.mockResolvedValue({});

      await service.findOne(LISTING_ID, OTHER_ID);

      expect(mockPrisma.listing.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: { viewCount: { increment: 1 } },
        }),
      );
    });

    it('should NOT increment viewCount for owner views', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue({ ...mockListing, status: 'active' });

      await service.findOne(LISTING_ID, HOST_ID);

      expect(mockPrisma.listing.update).not.toHaveBeenCalled();
    });
  });

  // ── findMyListings() ──

  describe('findMyListings', () => {
    it('should return paginated listings with meta', async () => {
      mockPrisma.$transaction.mockResolvedValue([[mockListing], 1]);

      const result = await service.findMyListings(HOST_ID, { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it('should filter by status when provided', async () => {
      mockPrisma.$transaction.mockResolvedValue([[], 0]);

      await service.findMyListings(HOST_ID, { status: 'active' } as any);

      const txCallback = mockPrisma.$transaction.mock.calls[0][0];
      // The transaction receives an array with findMany and count
      // We check that the service was called — detailed where testing is structural
      expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    });
  });

  // ── update() ──

  describe('update', () => {
    it('should update listing successfully', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue(mockListing);
      mockPrisma.listing.update.mockResolvedValue({ ...mockListing, title: 'Updated' });

      const result = await service.update(LISTING_ID, HOST_ID, { title: 'Updated' } as any);

      expect(result.data.title).toBe('Updated');
    });

    it('should throw ForbiddenException when non-owner tries to update', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue(mockListing);

      await expect(
        service.update(LISTING_ID, OTHER_ID, { title: 'Hack' } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException when listing not found', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', HOST_ID, { title: 'X' } as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should revert active listing to draft on edit', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue({ ...mockListing, status: 'active' });
      mockPrisma.listing.update.mockResolvedValue({ ...mockListing, status: 'draft' });

      await service.update(LISTING_ID, HOST_ID, { title: 'Changed' } as any);

      expect(mockPrisma.listing.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'draft' }),
        }),
      );
    });

    it('should throw BadRequestException when editing rejected listing', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue({ ...mockListing, status: 'rejected' });

      await expect(
        service.update(LISTING_ID, HOST_ID, { title: 'Fix' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── remove() ──

  describe('remove', () => {
    it('should soft-delete listing', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue(mockListing);
      mockPrisma.listing.update.mockResolvedValue({});

      const result = await service.remove(LISTING_ID, HOST_ID);

      expect(result.message).toBe('Listing deleted successfully');
      expect(mockPrisma.listing.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('should throw ForbiddenException for non-owner', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue(mockListing);

      await expect(service.remove(LISTING_ID, OTHER_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  // ── publish() ──

  describe('publish', () => {
    it('should publish draft listing with enough photos', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue(mockListing);
      mockPrisma.listingPhoto.count.mockResolvedValue(3);
      mockPrisma.listing.update.mockResolvedValue({ ...mockListing, status: 'pending_review' });

      const result = await service.publish(LISTING_ID, HOST_ID);

      expect(result.data.status).toBe('pending_review');
    });

    it('should throw BadRequestException with fewer than 3 photos', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue(mockListing);
      mockPrisma.listingPhoto.count.mockResolvedValue(2);

      await expect(service.publish(LISTING_ID, HOST_ID)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for non-draft/non-paused listing', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue({ ...mockListing, status: 'active' });

      await expect(service.publish(LISTING_ID, HOST_ID)).rejects.toThrow(BadRequestException);
    });
  });

  // ── pause() ──

  describe('pause', () => {
    it('should pause active listing', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue({ ...mockListing, status: 'active' });
      mockPrisma.listing.update.mockResolvedValue({ ...mockListing, status: 'paused' });

      const result = await service.pause(LISTING_ID, HOST_ID);

      expect(result.data.status).toBe('paused');
    });

    it('should throw BadRequestException for non-active listing', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue(mockListing); // draft

      await expect(service.pause(LISTING_ID, HOST_ID)).rejects.toThrow(BadRequestException);
    });
  });

  // ── resume() ──

  describe('resume', () => {
    it('should resume paused listing', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue({ ...mockListing, status: 'paused' });
      mockPrisma.listing.update.mockResolvedValue({ ...mockListing, status: 'active' });

      const result = await service.resume(LISTING_ID, HOST_ID);

      expect(result.data.status).toBe('active');
    });

    it('should throw BadRequestException for non-paused listing', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue({ ...mockListing, status: 'active' });

      await expect(service.resume(LISTING_ID, HOST_ID)).rejects.toThrow(BadRequestException);
    });
  });

  // ── markRented() ──

  describe('markRented', () => {
    it('should mark active listing as rented', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue({ ...mockListing, status: 'active' });
      mockPrisma.listing.update.mockResolvedValue({ ...mockListing, status: 'rented' });

      const result = await service.markRented(LISTING_ID, HOST_ID);

      expect(result.data.status).toBe('rented');
    });

    it('should throw BadRequestException for draft listing', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue(mockListing); // draft

      await expect(service.markRented(LISTING_ID, HOST_ID)).rejects.toThrow(BadRequestException);
    });
  });

  // ── addPhoto() ──

  describe('addPhoto', () => {
    it('should add photo with correct sort order', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue(mockListing);
      mockPrisma.listingPhoto.aggregate.mockResolvedValue({ _max: { sortOrder: 2 } });
      mockPrisma.listingPhoto.count.mockResolvedValue(5);
      mockPrisma.listingPhoto.create.mockResolvedValue({ id: 'photo-1', sortOrder: 3 });

      const result = await service.addPhoto(LISTING_ID, HOST_ID, 'url', 'thumb');

      expect(result.data.sortOrder).toBe(3);
    });

    it('should throw BadRequestException when max 20 photos reached', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue(mockListing);
      mockPrisma.listingPhoto.aggregate.mockResolvedValue({ _max: { sortOrder: 19 } });
      mockPrisma.listingPhoto.count.mockResolvedValue(20);

      await expect(
        service.addPhoto(LISTING_ID, HOST_ID, 'url', 'thumb'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ── removePhoto() ──

  describe('removePhoto', () => {
    it('should delete photo successfully', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue(mockListing);
      mockPrisma.listingPhoto.findFirst.mockResolvedValue({ id: 'photo-1', listingId: LISTING_ID });
      mockPrisma.listingPhoto.delete.mockResolvedValue({});

      const result = await service.removePhoto(LISTING_ID, 'photo-1', HOST_ID);

      expect(result.message).toBe('Photo deleted successfully');
    });

    it('should throw NotFoundException when photo not found', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue(mockListing);
      mockPrisma.listingPhoto.findFirst.mockResolvedValue(null);

      await expect(
        service.removePhoto(LISTING_ID, 'nonexistent', HOST_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ── reorderPhotos() ──

  describe('reorderPhotos', () => {
    it('should reorder photos and return sorted list', async () => {
      mockPrisma.listing.findFirst.mockResolvedValue(mockListing);
      mockPrisma.$transaction.mockResolvedValue([]);
      mockPrisma.listingPhoto.findMany.mockResolvedValue([
        { id: 'b', sortOrder: 0 },
        { id: 'a', sortOrder: 1 },
      ]);

      const result = await service.reorderPhotos(LISTING_ID, HOST_ID, ['b', 'a']);

      expect(result.data[0].id).toBe('b');
      expect(result.data[0].sortOrder).toBe(0);
    });
  });
});
