import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ListingStatus, UserStatus } from '@prisma/client';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class LandingService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeatured() {
    const listings = await this.prisma.listing.findMany({
      where: {
        status: ListingStatus.active,
        deletedAt: null,
        isFeatured: true,
        featuredUntil: { gte: new Date() },
      },
      select: {
        id: true,
        title: true,
        country: true,
        state: true,
        city: true,
        pricePerMonth: true,
        currency: true,
        listingType: true,
        roomSize: true,
        isFurnished: true,
        utilitiesIncluded: true,
        availableFrom: true,
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
      orderBy: { createdAt: 'desc' },
      take: 8,
    });

    // If not enough featured listings, fill with recent active ones
    if (listings.length < 6) {
      const existingIds = listings.map((l) => l.id);
      const additional = await this.prisma.listing.findMany({
        where: {
          status: ListingStatus.active,
          deletedAt: null,
          id: { notIn: existingIds },
        },
        select: {
          id: true,
          title: true,
          country: true,
          state: true,
          city: true,
          pricePerMonth: true,
          currency: true,
          listingType: true,
          roomSize: true,
          isFurnished: true,
          utilitiesIncluded: true,
          availableFrom: true,
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
        orderBy: [{ viewCount: 'desc' }, { createdAt: 'desc' }],
        take: 8 - listings.length,
      });
      listings.push(...additional);
    }

    return { data: listings };
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
      take: 8,
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

  async getStats() {
    const [activeListings, cityGroups, totalUsers] =
      await this.prisma.$transaction([
        this.prisma.listing.count({
          where: { status: ListingStatus.active, deletedAt: null },
        }),
        this.prisma.listing.groupBy({
          by: ['city'],
          where: { status: ListingStatus.active, deletedAt: null },
          orderBy: { city: 'asc' },
        }),
        this.prisma.user.count({
          where: { status: UserStatus.active, deletedAt: null },
        }),
      ]);

    return {
      data: {
        activeListings,
        totalCities: (cityGroups as unknown[]).length,
        totalUsers,
        totalReviews: 0, // M7 Reviews not yet implemented
      },
    };
  }

  async getTestimonials() {
    // Placeholder testimonials until M7 (Reviews) is implemented.
    // These will be replaced with real user reviews pulled from the database.
    return {
      data: [
        {
          id: '1',
          name: 'Ana Silva',
          city: 'Orlando, FL',
          avatarUrl: null,
          text: 'testimonial_1',
          rating: 5,
        },
        {
          id: '2',
          name: 'Carlos Santos',
          city: 'Newark, NJ',
          avatarUrl: null,
          text: 'testimonial_2',
          rating: 5,
        },
        {
          id: '3',
          name: 'Juliana Costa',
          city: 'Lisboa, PT',
          avatarUrl: null,
          text: 'testimonial_3',
          rating: 4,
        },
      ],
    };
  }

  async submitContact(dto: ContactDto) {
    await this.prisma.contactMessage.create({
      data: {
        name: dto.name,
        email: dto.email,
        subject: dto.subject,
        message: dto.message,
      },
    });

    return { message: 'Message sent successfully' };
  }
}
