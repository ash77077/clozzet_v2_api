import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateSalaryPaymentDto } from './dto/create-salary-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../common/decorators/roles.decorator';

@Controller('employees')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  // --- Employee routes ---

  @Post()
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.createEmployee(dto);
  }

  @Get()
  findAll() {
    return this.employeesService.findAllEmployees();
  }

  // IMPORTANT: specific routes must come before param routes
  @Get('summary')
  getCurrentMonthSummary() {
    return this.employeesService.getCurrentMonthSummary();
  }

  @Get('summary/:month/:year')
  getSummary(@Param('month') month: string, @Param('year') year: string) {
    return this.employeesService.getPayrollSummary(Number(month), Number(year));
  }

  // --- Payment routes (specific paths before :id) ---

  @Post('payments')
  createPayment(@Body() dto: CreateSalaryPaymentDto) {
    return this.employeesService.createPayment(dto);
  }

  @Get('payments/month/:month/:year')
  getPaymentsByMonth(@Param('month') month: string, @Param('year') year: string) {
    return this.employeesService.findPaymentsByMonthYear(Number(month), Number(year));
  }

  @Patch('payments/:id')
  updatePayment(@Param('id') id: string, @Body() dto: Partial<CreateSalaryPaymentDto>) {
    return this.employeesService.updatePayment(id, dto);
  }

  @Delete('payments/:id')
  deletePayment(@Param('id') id: string) {
    return this.employeesService.deletePayment(id);
  }

  // --- Routes with :id param (must come after specific paths) ---

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findEmployeeById(id);
  }

  @Patch(':id')
  updateEmployee(@Param('id') id: string, @Body() dto: Partial<CreateEmployeeDto>) {
    return this.employeesService.updateEmployee(id, dto);
  }

  @Delete(':id')
  deactivateEmployee(@Param('id') id: string) {
    return this.employeesService.deactivateEmployee(id);
  }

  @Get(':id/payments')
  getPaymentsByEmployee(@Param('id') id: string) {
    return this.employeesService.findPaymentsByEmployee(id);
  }
}
