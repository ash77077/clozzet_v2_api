import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, IsOptional, IsNumber, Min, IsObject, IsEnum } from 'class-validator';

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
    description: 'Client/Company name',
    example: 'Tech Corp',
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
    description: 'Total quantity (auto-calculated)',
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

  // Product Specifications
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
  })
  @IsString()
  @IsNotEmpty()
  textileType: string;

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
  })
  @IsArray()
  @IsString({ each: true })
  colors: string[];

  @ApiProperty({
    description: 'Custom color details if custom color selected',
    example: 'Pantone 186 C - Red',
    required: false,
  })
  @IsOptional()
  @IsString()
  customColorDetails?: string;

  @ApiProperty({
    description: 'Size quantities breakdown',
    example: { 'S': 10, 'M': 25, 'L': 15, 'XL': 5 },
  })
  @IsObject()
  sizeQuantities: { [size: string]: number };

  // Design & Printing
  @ApiProperty({
    description: 'Printing method',
    example: 'screen-printing',
  })
  @IsString()
  @IsNotEmpty()
  printingMethod: string;

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

  @ApiProperty({
    description: 'Pantone colors',
    example: 'Pantone 286 C, Pantone 485 C',
    required: false,
  })
  @IsOptional()
  @IsString()
  pantoneColors?: string;

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
}
