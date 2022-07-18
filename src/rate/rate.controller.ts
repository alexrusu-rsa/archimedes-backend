import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Rate } from 'src/entity/rate.entity';
import { RateService } from './rate.service';

@Controller('rate')
export class RateController {
  constructor(private rateService: RateService) {}

  @Get()
  getAllRates() {
    return this.rateService.getAllRates();
  }

  @Get(':id')
  getRate(@Param('id') id: string) {
    return this.rateService.getRate(id);
  }

  @Post()
  addRate(@Body() rate: Rate) {
    return this.rateService.addRate(rate);
  }

  @Delete(':id')
  deleteRate(@Param('id') id: string) {
    return this.rateService.deleteRate(id);
  }

  @Put(':id')
  updateRate(@Param('id') id: string, @Body() rate: Rate) {
    return this.rateService.updateRate(id, rate);
  }
}
