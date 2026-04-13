import { IsString, IsNumber, Min, IsOptional, IsEnum } from 'class-validator';
import { OrderRequestStatus } from '../schemas/order-request.schema';

export class AdminReviewOrderRequestDto {
  @IsNumber()
  @Min(0)
  internalCost: number; // in AMD

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsEnum(OrderRequestStatus)
  status: OrderRequestStatus.APPROVED | OrderRequestStatus.REJECTED;
}
