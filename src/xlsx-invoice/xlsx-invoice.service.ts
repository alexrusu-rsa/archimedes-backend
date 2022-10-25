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
import { Rate } from 'src/entity/rate.entity';
import { RateType } from 'src/custom/rate-type.enum';
import { databaseProvider } from 'src/providers/database.provider';

@Injectable()
export class XlsxInvoiceService {
  constructor(
    private dateFormatService: DateFormatService,
    @Inject('PROJECT_REPOSITORY')
    private projectRepository: Repository<Project>,
    @Inject('CUSTOMER_REPOSITORY')
    private customerRepository: Repository<Customer>,
    @Inject('RATE_REPOSITORY')
    private rateRepository: Repository<Rate>,
    @Inject('ACTIVITY_REPOSITORY')
    private activityRepository: Repository<Activity>,
  ) {}

  activitiesOfProjectPerMonthYear: Activity[];
  numberOfDaysWorkedOnProjectDuringMonth: number;
  allActivitiesOnProject: Activity[];

  async getCustomerExcel(
    res: Response,
    id: string,
    invoiceNumber: string,
    month: string,
    year: string,
    euroExchange: number,
    dateMillis: string,
  ) {
    const invoiceEmissionDate = new Date();
    const checkEmissionDate = new Date();
    checkEmissionDate.setTime(parseInt(dateMillis));
    if (
      invoiceEmissionDate.toISOString().split('T')[0] !==
      checkEmissionDate.toISOString().split('T')[0]
    )
      invoiceEmissionDate.setTime(parseInt(dateMillis) + 86400000);
    const emmisionDateString = invoiceEmissionDate.toISOString().split('T')[0];
    const actualEmisionDate = `${emmisionDateString.split('-')[2]}.${
      emmisionDateString.split('-')[1]
    }.${emmisionDateString.split('-')[0]}`;
    try {
      const rateForProject = await this.rateRepository.findOneBy({
        projectId: id,
      });
      const project = await this.projectRepository.findOneBy({ id });
      const invoiceCreationMonth = month;
      const invoiceCreationYear = year;
      const formattedDate = month + '/' + year;
      let invoiceDueDate = new Date();
      if (parseInt(invoiceCreationMonth) < 12) {
        invoiceDueDate = new Date(
          `${invoiceCreationYear}-${parseInt(invoiceCreationMonth) + 1}-${
            project.invoiceTerm
          }`,
        );
      } else {
        invoiceDueDate = new Date(
          `${parseInt(invoiceCreationYear)}-1-${project.invoiceTerm}`,
        );
      }
      let invoiceDueDateToDisplay = '';
      if (invoiceDueDate.getMonth() + 1 < 10) {
        invoiceDueDateToDisplay = `${invoiceDueDate.getDate()}.0${
          Number(invoiceDueDate.getMonth()) + 1
        }.${invoiceDueDate.getFullYear()}`;
      } else {
        invoiceDueDateToDisplay = `${invoiceDueDate.getDate()}.${
          Number(invoiceDueDate.getMonth()) + 1
        }.${invoiceDueDate.getFullYear()}`;
      }
      const internalCompany = await this.customerRepository.findOneBy({
        internal: true,
      });

      if (project) {
        const customerOfProject = await this.customerRepository.findOneBy({
          id: project.customerId,
        });
        const VATvalue = 0.19;
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
          this.numberOfDaysWorkedOnProjectDuringMonth =
            this.getNumberOfDayWithActivitiesOfProjectFromMonth(
              this.activitiesOfProjectPerMonthYear,
            );
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

          if (rateForProject.rateType === RateType.HOURLY) {
            worksheet.getCell('D20').value = 'U.M. (ore)';
            worksheet.getCell('D20').alignment = { horizontal: 'left' };
          }

          if (rateForProject.rateType === RateType.MONTHLY) {
            worksheet.getCell('D20').value = 'U.M. (luni)';
            worksheet.getCell('D20').alignment = { horizontal: 'left' };
          }

          if (rateForProject.rateType === RateType.DAILY) {
            worksheet.getCell('D20').value = 'U.M. (zile)';
            worksheet.getCell('D20').alignment = { horizontal: 'left' };
          }

          if (rateForProject.rateType === RateType.PROJECT) {
            worksheet.getCell('D20').value = 'U.M. (proiect)';
            worksheet.getCell('D20').alignment = { horizontal: 'left' };
          }

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
          worksheet.getCell('F29').alignment = { horizontal: 'center' };

          worksheet.getCell('F27').value = 'Curs BNR';
          worksheet.getCell('F27').alignment = { horizontal: 'center' };
          if (customerOfProject.VAT) {
            worksheet.getCell('F29').value = 'Cota TVA 19%';
          } else {
            worksheet.getCell('F29').value = 'Cota TVA 0%';
          }
          worksheet.getCell('F31').value = 'TOTAL DE PLATA:';
          worksheet.getCell('F31').alignment = { horizontal: 'center' };

          worksheet.getCell('A13').alignment = { horizontal: 'center' };
          worksheet.getCell('H5').font = { size: 18 };
          worksheet.getCell('A13').value = 'CLIENT';

          worksheet.getCell('H27').alignment = { horizontal: 'center' };
          worksheet.getCell('H27').value = `${euroExchange.toString()}`;
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

          worksheet.getCell('I9').value = actualEmisionDate.replaceAll(
            '/',
            '.',
          );
          if (project.dueDate) {
            worksheet.getCell('I10').value = invoiceDueDateToDisplay;
          }
          worksheet.mergeCells('A46:E46');
          worksheet.mergeCells('A47:E47');
          worksheet.mergeCells('A48:E48');
          worksheet.mergeCells('A49:E49');
          worksheet.mergeCells('A50:E50');

          worksheet.mergeCells('H49:J49');
          worksheet.mergeCells('H50:J50');
          if (internalCompany) {
            worksheet.getCell('A43').value = `${internalCompany.customerName}`;
            worksheet.getCell(
              'A46',
            ).value = `CUI ${internalCompany.customerCUI}`;
            worksheet.getCell('A46').alignment = { horizontal: 'left' };
            worksheet.getCell('A46').font = { size: 9 };

            worksheet.getCell('A47').value = `${internalCompany.customerReg}`;
            worksheet.getCell('A47').alignment = { horizontal: 'left' };
            worksheet.getCell('A47').font = { size: 9 };

            worksheet.getCell(
              'A48',
            ).value = `Sediu: ${internalCompany.customerAddress}`;
            worksheet.getCell('A48').alignment = { horizontal: 'left' };
            worksheet.getCell('A48').font = { size: 9 };

            worksheet.getCell(
              'A49',
            ).value = `${internalCompany.customerCity} ${internalCompany.customerCountry}`;
            worksheet.getCell('A49').alignment = { horizontal: 'left' };
            worksheet.getCell('A49').font = { size: 9 };

            worksheet.getCell(
              'A50',
            ).value = `Reprezentant: ${internalCompany.customerDirectorName} , Administrator`;
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

            worksheet.getCell('B21').value = '';
            worksheet.getCell('B21').font = { size: 11 };
            worksheet.getCell('B21').alignment = { horizontal: 'center' };

            worksheet.getCell('B21').value =
              worksheet.getCell('B21').value + project.projectName;
          } else {
            worksheet.getCell('A46').value = `CUI COMPANY_CUI`;
            worksheet.getCell('A46').alignment = { horizontal: 'left' };
            worksheet.getCell('A46').font = { size: 9 };

            worksheet.getCell('A47').value = `COMPANY_REG`;
            worksheet.getCell('A47').alignment = { horizontal: 'left' };
            worksheet.getCell('A47').font = { size: 9 };

            worksheet.getCell('A48').value = `Sediu: COMPANY_ADDRESS`;
            worksheet.getCell('A48').alignment = { horizontal: 'left' };
            worksheet.getCell('A48').font = { size: 9 };

            worksheet.getCell('A49').value = `COMPANY_CITY, COMPANY COUNTRY`;
            worksheet.getCell('A49').alignment = { horizontal: 'left' };
            worksheet.getCell('A49').font = { size: 9 };

            worksheet.getCell(
              'A50',
            ).value = `Reprezentant: COMPANY_DIRECTOR_NAME , Administrator`;
            worksheet.getCell('A50').alignment = { horizontal: 'left' };
            worksheet.getCell('A50').font = { size: 9 };

            worksheet.getCell('H49').value = 'COMPANY_BANK';
            worksheet.getCell('H49').alignment = { horizontal: 'right' };

            worksheet.getCell('H50').value = 'COMPANY_IBAN';
            worksheet.getCell('H50').alignment = { horizontal: 'right' };

            worksheet.mergeCells('C14:E14');
            worksheet.mergeCells('C15:E15');
            worksheet.mergeCells('C16:E16');
            worksheet.mergeCells('C17:E17');

            worksheet.getCell('C14').value = customerOfProject.customerName;
            worksheet.getCell('C15').value = customerOfProject.customerCUI;
            worksheet.getCell('C16').value = customerOfProject.customerReg;
            worksheet.getCell('C17').value = customerOfProject.customerAddress;

            worksheet.getCell('B21').value = '';
            worksheet.getCell('B21').font = { size: 11 };
            worksheet.getCell('B21').alignment = { horizontal: 'center' };

            worksheet.getCell('B21').value =
              worksheet.getCell('B21').value + project.projectName;
          }
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
            'ANEXA nr. 001 din ' +
            actualEmisionDate.replaceAll('/', '.') +
            ' la contractul ' +
            project.contract +
            ' si factura ' +
            invoiceNumber +
            ' din data ' +
            actualEmisionDate.replaceAll('/', '.');
          let annexStartLine = 2;
          let invoiceHoursTime = 0;
          let invoiceMinutesTime = 0;
          worksheet.getColumn('B').width = 20;
          worksheet.getCell('A21').alignment = { horizontal: 'center' };
          worksheet.getCell('A21').value = '1';

          const dateToDisplayOnServicesColumn = new Date();
          dateToDisplayOnServicesColumn.setDate(1);
          dateToDisplayOnServicesColumn.setMonth(parseInt(month) - 1);
          dateToDisplayOnServicesColumn.setFullYear(parseInt(year));
          const isoDateToDisplayOnServicesColumn = dateToDisplayOnServicesColumn
            .toISOString()
            .split('T')[0];
          const arrayDateMonthYear =
            isoDateToDisplayOnServicesColumn.split('-');
          const finalDateToDisplay = `${arrayDateMonthYear[2]}.${arrayDateMonthYear[1]}.${arrayDateMonthYear[0]}`;

          const monthEndDate = parseInt(arrayDateMonthYear[1]);
          const lastDayOfMonth = new Date(2008, monthEndDate, 0);

          const finalEndDateToDisplay = `${
            lastDayOfMonth.toString().split(' ')[2]
          }.${arrayDateMonthYear[1]}.${arrayDateMonthYear[0]}`;
          worksheet.getCell(
            'B21',
          ).value = `Prestare servicii IT, pe perioada \n ${finalDateToDisplay.replaceAll(
            '/',
            '.',
          )} - ${finalEndDateToDisplay.replaceAll(
            '/',
            '.',
          )} \n Consulting & Software development, \n Time & Material \n Conform Contract ${
            project.contract
          } `;
          worksheet.getCell('B21').font = { size: 8 };
          if (rateForProject.rateType === RateType.PROJECT) {
            this.activitiesOfProjectPerMonthYear =
              await this.getAllActivitiesOnProject(id);
          }
          const activitiesOfProjectMonthYearSortedASC =
            this.activitiesOfProjectPerMonthYear.sort(
              (activity1, activity2) =>
                new Date(
                  this.dateFormatService.formatDBDateStringToISO(
                    activity1.date,
                  ),
                ).getTime() -
                new Date(
                  this.dateFormatService.formatDBDateStringToISO(
                    activity2.date,
                  ),
                ).getTime(),
            );

          const annexLineEndColumn = 12;
          annexWorksheet.mergeCells('A2:L2');
          annexWorksheet.mergeCells('M2:N2');
          annexWorksheet.mergeCells('O2:Q2');
          annexWorksheet.getCell('A2').value = 'Activity Name';
          annexWorksheet.getCell('M2').value = 'Activity Type';
          annexWorksheet.getCell('O2').value = 'Activity Time';
          if (activitiesOfProjectMonthYearSortedASC.length >= 1) {
            activitiesOfProjectMonthYearSortedASC.forEach((activity) => {
              annexStartLine = annexStartLine + 1;
              annexWorksheet.mergeCells(
                annexStartLine,
                1,
                annexStartLine,
                annexLineEndColumn,
              );
              annexWorksheet.getCell(
                annexStartLine,
                2,
              ).value = `${activity.date.replaceAll('/', '.')} - ${
                activity.name
              }`;
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

              invoiceHoursTime =
                invoiceHoursTime + timeForCurrentActivity.hours;
              invoiceMinutesTime =
                invoiceMinutesTime + timeForCurrentActivity.minutes;

              annexWorksheet.getCell(annexStartLine, 15).value =
                'HOURS: ' +
                timeForCurrentActivity.hours +
                ' MINUTES: ' +
                timeForCurrentActivity.minutes;
            });
            const minutesToHours = invoiceMinutesTime / 60;
            invoiceHoursTime = invoiceHoursTime + minutesToHours;
            worksheet.getCell('H31').alignment = { horizontal: 'center' };
            worksheet.getCell('B21').alignment = { horizontal: 'center' };
            worksheet.getCell('D21').alignment = { horizontal: 'center' };
            worksheet.getCell('F21').alignment = { horizontal: 'center' };
            worksheet.getCell('H21').alignment = { horizontal: 'center' };
            if (rateForProject.rateType === RateType.HOURLY) {
              worksheet.getCell('D21').value = invoiceHoursTime;
              worksheet.getCell('H21').value =
                (invoiceHoursTime * rateForProject.rate * euroExchange)
                  .toFixed(2)
                  .toString() + ' RON';
              if (customerOfProject.VAT) {
                worksheet.getCell('H29').value =
                  (
                    invoiceHoursTime *
                    rateForProject.rate *
                    euroExchange *
                    VATvalue
                  )
                    .toFixed(2)
                    .toString() + ' RON';
                worksheet.getCell('H31').value =
                  (
                    invoiceHoursTime * rateForProject.rate * euroExchange +
                    invoiceHoursTime *
                      rateForProject.rate *
                      euroExchange *
                      VATvalue
                  )
                    .toFixed(2)
                    .toString() + ' RON';
              } else {
                worksheet.getCell('H31').value =
                  (invoiceHoursTime * rateForProject.rate * euroExchange)
                    .toFixed(2)
                    .toString() + ' RON';
              }
            }
            if (rateForProject.rateType === RateType.MONTHLY) {
              worksheet.getCell('D21').value = 1;
              worksheet.getCell('H21').value =
                (rateForProject.rate * euroExchange).toFixed(2).toString() +
                ' RON';
              if (customerOfProject.VAT) {
                worksheet.getCell('H29').value =
                  (rateForProject.rate * euroExchange * VATvalue)
                    .toFixed(2)
                    .toString() + ' RON';
                worksheet.getCell('H31').value =
                  (
                    rateForProject.rate * euroExchange +
                    rateForProject.rate * euroExchange * VATvalue
                  )
                    .toFixed(2)
                    .toString() + ' RON';
              } else {
                worksheet.getCell('H31').value =
                  (rateForProject.rate * euroExchange).toFixed(2).toString() +
                  ' RON';
              }
            }
            if (rateForProject.rateType === RateType.DAILY) {
              worksheet.getCell('D21').value =
                this.numberOfDaysWorkedOnProjectDuringMonth;
              worksheet.getCell('H21').value =
                (
                  rateForProject.rate *
                  euroExchange *
                  this.numberOfDaysWorkedOnProjectDuringMonth
                )
                  .toFixed(2)
                  .toString() + ' RON';
              if (customerOfProject.VAT) {
                worksheet.getCell('H29').value =
                  (
                    rateForProject.rate *
                    euroExchange *
                    this.numberOfDaysWorkedOnProjectDuringMonth *
                    VATvalue
                  )
                    .toFixed(2)
                    .toString() + ' RON';
                worksheet.getCell('H31').value =
                  (
                    rateForProject.rate *
                      euroExchange *
                      this.numberOfDaysWorkedOnProjectDuringMonth +
                    rateForProject.rate *
                      euroExchange *
                      this.numberOfDaysWorkedOnProjectDuringMonth *
                      VATvalue
                  )
                    .toFixed(2)
                    .toString() + ' RON';
              } else {
                worksheet.getCell('H31').value =
                  (
                    rateForProject.rate *
                    euroExchange *
                    this.numberOfDaysWorkedOnProjectDuringMonth
                  )
                    .toFixed(2)
                    .toString() + ' RON';
              }
            }
            if (rateForProject.rateType === RateType.PROJECT) {
              worksheet.getCell('D21').value = 1;
              worksheet.getCell('H21').value =
                (rateForProject.rate * euroExchange).toFixed(2).toString() +
                ' RON';
              if (customerOfProject.VAT) {
                worksheet.getCell('H29').value =
                  (rateForProject.rate * euroExchange * VATvalue)
                    .toFixed(2)
                    .toString() + ' RON';
                worksheet.getCell('H31').value =
                  (
                    rateForProject.rate * euroExchange +
                    rateForProject.rate * euroExchange * VATvalue
                  )
                    .toFixed(2)
                    .toString() + ' RON';
              } else {
                worksheet.getCell('H31').value =
                  (rateForProject.rate * euroExchange).toFixed(2).toString() +
                  ' RON';
              }
            }
            worksheet.getCell('F21').value =
              (rateForProject.rate * euroExchange).toFixed(2).toString() +
              ' RON';
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
  getNumberOfDayWithActivitiesOfProjectFromMonth(
    activities: Activity[],
  ): number {
    const notUniqueDates = [];
    activities.forEach((activity) => {
      notUniqueDates.push(activity.date);
    });
    const uniqueDates = [...new Set(notUniqueDates)];
    if (uniqueDates) return uniqueDates.length;
    return 0;
  }

  getAllActivitiesOnProject(projectId: string): Promise<Activity[]> {
    try {
      const activitiesOfProject = this.activityRepository.findBy({
        projectId: projectId,
      });
      if (activitiesOfProject) return activitiesOfProject;
      throw new HttpException(
        'No activities for project',
        HttpStatus.NOT_FOUND,
      );
    } catch (err) {
      throw err;
    }
  }
}
