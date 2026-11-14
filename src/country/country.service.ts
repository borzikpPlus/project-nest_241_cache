import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Country } from './entities/country.entity.js';
import { City } from './entities/city.entity.js';
import { CountryGetResDto } from './dtos/country_get.res.dto.js';
import { CityGetResDto } from './dtos/city_get.res.dto.js';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    private readonly _repository: Repository<Country>,
    @InjectRepository(City)
    private readonly _cityRepository: Repository<City>,
  ) {}

  async findAll(): Promise<CountryGetResDto[]> {
    return await this._repository.find({
      select: { id: true, name: true, iso2: true, iso3: true },
      order: { name: 'ASC' },
    });
  }

  async findCities(countryId: number): Promise<CityGetResDto[]> {
    const country = await this._repository.findOneBy({ id: countryId });
    if (!country) {
      throw new NotFoundException('Country not found');
    }
    return await this._cityRepository.find({
      select: { id: true, name: true },
      where: { country: { id: countryId } },
      order: { name: 'ASC' },
    });
  }
}
