import { DeliveryAddressGetResDto } from './delivery-address.res.dto.js';

export class UserGetResDto {
  id: number;
  email: string;
  fullname: string;
  is_block: boolean;
  role: string | null;
  delivery_address: DeliveryAddressGetResDto | null;
}
