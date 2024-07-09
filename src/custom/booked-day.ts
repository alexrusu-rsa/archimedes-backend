import { UserDateTimeBooked } from './user-date-timebooked';

export interface BookedDay {
  timeBooked: string;
  expectedHours: number;
  bookedUsers: UserDateTimeBooked[];
  date: string;
}
