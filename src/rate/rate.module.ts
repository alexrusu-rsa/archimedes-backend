import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database.module';
import { RateProvider } from 'src/providers/rate.provider';
import { RateController } from './rate.controller';
import { RateService } from './rate.service';
import { UserProvider } from 'src/providers/user.provider';
import { ProjectProvider } from 'src/providers/project.provider';

@Module({
  imports: [DatabaseModule],
  controllers: [RateController],
  providers: [
    ...RateProvider,
    ...UserProvider,
    ...ProjectProvider,
    RateService,
  ],
  exports: [RateService],
})
export class RateModule {}
