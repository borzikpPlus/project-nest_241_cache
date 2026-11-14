import { PartialType } from '@nestjs/mapped-types';
import { DeliveryAddressReqDto } from './delivery-address.req.dto.js';

export class UpdateDeliveryAddressDto extends PartialType(
  DeliveryAddressReqDto,
) {}
