import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Employee } from './schemas/employee.schema';
import { SalaryPayment, PaymentStatus } from './schemas/salary-payment.schema';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CreateSalaryPaymentDto } from './dto/create-salary-payment.dto';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectModel(Employee.name) private readonly employeeModel: Model<Employee>,
    @InjectModel(SalaryPayment.name) private readonly paymentModel: Model<SalaryPayment>,
  ) {}

  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    return new this.employeeModel(dto).save();
  }

  async findAllEmployees(): Promise<Employee[]> {
    return this.employeeModel
      .find({ isActive: true })
      .sort({ lastName: 1 })
      .exec();
  }

  async findEmployeeById(id: string): Promise<Employee> {
    const employee = await this.employeeModel.findById(id).exec();
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    return employee;
  }

  async updateEmployee(id: string, dto: Partial<CreateEmployeeDto>): Promise<Employee> {
    const employee = await this.employeeModel
      .findByIdAndUpdate(id, dto, { new: true })
      .exec();
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    return employee;
  }

  async deactivateEmployee(id: string): Promise<Employee> {
    const employee = await this.employeeModel
      .findByIdAndUpdate(id, { isActive: false }, { new: true })
      .exec();
    if (!employee) {
      throw new NotFoundException(`Employee with id ${id} not found`);
    }
    return employee;
  }

  async createPayment(dto: CreateSalaryPaymentDto): Promise<SalaryPayment> {
    const paymentData: any = {
      employee: new Types.ObjectId(dto.employeeId),
      month: dto.month,
      year: dto.year,
      period: dto.period,
      amount: dto.amount,
      cashAmount: dto.cashAmount ?? 0,
      cardAmount: dto.cardAmount ?? 0,
      status: dto.status ?? PaymentStatus.PENDING,
      notes: dto.notes,
    };

    if (dto.status === PaymentStatus.PAID) {
      paymentData.paidAt = dto.paidAt ? new Date(dto.paidAt) : new Date();
    }

    return new this.paymentModel(paymentData).save();
  }

  async findPaymentsByEmployee(employeeId: string): Promise<SalaryPayment[]> {
    return this.paymentModel
      .find({ employee: new Types.ObjectId(employeeId) })
      .populate('employee')
      .sort({ year: -1, month: -1 })
      .exec();
  }

  async findPaymentsByMonthYear(month: number, year: number): Promise<SalaryPayment[]> {
    return this.paymentModel
      .find({ month, year })
      .populate('employee')
      .sort({ year: -1, month: -1 })
      .exec();
  }

  async updatePayment(id: string, dto: Partial<CreateSalaryPaymentDto>): Promise<SalaryPayment> {
    const updateData: any = { ...dto };

    if (dto.status === PaymentStatus.PAID && !dto.paidAt) {
      updateData.paidAt = new Date();
    } else if (dto.paidAt) {
      updateData.paidAt = new Date(dto.paidAt);
    }

    if (dto.employeeId) {
      updateData.employee = new Types.ObjectId(dto.employeeId);
      delete updateData.employeeId;
    }

    const payment = await this.paymentModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate('employee')
      .exec();

    if (!payment) {
      throw new NotFoundException(`Payment with id ${id} not found`);
    }
    return payment;
  }

  async deletePayment(id: string): Promise<void> {
    await this.paymentModel.findByIdAndDelete(id).exec();
  }

  async getPayrollSummary(month: number, year: number) {
    const activeEmployees = await this.employeeModel.find({ isActive: true }).exec();
    const totalEmployees = activeEmployees.length;
    const totalPayroll = activeEmployees.reduce((sum, emp) => sum + (emp.monthlySalary || 0), 0);

    const payments = await this.paymentModel
      .find({ month, year })
      .populate('employee')
      .exec();

    const paidPayments = payments.filter(p => p.status === PaymentStatus.PAID);
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalCash = paidPayments.reduce((sum, p) => sum + p.cashAmount, 0);
    const totalCard = paidPayments.reduce((sum, p) => sum + p.cardAmount, 0);
    const totalPending = totalPayroll - totalPaid;
    const paymentsCount = payments.length;

    // Find employees who have no PAID payment this month
    const paidEmployeeIds = new Set(
      paidPayments.map(p => {
        const emp = p.employee as any;
        return emp?._id?.toString() ?? emp?.toString();
      }),
    );

    const pendingEmployees = activeEmployees
      .filter(emp => !paidEmployeeIds.has((emp._id as any).toString()))
      .map(emp => `${emp.firstName} ${emp.lastName}`);

    return {
      totalEmployees,
      totalPayroll,
      totalPaid,
      totalPending,
      totalCash,
      totalCard,
      paymentsCount,
      pendingEmployees,
    };
  }

  async getCurrentMonthSummary() {
    const now = new Date();
    return this.getPayrollSummary(now.getMonth() + 1, now.getFullYear());
  }
}
