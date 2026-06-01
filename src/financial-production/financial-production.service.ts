import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccessoryItem } from './schemas/accessory-item.schema';
import { InventoryFabric } from './schemas/inventory-fabric.schema';
import { FabricInventoryHistory } from './schemas/fabric-inventory-history.schema';
import { ProductDefinition } from './schemas/product-definition.schema';
import { ProductionRun } from './schemas/production-run.schema';
import { MonthlyExpenseReport } from './schemas/monthly-expense-report.schema';
import { CostScenario } from './schemas/cost-scenario.schema';

@Injectable()
export class FinancialProductionService {
  private readonly logger = new Logger(FinancialProductionService.name);

  constructor(
    @InjectModel(AccessoryItem.name) private accessoryModel: Model<AccessoryItem>,
    @InjectModel(InventoryFabric.name) private fabricModel: Model<InventoryFabric>,
    @InjectModel(FabricInventoryHistory.name) private historyModel: Model<FabricInventoryHistory>,
    @InjectModel(ProductDefinition.name) private productDefModel: Model<ProductDefinition>,
    @InjectModel(ProductionRun.name) private productionRunModel: Model<ProductionRun>,
    @InjectModel(MonthlyExpenseReport.name) private expenseModel: Model<MonthlyExpenseReport>,
    @InjectModel(CostScenario.name) private costScenarioModel: Model<CostScenario>,
  ) {}

  // ==================== ACCESSORY ITEMS ====================
  async createAccessory(data: any): Promise<AccessoryItem> {
    try {
      const accessory = new this.accessoryModel(data);
      return await accessory.save();
    } catch (error) {
      this.logger.error(`Failed to create accessory: ${error.message}`);
      throw error;
    }
  }

  async getAllAccessories(): Promise<AccessoryItem[]> {
    return await this.accessoryModel.find().sort({ createdAt: -1 }).exec();
  }

  async getAccessoryById(id: string): Promise<AccessoryItem> {
    const accessory = await this.accessoryModel.findById(id).exec();
    if (!accessory) {
      throw new NotFoundException(`Accessory with ID ${id} not found`);
    }
    return accessory;
  }

