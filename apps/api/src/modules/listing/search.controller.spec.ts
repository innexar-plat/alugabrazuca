import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Test, TestingModule } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchListingsDto } from './dto';

describe('SearchController', () => {
  let controller: SearchController;
  let searchService: SearchService;

  const mockSearchService = {
    search: vi.fn(),
    getCities: vi.fn(),
    getSuggestions: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [
        { provide: SearchService, useValue: mockSearchService },
      ],
    }).compile();

    controller = module.get<SearchController>(SearchController);
    searchService = module.get<SearchService>(SearchService);
  });

  describe('search', () => {
    it('should delegate to searchService.search with the dto', async () => {
      const dto = new SearchListingsDto();
      dto.city = 'Orlando';
      const expected = {
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      };
      mockSearchService.search.mockResolvedValue(expected);

      const result = await controller.search(dto);

      expect(result).toEqual(expected);
      expect(mockSearchService.search).toHaveBeenCalledWith(dto);
    });

    it('should pass default dto when no filters provided', async () => {
      const dto = new SearchListingsDto();
      const expected = {
        data: [{ id: 'uuid', title: 'Test' }],
        meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
      };
      mockSearchService.search.mockResolvedValue(expected);

      const result = await controller.search(dto);

      expect(result).toEqual(expected);
      expect(mockSearchService.search).toHaveBeenCalledOnce();
    });
  });

  describe('getCities', () => {
    it('should delegate to searchService.getCities', async () => {
      const expected = {
        data: [
          { country: 'USA', state: 'Florida', city: 'Orlando', count: 5 },
        ],
      };
      mockSearchService.getCities.mockResolvedValue(expected);

      const result = await controller.getCities();

      expect(result).toEqual(expected);
      expect(mockSearchService.getCities).toHaveBeenCalledOnce();
    });

    it('should return empty data when no cities found', async () => {
      mockSearchService.getCities.mockResolvedValue({ data: [] });

      const result = await controller.getCities();

      expect(result.data).toEqual([]);
    });
  });

  describe('getSuggestions', () => {
    it('should delegate to searchService.getSuggestions with query', async () => {
      const expected = {
        data: [
          { label: 'Orlando, Florida, USA', city: 'Orlando', state: 'Florida', country: 'USA' },
        ],
      };
      mockSearchService.getSuggestions.mockResolvedValue(expected);

      const result = await controller.getSuggestions('Orl');

      expect(result).toEqual(expected);
      expect(mockSearchService.getSuggestions).toHaveBeenCalledWith('Orl');
    });

    it('should pass empty string when query is undefined', async () => {
      mockSearchService.getSuggestions.mockResolvedValue({ data: [] });

      // The controller uses `query || ''` so undefined becomes ''
      const result = await controller.getSuggestions(undefined as any);

      expect(mockSearchService.getSuggestions).toHaveBeenCalledWith('');
    });

    it('should return empty suggestions for short query', async () => {
      mockSearchService.getSuggestions.mockResolvedValue({ data: [] });

      const result = await controller.getSuggestions('a');

      expect(result.data).toEqual([]);
      expect(mockSearchService.getSuggestions).toHaveBeenCalledWith('a');
    });
  });
});
