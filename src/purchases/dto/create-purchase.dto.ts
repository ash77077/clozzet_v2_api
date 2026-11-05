import {
  IsString, IsNotEmpty, IsOptional, IsIn, IsNumber,
  IsArray, ValidateNested, IsDateString, Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePurchaseLineDto {
  @IsString() @IsOptional() lineType?: string; // default 'fabric'
  @IsString() @IsNotEmpty() fabricTypeId: string;
  @IsString() @IsOptional() fabricTypeName?: string;
  @IsString() @IsOptional() colorId?: string;
  @IsString() @IsOptional() colorName?: string;
  @IsNumber() @Min(0.001) quantity: number;
  @IsNumber() @Min(0) unitPrice: number;
  @IsString() @IsOptional() orderId?: string;
}

export class CreatePurchaseDto {
  @IsString() @IsNotEmpty() supplierId: string;
  @IsString() @IsOptional() supplierName?: string;
  @IsDateString() date: string;
  @IsIn(['cash', 'invoice']) paymentType: string;
  @IsString() @IsOptional() documentNumber?: string;
  @IsDateString() @IsOptional() documentDate?: string;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CreatePurchaseLineDto) lines: CreatePurchaseLineDto[];
  @IsNumber() @Min(0) @IsOptional() paidAmount?: number;
  @IsIn(['unpaid', 'partial', 'paid']) @IsOptional() paymentStatus?: string;
  @IsString() @IsOptional() notes?: string;
}
