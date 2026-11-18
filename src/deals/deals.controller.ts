import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DealsService } from './deals.service';
import { CreateDealDto } from './dto/create-deal.dto';
import { UpdateDealDto } from './dto/update-deal.dto';
import {
  ChangeStageDto,
  MarkLostDto,
  MarkWonDto,
} from './dto/change-stage.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Role, Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { CurrentUserType } from '../common/decorators/current-user.decorator';

@Controller('deals')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MANAGER)
export class DealsController {
  constructor(private readonly dealsService: DealsService) {}

  @Get()
  findAll(
    @Query('ownerId') ownerId?: string,
    @Query('stageKey') stageKey?: string,
    @Query('customerId') customerId?: string,
    @Query('isDeleted') isDeleted?: string,
  ) {
    return this.dealsService.findAll({
      ownerId,
      stageKey,
      customerId,
      isDeleted:
        isDeleted === 'true' ? true : isDeleted === 'false' ? false : false,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dealsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDealDto, @CurrentUser() user: CurrentUserType) {
    return this.dealsService.create(dto, user.userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDealDto) {
    return this.dealsService.update(id, dto);
  }

  @Patch(':id/stage')
  changeStage(
    @Param('id') id: string,
    @Body() dto: ChangeStageDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    if (dto.allowEmptyOrderIds && user.role !== Role.ADMIN) {
      throw new ForbiddenException('Only admins can mark won without an order');
    }
    return this.dealsService.updateStage(id, dto.stageId, user.userId, {
      note: dto.note,
      lostReasonId: dto.lostReasonId,
      lostComment: dto.lostComment,
      allowEmptyOrderIds: dto.allowEmptyOrderIds,
    });
  }

  @Patch(':id/won')
  markWon(
    @Param('id') id: string,
    @Body() dto: MarkWonDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.dealsService.markWon(id, dto.orderId, user.userId);
  }

  @Patch(':id/lost')
  markLost(
    @Param('id') id: string,
    @Body() dto: MarkLostDto,
    @CurrentUser() user: CurrentUserType,
  ) {
    return this.dealsService.markLost(
      id,
      dto.lostReasonId,
      dto.lostComment,
      user.userId,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserType) {
    return this.dealsService.softDelete(id, user.userId);
  }
}
