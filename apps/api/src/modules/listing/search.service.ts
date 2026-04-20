import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchListingsDto } from './dto';
import { ListingStatus, ParkingType, PetPolicy, SmokingPolicy, Prisma } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(dto: SearchListingsDto) {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc',
    } = dto;

    const where = this.buildWhere(dto);

    const allowedSortFields = ['createdAt', 'pricePerMonth', 'viewCount'];
    const safeSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';

    const [items, total] = await this.prisma.$transaction([
      this.prisma.listing.findMany({
        where,
        select: {
          id: true,
          title: true,
          country: true,
          state: true,
          city: true,
          neighborhood: true,
          pricePerMonth: true,
          currency: true,
          listingType: true,
          roomSize: true,
          bedType: true,
          bathroomType: true,
          utilitiesIncluded: true,
          internetIncluded: true,
          isFurnished: true,
          availableFrom: true,
          minimumStay: true,
          viewCount: true,
          favoriteCount: true,
          isFeatured: true,
          createdAt: true,
          photos: {
            orderBy: { sortOrder: 'asc' },
            take: 1,
            select: { url: true, thumbnailUrl: true },
          },
          host: {
            select: {
              id: true,
              firstName: true,
              isVerified: true,
            },
          },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { [safeSortBy]: order },
        ],
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

  async getCities() {
    const cities = await this.prisma.listing.groupBy({
      by: ['country', 'state', 'city'],
      where: {
        status: ListingStatus.active,
        deletedAt: null,
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    return {
      data: cities.map((c) => ({
        country: c.country,
        state: c.state,
        city: c.city,
        count: c._count.id,
      })),
    };
  }

  async getSuggestions(query: string) {
    if (!query || query.length < 2) {
      return { data: [] };
    }

    const sanitized = query.trim();

    const cities = await this.prisma.listing.findMany({
      where: {
        status: ListingStatus.active,
        deletedAt: null,
        OR: [
          { city: { contains: sanitized, mode: 'insensitive' } },
          { state: { contains: sanitized, mode: 'insensitive' } },
          { neighborhood: { contains: sanitized, mode: 'insensitive' } },
          { zipCode: { startsWith: sanitized } },
        ],
      },
      select: { city: true, state: true, country: true },
      distinct: ['city', 'state', 'country'],
      take: 10,
    });

    return {
      data: cities.map((c) => ({
        label: `${c.city}, ${c.state}, ${c.country}`,
        city: c.city,
        state: c.state,
        country: c.country,
      })),
    };
  }

  private buildWhere(dto: SearchListingsDto): Prisma.ListingWhereInput {
    const conditions: Prisma.ListingWhereInput[] = [
      { status: ListingStatus.active },
      { deletedAt: null },
    ];

    // Text search
    if (dto.query) {
      conditions.push({
        OR: [
          { title: { contains: dto.query, mode: 'insensitive' } },
          { city: { contains: dto.query, mode: 'insensitive' } },
          { neighborhood: { contains: dto.query, mode: 'insensitive' } },
          { state: { contains: dto.query, mode: 'insensitive' } },
          { zipCode: { startsWith: dto.query } },
        ],
      });
    }

    // Location
    if (dto.country) conditions.push({ country: { equals: dto.country, mode: 'insensitive' } });
    if (dto.state) conditions.push({ state: { equals: dto.state, mode: 'insensitive' } });
    if (dto.city) conditions.push({ city: { equals: dto.city, mode: 'insensitive' } });
    if (dto.neighborhood) conditions.push({ neighborhood: { contains: dto.neighborhood, mode: 'insensitive' } });
    if (dto.zipCode) conditions.push({ zipCode: { startsWith: dto.zipCode } });

    // Price
    if (dto.minPrice !== undefined) conditions.push({ pricePerMonth: { gte: dto.minPrice } });
    if (dto.maxPrice !== undefined) conditions.push({ pricePerMonth: { lte: dto.maxPrice } });

    // Room
    if (dto.listingType) conditions.push({ listingType: dto.listingType });
    if (dto.roomSize) conditions.push({ roomSize: dto.roomSize });
    if (dto.bedType) conditions.push({ bedType: dto.bedType });
    if (dto.isFurnished !== undefined) conditions.push({ isFurnished: dto.isFurnished });
    if (dto.hasWindow !== undefined) conditions.push({ hasWindow: dto.hasWindow });
    if (dto.hasLock !== undefined) conditions.push({ hasLock: dto.hasLock });

    // Bathroom, Kitchen, Laundry
    if (dto.bathroomType) conditions.push({ bathroomType: dto.bathroomType });
    if (dto.kitchenAccess) conditions.push({ kitchenAccess: dto.kitchenAccess });
    if (dto.laundryAccess) conditions.push({ laundryAccess: dto.laundryAccess });

    // Utilities
    if (dto.utilitiesIncluded !== undefined) conditions.push({ utilitiesIncluded: dto.utilitiesIncluded });
    if (dto.internetIncluded !== undefined) conditions.push({ internetIncluded: dto.internetIncluded });

    // Rules
    if (dto.allowsPets === true) {
      conditions.push({ allowsPets: { not: PetPolicy.no } });
    }
    if (dto.allowsSmoking === true) {
      conditions.push({ allowsSmoking: { not: SmokingPolicy.no } });
    }
    if (dto.allowsCouples !== undefined) conditions.push({ allowsCouples: dto.allowsCouples });
    if (dto.allowsChildren !== undefined) conditions.push({ allowsChildren: dto.allowsChildren });
    if (dto.lgbtFriendly !== undefined) conditions.push({ lgbtFriendly: dto.lgbtFriendly });

    // Availability
    if (dto.availableFrom) {
      conditions.push({ availableFrom: { lte: new Date(dto.availableFrom) } });
    }
    if (dto.minimumStayMax) {
      conditions.push({ minimumStay: { lte: dto.minimumStayMax } });
    }

    // Other
    if (dto.hasParking === true) {
      conditions.push({ parkingType: { not: ParkingType.none } });
    }
    if (dto.hasPool === true) conditions.push({ hasPool: true });
    if (dto.hasContract !== undefined) conditions.push({ hasContract: dto.hasContract });

    return { AND: conditions };
  }
}
