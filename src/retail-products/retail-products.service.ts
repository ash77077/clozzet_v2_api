import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RetailProduct } from './schemas/retail-product.schema';
import { CreateRetailProductDto } from './dto/create-retail-product.dto';
import { UpdateRetailProductDto } from './dto/update-retail-product.dto';
import { SellVariantDto } from './dto/sell-variant.dto';

@Injectable()
export class RetailProductsService {
  constructor(
    @InjectModel(RetailProduct.name) private retailProductModel: Model<RetailProduct>,
  ) {}

  async create(createRetailProductDto: CreateRetailProductDto): Promise<RetailProduct> {
    // Map variants to include soldQuantity
    const variants = createRetailProductDto.variants.map(v => ({
      size: v.size,
      color: v.color,
      quantity: v.quantity,
      soldQuantity: 0,
    }));

    const product = new this.retailProductModel({
      ...createRetailProductDto,
      variants,
      salesHistory: [],
    });

    return product.save();
  }

  async findAll(): Promise<RetailProduct[]> {
    return this.retailProductModel.find().sort({ createdAt: -1 }).exec();
  }

  async findAvailable(): Promise<RetailProduct[]> {
    // Find products that have at least one variant with available stock
    const products = await this.retailProductModel
      .find()
      .sort({ createdAt: -1 })
      .exec();

    return products.filter(p =>
      p.variants.some(v => v.quantity - v.soldQuantity > 0)
    );
  }

  async findSold(): Promise<RetailProduct[]> {
    // Find products that have at least one sold item
    const products = await this.retailProductModel
      .find()
      .sort({ updatedAt: -1 })
      .exec();

    return products.filter(p =>
      p.variants.some(v => v.soldQuantity > 0)
    );
  }

  async findOne(id: string): Promise<RetailProduct> {
    const product = await this.retailProductModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Retail product with id ${id} not found`);
    }
    return product;
  }

  async update(id: string, updateRetailProductDto: UpdateRetailProductDto): Promise<RetailProduct> {
    const product = await this.findOne(id);

    if (updateRetailProductDto.variants) {
      // Map variants to include soldQuantity (preserve existing sold quantities if variant exists)
      const variants = updateRetailProductDto.variants.map(v => {
        const existingVariant = product.variants.find(
          ev => ev.size === v.size && ev.color === v.color
        );
        return {
          size: v.size,
          color: v.color,
          quantity: v.quantity,
          soldQuantity: existingVariant?.soldQuantity || 0,
        };
      });

      const updatedProduct = await this.retailProductModel
        .findByIdAndUpdate(
          id,
          { ...updateRetailProductDto, variants },
          { new: true }
        )
        .exec();

      if (!updatedProduct) {
        throw new NotFoundException(`Retail product with id ${id} not found`);
      }

      return updatedProduct;
    }

    const updatedProduct = await this.retailProductModel
      .findByIdAndUpdate(id, updateRetailProductDto, { new: true })
      .exec();

    if (!updatedProduct) {
      throw new NotFoundException(`Retail product with id ${id} not found`);
    }

    return updatedProduct;
  }

  async sellVariant(id: string, sellVariantDto: SellVariantDto): Promise<RetailProduct> {
    const product = await this.findOne(id);

    // Find the variant
    const variant = product.variants.find(
      v => v.size === sellVariantDto.size && v.color === sellVariantDto.color
    );

    if (!variant) {
      throw new NotFoundException(
        `Variant ${sellVariantDto.color} ${sellVariantDto.size} not found in this product`
      );
    }

    // Check if there's enough stock
    const availableQuantity = variant.quantity - variant.soldQuantity;
    if (availableQuantity < sellVariantDto.quantity) {
      throw new BadRequestException(
        `Not enough stock. Available: ${availableQuantity}, Requested: ${sellVariantDto.quantity}`
      );
    }

    // Update variant sold quantity
    variant.soldQuantity += sellVariantDto.quantity;

    // Mark the variants array as modified so Mongoose saves the changes
    product.markModified('variants');

    // Add to sales history
    product.salesHistory.push({
      size: sellVariantDto.size,
      color: sellVariantDto.color,
      quantity: sellVariantDto.quantity,
      soldPrice: sellVariantDto.soldPrice || product.price,
      soldDate: new Date(),
    });

    return product.save();
  }

  async restockVariant(
    id: string,
    size: string,
    color: string,
    quantity: number
  ): Promise<RetailProduct> {
    const product = await this.findOne(id);

    // Find the variant
    const variant = product.variants.find(
      v => v.size === size && v.color === color
    );

    if (!variant) {
      throw new NotFoundException(
        `Variant ${color} ${size} not found in this product`
      );
    }

    // Check if we can restock (can't exceed soldQuantity)
    if (variant.soldQuantity < quantity) {
      throw new BadRequestException(
        `Cannot restock more than sold quantity. Sold: ${variant.soldQuantity}, Requested: ${quantity}`
      );
    }

    // Update variant sold quantity
    variant.soldQuantity -= quantity;

    // Mark the variants array as modified so Mongoose saves the changes
    product.markModified('variants');

    return product.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.retailProductModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Retail product with id ${id} not found`);
    }
  }

  async getSalesReport(id: string) {
    const product = await this.findOne(id);

    // Group sales by variant
    const salesByVariant = product.salesHistory.reduce((acc, sale) => {
      const key = `${sale.color}-${sale.size}`;
      if (!acc[key]) {
        acc[key] = {
          color: sale.color,
          size: sale.size,
          totalQuantity: 0,
          totalRevenue: 0,
          sales: [],
        };
      }
      acc[key].totalQuantity += sale.quantity;
      acc[key].totalRevenue += sale.soldPrice * sale.quantity;
      acc[key].sales.push({
        quantity: sale.quantity,
        soldPrice: sale.soldPrice,
        soldDate: sale.soldDate,
      });
      return acc;
    }, {});

    const totalRevenue = product.salesHistory.reduce(
      (sum, sale) => sum + sale.soldPrice * sale.quantity,
      0
    );

    // Calculate total sold and available from variants
    const totalSold = product.variants.reduce((sum, v) => sum + v.soldQuantity, 0);
    const totalQuantity = product.variants.reduce((sum, v) => sum + (v.quantity - v.soldQuantity), 0);

    return {
      product: {
        id: product._id,
        name: product.name,
        category: product.category,
      },
      totalSold,
      totalQuantity,
      totalRevenue,
      salesByVariant: Object.values(salesByVariant),
      recentSales: product.salesHistory.slice(-10).reverse(),
    };
  }
}
