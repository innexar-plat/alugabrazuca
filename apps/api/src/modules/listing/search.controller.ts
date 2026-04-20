import {
  Controller,
  Get,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchListingsDto } from './dto';

@ApiTags('Search')
@Controller('listings')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search listings with filters' })
  @ApiResponse({ status: 200, description: 'Paginated list of matching listings' })
  search(@Query() dto: SearchListingsDto) {
    return this.searchService.search(dto);
  }

  @Get('cities')
  @ApiOperation({ summary: 'Get all cities with active listings' })
  @ApiResponse({ status: 200, description: 'Grouped list of cities with listing counts' })
  getCities() {
    return this.searchService.getCities();
  }

  @Get('suggestions')
  @ApiOperation({ summary: 'Get search autocomplete suggestions' })
  @ApiQuery({ name: 'query', required: false, description: 'Search text (min 2 characters)' })
  @ApiResponse({ status: 200, description: 'List of location suggestions' })
  getSuggestions(@Query('query') query: string) {
    return this.searchService.getSuggestions(query || '');
  }
}
