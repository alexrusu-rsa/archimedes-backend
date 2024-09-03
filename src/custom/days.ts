import { Activity } from 'src/entity/activity.entity';

export interface DayReport {
  expectedHours: number;
  timeBooked: string;
  activities: Activity[];
}
export interface Days {
  [date: string]: DayReport;
}
