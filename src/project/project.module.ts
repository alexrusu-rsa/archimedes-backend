import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database.module';
import { PdfInvoiceService } from 'src/pdf-invoice/pdf-invoice.service';
import { ProjectProvider } from 'src/providers/project.provider';
import { RateProvider } from 'src/providers/rate.provider';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
@Module({
  imports: [DatabaseModule],
  controllers: [ProjectController],
  providers: [...ProjectProvider, ...RateProvider, ProjectService],
})
export class ProjectModule {}
