import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database.module';
import { ProjectProvider } from 'src/providers/project.provider';
import { XlsxService } from 'src/xlsx/xlsx.service';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
@Module({
  imports: [DatabaseModule],
  controllers: [ProjectController],
  providers: [...ProjectProvider, ProjectService],
})
export class ProjectModule {}
