import { Module } from '@nestjs/common';
import { ListingController } from './listing.controller';
import { ListingService } from './listing.service';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';

@Module({
  controllers: [SearchController, ListingController],
  providers: [ListingService, SearchService],
  exports: [ListingService, SearchService],
})
export class ListingModule {}
