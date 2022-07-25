import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database.module';
import { RateProvider } from 'src/providers/rate.provider';
import { RateController } from './rate.controller';
import { RateService } from './rate.service';

@Module({
  imports: [DatabaseModule],
  controllers: [RateController],
  providers: [...RateProvider, RateService],
  exports: [RateService],
})
export class RateModule {}