  async updateAccessory(id: string, data: any): Promise<AccessoryItem> {
    const accessory = await this.accessoryModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!accessory) {
      throw new NotFoundException(`Accessory with ID ${id} not found`);
    }
    return accessory;
  }

  async deleteAccessory(id: string): Promise<void> {
    const result = await this.accessoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Accessory with ID ${id} not found`);
    }
  }

  // ==================== INVENTORY FABRICS ====================
  async createFabric(data: any): Promise<InventoryFabric> {
    try {
      const fabric = new this.fabricModel(data);
      const savedFabric = await fabric.save();

      // Create initial stock history entry
      await this.createHistoryEntry({
        fabricId: (savedFabric._id as any).toString(),
        fabricName: savedFabric.name,
        changeType: 'initial_stock',
        quantityChange: savedFabric.availableKg,
        quantityBefore: 0,
        quantityAfter: savedFabric.availableKg,
        reason: 'Initial stock added',
      });

      return savedFabric;
    } catch (error) {
      this.logger.error(`Failed to create fabric: ${error.message}`);
      throw error;
    }
  }

  async getAllFabrics(): Promise<InventoryFabric[]> {
    return await this.fabricModel.find().sort({ createdAt: -1 }).exec();
  }

  async getFabricById(id: string): Promise<InventoryFabric> {
    const fabric = await this.fabricModel.findById(id).exec();
    if (!fabric) {
      throw new NotFoundException(`Fabric with ID ${id} not found`);
    }
    return fabric;
  }

  async updateFabric(id: string, data: any): Promise<InventoryFabric> {
    const oldFabric = await this.getFabricById(id);

    const fabric = await this.fabricModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!fabric) {
      throw new NotFoundException(`Fabric with ID ${id} not found`);
    }

    // Create history entry for update
    const quantityChanged = fabric.availableKg !== oldFabric.availableKg;
    await this.createHistoryEntry({
      fabricId: id,
      fabricName: fabric.name,
      changeType: 'update',
      quantityChange: fabric.availableKg - oldFabric.availableKg,
      quantityBefore: oldFabric.availableKg,
      quantityAfter: fabric.availableKg,
      reason: quantityChanged
        ? `Fabric updated (quantity changed from ${oldFabric.availableKg}kg to ${fabric.availableKg}kg)`
        : 'Fabric information updated',
    });

    return fabric;
  }

  async deleteFabric(id: string): Promise<void> {
    const fabric = await this.getFabricById(id);

    // Create history entry before deletion
    await this.createHistoryEntry({
      fabricId: id,
      fabricName: fabric.name,
      changeType: 'delete',
      quantityChange: -fabric.availableKg,
      quantityBefore: fabric.availableKg,
      quantityAfter: 0,
      reason: `Fabric deleted: ${fabric.name} (${fabric.color}, ${fabric.type})`,
    });

    const result = await this.fabricModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Fabric with ID ${id} not found`);
    }
  }

  // Waste management
  async recordWaste(fabricId: string, wasteKg: number, reason?: string): Promise<FabricInventoryHistory> {
    const fabric = await this.getFabricById(fabricId);

    if (wasteKg > fabric.availableKg) {
      throw new BadRequestException('Waste quantity exceeds available stock');
    }

    const quantityBefore = fabric.availableKg;
    const quantityAfter = quantityBefore - wasteKg;

    // Update fabric stock
    await this.fabricModel
      .findByIdAndUpdate(fabricId, { availableKg: quantityAfter })
      .exec();

    // Create history entry
    return await this.createHistoryEntry({
      fabricId,
      fabricName: fabric.name,
      changeType: 'waste',
      quantityChange: -wasteKg,
      quantityBefore,
      quantityAfter,
      reason,
    });
  }

  async returnWaste(entryId: string, reason?: string): Promise<FabricInventoryHistory> {
    const wasteEntry = await this.historyModel.findById(entryId).exec();
    if (!wasteEntry || wasteEntry.changeType !== 'waste') {
      throw new BadRequestException('Invalid waste entry');
    }

    // Check if already returned
    const existingReturn = await this.historyModel
      .findOne({ relatedEntryId: entryId })
      .exec();
    if (existingReturn) {
      throw new BadRequestException('Waste already returned');
    }

    const fabric = await this.getFabricById(wasteEntry.fabricId);
    const returnAmount = Math.abs(wasteEntry.quantityChange);
    const quantityBefore = fabric.availableKg;
    const quantityAfter = quantityBefore + returnAmount;

    // Update fabric stock
    await this.fabricModel
      .findByIdAndUpdate(wasteEntry.fabricId, { availableKg: quantityAfter })
      .exec();

    // Create return history entry
    const wasteDate = (wasteEntry as any).createdAt || new Date();
    return await this.createHistoryEntry({
      fabricId: wasteEntry.fabricId,
      fabricName: fabric.name,
      changeType: 'waste_return',
      quantityChange: returnAmount,
      quantityBefore,
      quantityAfter,
      reason: reason || `Return of waste from ${wasteDate}`,
      relatedEntryId: entryId,
    });
  }

  async restockFabric(fabricId: string, restockKg: number, reason?: string): Promise<FabricInventoryHistory> {
    const fabric = await this.getFabricById(fabricId);
    const quantityBefore = fabric.availableKg;
    const quantityAfter = quantityBefore + restockKg;

    // Update fabric stock
    await this.fabricModel
      .findByIdAndUpdate(fabricId, { availableKg: quantityAfter })
      .exec();

    // Create history entry
    return await this.createHistoryEntry({
      fabricId,
      fabricName: fabric.name,
      changeType: 'restock',
      quantityChange: restockKg,
      quantityBefore,
      quantityAfter,
      reason,
    });
  }

  async getFabricHistory(): Promise<FabricInventoryHistory[]> {
    return await this.historyModel.find().sort({ createdAt: -1 }).exec();
  }

  private async createHistoryEntry(data: any): Promise<FabricInventoryHistory> {
    const history = new this.historyModel(data);
    return await history.save();
  }

  // ==================== PRODUCT DEFINITIONS ====================
  async createProductDefinition(data: any): Promise<ProductDefinition> {
    try {
      // Calculate costs
      const fabricCost = (data.fabricComponent.pricePerKg / 1000) * data.fabricComponent.gramsUsed;
      data.fabricComponent.fabricCost = fabricCost;

      let accessoriesTotalCost = 0;
      data.accessories.forEach((acc: any) => {
        acc.accessoryCost = acc.costPerUnit * acc.quantity;
        accessoriesTotalCost += acc.accessoryCost;
      });

      data.totalUnitCost = fabricCost + accessoriesTotalCost + data.pieceworkLabor;

      const product = new this.productDefModel(data);
      return await product.save();
    } catch (error) {
      this.logger.error(`Failed to create product definition: ${error.message}`);
      throw error;
    }
  }

  async getAllProductDefinitions(): Promise<ProductDefinition[]> {
    return await this.productDefModel.find().sort({ createdAt: -1 }).exec();
  }

  async getProductDefinitionById(id: string): Promise<ProductDefinition> {
    const product = await this.productDefModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product definition with ID ${id} not found`);
    }
    return product;
  }

  async updateProductDefinition(id: string, data: any): Promise<ProductDefinition> {
    // Recalculate costs if components changed
    if (data.fabricComponent || data.accessories || data.pieceworkLabor) {
      const existing = await this.getProductDefinitionById(id);

      const fabricComp = data.fabricComponent || existing.fabricComponent;
      const fabricCost = (fabricComp.pricePerKg / 1000) * fabricComp.gramsUsed;
      if (data.fabricComponent) {
        data.fabricComponent.fabricCost = fabricCost;
      }

      const accessories = data.accessories || existing.accessories;
      let accessoriesTotalCost = 0;
      accessories.forEach((acc: any) => {
        acc.accessoryCost = acc.costPerUnit * acc.quantity;
        accessoriesTotalCost += acc.accessoryCost;
      });

      const piecework = data.pieceworkLabor !== undefined ? data.pieceworkLabor : existing.pieceworkLabor;
      data.totalUnitCost = fabricCost + accessoriesTotalCost + piecework;
    }

    const product = await this.productDefModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!product) {
      throw new NotFoundException(`Product definition with ID ${id} not found`);
    }
    return product;
  }

  async deleteProductDefinition(id: string): Promise<void> {
    const result = await this.productDefModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Product definition with ID ${id} not found`);
    }
  }

  // ==================== PRODUCTION RUNS ====================
  async createProductionRun(data: any): Promise<ProductionRun> {
    try {
      // Get product definition
      const productDef = await this.getProductDefinitionById(data.productId);

      // Deduct from inventory
      await this.deductFromInventory(productDef, data.quantity);

      // Calculate values
      const productionDate = new Date(data.productionDate);
      const startDate = new Date(data.startDate);

      const totalUnitCost = productDef.totalUnitCost || 0;
      const production = new this.productionRunModel({
        ...data,
        productName: productDef.productName,
        productDefinition: productDef,
        totalUnitCost,
        grossProfit: (data.sellingPricePerUnit - totalUnitCost) * data.quantity,
        month: productionDate.getMonth() + 1,
        year: productionDate.getFullYear(),
        startDate,
        productionDate,
        status: 'pending',
        quantityFinished: 0,
      });

      return await production.save();
    } catch (error) {
      this.logger.error(`Failed to create production run: ${error.message}`);
      throw error;
    }
  }

  async getAllProductionRuns(): Promise<ProductionRun[]> {
    return await this.productionRunModel.find().sort({ createdAt: -1 }).exec();
  }

  async getProductionRunById(id: string): Promise<ProductionRun> {
    const run = await this.productionRunModel.findById(id).exec();
    if (!run) {
      throw new NotFoundException(`Production run with ID ${id} not found`);
    }
    return run;
  }

  async updateProductionStatus(id: string, status: string, quantityFinished: number, statusNotes?: string): Promise<ProductionRun> {
    const updateData: any = {
      status,
      quantityFinished,
      statusNotes,
    };

    if (status === 'completed') {
      updateData.finishedDate = new Date();
    }

    const run = await this.productionRunModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!run) {
      throw new NotFoundException(`Production run with ID ${id} not found`);
    }
    return run;
  }

  async deleteProductionRun(id: string): Promise<void> {
    const result = await this.productionRunModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Production run with ID ${id} not found`);
    }
  }

  private async deductFromInventory(productDef: ProductDefinition, quantity: number): Promise<void> {
    // Deduct fabric
    const fabricKgUsed = (productDef.fabricComponent.gramsUsed * quantity) / 1000;
    const fabric = await this.getFabricById(productDef.fabricComponent.fabricId);

    if (fabricKgUsed > fabric.availableKg) {
      throw new BadRequestException(
        `Insufficient fabric stock. Required: ${fabricKgUsed}kg, Available: ${fabric.availableKg}kg`
      );
    }

    const quantityBefore = fabric.availableKg;
    const quantityAfter = quantityBefore - fabricKgUsed;

    await this.fabricModel
      .findByIdAndUpdate(productDef.fabricComponent.fabricId, { availableKg: quantityAfter })
      .exec();

    // Create history entry
    await this.createHistoryEntry({
      fabricId: productDef.fabricComponent.fabricId,
      fabricName: fabric.name,
      changeType: 'production_use',
      quantityChange: -fabricKgUsed,
      quantityBefore,
      quantityAfter,
      reason: `Production: ${productDef.productName} x${quantity}`,
    });

    // Deduct accessories
    for (const acc of productDef.accessories) {
      const totalNeeded = acc.quantity * quantity;
      const accessory = await this.accessoryModel.findById(acc.accessoryId).exec();

      if (accessory) {
        const newQuantity = Math.max(0, accessory.quantity - totalNeeded);
        await this.accessoryModel
          .findByIdAndUpdate(acc.accessoryId, { quantity: newQuantity })
          .exec();
      }
    }
  }

  // ==================== MONTHLY EXPENSES ====================
  async createMonthlyExpense(data: any): Promise<MonthlyExpenseReport> {
    try {
      // Check if expense report already exists for this month/year
      const existing = await this.expenseModel
        .findOne({ month: data.month, year: data.year })
        .exec();

      if (existing) {
        throw new BadRequestException(
          `Expense report for ${data.month}/${data.year} already exists`
        );
      }

      data.totalOverhead =
        data.rent + data.utilities + data.fixedSalaries + data.variableDailyLabor;

      const expense = new this.expenseModel(data);
      return await expense.save();
    } catch (error) {
      this.logger.error(`Failed to create monthly expense: ${error.message}`);
      throw error;
    }
  }

  async getAllMonthlyExpenses(): Promise<MonthlyExpenseReport[]> {
    return await this.expenseModel.find().sort({ year: -1, month: -1 }).exec();
  }

  async getMonthlyExpenseById(id: string): Promise<MonthlyExpenseReport> {
    const expense = await this.expenseModel.findById(id).exec();
    if (!expense) {
      throw new NotFoundException(`Monthly expense with ID ${id} not found`);
    }
    return expense;
  }

  async updateMonthlyExpense(id: string, data: any): Promise<MonthlyExpenseReport> {
    if (data.rent !== undefined || data.utilities !== undefined ||
        data.fixedSalaries !== undefined || data.variableDailyLabor !== undefined) {
      const existing = await this.getMonthlyExpenseById(id);
      const rent = data.rent !== undefined ? data.rent : existing.rent;
      const utilities = data.utilities !== undefined ? data.utilities : existing.utilities;
      const fixedSalaries = data.fixedSalaries !== undefined ? data.fixedSalaries : existing.fixedSalaries;
      const variableDailyLabor = data.variableDailyLabor !== undefined ? data.variableDailyLabor : existing.variableDailyLabor;

      data.totalOverhead = rent + utilities + fixedSalaries + variableDailyLabor;
    }

    const expense = await this.expenseModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    if (!expense) {
      throw new NotFoundException(`Monthly expense with ID ${id} not found`);
    }
    return expense;
  }

  async deleteMonthlyExpense(id: string): Promise<void> {
    const result = await this.expenseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Monthly expense with ID ${id} not found`);
    }
  }

  // ==================== COST SCENARIOS ====================
  async createCostScenario(data: any): Promise<CostScenario> {
    try {
      const scenario = new this.costScenarioModel(data);
      return await scenario.save();
    } catch (error) {
      this.logger.error(`Failed to create cost scenario: ${error.message}`);
      throw error;
    }
  }

  async getAllCostScenarios(): Promise<CostScenario[]> {
    return await this.costScenarioModel.find().sort({ createdAt: -1 }).exec();
  }

  async getCostScenarioById(id: string): Promise<CostScenario> {
    const scenario = await this.costScenarioModel.findById(id).exec();
    if (!scenario) {
      throw new NotFoundException(`Cost scenario with ID ${id} not found`);
    }
    return scenario;
  }

  async updateCostScenario(id: string, data: any): Promise<CostScenario> {
    const scenario = await this.costScenarioModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!scenario) {
      throw new NotFoundException(`Cost scenario with ID ${id} not found`);
    }
    return scenario;
  }

  async deleteCostScenario(id: string): Promise<void> {
    const result = await this.costScenarioModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Cost scenario with ID ${id} not found`);
    }
  }
}
