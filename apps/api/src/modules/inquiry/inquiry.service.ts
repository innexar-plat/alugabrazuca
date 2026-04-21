import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InquiryStatus, ListingStatus } from "@prisma/client";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateInquiryDto } from "./dto/create-inquiry.dto";
import { RejectInquiryDto } from "./dto/reject-inquiry.dto";
import { ReplyInquiryDto } from "./dto/reply-inquiry.dto";

const MAX_PENDING_INQUIRIES = 10;
const EXPIRY_DAYS = 7;

@Injectable()
export class InquiryService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Create ─────────────────────────────────────────────────────────

  async create(tenantId: string, dto: CreateInquiryDto) {
    // 1. Verify listing is active
    const listing = await this.prisma.listing.findUnique({
      where: { id: dto.listingId },
      select: { id: true, hostId: true, status: true, title: true },
    });

    if (!listing) throw new NotFoundException("Listing not found");
    if (listing.status !== ListingStatus.active) {
      throw new BadRequestException("Listing is not available for inquiries");
    }
    if (listing.hostId === tenantId) {
      throw new BadRequestException(
        "You cannot send an inquiry to your own listing",
      );
    }

    // 2. Check tenant does not already have inquiry for this listing
    const existing = await this.prisma.inquiry.findUnique({
      where: { listingId_tenantId: { listingId: dto.listingId, tenantId } },
    });
    if (existing) {
      throw new BadRequestException(
        "You already have an inquiry for this listing",
      );
    }

    // 3. Check max pending inquiries
    const pendingCount = await this.prisma.inquiry.count({
      where: { tenantId, status: InquiryStatus.pending },
    });
    if (pendingCount >= MAX_PENDING_INQUIRIES) {
      throw new BadRequestException(
        `You can have at most ${MAX_PENDING_INQUIRIES} pending inquiries at a time`,
      );
    }

    // 4. Create inquiry
    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + EXPIRY_DAYS);

    const inquiry = await this.prisma.inquiry.create({
      data: {
        listingId: dto.listingId,
        tenantId,
        hostId: listing.hostId,
        type: dto.type,
        message: dto.message,
        moveInDate: dto.moveInDate ? new Date(dto.moveInDate) : undefined,
        stayDuration: dto.stayDuration,
        occupants: dto.occupants ?? 1,
        hasPets: dto.hasPets ?? false,
        petDetails: dto.petDetails,
        occupation: dto.occupation,
        aboutMe: dto.aboutMe,
        expiredAt,
      },
      include: {
        listing: { select: { id: true, title: true, city: true, state: true } },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    // 5. Increment listing inquiry counter
    await this.prisma.listing.update({
      where: { id: dto.listingId },
      data: { inquiryCount: { increment: 1 } },
    });

    return { data: inquiry };
  }

  // ── Sent (tenant view) ────────────────────────────────────────────

  async findSent(tenantId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.inquiry.findMany({
        where: { tenantId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              city: true,
              state: true,
              country: true,
              pricePerMonth: true,
              currency: true,
              photos: { take: 1, select: { thumbnailUrl: true } },
            },
          },
          host: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.inquiry.count({ where: { tenantId } }),
    ]);

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Received (host view) ──────────────────────────────────────────

  async findReceived(hostId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.inquiry.findMany({
        where: { hostId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              city: true,
              state: true,
              country: true,
              photos: { take: 1, select: { thumbnailUrl: true } },
            },
          },
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.inquiry.count({ where: { hostId } }),
    ]);

    return {
      data: items,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  // ── Detail ────────────────────────────────────────────────────────

  async findOne(id: string, userId: string) {
    const inquiry = await this.prisma.inquiry.findUnique({
      where: { id },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            city: true,
            state: true,
            country: true,
            streetAddress: true,
            zipCode: true,
            pricePerMonth: true,
            currency: true,
            photos: { take: 3, select: { url: true, thumbnailUrl: true } },
            host: {
              select: {
                id: true,
                firstName: true,
                phone: true,
                whatsapp: true,
              },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
            email: true,
            phone: true,
            whatsapp: true,
          },
        },
        host: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!inquiry) throw new NotFoundException("Inquiry not found");
    if (inquiry.tenantId !== userId && inquiry.hostId !== userId) {
      throw new ForbiddenException("You do not have access to this inquiry");
    }

    // Hide sensitive address unless accepted
    if (inquiry.status !== InquiryStatus.accepted) {
      (inquiry.listing as Record<string, unknown>).streetAddress = null;
      (inquiry.listing as Record<string, unknown>).zipCode = null;
      if (inquiry.listing.host) {
        (inquiry.listing.host as Record<string, unknown>).phone = null;
        (inquiry.listing.host as Record<string, unknown>).whatsapp = null;
      }
      if (inquiry.tenant) {
        (inquiry.tenant as Record<string, unknown>).phone = null;
        (inquiry.tenant as Record<string, unknown>).whatsapp = null;
      }
    }

    return { data: inquiry };
  }

  // ── Accept ────────────────────────────────────────────────────────

  async accept(id: string, hostId: string) {
    const inquiry = await this.findInquiryForHost(id, hostId);
    this.assertPending(inquiry.status);

    const updated = await this.prisma.inquiry.update({
      where: { id },
      data: {
        status: InquiryStatus.accepted,
        acceptedAt: new Date(),
      },
    });
    return { data: updated };
  }

  // ── Reject ────────────────────────────────────────────────────────

  async reject(id: string, hostId: string, dto: RejectInquiryDto) {
    const inquiry = await this.findInquiryForHost(id, hostId);
    this.assertPending(inquiry.status);

    const updated = await this.prisma.inquiry.update({
      where: { id },
      data: {
        status: InquiryStatus.rejected,
        rejectionReason: dto.reason,
        rejectedAt: new Date(),
      },
    });
    return { data: updated };
  }

  // ── Reply ─────────────────────────────────────────────────────────

  async reply(id: string, hostId: string, dto: ReplyInquiryDto) {
    const inquiry = await this.findInquiryForHost(id, hostId);
    if (
      inquiry.status === InquiryStatus.rejected ||
      inquiry.status === InquiryStatus.cancelled
    ) {
      throw new BadRequestException("Cannot reply to a closed inquiry");
    }

    const updated = await this.prisma.inquiry.update({
      where: { id },
      data: { hostReply: dto.message },
    });
    return { data: updated };
  }

  // ── Cancel ────────────────────────────────────────────────────────

  async cancel(id: string, tenantId: string) {
    const inquiry = await this.prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) throw new NotFoundException("Inquiry not found");
    if (inquiry.tenantId !== tenantId) throw new ForbiddenException();
    if (inquiry.status !== InquiryStatus.pending) {
      throw new BadRequestException("Only pending inquiries can be cancelled");
    }

    const updated = await this.prisma.inquiry.update({
      where: { id },
      data: { status: InquiryStatus.cancelled, cancelledAt: new Date() },
    });
    return { data: updated };
  }

  // ── Private Helpers ───────────────────────────────────────────────

  private async findInquiryForHost(id: string, hostId: string) {
    const inquiry = await this.prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) throw new NotFoundException("Inquiry not found");
    if (inquiry.hostId !== hostId) throw new ForbiddenException();
    return inquiry;
  }

  private assertPending(status: InquiryStatus) {
    if (status !== InquiryStatus.pending) {
      throw new BadRequestException("Inquiry is no longer pending");
    }
  }
}
