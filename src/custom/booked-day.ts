import { UserTimeBooked } from './user-date-timebooked';

export interface BookedDay {
  timeBooked: string;
  expectedHours: number;
  usersTimeBooked: UserTimeBooked[];
  date: Date;
}
