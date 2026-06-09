import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FinancialProductionService } from './financial-production.service';
import {
  CreateAccessoryItemDto,
  UpdateAccessoryItemDto,
} from './dto/create-accessory-item.dto';
import {
  CreateInventoryFabricDto,
  UpdateInventoryFabricDto,
} from './dto/create-inventory-fabric.dto';
import {
  CreateProductDefinitionDto,
  UpdateProductDefinitionDto,
} from './dto/create-product-definition.dto';
import {
  CreateProductionRunDto,
  UpdateProductionStatusDto,
  RecordWasteDto,
  RestockFabricDto,
} from './dto/create-production-run.dto';
import {
  CreateMonthlyExpenseReportDto,
  UpdateMonthlyExpenseReportDto,
} from './dto/create-monthly-expense.dto';
import {
  CreateCostScenarioDto,
  UpdateCostScenarioDto,
} from './dto/cost-scenario.dto';

@Controller('financial-production')
export class FinancialProductionController {
  constructor(
    private readonly financialService: FinancialProductionService,
  ) {}

  // ==================== ACCESSORY ITEMS ====================
  @Post('accessories')
  async createAccessory(@Body() dto: CreateAccessoryItemDto) {
    try {
      const accessory = await this.financialService.createAccessory(dto);
      return { success: true, data: accessory };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('accessories')
  async getAllAccessories() {
    try {
      const accessories = await this.financialService.getAllAccessories();
      return { success: true, data: accessories };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('accessories/:id')
  async getAccessoryById(@Param('id') id: string) {
    try {
      const accessory = await this.financialService.getAccessoryById(id);
      return { success: true, data: accessory };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('accessories/:id')
  async updateAccessory(
    @Param('id') id: string,
    @Body() dto: UpdateAccessoryItemDto,
  ) {
    try {
      const accessory = await this.financialService.updateAccessory(id, dto);
      return { success: true, data: accessory };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('accessories/:id')
  async deleteAccessory(@Param('id') id: string) {
    try {
      await this.financialService.deleteAccessory(id);
      return { success: true, message: 'Accessory deleted successfully' };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ==================== INVENTORY FABRICS ====================
  @Post('fabrics')
  async createFabric(@Body() dto: CreateInventoryFabricDto) {
    try {
      const fabric = await this.financialService.createFabric(dto);
      return { success: true, data: fabric };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('fabrics')
  async getAllFabrics() {
    try {
      const fabrics = await this.financialService.getAllFabrics();
      return { success: true, data: fabrics };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('fabrics/:id')
  async getFabricById(@Param('id') id: string) {
    try {
      const fabric = await this.financialService.getFabricById(id);
      return { success: true, data: fabric };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('fabrics/:id')
  async updateFabric(
    @Param('id') id: string,
    @Body() dto: UpdateInventoryFabricDto,
  ) {
    try {
      const fabric = await this.financialService.updateFabric(id, dto);
      return { success: true, data: fabric };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('fabrics/:id')
  async deleteFabric(@Param('id') id: string) {
    try {
      await this.financialService.deleteFabric(id);
      return { success: true, message: 'Fabric deleted successfully' };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('fabrics/:id/waste')
  async recordWaste(@Param('id') id: string, @Body() dto: RecordWasteDto) {
    try {
      const history = await this.financialService.recordWaste(
        id,
        dto.wasteKg,
        dto.reason,
      );
      return { success: true, data: history };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('fabrics/waste/:entryId/return')
  async returnWaste(@Param('entryId') entryId: string, @Body() body: any) {
    try {
      const history = await this.financialService.returnWaste(
        entryId,
        body.reason,
      );
      return { success: true, data: history };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('fabrics/:id/restock')
  async restockFabric(
    @Param('id') id: string,
    @Body() dto: RestockFabricDto,
  ) {
    try {
      const history = await this.financialService.restockFabric(
        id,
        dto.restockKg,
        dto.reason,
      );
      return { success: true, data: history };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('fabrics-history')
  async getFabricHistory() {
    try {
      const history = await this.financialService.getFabricHistory();
      return { success: true, data: history };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // ==================== PRODUCT DEFINITIONS ====================
  @Post('product-definitions')
  async createProductDefinition(@Body() dto: CreateProductDefinitionDto) {
    try {
      const product =
        await this.financialService.createProductDefinition(dto);
      return { success: true, data: product };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('product-definitions')
  async getAllProductDefinitions() {
    try {
      const products =
        await this.financialService.getAllProductDefinitions();
      return { success: true, data: products };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('product-definitions/:id')
  async getProductDefinitionById(@Param('id') id: string) {
    try {
      const product =
        await this.financialService.getProductDefinitionById(id);
      return { success: true, data: product };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('product-definitions/:id')
  async updateProductDefinition(
    @Param('id') id: string,
    @Body() dto: UpdateProductDefinitionDto,
  ) {
    try {
      const product =
        await this.financialService.updateProductDefinition(id, dto);
      return { success: true, data: product };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('product-definitions/:id')
  async deleteProductDefinition(@Param('id') id: string) {
    try {
      await this.financialService.deleteProductDefinition(id);
      return {
        success: true,
        message: 'Product definition deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ==================== PRODUCTION RUNS ====================
  @Post('production-runs')
  async createProductionRun(@Body() dto: CreateProductionRunDto) {
    try {
      const production =
        await this.financialService.createProductionRun(dto);
      return { success: true, data: production };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('production-runs')
  async getAllProductionRuns() {
    try {
      const productions =
        await this.financialService.getAllProductionRuns();
      return { success: true, data: productions };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('production-runs/:id')
  async getProductionRunById(@Param('id') id: string) {
    try {
      const production =
        await this.financialService.getProductionRunById(id);
      return { success: true, data: production };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('production-runs/:id/status')
  async updateProductionStatus(
    @Param('id') id: string,
    @Body() dto: UpdateProductionStatusDto,
  ) {
    try {
      const production =
        await this.financialService.updateProductionStatus(
          id,
          dto.status,
          dto.quantityFinished,
          dto.statusNotes,
        );
      return { success: true, data: production };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('production-runs/:id')
  async deleteProductionRun(@Param('id') id: string) {
    try {
      await this.financialService.deleteProductionRun(id);
      return {
        success: true,
        message: 'Production run deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ==================== MONTHLY EXPENSES ====================
  @Post('monthly-expenses')
  async createMonthlyExpense(@Body() dto: CreateMonthlyExpenseReportDto) {
    try {
      const expense = await this.financialService.createMonthlyExpense(dto);
      return { success: true, data: expense };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('monthly-expenses')
  async getAllMonthlyExpenses() {
    try {
      const expenses = await this.financialService.getAllMonthlyExpenses();
      return { success: true, data: expenses };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('monthly-expenses/:id')
  async getMonthlyExpenseById(@Param('id') id: string) {
    try {
      const expense = await this.financialService.getMonthlyExpenseById(id);
      return { success: true, data: expense };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('monthly-expenses/:id')
  async updateMonthlyExpense(
    @Param('id') id: string,
    @Body() dto: UpdateMonthlyExpenseReportDto,
  ) {
    try {
      const expense = await this.financialService.updateMonthlyExpense(
        id,
        dto,
      );
      return { success: true, data: expense };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('monthly-expenses/:id')
  async deleteMonthlyExpense(@Param('id') id: string) {
    try {
      await this.financialService.deleteMonthlyExpense(id);
      return {
        success: true,
        message: 'Monthly expense deleted successfully',
      };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ==================== COST SCENARIOS ====================
  @Post('cost-scenarios')
  async createCostScenario(@Body() dto: CreateCostScenarioDto) {
    try {
      const scenario = await this.financialService.createCostScenario(dto);
      return { success: true, data: scenario };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('cost-scenarios')
  async getAllCostScenarios() {
    try {
      const scenarios = await this.financialService.getAllCostScenarios();
      return { success: true, data: scenarios };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('cost-scenarios/:id')
  async getCostScenarioById(@Param('id') id: string) {
    try {
      const scenario = await this.financialService.getCostScenarioById(id);
      return { success: true, data: scenario };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.NOT_FOUND,
      );
    }
  }

  @Put('cost-scenarios/:id')
  async updateCostScenario(
    @Param('id') id: string,
    @Body() dto: UpdateCostScenarioDto,
  ) {
    try {
      const scenario = await this.financialService.updateCostScenario(id, dto);
      return { success: true, data: scenario };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Delete('cost-scenarios/:id')
  async deleteCostScenario(@Param('id') id: string) {
    try {
      await this.financialService.deleteCostScenario(id);
      return { success: true, message: 'Cost scenario deleted successfully' };
    } catch (error) {
      throw new HttpException(
        { success: false, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
