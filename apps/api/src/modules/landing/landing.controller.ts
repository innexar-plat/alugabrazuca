import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LandingService } from './landing.service';
import { ContactDto } from './dto/contact.dto';

@ApiTags('Landing')
@Controller('landing')
export class LandingController {
  constructor(private readonly landingService: LandingService) {}

  @Get('featured')
  @ApiOperation({ summary: 'Get featured listings for the landing page' })
  @ApiResponse({ status: 200, description: 'List of featured listings' })
  getFeatured() {
    return this.landingService.getFeatured();
  }

  @Get('cities')
  @ApiOperation({ summary: 'Get popular cities with listing count' })
  @ApiResponse({ status: 200, description: 'List of cities with count' })
  getCities() {
    return this.landingService.getCities();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics' })
  @ApiResponse({ status: 200, description: 'Platform numbers' })
  getStats() {
    return this.landingService.getStats();
  }

  @Get('testimonials')
  @ApiOperation({ summary: 'Get user testimonials' })
  @ApiResponse({ status: 200, description: 'List of testimonials' })
  getTestimonials() {
    return this.landingService.getTestimonials();
  }

  @Post('contact')
  @HttpCode(200)
  @ApiOperation({ summary: 'Submit a contact form message' })
  @ApiResponse({ status: 200, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  submitContact(@Body() dto: ContactDto) {
    return this.landingService.submitContact(dto);
  }
}
