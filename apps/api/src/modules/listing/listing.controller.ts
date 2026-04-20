import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { ListingService } from './listing.service';
import { CreateListingDto, UpdateListingDto, ListingQueryDto, ReorderPhotosDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

const UPLOAD_DIR = './uploads/listings';
mkdirSync(UPLOAD_DIR, { recursive: true });

@Controller('listings')
export class ListingController {
  constructor(private readonly listingService: ListingService) {}

  // ── File Upload ──

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          const ext = extname(file.originalname).toLowerCase();
          cb(null, `${uniqueSuffix}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\/(jpeg|png|webp)$/)) {
          cb(new BadRequestException('Only JPG, PNG and WebP images are allowed'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  uploadPhoto(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const url = `/uploads/listings/${file.filename}`;
    return { url, thumbnailUrl: url, filename: file.filename, size: file.size };
  }

  // ── CRUD ──

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateListingDto,
  ) {
    return this.listingService.create(userId, dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  findMyListings(
    @CurrentUser('id') userId: string,
    @Query() query: ListingQueryDto,
  ) {
    return this.listingService.findMyListings(userId, query);
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    // Public endpoint — no auth, no ownership check for active listings
    return this.listingService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listingService.update(id, userId, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.listingService.remove(id, userId);
  }

  // ── Lifecycle ──

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  publish(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.listingService.publish(id, userId);
  }

  @Post(':id/pause')
  @UseGuards(JwtAuthGuard)
  pause(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.listingService.pause(id, userId);
  }

  @Post(':id/resume')
  @UseGuards(JwtAuthGuard)
  resume(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.listingService.resume(id, userId);
  }

  @Post(':id/mark-rented')
  @UseGuards(JwtAuthGuard)
  markRented(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.listingService.markRented(id, userId);
  }

  // ── Photos ──

  @Post(':id/photos')
  @UseGuards(JwtAuthGuard)
  addPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() body: { url: string; thumbnailUrl: string; caption?: string },
  ) {
    if (!body.url || !body.thumbnailUrl) {
      throw new BadRequestException('url and thumbnailUrl are required');
    }
    return this.listingService.addPhoto(id, userId, body.url, body.thumbnailUrl, body.caption);
  }

  @Delete(':id/photos/:photoId')
  @UseGuards(JwtAuthGuard)
  removePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.listingService.removePhoto(id, photoId, userId);
  }

  @Patch(':id/photos/reorder')
  @UseGuards(JwtAuthGuard)
  reorderPhotos(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ReorderPhotosDto,
  ) {
    return this.listingService.reorderPhotos(id, userId, dto.photoIds);
  }
}
