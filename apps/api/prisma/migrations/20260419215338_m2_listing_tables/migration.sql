-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('house', 'apartment', 'condo', 'townhouse', 'studio', 'other');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('private_room', 'shared_room', 'entire_place');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('draft', 'pending_review', 'active', 'paused', 'rejected', 'expired', 'rented');

-- CreateEnum
CREATE TYPE "RoomSize" AS ENUM ('small', 'medium', 'large', 'extra_large');

-- CreateEnum
CREATE TYPE "BedType" AS ENUM ('single', 'double', 'queen', 'king', 'bunk_bed', 'sofa_bed', 'mattress_only', 'no_bed');

-- CreateEnum
CREATE TYPE "BathroomType" AS ENUM ('private_ensuite', 'private_not_ensuite', 'shared');

-- CreateEnum
CREATE TYPE "KitchenAccess" AS ENUM ('full', 'limited', 'scheduled', 'none');

-- CreateEnum
CREATE TYPE "LaundryAccess" AS ENUM ('in_unit', 'in_building', 'nearby', 'none');

-- CreateEnum
CREATE TYPE "ParkingType" AS ENUM ('included', 'available_paid', 'street', 'none');

-- CreateEnum
CREATE TYPE "PetPolicy" AS ENUM ('yes', 'small_only', 'cats_only', 'dogs_only', 'no');

-- CreateEnum
CREATE TYPE "SmokingPolicy" AS ENUM ('yes', 'outside_only', 'no');

-- CreateEnum
CREATE TYPE "VisitorPolicy" AS ENUM ('anytime', 'daytime_only', 'with_notice', 'no_overnight', 'no');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('USD', 'EUR', 'GBP');

