import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { Country } from './country.entity.js';

@Entity()
@Unique(['name', 'country'])
export class City {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Country, (country) => country.cities, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'country_id' })
  country: Relation<Country>;
}
