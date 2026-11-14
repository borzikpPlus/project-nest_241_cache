import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { City } from './city.entity.js';

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 100 })
  name: string;

  @Column({ unique: true, length: 2 })
  iso2: string;

  @Column({ length: 3 })
  iso3: string;

  @OneToMany(() => City, (city) => city.country)
  cities: City[];
}
