import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, Min, IsObject, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductItemDto {
  @ApiProperty({
    description: 'Type of cloth/product',
    example: 't-shirts',
  })
  @IsString()
  @IsNotEmpty()
  clothType: string;

  @ApiProperty({
    description: 'Textile type',
    example: 'cotton',
    required: false,
  })
  @IsOptional()
  @IsString()
  textileType?: string;

  @ApiProperty({
    description: 'Design method for this product',
    example: 'Ասեղնագործություն',
    required: false,
  })
  @IsOptional()
  @IsString()
  designMethod?: string;

  @ApiProperty({
    description: 'Colors for this product',
    example: 'Black, White, Navy Blue',
    required: false,
  })
  @IsOptional()
  @IsString()
  colors?: string;

  @ApiProperty({
    description: 'Custom color details',
    example: 'Pantone 185C',
    required: false,
  })
  @IsOptional()
  @IsString()
  customColorDetails?: string;

  @ApiProperty({
    description: 'Logo position',
    example: 'front-center',
    required: false,
  })
  @IsOptional()
  @IsString()
  logoPosition?: string;

  @ApiProperty({
    description: 'Logo size',
    example: '10x8 cm',
    required: false,
  })
  @IsOptional()
  @IsString()
  logoSize?: string;

  @ApiProperty({
    description: 'Comments for this product',
    example: 'Please use premium quality cotton',
    required: false,
  })
  @IsOptional()
  @IsString()
  comments?: string;

  @ApiProperty({
    description: 'Cost price per unit (production cost)',
    example: 8.50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  costPricePerUnit?: number;

  @ApiProperty({
    description: 'Selling price per unit (price charged to customer) — legacy single price',
    example: 15.00,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  sellingPricePerUnit?: number;

  @ApiProperty({
    description: 'Selling price per unit for adult sizes',
    example: 5000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  adultSellingPricePerUnit?: number;

  @ApiProperty({
    description: 'Selling price per unit for children sizes',
    example: 3500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  childrenSellingPricePerUnit?: number;

  @ApiProperty({
    description: 'Size breakdown for this product',
    example: {
      xs: { men: 5, women: 10, uni: 0 },
      s: { men: 10, women: 15, uni: 5 },
      m: { men: 20, women: 20, uni: 10 }
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  sizes?: Record<string, { men?: number; women?: number; uni?: number }>;
}

export class CreateProductDetailsDto {
  @ApiProperty({
    description: 'Order number (auto-generated if not provided)',
    example: '1',
    required: false,
  })
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Tech Corp',
    required: false,
  })
  @IsOptional()
  @IsString()
  companyName?: string;

  @ApiProperty({
    description: 'Client name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  clientName: string;

  @ApiProperty({
    description: 'Sales person handling the order',
    example: 'John Smith',
  })
  @IsString()
  @IsNotEmpty()
  salesPerson: string;

  @ApiProperty({
    description: 'Order deadline',
    example: '2024-02-15',
  })
  @IsString()
  @IsNotEmpty()
  deadline: string;

  @ApiProperty({
    description: 'Total quantity (auto-calculated from products)',
    example: 100,
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({
    description: 'Priority level',
    example: 'high',
  })
  @IsEnum(['low', 'normal', 'high', 'urgent'])
  priority: string;

  @ApiProperty({
    description: 'Array of products in this order',
    type: [ProductItemDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductItemDto)
  products?: ProductItemDto[];

  @ApiProperty({
    description: 'Order status',
    example: 'pending',
    required: false,
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Start date',
    example: '2024-02-01',
    required: false,
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  // Legacy Product Specifications (for backward compatibility)
  @ApiProperty({
    description: 'Type of cloth/product (legacy - use products array instead)',
    example: 't-shirts',
    required: false,
  })
  @IsOptional()
  @IsString()
  clothType?: string;

  @ApiProperty({
    description: 'Textile type (legacy - use products array instead)',
    example: 'cotton',
    required: false,
  })
  @IsOptional()
  @IsString()
  textileType?: string;

  @ApiProperty({
    description: 'Fabric weight in GSM',
    example: 180,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  fabricWeight?: number;

  @ApiProperty({
    description: 'Selected colors',
    example: ['white', 'black', 'navy'],
    isArray: true,
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  colors?: string[];

  @ApiProperty({
    description: 'Custom color details if custom color selected',
    example: 'Crimson Red',
    required: false,
  })
  @IsOptional()
  @IsString()
  customColorDetails?: string;

  @ApiProperty({
    description: 'Size quantities breakdown',
    example: { 'S': 10, 'M': 25, 'L': 15, 'XL': 5 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  sizeQuantities?: { [size: string]: number };

  // Design & Printing
  @ApiProperty({
    description: 'Design method',
    example: 'ասեղնագործությւոն',
    required: false,
  })
  @IsOptional()
  @IsString()
  designMethod?: string;

  @ApiProperty({
    description: 'Printing method',
    example: 'screen-printing',
    required: false,
  })
  @IsOptional()
  @IsString()
  printingMethod?: string;

  @ApiProperty({
    description: 'Logo position',
    example: 'front-center',
    required: false,
  })
  @IsOptional()
  @IsString()
  logoPosition?: string;

  @ApiProperty({
    description: 'Logo size',
    example: '10x8 cm',
    required: false,
  })
  @IsOptional()
  @IsString()
  logoSize?: string;

  @ApiProperty({
    description: 'Logo file paths (uploaded files)',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  logoFiles?: string[];

  @ApiProperty({
    description: 'Design file paths (uploaded files)',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  designFiles?: string[];

  @ApiProperty({
    description: 'Reference image file paths (uploaded files)',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  referenceImages?: string[];

  // T-Shirt Specific (optional)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  neckStyle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  sleeveType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  fit?: string;

  // Hoodie Specific (optional)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  hoodieStyle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pocketType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  zipperType?: string;

  // Polo Specific (optional)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  collarStyle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  buttonCount?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  placketStyle?: string;

  // Eco Bag Specific (optional)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bagStyle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  handleType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bagDimensions?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reinforcement?: string;

  // Cap Specific (optional)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  capStyle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  visorType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  closure?: string;

  // Apron Specific (optional)
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  apronStyle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  neckStrap?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  waistTie?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  pocketDetails?: string;

  // Additional Details
  @ApiProperty({
    description: 'Special manufacturing instructions',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiProperty({
    description: 'Packaging requirements',
    required: false,
  })
  @IsOptional()
  @IsString()
  packagingRequirements?: string;

  @ApiProperty({
    description: 'Shipping address',
    required: false,
  })
  @IsOptional()
  @IsString()
  shippingAddress?: string;

  @ApiProperty({ description: 'Payment status', example: 'not_paid', required: false })
  @IsOptional()
  @IsString()
  paymentStatus?: string;

  @ApiProperty({ description: 'Amount already paid by the client', example: 500, required: false })
  @IsOptional()
  @IsNumber()
  paidAmount?: number;

  @ApiProperty({ description: 'Expected total revenue for this order', example: 1500, required: false })
  @IsOptional()
  @IsNumber()
  expectedRevenue?: number;
}
