import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FinancialProductionController } from './financial-production.controller';
import { FinancialProductionService } from './financial-production.service';
import { AccessoryItem, AccessoryItemSchema } from './schemas/accessory-item.schema';
import { InventoryFabric, InventoryFabricSchema } from './schemas/inventory-fabric.schema';
import {
  FabricInventoryHistory,
  FabricInventoryHistorySchema,
} from './schemas/fabric-inventory-history.schema';
import { ProductDefinition, ProductDefinitionSchema } from './schemas/product-definition.schema';
import { ProductionRun, ProductionRunSchema } from './schemas/production-run.schema';
import {
  MonthlyExpenseReport,
  MonthlyExpenseReportSchema,
} from './schemas/monthly-expense-report.schema';
import { CostScenario, CostScenarioSchema } from './schemas/cost-scenario.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AccessoryItem.name, schema: AccessoryItemSchema },
      { name: InventoryFabric.name, schema: InventoryFabricSchema },
      { name: FabricInventoryHistory.name, schema: FabricInventoryHistorySchema },
      { name: ProductDefinition.name, schema: ProductDefinitionSchema },
      { name: ProductionRun.name, schema: ProductionRunSchema },
      { name: MonthlyExpenseReport.name, schema: MonthlyExpenseReportSchema },
      { name: CostScenario.name, schema: CostScenarioSchema },
    ]),
  ],
  controllers: [FinancialProductionController],
  providers: [FinancialProductionService],
  exports: [FinancialProductionService],
})
export class FinancialProductionModule {}
