import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { PipelineStagesService } from './pipeline-stages.service';
import { UpdatePipelineStageDto } from './dto/update-pipeline-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../common/decorators/roles.decorator';

@Controller('pipeline-stages')
export class PipelineStagesController {
  constructor(private readonly pipelineStagesService: PipelineStagesService) {}

  // Public: active stages for board/UI loading
  @Get()
  findAll() {
    return this.pipelineStagesService.findAll();
  }

  // Admin: all stages including inactive
  @Get('admin')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAllAdmin() {
    return this.pipelineStagesService.findAllAdmin();
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: UpdatePipelineStageDto) {
    return this.pipelineStagesService.update(id, dto);
  }
}
