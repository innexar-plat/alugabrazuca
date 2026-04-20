import { describe, it, expect } from 'vitest';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { SearchListingsDto } from './search-listings.dto';

function createDto(data: Record<string, any>): SearchListingsDto {
  return plainToInstance(SearchListingsDto, data, { enableImplicitConversion: false });
}

describe('SearchListingsDto', () => {
  // ── Pagination ──

  describe('pagination', () => {
    it('should pass validation with default values', async () => {
      const dto = createDto({});
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should pass validation with valid page and limit', async () => {
      const dto = createDto({ page: 2, limit: 50 });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when page is 0', async () => {
      const dto = createDto({ page: 0 });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('page');
    });

    it('should fail validation when limit exceeds 100', async () => {
      const dto = createDto({ limit: 101 });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('limit');
    });

    it('should fail validation when page is negative', async () => {
      const dto = createDto({ page: -1 });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ── Price ──

  describe('price', () => {
    it('should pass validation with valid minPrice and maxPrice', async () => {
      const dto = createDto({ minPrice: 100, maxPrice: 2000 });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when minPrice is negative', async () => {
      const dto = createDto({ minPrice: -50 });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('minPrice');
    });
  });

  // ── Boolean transforms ──

  describe('boolean transforms', () => {
    it('should transform string "true" to boolean true for isFurnished', () => {
      const dto = createDto({ isFurnished: 'true' });
      expect(dto.isFurnished).toBe(true);
    });

    it('should transform string "false" to boolean false for isFurnished', () => {
      const dto = createDto({ isFurnished: 'false' });
      expect(dto.isFurnished).toBe(false);
    });

    it('should transform boolean true directly for allowsPets', () => {
      const dto = createDto({ allowsPets: true });
      expect(dto.allowsPets).toBe(true);
    });

    it('should transform string "true" for utilitiesIncluded', () => {
      const dto = createDto({ utilitiesIncluded: 'true' });
      expect(dto.utilitiesIncluded).toBe(true);
    });

    it('should transform string "true" for internetIncluded', () => {
      const dto = createDto({ internetIncluded: 'true' });
      expect(dto.internetIncluded).toBe(true);
    });

    it('should transform string "true" for hasWindow', () => {
      const dto = createDto({ hasWindow: 'true' });
      expect(dto.hasWindow).toBe(true);
    });

    it('should transform string "true" for hasLock', () => {
      const dto = createDto({ hasLock: 'true' });
      expect(dto.hasLock).toBe(true);
    });

    it('should transform string "true" for allowsSmoking', () => {
      const dto = createDto({ allowsSmoking: 'true' });
      expect(dto.allowsSmoking).toBe(true);
    });

    it('should transform string "true" for allowsCouples', () => {
      const dto = createDto({ allowsCouples: 'true' });
      expect(dto.allowsCouples).toBe(true);
    });

    it('should transform string "true" for allowsChildren', () => {
      const dto = createDto({ allowsChildren: 'true' });
      expect(dto.allowsChildren).toBe(true);
    });

    it('should transform string "true" for lgbtFriendly', () => {
      const dto = createDto({ lgbtFriendly: 'true' });
      expect(dto.lgbtFriendly).toBe(true);
    });

    it('should transform string "true" for hasParking', () => {
      const dto = createDto({ hasParking: 'true' });
      expect(dto.hasParking).toBe(true);
    });

    it('should transform string "true" for hasPool', () => {
      const dto = createDto({ hasPool: 'true' });
      expect(dto.hasPool).toBe(true);
    });

    it('should transform string "true" for hasContract', () => {
      const dto = createDto({ hasContract: 'true' });
      expect(dto.hasContract).toBe(true);
    });
  });

  // ── Enum validation ──

  describe('enum validation', () => {
    it('should pass validation with valid listingType', async () => {
      const dto = createDto({ listingType: 'private_room' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid listingType', async () => {
      const dto = createDto({ listingType: 'invalid_type' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('listingType');
    });

    it('should pass validation with valid bathroomType', async () => {
      const dto = createDto({ bathroomType: 'private_ensuite' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  // ── Text search ──

  describe('text search', () => {
    it('should trim query string', () => {
      const dto = createDto({ query: '  Orlando  ' });
      expect(dto.query).toBe('Orlando');
    });

    it('should pass validation with valid query string', async () => {
      const dto = createDto({ query: 'Orlando room' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  // ── Availability ──

  describe('availability', () => {
    it('should pass validation with valid date string for availableFrom', async () => {
      const dto = createDto({ availableFrom: '2026-06-01' });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation with invalid date for availableFrom', async () => {
      const dto = createDto({ availableFrom: 'not-a-date' });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('availableFrom');
    });

    it('should pass validation with valid minimumStayMax', async () => {
      const dto = createDto({ minimumStayMax: 6 });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail validation when minimumStayMax is 0', async () => {
      const dto = createDto({ minimumStayMax: 0 });
      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });

  // ── Location ──

  describe('location', () => {
    it('should pass validation with all location fields', async () => {
      const dto = createDto({
        country: 'USA',
        state: 'Florida',
        city: 'Orlando',
        neighborhood: 'Downtown',
        zipCode: '32801',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  // ── All fields combined ──

  describe('combined filters', () => {
    it('should pass validation with multiple valid filters', async () => {
      const dto = createDto({
        page: 1,
        limit: 10,
        sortBy: 'pricePerMonth',
        order: 'asc',
        query: 'room',
        city: 'Orlando',
        minPrice: 500,
        maxPrice: 1500,
        listingType: 'private_room',
        isFurnished: 'true',
        allowsPets: 'true',
        availableFrom: '2026-03-01',
      });
      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
