import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExpoStock } from './schemas/expo-stock.schema';
import { RetailProduct } from '../retail-products/schemas/retail-product.schema';
import {
  CreateExpoStockDto,
  AddExpoItemsDto,
  SellCartDto,
  ImportFromExpoDto,
} from './dto/expo-stock.dto';

@Injectable()
export class ExpoSalesService {
  constructor(
    @InjectModel(ExpoStock.name) private expoModel: Model<ExpoStock>,
    @InjectModel(RetailProduct.name) private retailModel: Model<RetailProduct>,
  ) {}

  async findAll(): Promise<ExpoStock[]> {
    return this.expoModel.find().sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<ExpoStock> {
    const expo = await this.expoModel.findById(id).exec();
    if (!expo) throw new NotFoundException(`Expo ${id} not found`);
    return expo;
  }

  async create(dto: CreateExpoStockDto): Promise<ExpoStock> {
    const expo = new this.expoModel({
      name: dto.name,
      description: dto.description || '',
      status: 'active',
      items: (dto.items || []).map(i => ({ ...i, soldQuantity: 0, sellPrice: i.sellPrice || 0 })),
      sales: [],
    });
    return expo.save();
  }

  async addItems(id: string, dto: AddExpoItemsDto): Promise<ExpoStock> {
    const expo = await this.findOne(id);
    if (expo.status === 'closed') throw new BadRequestException('Expo is closed');
    for (const item of dto.items) {
      const existing = expo.items.find(
        i => i.type === item.type && i.color === item.color && i.size === item.size,
      );
      if (existing) {
        existing.quantity += item.quantity;
        if (item.costPrice) existing.costPrice = item.costPrice;
        if (item.sellPrice) existing.sellPrice = item.sellPrice;
      } else {
        expo.items.push({ ...item, soldQuantity: 0, sellPrice: item.sellPrice || 0 });
      }
    }
    expo.markModified('items');
    return expo.save();
  }

  async updateItem(id: string, itemIndex: number, patch: Partial<{ quantity: number; costPrice: number; sellPrice: number }>): Promise<ExpoStock> {
    const expo = await this.findOne(id);
    if (!expo.items[itemIndex]) throw new NotFoundException('Item not found');
    Object.assign(expo.items[itemIndex], patch);
    expo.markModified('items');
    return expo.save();
  }

  async removeItem(id: string, itemIndex: number): Promise<ExpoStock> {
    const expo = await this.findOne(id);
    expo.items.splice(itemIndex, 1);
    expo.markModified('items');
    return expo.save();
  }

  async sellCart(id: string, dto: SellCartDto): Promise<ExpoStock> {
    const expo = await this.findOne(id);
    if (expo.status === 'closed') throw new BadRequestException('Expo is closed');
    for (const line of dto.items) {
      const item = expo.items.find(
        i => i.type === line.type && i.color === line.color && i.size === line.size,
      );
      if (!item) throw new NotFoundException(`Item ${line.type} ${line.color} ${line.size} not found`);
      const avail = item.quantity - item.soldQuantity;
      if (line.quantity > avail) {
        throw new BadRequestException(`Not enough stock for ${line.type} ${line.color} ${line.size}. Available: ${avail}`);
      }
      item.soldQuantity += line.quantity;
      expo.sales.push({
        type: line.type,
        color: line.color,
        size: line.size,
        quantity: line.quantity,
        soldPrice: line.soldPrice,
        soldAt: new Date(),
        isReturn: false,
      } as any);
    }
    expo.markModified('items');
    expo.markModified('sales');
    return expo.save();
  }

  async returnSale(expoId: string, saleId: string, returnQty?: number): Promise<ExpoStock> {
    const expo = await this.findOne(expoId);
    const sale = (expo.sales as any[]).find(s => s._id?.toString() === saleId);
    if (!sale) throw new NotFoundException('Sale not found');
    if (sale.isReturn) throw new BadRequestException('Already returned');
    const qty = returnQty && returnQty > 0 && returnQty < sale.quantity ? returnQty : sale.quantity;
    const item = expo.items.find(
      i => i.type === sale.type && i.color === sale.color && i.size === sale.size,
    );
    if (item) item.soldQuantity = Math.max(0, item.soldQuantity - qty);
    if (qty >= sale.quantity) {
      sale.isReturn = true;
    } else {
      sale.quantity -= qty;
      expo.sales.push({
        type: sale.type, color: sale.color, size: sale.size,
        quantity: qty, soldPrice: sale.soldPrice,
        soldAt: sale.soldAt, isReturn: true,
      } as any);
    }
    expo.markModified('items');
    expo.markModified('sales');
    return expo.save();
  }

  async importFromExpo(id: string, dto: ImportFromExpoDto): Promise<ExpoStock> {
    const target = await this.findOne(id);
    if (target.status === 'closed') throw new BadRequestException('Expo is closed');
    const source = await this.findOne(dto.sourceExpoId);
    const sourceItems = source.items;
    for (const si of sourceItems) {
      const remaining = si.quantity - si.soldQuantity;
      if (remaining <= 0) continue;
      const existing = target.items.find(
        i => i.type === si.type && i.color === si.color && i.size === si.size,
      );
      if (existing) {
        existing.quantity += remaining;
      } else {
        target.items.push({
          type: si.type, color: si.color, size: si.size,
          quantity: remaining, soldQuantity: 0,
          costPrice: si.costPrice, sellPrice: si.sellPrice,
        });
      }
    }
    target.markModified('items');
    return target.save();
  }

  async closeExpo(id: string, returnUnsold: boolean): Promise<ExpoStock> {
    const expo = await this.findOne(id);
    if (expo.status === 'closed') throw new BadRequestException('Already closed');
    if (returnUnsold) {
      for (const item of expo.items) {
        const remaining = item.quantity - item.soldQuantity;
        if (remaining <= 0) continue;
        // Find or create retail product matching this category/type
        let product = await this.retailModel.findOne({
          category: { $regex: new RegExp(`^${item.type}$`, 'i') },
        }).exec();
        if (!product) {
          product = new this.retailModel({
            name: item.type,
            description: `Returned from expo: ${expo.name}`,
            price: item.sellPrice || 0,
            costPrice: item.costPrice || 0,
            category: item.type,
            variants: [],
            salesHistory: [],
          });
        }
        const variant = product.variants.find(v => v.color === item.color && v.size === item.size);
        if (variant) {
          variant.quantity += remaining;
        } else {
          product.variants.push({ color: item.color, size: item.size, quantity: remaining, soldQuantity: 0 } as any);
        }
        product.markModified('variants');
        await product.save();
      }
    }
    expo.status = 'closed';
    expo.closedAt = new Date();
    return expo.save();
  }

  async reopen(id: string): Promise<ExpoStock> {
    const expo = await this.findOne(id);
    expo.status = 'active';
    expo.closedAt = null;
    return expo.save();
  }

  async deleteExpo(id: string): Promise<void> {
    const res = await this.expoModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException(`Expo ${id} not found`);
  }

  // Stats helper
  async getSummary(id: string) {
    const expo = await this.findOne(id);
    const totalStock = expo.items.reduce((s, i) => s + i.quantity, 0);
    const totalSold = expo.items.reduce((s, i) => s + i.soldQuantity, 0);
    const totalRemaining = totalStock - totalSold;
    const revenue = expo.sales
      .filter((s: any) => !s.isReturn)
      .reduce((s: number, sale: any) => s + sale.soldPrice * sale.quantity, 0);
    const cost = expo.items.reduce((s, i) => s + i.costPrice * i.soldQuantity, 0);
    return { totalStock, totalSold, totalRemaining, revenue, profit: revenue - cost };
  }
}
