import dataSource from '../data-source.js';
import { Country } from '../country/entities/country.entity.js';
import { City } from '../country/entities/city.entity.js';

const API_URL = 'https://countriesnow.space/api/v0.1';
const countries = ['Ukraine', 'Poland', 'Lithuania'];

interface ApiResponse<T> {
  error: boolean;
  msg: string;
  data: T;
}

interface ApiCountry {
  name: string;
  Iso2: string;
  Iso3: string;
}

async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || body.error) {
    throw new Error(`${url}: ${response.status} ${body.msg}`);
  }
  return body.data;
}

async function seedGeo(): Promise<void> {
  await dataSource.initialize();

  try {
    const countryRepository = dataSource.getRepository(Country);
    const isoList = await fetchData<ApiCountry[]>(`${API_URL}/countries/iso`);

    for (const name of countries) {
      const iso = isoList.find((c) => c.name === name);
      if (!iso) {
        throw new Error(`Country ${name} not found in API`);
      }
      await countryRepository.upsert({ name, iso2: iso.Iso2, iso3: iso.Iso3 }, [
        'iso2',
      ]);
      const country = await countryRepository.findOneByOrFail({
        iso2: iso.Iso2,
      });

      const cities = await fetchData<string[]>(
        `${API_URL}/countries/cities/q?country=${encodeURIComponent(name)}`,
      );
      const names = [...new Set(cities.map((c) => c.trim()))].filter(
        (c) => c.length > 0 && c.length <= 100,
      );
      for (let i = 0; i < names.length; i += 1000) {
        await dataSource
          .createQueryBuilder()
          .insert()
          .into(City)
          .values(names.slice(i, i + 1000).map((c) => ({ name: c, country })))
          .orIgnore()
          .execute();
      }
      console.log(`${name}: ${names.length} cities`);
    }
  } finally {
    await dataSource.destroy();
  }
}

void seedGeo().catch((error: unknown) => {
  console.error('Failed to seed geo:', error);
  process.exitCode = 1;
});
