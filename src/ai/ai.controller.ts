import { Controller, Post, Body, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AiService } from './ai.service';
import { AnalyzeCustomerDto } from './dto/analyze-customer.dto';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze-customer')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false, transform: true }))
  analyzeCustomer(@Body() dto: AnalyzeCustomerDto) {
    return this.aiService.analyzeCustomer(dto);
  }

  @Post('chat')
  @UsePipes(new ValidationPipe({ whitelist: false, transform: true }))
  chat(@Body() dto: ChatDto) {
    return this.aiService.chat(dto);
  }
}
