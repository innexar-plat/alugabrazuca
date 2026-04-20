import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InquiryService } from './inquiry.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { RejectInquiryDto } from './dto/reject-inquiry.dto';
import { ReplyInquiryDto } from './dto/reply-inquiry.dto';

@UseGuards(JwtAuthGuard)
@Controller('inquiries')
export class InquiryController {
  constructor(private readonly inquiryService: InquiryService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateInquiryDto) {
    return this.inquiryService.create(userId, dto);
  }

  @Get('sent')
  findSent(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inquiryService.findSent(
      userId,
      page ? Number(page) : 1,
      limit ? Math.min(Number(limit), 100) : 20,
    );
  }

  @Get('received')
  findReceived(
    @CurrentUser('id') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.inquiryService.findReceived(
      userId,
      page ? Number(page) : 1,
      limit ? Math.min(Number(limit), 100) : 20,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.inquiryService.findOne(id, userId);
  }

  @Post(':id/accept')
  accept(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.inquiryService.accept(id, userId);
  }

  @Post(':id/reject')
  reject(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: RejectInquiryDto,
  ) {
    return this.inquiryService.reject(id, userId, dto);
  }

  @Post(':id/reply')
  reply(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
    @Body() dto: ReplyInquiryDto,
  ) {
    return this.inquiryService.reply(id, userId, dto);
  }

  @Post(':id/cancel')
  cancel(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser('id') userId: string,
  ) {
    return this.inquiryService.cancel(id, userId);
  }
}
