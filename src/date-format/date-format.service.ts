import { Injectable } from '@nestjs/common';

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
}
