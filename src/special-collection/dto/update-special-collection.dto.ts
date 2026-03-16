import { PartialType } from '@nestjs/mapped-types';
import { CreateSpecialCollectionDto } from './create-special-collection.dto';

export class UpdateSpecialCollectionDto extends PartialType(CreateSpecialCollectionDto) {}
