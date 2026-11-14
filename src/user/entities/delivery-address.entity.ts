import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from './user.entity.js';
import { City } from '../../country/entities/city.entity.js';

@Entity()
export class DeliveryAddress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => City, { nullable: false })
  @JoinColumn({ name: 'city_id' })
  city: Relation<City>;

  @Column({ length: 100 })
  street: string;

  @Column({ length: 20 })
  house: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  apartment: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  postal_code: string | null;

  @OneToOne(() => User, (user) => user.delivery_address, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>;
}
