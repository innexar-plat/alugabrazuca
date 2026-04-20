import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateListingDto, UpdateListingDto, ListingQueryDto } from './dto';
import { ListingStatus, Prisma } from '@prisma/client';

@Injectable()
export class ListingService {
  constructor(private readonly prisma: PrismaService) {}

  async create(hostId: string, dto: CreateListingDto) {
    const listing = await this.prisma.listing.create({
      data: {
        hostId,
        ...dto,
        availableFrom: new Date(dto.availableFrom),
        availableTo: dto.availableTo ? new Date(dto.availableTo) : undefined,
        status: ListingStatus.draft,
      },
      include: { photos: true },
    });

    return { data: listing };
  }

  async findOne(id: string, userId?: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id, deletedAt: null },
      include: {
        photos: { orderBy: { sortOrder: 'asc' } },
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            currentCity: true,
            currentCountry: true,
            isVerified: true,
            createdAt: true,
          },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Non-owner can only see active/rented listings
    const isOwner = userId && listing.hostId === userId;
    if (!isOwner && listing.status !== ListingStatus.active && listing.status !== ListingStatus.rented) {
      throw new NotFoundException('Listing not found');
    }

    // Increment view count for non-owner views (fire and forget)
    if (!isOwner) {
      this.prisma.listing.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      }).catch(() => {});
    }

    // Hide street address for non-owners
    if (!isOwner) {
      return {
        data: {
          ...listing,
          streetAddress: undefined,
        },
      };
    }

    return { data: listing };
  }

  async findMyListings(hostId: string, query: ListingQueryDto) {
    const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc', status } = query;

    const where: Prisma.ListingWhereInput = {
      hostId,
      deletedAt: null,
      ...(status && { status }),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        include: {
          photos: { orderBy: { sortOrder: 'asc' }, take: 1 },
        },
        orderBy: { [sortBy]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.listing.count({ where }),
    ]);

    return {
      data: items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(id: string, hostId: string, dto: UpdateListingDto) {
    const listing = await this.findOwnedListing(id, hostId);

    // Cannot edit rejected/expired listings
    if (listing.status === ListingStatus.rejected || listing.status === ListingStatus.expired) {
      throw new BadRequestException('Cannot edit a listing with status: ' + listing.status);
    }

    // If listing was active, revert to draft on edit (requires re-review)
    const shouldRevertToDraft =
      listing.status === ListingStatus.active || listing.status === ListingStatus.pending_review;

    const updateData: any = { ...dto };

    if (updateData.availableFrom) {
      updateData.availableFrom = new Date(updateData.availableFrom);
    }
    if (updateData.availableTo) {
      updateData.availableTo = new Date(updateData.availableTo);
    }

    if (shouldRevertToDraft) {
      updateData.status = ListingStatus.draft;
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: updateData,
      include: { photos: { orderBy: { sortOrder: 'asc' } } },
    });

    return { data: updated };
  }

  async remove(id: string, hostId: string) {
    await this.findOwnedListing(id, hostId);

    await this.prisma.listing.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Listing deleted successfully' };
  }

  // ── Lifecycle Actions ──

  async publish(id: string, hostId: string) {
    const listing = await this.findOwnedListing(id, hostId);

    if (listing.status !== ListingStatus.draft && listing.status !== ListingStatus.paused) {
      throw new BadRequestException('Only draft or paused listings can be published');
    }

    // Check minimum requirements
    const photoCount = await this.prisma.listingPhoto.count({ where: { listingId: id } });
    if (photoCount < 3) {
      throw new BadRequestException('At least 3 photos are required to publish');
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.pending_review },
    });

    return { data: updated };
  }

  async pause(id: string, hostId: string) {
    const listing = await this.findOwnedListing(id, hostId);

    if (listing.status !== ListingStatus.active) {
      throw new BadRequestException('Only active listings can be paused');
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.paused },
    });

    return { data: updated };
  }

  async resume(id: string, hostId: string) {
    const listing = await this.findOwnedListing(id, hostId);

    if (listing.status !== ListingStatus.paused) {
      throw new BadRequestException('Only paused listings can be resumed');
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.active },
    });

    return { data: updated };
  }

  async markRented(id: string, hostId: string) {
    const listing = await this.findOwnedListing(id, hostId);

    if (listing.status !== ListingStatus.active && listing.status !== ListingStatus.paused) {
      throw new BadRequestException('Only active or paused listings can be marked as rented');
    }

    const updated = await this.prisma.listing.update({
      where: { id },
      data: { status: ListingStatus.rented },
    });

    return { data: updated };
  }

  // ── Photos ──

  async addPhoto(
    listingId: string,
    hostId: string,
    url: string,
    thumbnailUrl: string,
    caption?: string,
  ) {
    await this.findOwnedListing(listingId, hostId);

    const maxSort = await this.prisma.listingPhoto.aggregate({
      where: { listingId },
      _max: { sortOrder: true },
    });
    const nextSort = (maxSort._max.sortOrder ?? -1) + 1;

    // Check max 20 photos
    const count = await this.prisma.listingPhoto.count({ where: { listingId } });
    if (count >= 20) {
      throw new BadRequestException('Maximum of 20 photos allowed');
    }

    const photo = await this.prisma.listingPhoto.create({
      data: {
        listingId,
        url,
        thumbnailUrl,
        caption,
        sortOrder: nextSort,
      },
    });

    return { data: photo };
  }

  async removePhoto(listingId: string, photoId: string, hostId: string) {
    await this.findOwnedListing(listingId, hostId);

    const photo = await this.prisma.listingPhoto.findFirst({
      where: { id: photoId, listingId },
    });

    if (!photo) {
      throw new NotFoundException('Photo not found');
    }

    await this.prisma.listingPhoto.delete({ where: { id: photoId } });

    return { message: 'Photo deleted successfully' };
  }

  async reorderPhotos(listingId: string, hostId: string, photoIds: string[]) {
    await this.findOwnedListing(listingId, hostId);

    await this.prisma.$transaction(
      photoIds.map((photoId, index) =>
        this.prisma.listingPhoto.update({
          where: { id: photoId },
          data: { sortOrder: index },
        }),
      ),
    );

    const photos = await this.prisma.listingPhoto.findMany({
      where: { listingId },
      orderBy: { sortOrder: 'asc' },
    });

    return { data: photos };
  }

  // ── Helpers ──

  private async findOwnedListing(id: string, hostId: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id, deletedAt: null },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    if (listing.hostId !== hostId) {
      throw new ForbiddenException('You do not own this listing');
    }

    return listing;
  }
}
