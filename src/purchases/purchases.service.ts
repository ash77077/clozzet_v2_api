import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Purchase } from './schemas/purchase.schema';
import { StockLot } from '../stock-lots/schemas/stock-lot.schema';
import { StockConsumption } from '../stock-lots/schemas/stock-consumption.schema';
import { StockAdjustment } from '../stock-lots/schemas/stock-adjustment.schema';
import { CreatePurchaseDto } from './dto/create-purchase.dto';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectModel(Purchase.name) private readonly purchaseModel: Model<Purchase>,
    @InjectModel(StockLot.name) private readonly lotModel: Model<StockLot>,
    @InjectModel(StockConsumption.name) private readonly consumptionModel: Model<StockConsumption>,
    @InjectModel(StockAdjustment.name) private readonly adjustmentModel: Model<StockAdjustment>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(dto: CreatePurchaseDto, createdBy: string): Promise<Purchase> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const lines = dto.lines.map(l => ({
        ...l,
        lineType: l.lineType ?? 'fabric',
        lineTotal: l.quantity * l.unitPrice,
      }));
      const totalAmount = lines.reduce((s, l) => s + l.lineTotal, 0);
      const paidAmount = dto.paidAmount ?? 0;
      const paymentStatus = dto.paymentStatus ?? (paidAmount >= totalAmount ? 'paid' : paidAmount > 0 ? 'partial' : 'unpaid');

      const [purchase] = await this.purchaseModel.create(
        [{
          ...dto,
          lines,
          totalAmount,
          paidAmount,
          paymentStatus,
          hasDocument: dto.paymentType === 'invoice',
          createdBy,
        }],
        { session },
      );

      // Create one StockLot per fabric line
      for (let i = 0; i < purchase.lines.length; i++) {
        const line = purchase.lines[i];
        if (line.lineType !== 'fabric') continue;
        const [lot] = await this.lotModel.create(
          [{
            purchaseId: (purchase._id as any).toString(),
            purchaseLineId: (line as any)._id.toString(),
            fabricTypeId: line.fabricTypeId,
            fabricTypeName: line.fabricTypeName,
            colorId: line.colorId,
            colorName: line.colorName,
            initialQty: line.quantity,
            remainingQty: line.quantity,
            unitPrice: line.unitPrice,
            reservedForOrderId: line.orderId,
            supplierId: dto.supplierId,
            supplierName: dto.supplierName,
            purchaseDate: dto.date,
          }],
          { session },
        );
        // Back-link stockLotId on line
        purchase.lines[i].stockLotId = (lot._id as any).toString();
      }
      purchase.markModified('lines');
      await purchase.save({ session });

      await session.commitTransaction();
      return purchase;
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }

  async findAll(filters?: { supplierId?: string; paymentType?: string; paymentStatus?: string }): Promise<Purchase[]> {
    const q: any = {};
    if (filters?.supplierId) q.supplierId = filters.supplierId;
    if (filters?.paymentType) q.paymentType = filters.paymentType;
    if (filters?.paymentStatus) q.paymentStatus = filters.paymentStatus;
    return this.purchaseModel.find(q).sort({ date: -1 }).exec();
  }

  async findOne(id: string): Promise<Purchase> {
    const doc = await this.purchaseModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`Purchase ${id} not found`);
    return doc;
  }

  async updatePayment(id: string, paidAmount: number, paymentStatus: string): Promise<Purchase> {
    const doc = await this.purchaseModel.findByIdAndUpdate(
      id, { paidAmount, paymentStatus }, { new: true },
    ).exec();
    if (!doc) throw new NotFoundException(`Purchase ${id} not found`);
    return doc;
  }

  // ─── Stock Lot operations ─────────────────────────────────────────────────

  async getLots(filters?: { fabricTypeId?: string; colorId?: string; orderId?: string }): Promise<StockLot[]> {
    const q: any = {};
    if (filters?.fabricTypeId) q.fabricTypeId = filters.fabricTypeId;
    if (filters?.colorId) q.colorId = filters.colorId;
    if (filters?.orderId) q.reservedForOrderId = filters.orderId;
    return this.lotModel.find(q).sort({ createdAt: 1 }).exec(); // FIFO
  }

  async getLot(id: string): Promise<StockLot> {
    const doc = await this.lotModel.findById(id).exec();
    if (!doc) throw new NotFoundException(`StockLot ${id} not found`);
    return doc;
  }

  async reserveLot(lotId: string, orderId: string): Promise<StockLot> {
    const doc = await this.lotModel.findByIdAndUpdate(
      lotId, { reservedForOrderId: orderId }, { new: true },
    ).exec();
    if (!doc) throw new NotFoundException(`StockLot ${lotId} not found`);
    return doc;
  }

  // ─── Consumption ──────────────────────────────────────────────────────────

  async recordConsumption(
    lotId: string, orderId: string, quantity: number, createdBy: string,
    orderItemIndex?: number, note?: string, adminOverride = false,
  ): Promise<StockConsumption> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const lot = await this.lotModel.findById(lotId).session(session).exec();
      if (!lot) throw new NotFoundException(`StockLot ${lotId} not found`);
      if (!adminOverride && quantity > lot.remainingQty) {
        throw new BadRequestException(
          `Quantity ${quantity} exceeds lot remaining ${lot.remainingQty}. Use adminOverride to force.`,
        );
      }

      const [consumption] = await this.consumptionModel.create(
        [{
          lotId,
          orderId,
          orderItemIndex,
          quantity,
          unitCost: lot.unitPrice,
          totalCost: quantity * lot.unitPrice,
          date: new Date(),
          createdBy,
          note,
        }],
        { session },
      );

      await this.lotModel.findByIdAndUpdate(
        lotId,
        { $inc: { remainingQty: -quantity } },
        { session },
      ).exec();

      await session.commitTransaction();
      return consumption;
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }

  async getConsumptions(orderId?: string, lotId?: string): Promise<StockConsumption[]> {
    const q: any = {};
    if (orderId) q.orderId = orderId;
    if (lotId) q.lotId = lotId;
    return this.consumptionModel.find(q).sort({ date: -1 }).exec();
  }

  // ─── Adjustments ─────────────────────────────────────────────────────────

  async recordAdjustment(
    lotId: string, countedQty: number, reason: string, createdBy: string, note?: string,
  ): Promise<StockAdjustment> {
    const session = await this.connection.startSession();
    session.startTransaction();
    try {
      const lot = await this.lotModel.findById(lotId).session(session).exec();
      if (!lot) throw new NotFoundException(`StockLot ${lotId} not found`);
      const difference = countedQty - lot.remainingQty;

      const [adjustment] = await this.adjustmentModel.create(
        [{
          lotId,
          countedQty,
          systemQty: lot.remainingQty,
          difference,
          reason,
          date: new Date(),
          createdBy,
          note,
        }],
        { session },
      );

      await this.lotModel.findByIdAndUpdate(
        lotId,
        { $set: { remainingQty: countedQty } },
        { session },
      ).exec();

      await session.commitTransaction();
      return adjustment;
    } catch (e) {
      await session.abortTransaction();
      throw e;
    } finally {
      session.endSession();
    }
  }

  async getAdjustments(lotId: string): Promise<StockAdjustment[]> {
    return this.adjustmentModel.find({ lotId }).sort({ date: -1 }).exec();
  }
}