-- CreateTable
CREATE TABLE "listings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "host_id" UUID NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "description" TEXT NOT NULL,
    "property_type" "PropertyType" NOT NULL,
    "listing_type" "ListingType" NOT NULL,
    "status" "ListingStatus" NOT NULL DEFAULT 'draft',
    "country" VARCHAR(50) NOT NULL,
    "state" VARCHAR(50) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "neighborhood" VARCHAR(100),
    "zip_code" VARCHAR(20) NOT NULL,
    "street_address" VARCHAR(255) NOT NULL,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "nearby_locations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "public_transport" VARCHAR(255),
    "distance_to_downtown" VARCHAR(50),
    "room_size" "RoomSize" NOT NULL,
    "room_size_sqft" INTEGER,
    "floor_level" INTEGER,
    "has_window" BOOLEAN NOT NULL,
    "has_closet" BOOLEAN NOT NULL,
    "has_lock" BOOLEAN NOT NULL,
    "is_furnished" BOOLEAN NOT NULL,
    "natural_light" VARCHAR(10),
    "bed_type" "BedType" NOT NULL,
    "bed_count" INTEGER NOT NULL DEFAULT 1,
    "bedsheets_provided" BOOLEAN NOT NULL DEFAULT false,
    "room_furniture" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bathroom_type" "BathroomType" NOT NULL,
    "bathroom_count" INTEGER,
    "shared_with_count" INTEGER,
    "has_bathtub" BOOLEAN NOT NULL DEFAULT false,
    "has_shower" BOOLEAN NOT NULL DEFAULT true,
    "has_bidet" BOOLEAN NOT NULL DEFAULT false,
    "hot_water" VARCHAR(20),
    "towels_provided" BOOLEAN NOT NULL DEFAULT false,
    "kitchen_access" "KitchenAccess" NOT NULL,
    "kitchen_schedule" VARCHAR(100),
    "kitchen_appliances" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "has_own_cabinet_space" BOOLEAN NOT NULL DEFAULT false,
    "has_own_fridge_space" BOOLEAN NOT NULL DEFAULT false,
    "laundry_access" "LaundryAccess" NOT NULL,
    "laundry_frequency" VARCHAR(20),
    "laundry_cost" VARCHAR(20),
    "laundry_cost_amount" DECIMAL(10,2),
    "has_dryer" BOOLEAN NOT NULL DEFAULT false,
    "has_iron" BOOLEAN NOT NULL DEFAULT false,
    "living_room_access" BOOLEAN NOT NULL DEFAULT false,
    "living_room_shared" BOOLEAN NOT NULL DEFAULT true,
    "parking_type" "ParkingType" NOT NULL,
    "parking_cost" DECIMAL(10,2),
    "parking_spaces" INTEGER,
    "has_backyard" BOOLEAN NOT NULL DEFAULT false,
    "has_patio" BOOLEAN NOT NULL DEFAULT false,
    "has_balcony" BOOLEAN NOT NULL DEFAULT false,
    "has_pool" BOOLEAN NOT NULL DEFAULT false,
    "has_bbq_area" BOOLEAN NOT NULL DEFAULT false,
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "price_per_month" DECIMAL(10,2) NOT NULL,
    "currency" "Currency" NOT NULL DEFAULT 'USD',
    "security_deposit" DECIMAL(10,2),
    "deposit_months" DECIMAL(3,1),
    "utilities_included" BOOLEAN NOT NULL,
    "utilities_estimate" DECIMAL(10,2),
    "utilities_details" TEXT,
    "internet_included" BOOLEAN NOT NULL,
    "minimum_stay" INTEGER NOT NULL DEFAULT 1,
    "maximum_stay" INTEGER,
    "available_from" DATE NOT NULL,
    "available_to" DATE,
    "payment_methods" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "price_negotiable" BOOLEAN NOT NULL DEFAULT false,
    "allows_pets" "PetPolicy" NOT NULL,
    "pet_deposit" DECIMAL(10,2),
    "allows_smoking" "SmokingPolicy" NOT NULL,
    "allows_couples" BOOLEAN NOT NULL,
    "couple_extra_charge" DECIMAL(10,2),
    "allows_children" BOOLEAN NOT NULL,
    "allows_visitors" "VisitorPolicy" NOT NULL,
    "quiet_hours" VARCHAR(50),
    "max_occupants" INTEGER NOT NULL DEFAULT 1,
    "additional_rules" TEXT,
    "preferred_gender" VARCHAR(10),
    "preferred_age" VARCHAR(20),
    "preferred_occupation" VARCHAR(20),
    "lgbt_friendly" BOOLEAN NOT NULL DEFAULT true,
    "prefers_brazilian" BOOLEAN NOT NULL DEFAULT false,
    "total_rooms" INTEGER NOT NULL,
    "total_bathrooms" INTEGER NOT NULL,
    "current_occupants" INTEGER NOT NULL,
    "occupants_gender" VARCHAR(10),
    "occupants_description" VARCHAR(255),
    "host_lives_in" BOOLEAN NOT NULL,
    "has_contract" BOOLEAN NOT NULL,
    "contract_type" VARCHAR(30),
    "video_url" VARCHAR(500),
    "virtual_tour_url" VARCHAR(500),
    "cover_photo_index" INTEGER NOT NULL DEFAULT 0,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "favorite_count" INTEGER NOT NULL DEFAULT 0,
    "inquiry_count" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "featured_until" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "reviewed_by" UUID,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listing_photos" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "listing_id" UUID NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "thumbnail_url" VARCHAR(500) NOT NULL,
    "caption" VARCHAR(200),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "listing_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "listings_host_id_idx" ON "listings"("host_id");

-- CreateIndex
CREATE INDEX "listings_status_idx" ON "listings"("status");

-- CreateIndex
CREATE INDEX "listings_city_status_idx" ON "listings"("city", "status");

-- CreateIndex
CREATE INDEX "listings_country_city_status_idx" ON "listings"("country", "city", "status");

-- CreateIndex
CREATE INDEX "listings_price_per_month_idx" ON "listings"("price_per_month");

-- CreateIndex
CREATE INDEX "listings_available_from_idx" ON "listings"("available_from");

-- CreateIndex
CREATE INDEX "listings_created_at_idx" ON "listings"("created_at");

-- CreateIndex
CREATE INDEX "listing_photos_listing_id_idx" ON "listing_photos"("listing_id");

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_host_id_fkey" FOREIGN KEY ("host_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listing_photos" ADD CONSTRAINT "listing_photos_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
