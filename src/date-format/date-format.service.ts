import { Injectable } from '@nestjs/common';
import { HoursAndMinutes } from '../custom/hours_minutes';

@Injectable()
export class DateFormatService {
  formatDateStringToISO(dateString: string): string {
    const day = dateString.slice(0, 2);
    const month = dateString.slice(2, 4);
    const year = dateString.slice(4, 8);
    return year + '-' + month + '-' + day;
  }

  formatDBDateStringToISO(dateString: string): string {
    const activityDate = dateString.split('/');
    return activityDate[2] + '-' + activityDate[1] + '-' + activityDate[0];
  }

  formatISOToDB(dateiso: string) {
    const activityDate = dateiso.split('-');
    return activityDate[2] + '/' + activityDate[1] + '/' + activityDate[0];
  }

  getNewDateWithTime(time: string): Date {
    const newDate = new Date();
    newDate.setTime(this.toMilliseconds(time));
    return newDate;
  }

  toMilliseconds(time: string): number {
    const hoursAndMinutes = time.split(':');
    const hours = Number(hoursAndMinutes[0]);
    const minutes = Number(hoursAndMinutes[1]);
    return (
      this.hoursToMilliseconds(hours) + this.minutesToMilliseconds(minutes)
    );
  }

  hoursToMilliseconds(hours: number): number {
    return 3600 * 1000 * hours;
  }

  minutesToMilliseconds(minutes: number): number {
    return 60000 * minutes;
  }

  millisecondsToSeconds(milliseconds: number): number {
    return milliseconds / 1000;
  }

  secondsToMinutes(seconds: number): number {
    return seconds / 60;
  }

  minutesToHours(minutes: number): number {
    return minutes / 60;
  }

  millisecondsToHoursAndMinutes(milliseconds: number): HoursAndMinutes {
    const seconds = this.millisecondsToSeconds(milliseconds);
    const minutes = this.secondsToMinutes(seconds);
    const hours = Math.floor(this.minutesToHours(minutes));
    const finalMinutes = minutes - hours * 60;
    return new HoursAndMinutes(hours, finalMinutes);
  }
}
