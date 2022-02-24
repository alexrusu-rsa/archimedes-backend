import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database.module';
import { EmployeeProvider } from 'src/providers/employee.provider';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';

@Module({
  imports: [DatabaseModule],
  controllers: [EmployeeController],
  providers: [...EmployeeProvider, EmployeeService],
})
export class EmployeeModule {}
