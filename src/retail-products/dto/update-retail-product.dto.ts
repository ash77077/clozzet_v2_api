import { PartialType } from '@nestjs/mapped-types';
import { CreateRetailProductDto } from './create-retail-product.dto';

export class UpdateRetailProductDto extends PartialType(CreateRetailProductDto) {}
