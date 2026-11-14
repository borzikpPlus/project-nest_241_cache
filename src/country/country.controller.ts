import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { CountryService } from './country.service.js';
import { CountryGetResDto } from './dtos/country_get.res.dto.js';
import { CityGetResDto } from './dtos/city_get.res.dto.js';

@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  @Get()
  async getAllCountries(): Promise<CountryGetResDto[]> {
    return await this.countryService.findAll();
  }

  @UseInterceptors(CacheInterceptor)
  @CacheTTL(3600000)
  @Get(':id/cities')
  async getCities(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CityGetResDto[]> {
    return await this.countryService.findCities(id);
  }
}
