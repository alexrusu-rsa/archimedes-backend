import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import e from 'express';
import { Activity } from 'src/entity/activity.entity';
import { Customer } from 'src/entity/customer.entity';
import { Project } from 'src/entity/project.entity';
import { Response } from 'express';
import { getRepository, Repository } from 'typeorm';
import * as exceljs from 'exceljs';
import { DateFormatService } from 'src/date-format/date-format.service';
import { time } from 'console';

@Injectable()
export class XlsxInvoiceService {
  constructor(
    private dateFormatService: DateFormatService,
    @Inject('PROJECT_REPOSITORY')
    private projectRepository: Repository<Project>,
    @Inject('CUSTOMER_REPOSITORY')
    private customerRepository: Repository<Customer>,
  ) {}

  activitiesOfProjectPerMonthYear: Activity[];

  async getCustomerExcel(
    res: Response,
    id: string,
    invoiceNumber: string,
    monthYear: string,
  ) {
    try {
      const project = await this.projectRepository.findOneBy({ id });
      const formattedDate =
        monthYear.substring(0, 1) + '/' + monthYear.substring(1);

      if (project) {
        const customerOfProject = await this.customerRepository.findOneBy({
          id: project.customerId,
        });
        this.activitiesOfProjectPerMonthYear = await getRepository(Activity)
          .createQueryBuilder('activity')
          .where('activity.projectId like :currentprojectid', {
            currentprojectid: project.id,
          })
          .andWhere('activity.date like :date', {
            date: `%${formattedDate}`,
          })
          .getMany();
        if (this.activitiesOfProjectPerMonthYear) {
          const workbook = new exceljs.Workbook();
          const worksheet = workbook.addWorksheet('Invoice');
          const annexWorksheet = workbook.addWorksheet('Anexa 001');
          const addedImage = workbook.addImage({
            filename: `src/images/test.png`,
            extension: 'png',
          });
          worksheet.mergeCells('A2:F10');
          worksheet.mergeCells('A1:J1');
          worksheet.mergeCells('G5:J5');

          worksheet.getCell('H5').value = 'FACTURĂ FISCALĂ';
          worksheet.getCell('H5').alignment = { horizontal: 'center' };
          worksheet.getCell('H5').font = { size: 18 };
          worksheet.getCell('H5').font = { color: { argb: 'FF2D508F' } };

          worksheet.mergeCells('G7:H7');
          worksheet.mergeCells('G8:H8');
          worksheet.mergeCells('G9:H9');
          worksheet.mergeCells('G10:H10');

          worksheet.mergeCells('I7:J7');
          worksheet.mergeCells('I8:J8');
          worksheet.mergeCells('I9:J9');
          worksheet.mergeCells('I10:J10');

          worksheet.mergeCells('A14:B14');
          worksheet.mergeCells('A15:B15');
          worksheet.mergeCells('A16:B16');
          worksheet.mergeCells('A17:B17');

          worksheet.getCell('H7').value = 'Seria:';
          worksheet.getCell('H7').font = { size: 11 };
          worksheet.getCell('H7').alignment = { horizontal: 'right' };

          worksheet.getCell('H8').value = 'Număr:';
          worksheet.getCell('H8').font = { size: 11 };
          worksheet.getCell('H8').alignment = { horizontal: 'right' };

          worksheet.getCell('H9').value = 'Data eliberării:';
          worksheet.getCell('H9').font = { size: 11 };
          worksheet.getCell('H9').alignment = { horizontal: 'right' };

          worksheet.getCell('H10').value = 'Data scadenței:';
          worksheet.getCell('H10').font = { size: 11 };
          worksheet.getCell('H10').alignment = { horizontal: 'right' };

          worksheet.getCell('I7').value = 'RSA';
          worksheet.getCell('I7').font = { size: 11 };
          worksheet.getCell('I7').alignment = { horizontal: 'center' };

          worksheet.getCell('I8').value = invoiceNumber;
          worksheet.getCell('I8').font = { size: 11 };
          worksheet.getCell('I8').alignment = { horizontal: 'center' };

          worksheet.getCell('I9').font = { size: 11 };
          worksheet.getCell('I9').alignment = { horizontal: 'center' };

          worksheet.getCell('I10').font = { size: 11 };
          worksheet.getCell('I10').alignment = { horizontal: 'center' };

          worksheet.getCell('A14').value = 'Nume:';
          worksheet.getCell('A14').font = { size: 11 };
          worksheet.getCell('A14').alignment = { horizontal: 'right' };

          worksheet.getCell('A15').value = 'CIF:';
          worksheet.getCell('A15').font = { size: 11 };
          worksheet.getCell('A15').alignment = { horizontal: 'right' };

          worksheet.getCell('A16').value = 'Reg. Com:';
          worksheet.getCell('A16').font = { size: 11 };
          worksheet.getCell('A16').alignment = { horizontal: 'right' };

          worksheet.getCell('A17').value = 'Sediu:';
          worksheet.getCell('A17').font = { size: 11 };
          worksheet.getCell('A17').alignment = { horizontal: 'right' };

          worksheet.mergeCells('B20:C20');
          worksheet.mergeCells('D20:E20');
          worksheet.mergeCells('F20:G20');
          worksheet.mergeCells('H20:J20');

          worksheet.getRow(20).getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2D508F' },
            bgColor: { argb: 'FF2D508F' },
          };
          worksheet.getRow(20).getCell(2).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2D508F' },
            bgColor: { argb: 'FF2D508F' },
          };
          worksheet.getRow(20).getCell(4).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2D508F' },
            bgColor: { argb: 'FF2D508F' },
          };
          worksheet.getRow(20).getCell(6).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2D508F' },
            bgColor: { argb: 'FF2D508F' },
          };
          worksheet.getRow(20).getCell(8).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2D508F' },
            bgColor: { argb: 'FF2D508F' },
          };

          worksheet.getCell('A20').value = 'Nr. Crt.';
          worksheet.getCell('A20').alignment = { horizontal: 'left' };

          worksheet.getCell('B20').value = 'Descriere Servicii';
          worksheet.getCell('B20').alignment = { horizontal: 'left' };

          worksheet.getCell('D20').value = 'U.M. (ore)';
          worksheet.getCell('D20').alignment = { horizontal: 'left' };

          worksheet.getCell('F20').value = 'Valoare Unitară';
          worksheet.getCell('F20').alignment = { horizontal: 'left' };

          worksheet.getCell('H20').value = 'Valoare';
          worksheet.getCell('H20').alignment = { horizontal: 'left' };

          worksheet.mergeCells('A13:E13');
          worksheet.mergeCells('A21:A24');

          worksheet.mergeCells('B21:C24');
          worksheet.mergeCells('D21:E24');
          worksheet.mergeCells('F21:G24');
          worksheet.mergeCells('H21:J24');

          worksheet.getRow(13).getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2D508F' },
            bgColor: { argb: 'FF2D508F' },
          };

          worksheet.getRow(1).getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2D508F' },
            bgColor: { argb: 'FF2D508F' },
          };

          worksheet.mergeCells('F27:G28');
          worksheet.mergeCells('F29:G30');
          worksheet.mergeCells('F31:G32');

          worksheet.mergeCells('H27:J28');
          worksheet.mergeCells('H29:J30');
          worksheet.mergeCells('H31:J32');

          worksheet.getCell('F27').value = 'Curs BNR';
          worksheet.getCell('F27').alignment = { horizontal: 'center' };

          worksheet.getCell('F29').value = 'Cota TVA 0%';
          worksheet.getCell('F29').alignment = { horizontal: 'center' };

          worksheet.getCell('F31').value = 'TOTAL DE PLATA:';
          worksheet.getCell('F31').alignment = { horizontal: 'center' };

          worksheet.getCell('A13').alignment = { horizontal: 'center' };
          worksheet.getCell('H5').font = { size: 18 };
          worksheet.getCell('A13').value = 'CLIENT';

          worksheet.mergeCells('A38:J40');
          worksheet.getCell('A38').font = { size: 6 };
          worksheet.getCell('A38').value =
            'Valabil fără semnătură și ștampilă, conform art. 319, alin. 29 din Codul Fiscal, semnarea şi ştampilarea facturilor nu constituie elemente obligatorii pe care trebuie să le conţină factura.';
          worksheet.mergeCells('A44:J44');

          worksheet.getRow(44).getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2D508F' },
            bgColor: { argb: 'FF2D508F' },
          };

          worksheet.mergeCells('A43:D43');
          worksheet.getCell('A43').value = 'RSA SOFT SRL';

          const today = new Date();
          const dd = String(today.getDate()).padStart(2, '0');
          const mm = String(today.getMonth() + 1).padStart(2, '0');
          const yyyy = today.getFullYear();
          const todayString = dd + '/' + mm + '/' + yyyy;

          worksheet.getCell('I9').value = todayString;
          if (project.dueDate) {
            worksheet.getCell('I10').value = project.dueDate;
          }
          worksheet.mergeCells('A46:E46');
          worksheet.mergeCells('A47:E47');
          worksheet.mergeCells('A48:E48');
          worksheet.mergeCells('A49:E49');
          worksheet.mergeCells('A50:E50');

          worksheet.mergeCells('H49:J49');
          worksheet.mergeCells('H50:J50');

          worksheet.getCell('A46').value = 'CUI 43911790';
          worksheet.getCell('A46').alignment = { horizontal: 'left' };
          worksheet.getCell('A46').font = { size: 9 };

          worksheet.getCell('A47').value = 'J31/149/2021';
          worksheet.getCell('A47').alignment = { horizontal: 'left' };
          worksheet.getCell('A47').font = { size: 9 };

          worksheet.getCell('A48').value =
            'Sediu: Strada Gheorghe Doja, nr. 89';
          worksheet.getCell('A48').alignment = { horizontal: 'left' };
          worksheet.getCell('A48').font = { size: 9 };

          worksheet.getCell('A49').value = 'Municipiul Zalău, Județ Sălaj';
          worksheet.getCell('A49').alignment = { horizontal: 'left' };
          worksheet.getCell('A49').font = { size: 9 };

          worksheet.getCell('A50').value =
            'Reprezentant: ALEX-GEORGE RUSU, Administrator';
          worksheet.getCell('A50').alignment = { horizontal: 'left' };
          worksheet.getCell('A50').font = { size: 9 };

          worksheet.getCell('H49').value = 'Banca Transilvania';
          worksheet.getCell('H49').alignment = { horizontal: 'right' };

          worksheet.getCell('H50').value = 'RO43BTRLRONCRT0593347301 ';
          worksheet.getCell('H50').alignment = { horizontal: 'right' };

          worksheet.mergeCells('C14:E14');
          worksheet.mergeCells('C15:E15');
          worksheet.mergeCells('C16:E16');
          worksheet.mergeCells('C17:E17');

          worksheet.getCell('C14').value = customerOfProject.customerName;
          worksheet.getCell('C15').value = customerOfProject.customerCUI;
          worksheet.getCell('C16').value = customerOfProject.customerReg;
          worksheet.getCell('C17').value = customerOfProject.customerAddress;

          worksheet.getCell('D21').value =
            this.activitiesOfProjectPerMonthYear.length;
          worksheet.getCell('D21').font = { size: 11 };
          worksheet.getCell('D21').alignment = { horizontal: 'center' };

          worksheet.getCell('B21').value = '';
          worksheet.getCell('B21').font = { size: 11 };
          worksheet.getCell('B21').alignment = { horizontal: 'center' };

          worksheet.getCell('B21').value =
            worksheet.getCell('B21').value + project.projectName;

          worksheet.addImage(addedImage, {
            tl: { col: 1, row: 2 },
            ext: { width: 244, height: 160 },
          });
          annexWorksheet.mergeCells('A1:Q1');
          annexWorksheet.getRow(1).getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF2D508F' },
            bgColor: { argb: 'FF2D508F' },
          };
          annexWorksheet.getCell('A1').value =
            'ANEXA nr. 001 din' +
            todayString +
            ' la contractul ' + 
            project.contract +
            ' si factura ' +
            invoiceNumber +
            ' din data ' +
            todayString;
          let annexStartLine = 2;
          let invoiceHoursTime = 0;
          let invoiceMinutesTime = 0;

          const annexLineEndColumn = 12;
          annexWorksheet.mergeCells('A2:L2');
          annexWorksheet.mergeCells('M2:N2');
          annexWorksheet.mergeCells('O2:Q2');
          annexWorksheet.getCell('A2').value = 'Activity Name';
          annexWorksheet.getCell('M2').value = 'Activity Type';
          annexWorksheet.getCell('O2').value = 'Activity Time';
          if (this.activitiesOfProjectPerMonthYear.length >= 1) {
            this.activitiesOfProjectPerMonthYear.forEach((activity) => {
              annexStartLine = annexStartLine + 1;
              annexWorksheet.mergeCells(
                annexStartLine,
                1,
                annexStartLine,
                annexLineEndColumn,
              );
              annexWorksheet.getCell(annexStartLine, 1).value = activity.name;
              annexWorksheet.getCell(annexStartLine, 13).value =
                activity.activityType;
              const startDateTime = this.dateFormatService.getNewDateWithTime(
                activity.start,
              );
              const endDateTime = this.dateFormatService.getNewDateWithTime(
                activity.end,
              );
              const timeForCurrentActivity =
                this.dateFormatService.millisecondsToHoursAndMinutes(
                  endDateTime.getTime() - startDateTime.getTime(),
                );

              invoiceHoursTime = invoiceHoursTime + timeForCurrentActivity.hours;
              invoiceMinutesTime = invoiceMinutesTime + timeForCurrentActivity.minutes;
              const minutesToHours = invoiceMinutesTime / 60;
              invoiceHoursTime = invoiceHoursTime + minutesToHours;

              annexWorksheet.getCell(annexStartLine, 15).value =
                'HOURS: ' +
                timeForCurrentActivity.hours +
                ' MINUTES: ' +
                timeForCurrentActivity.minutes;
            });
            worksheet.getCell('D21').value = invoiceHoursTime;
          }
          res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          );

          res.setHeader(
            'Content-Disposition',
            'attachment; filename=' + 'tutorials.xlsx',
          );
          return workbook.xlsx.write(res).then(function () {
            res.status(200).end();
          });
        } else {
          throw new HttpException(
            'There were no activites found for this project.',
            HttpStatus.NOT_FOUND,
          );
        }
      } else {
        throw new HttpException(
          'The project was not found.',
          HttpStatus.NOT_FOUND,
        );
      }
    } catch (err) {
      throw err;
    }
  }
}
