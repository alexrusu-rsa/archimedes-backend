import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Employee } from 'src/entity/employee.entity';
import { DeleteResult, InsertResult, Repository } from 'typeorm';

@Injectable()
export class EmployeeService {
  constructor(
    @Inject('EMPLOYEE_REPOSITORY')
    private employeeRepository: Repository<Employee>,
  ) {}
  async getEmployees(): Promise<Employee[]> {
    return this.employeeRepository.find();
  }

  async addEmployee(employee: Employee): Promise<InsertResult> {
    return this.employeeRepository.insert(employee);
  }

  async updateById(id: number, employee: Employee): Promise<Employee> {
    const employeeToUpdate = await this.employeeRepository.findOne(id);
    if (employeeToUpdate === undefined) throw new NotFoundException();
    await this.employeeRepository.update(id, employee);
    return this.employeeRepository.findOne(id);
  }

  async deleteEmployee(id: number): Promise<DeleteResult> {
    const employeeToDelete = await this.employeeRepository.findOne(id);
    if (employeeToDelete === undefined) throw new NotFoundException();
    return this.employeeRepository.delete(id);
  }

  async findOne(id: number): Promise<Employee> {
    return this.employeeRepository.findOne(id);
  }
}
