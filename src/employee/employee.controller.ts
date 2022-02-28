import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { Employee } from 'src/entity/employee.entity';
import { DeleteResult } from 'typeorm';
import { EmployeeService } from './employee.service';

@Controller('employee')
export class EmployeeController {
  constructor(private employeeService: EmployeeService) {}

  @Get()
  getAllEmployees(): Promise<Employee[]> {
    return this.employeeService.getEmployees();
  }

  @Get(':id')
  getOneEmployee(@Param('id') id: string): Promise<Employee> {
    return this.employeeService.findOne(id);
  }

  @Post()
  addNewEmployee(@Body() employee: Employee) {
    return this.employeeService.addEmployee(employee);
  }

  @Put(':id')
  updateEmployee(@Body() employee: Employee, @Param('id') id: string) {
    return this.employeeService.updateById(id, employee);
  }

  @Delete(':id')
  deleteEmployee(@Param('id') id: string): Promise<DeleteResult> {
    return this.employeeService.deleteEmployee(id);
  }
}
