export class DeliveryAddressGetResDto {
  id: number;
  country: string;
  city: string;
  street: string;
  house: string;
  apartment: string | null;
  postal_code: string | null;
}
