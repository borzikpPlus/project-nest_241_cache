import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryService } from './country.service.js';
import { CountryController } from './country.controller.js';
import { Country } from './entities/country.entity.js';
import { City } from './entities/city.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Country, City])],
  controllers: [CountryController],
  providers: [CountryService],
  exports: [],
})
export class CountryModule {}
