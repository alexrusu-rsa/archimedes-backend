import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database.module';
import { DayProvider } from 'src/providers/day.provider';
import { DayController } from './day.controller';
import { DayService } from './day.service';

@Module({
  imports: [DatabaseModule],
  controllers: [DayController],
  providers: [...DayProvider, DayService],
})
export class DayModule {}
