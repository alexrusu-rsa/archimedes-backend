import { Provider } from '@nestjs/common';
import { Employee } from 'src/entity/employee.entity';
import { Connection } from 'typeorm';

export const EmployeeProvider: Provider[] = [
  {
    provide: 'EMPLOYEE_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Employee),
    inject: ['DATABASE_CONNECTION'],
  },
];
