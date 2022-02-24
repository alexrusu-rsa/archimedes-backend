import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Day } from 'src/entity/day.entity';
import { DeleteResult } from 'typeorm';
import { DayService } from './day.service';

@Controller('day')
export class DayController {
  constructor(private dayService: DayService) {}

  @Get()
  getAllDays(): Promise<Day[]> {
    return this.dayService.getDays();
  }

  @Post()
  addNewDay(@Body() day: Day) {
    return this.dayService.addDay(day);
  }

  @Get(':id')
  getOneDay(@Param('id') id: string): Promise<Day> {
    return this.dayService.findOne(Number(id));
  }

  @Put(':id')
  updateDay(@Body() day: Day, @Param('id') id: string): Promise<Day> {
    return this.dayService.updateById(Number(id), day);
  }

  @Delete(':id')
  deleteDay(@Param('id') id: string): Promise<DeleteResult> {
    return this.dayService.deleteDay(Number(id));
  }
}
