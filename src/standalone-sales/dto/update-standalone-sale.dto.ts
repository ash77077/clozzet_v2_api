import { PartialType } from '@nestjs/swagger';
import { CreateStandaloneSaleDto } from './create-standalone-sale.dto';

export class UpdateStandaloneSaleDto extends PartialType(CreateStandaloneSaleDto) {}
