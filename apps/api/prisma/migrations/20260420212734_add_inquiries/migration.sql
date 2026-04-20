-- CreateEnum
CREATE TYPE "InquiryType" AS ENUM ('visit', 'info', 'apply');

-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('pending', 'accepted', 'rejected', 'expired', 'cancelled', 'completed');

-- CreateTable
CREATE TABLE "inquiries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "host_id" UUID NOT NULL,
    "type" "InquiryType" NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'pending',
    "message" TEXT NOT NULL,
    "move_in_date" DATE,
    "stay_duration" INTEGER,
    "occupants" INTEGER NOT NULL DEFAULT 1,
    "has_pets" BOOLEAN NOT NULL DEFAULT false,
    "pet_details" VARCHAR(255),
    "occupation" VARCHAR(100),
    "about_me" TEXT,
    "host_reply" TEXT,
    "rejection_reason" TEXT,
    "accepted_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "expired_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inquiries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "inquiries_listing_id_idx" ON "inquiries"("listing_id");

-- CreateIndex
CREATE INDEX "inquiries_tenant_id_idx" ON "inquiries"("tenant_id");

-- CreateIndex
CREATE INDEX "inquiries_host_id_idx" ON "inquiries"("host_id");

-- CreateIndex
CREATE INDEX "inquiries_status_idx" ON "inquiries"("status");

-- CreateIndex
CREATE INDEX "inquiries_created_at_idx" ON "inquiries"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "inquiries_listing_id_tenant_id_key" ON "inquiries"("listing_id", "tenant_id");

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inquiries" ADD CONSTRAINT "inquiries_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
