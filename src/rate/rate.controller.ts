import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { RateType } from 'src/custom/rate-type.enum';
import { Rate } from 'src/entity/rate.entity';
import { RateService } from './rate.service';

@Controller()
export class RateController {
  constructor(private rateService: RateService) {}

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @Get('/types')
  getAvailableActivityTypes() {
    return RateType;
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @Get()
  getAllRates() {
    return this.rateService.getAllRates();
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getRate(@Param('id') id: string) {
    return this.rateService.getRate(id);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @Post()
  addRate(@Body() rate: Rate) {
    return this.rateService.addRate(rate);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteRate(@Param('id') id: string) {
    return this.rateService.deleteRate(id);
  }

  @Get('rateemployee/:id')
  getRateForEmployee(@Param('id') id: string) {
    return this.rateService.getRateForEmployeeId(id);
  }
  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateRate(@Param('id') id: string, @Body() rate: Rate) {
    return this.rateService.updateRate(id, rate);
  }
}
