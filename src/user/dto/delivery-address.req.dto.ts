import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class DeliveryAddressReqDto {
  @IsInt({ message: 'ID міста має бути цілим числом' })
  @Min(1, { message: 'ID міста має бути більше 0' })
  city_id: number;

  @IsString()
  @MinLength(2, { message: 'Вулиця мінімум 2 символи' })
  @MaxLength(100, { message: 'Вулиця максимум 100 символів' })
  street: string;

  @IsString()
  @MinLength(1, { message: 'Номер будинку обовʼязковий' })
  @MaxLength(20, { message: 'Номер будинку максимум 20 символів' })
  house: string;

  @IsOptional()
  @IsString()
  @MaxLength(20, { message: 'Квартира максимум 20 символів' })
  apartment?: string;

  @IsOptional()
  @Matches(/^[0-9A-Za-z -]{3,10}$/, { message: 'Некоректний поштовий індекс' })
  postal_code?: string;
}
