import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ThrottlerModule } from "@nestjs/throttler";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthModule } from "./health/health.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ListingModule } from "./modules/listing/listing.module";
import { LandingModule } from "./modules/landing/landing.module";
import { InquiryModule } from "./modules/inquiry/inquiry.module";

@Module({
  imports: [
    // Environment variables
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: "../../.env",
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: Number(process.env.THROTTLE_TTL) || 60000,
        limit: Number(process.env.THROTTLE_LIMIT) || 120,
      },
    ]),

    // Database
    PrismaModule,

    // Health checks
    HealthModule,

    // Auth & Users
    AuthModule,

    // Listings
    ListingModule,

    // Landing page
    LandingModule,

    // Inquiries
    InquiryModule,
  ],
})
export class AppModule {}
