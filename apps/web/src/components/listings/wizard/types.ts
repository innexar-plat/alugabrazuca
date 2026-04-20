import type { UploadedPhoto } from "./photo-upload";

export interface ListingFormData {
  // Location
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  country: string;
  state: string;
  city: string;
  neighborhood: string;
  zipCode: string;
  streetAddress: string;

  // Room
  roomSize: string;
  bedType: string;
  bedCount: number;
  hasWindow: boolean;
  hasCloset: boolean;
  hasLock: boolean;
  isFurnished: boolean;
  floorLevel: number | null;
  bedsheetsProvided: boolean;

  // Bathroom
  bathroomType: string;
  bathroomCount: number;
  hasBathtub: boolean;
  hasShower: boolean;
  hotWater: string;

  // Common areas
  kitchenAccess: string;
  laundryAccess: string;
  parkingType: string;
  livingRoomAccess: boolean;
  hasBackyard: boolean;
  hasPatio: boolean;
  hasBalcony: boolean;
  hasPool: boolean;
  hasBBQArea: boolean;

  // Amenities
  amenities: string[];

  // Price
  pricePerMonth: number | null;
  currency: string;
  securityDeposit: number | null;
  utilitiesIncluded: boolean;
  utilitiesEstimate: number | null;
  internetIncluded: boolean;
  minimumStay: number;
  availableFrom: string;
  priceNegotiable: boolean;
  paymentMethods: string[];

  // Rules
  allowsPets: string;
  allowsSmoking: string;
  allowsCouples: boolean;
  allowsChildren: boolean;
  allowsVisitors: string;
  quietHours: string;
  maxOccupants: number;
  additionalRules: string;

  // Housing
  totalRooms: number | null;
  totalBathrooms: number | null;
  currentOccupants: number | null;
  hostLivesIn: boolean;
  hasContract: boolean;
  lgbtFriendly: boolean;
  prefersBrazilian: boolean;

  // Media
  coverPhotoIndex: number;
  photos: UploadedPhoto[];

  [key: string]: unknown;
}

export const INITIAL_FORM: ListingFormData = {
  title: "",
  description: "",
  propertyType: "",
  listingType: "",
  country: "",
  state: "",
  city: "",
  neighborhood: "",
  zipCode: "",
  streetAddress: "",
  roomSize: "",
  bedType: "",
  bedCount: 1,
  hasWindow: false,
  hasCloset: false,
  hasLock: false,
  isFurnished: false,
  floorLevel: null,
  bedsheetsProvided: false,
  bathroomType: "",
  bathroomCount: 1,
  hasBathtub: false,
  hasShower: true,
  hotWater: "",
  kitchenAccess: "",
  laundryAccess: "",
  parkingType: "",
  livingRoomAccess: false,
  hasBackyard: false,
  hasPatio: false,
  hasBalcony: false,
  hasPool: false,
  hasBBQArea: false,
  amenities: [],
  pricePerMonth: null,
  currency: "USD",
  securityDeposit: null,
  utilitiesIncluded: false,
  utilitiesEstimate: null,
  internetIncluded: false,
  minimumStay: 1,
  availableFrom: "",
  priceNegotiable: false,
  paymentMethods: [],
  allowsPets: "",
  allowsSmoking: "",
  allowsCouples: false,
  allowsChildren: false,
  allowsVisitors: "",
  quietHours: "",
  maxOccupants: 1,
  additionalRules: "",
  totalRooms: null,
  totalBathrooms: null,
  currentOccupants: null,
  hostLivesIn: false,
  hasContract: false,
  lgbtFriendly: true,
  prefersBrazilian: false,
  coverPhotoIndex: 0,
  photos: [],
};

export const STEPS = [
  "location",
  "room",
  "bathroom",
  "common",
  "price",
  "rules",
  "housing",
  "photos",
  "review",
] as const;

export type StepKey = (typeof STEPS)[number];
