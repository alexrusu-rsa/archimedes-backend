import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Activity } from 'src/entity/activity.entity';
import { Customer } from 'src/entity/customer.entity';
import { Project } from 'src/entity/project.entity';
import { getRepository, Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { DateFormatService } from 'src/date-format/date-format.service';
import { Rate } from 'src/entity/rate.entity';
import { RateType } from 'src/custom/rate-type.enum';

@Injectable()
export class PdfInvoiceService {
  activitiesOfProjectPerMonthYear: Activity[];
  constructor(
    private dateFormatService: DateFormatService,
    @Inject('PROJECT_REPOSITORY')
    private projectRepository: Repository<Project>,
    @Inject('CUSTOMER_REPOSITORY')
    private customerRepository: Repository<Customer>,
    @Inject('RATE_REPOSITORY')
    private rateRepository: Repository<Rate>,
  ) {}
  async generatePDF(
    id: string,
    invoiceNumber: string,
    month: string,
    year: string,
    euroExchange: number,
  ): Promise<Buffer> {
    try {
      const rateForProject = await this.rateRepository.findOneBy({
        projectId: id,
      });
      const project = await this.projectRepository.findOneBy({ id });
      const invoiceCreationMonth = month;
      const invoiceCreationYear = year;
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
      const invoiceDueDateToDisplay = `${invoiceDueDate.getDate()}/${
        Number(invoiceDueDate.getMonth()) + 1
      }/${invoiceDueDate.getFullYear()}`;
      const internalCompany = await this.customerRepository.findOneBy({
        internal: true,
      });

      const formattedDate = month + '/' + year;
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
          const pdfBuffer: Buffer = await new Promise((resolve) => {
            const doc = new PDFDocument({
              size: 'A4',
              bufferPages: true,
            });
            doc.lineWidth(5);
            doc
              .lineCap('butt')
              .moveTo(40, 50)
              .lineTo(555.28, 50)
              .stroke('#2D508F');
            doc.image('src/images/logo_invoice.png', 50, 100, {
              width: 200,
            });
            doc.fontSize(14);
            doc
              .font('Helvetica-Bold')
              .fillColor('#2D508F')
              .text('FACTURA FISCALA', 310, 90, {
                width: 225,
                align: 'center',
              });
            doc.fontSize(10);

            doc
              .fillColor('#000000')
              .text('Seria:', 325, 115, { width: 175, align: 'justify' });

            doc
              .fillColor('#000000')
              .text('RSA', 450, 115, { width: 175, align: 'justify' });

            doc
              .fillColor('#000000')
              .text('Numar:', 325, 130, { width: 175, align: 'justify' });

            doc.fillColor('#000000').text(invoiceNumber, 450, 130, {
              width: 175,
              align: 'justify',
            });

            doc.fillColor('#000000').text('Data eliberarii:', 325, 145, {
              width: 175,
              align: 'justify',
            });
            const today = new Date();
            const dd = parseInt(String(today.getDate()).padStart(2, '0'));
            const mm = parseInt(String(today.getMonth() + 1).padStart(2, '0'));
            const yyyy = today.getFullYear();
            const todayString = dd + '/' + mm + '/' + yyyy;

            doc
              .fillColor('#000000')
              .text(todayString, 450, 145, { width: 175, align: 'justify' });

            doc.fillColor('#000000').text('Data scadentei:', 325, 160, {
              width: 175,
              align: 'justify',
            });
            doc.fillColor('#000000').text(invoiceDueDateToDisplay, 450, 160, {
              width: 175,
              align: 'justify',
            });

            doc.lineWidth(20);

            doc
              .lineCap('butt')
              .moveTo(40, 210)
              .lineTo(297.64, 210)
              .stroke('#2D508F');
            doc.fontSize(12);
            doc
              .fillColor('#ffffff')
              .text('CLIENT', 110, 205, { width: 100, align: 'left' });
            doc.fontSize(10);
            doc
              .fillColor('#000000')
              .text('Nume:', 45, 225, { width: 50, align: 'justify' });
            doc
              .fillColor('#000000')
              .text(customerOfProject.customerName, 145, 225, {
                width: 175,
                align: 'left',
              });

            doc
              .fillColor('#000000')
              .text('CIF:', 45, 240, { width: 50, align: 'justify' });
            doc
              .fillColor('#000000')
              .text(customerOfProject.customerCUI, 145, 240, {
                width: 175,
                align: 'left',
              });

            doc
              .fillColor('#000000')
              .text('Reg. Com:', 45, 255, { width: 50, align: 'justify' });
            doc
              .fillColor('#000000')
              .text(customerOfProject.customerReg, 145, 255, {
                width: 175,
                align: 'justify',
              });

            doc
              .fillColor('#000000')
              .text('Sediu:', 45, 270, { width: 50, align: 'justify' });
            doc
              .fillColor('#000000')
              .text(customerOfProject.customerAddress, 145, 270, {
                width: 175,
                align: 'justify',
              });
            doc.fontSize(14);

            doc.lineWidth(1);
            doc
              .lineJoin('square')
              .rect(45, 290, 505.28, 15)
              .fillOpacity(1)
              .fillAndStroke('#2D508F', '#000000');
            doc.lineJoin('square').rect(45, 290, 505.28, 80).stroke('#000000');
            doc
              .lineCap('butt')
              .moveTo(45, 305)
              .lineTo(550, 305)
              .stroke('#000000');
            doc
              .lineCap('butt')
              .moveTo(90, 290)
              .lineTo(90, 370)
              .stroke('#000000');
            doc
              .lineCap('butt')
              .moveTo(250, 290)
              .lineTo(250, 370)
              .stroke('#000000');
            doc
              .lineCap('butt')
              .moveTo(325, 290)
              .lineTo(325, 370)
              .stroke('#000000');
            doc
              .lineCap('butt')
              .moveTo(440, 290)
              .lineTo(440, 370)
              .stroke('#000000');
            doc.fontSize(10);
            doc
              .font('Helvetica-Bold')
              .fillColor('#ffffff')
              .text('Nr. crt.', 20, 294, { width: 90, align: 'center' });

            doc
              .font('Helvetica-Bold')
              .fillColor('#ffffff')
              .text('Descriere servicii', 90, 294, {
                width: 160,
                align: 'center',
              });

            if (rateForProject.rateType === RateType.HOURLY)
              doc
                .font('Helvetica-Bold')
                .fillColor('#ffffff')
                .text('U.M(ore)', 250, 294, { width: 75, align: 'center' });
            if (rateForProject.rateType === RateType.MONTHLY)
              doc
                .font('Helvetica-Bold')
                .fillColor('#ffffff')
                .text('U.M(luni)', 250, 294, { width: 75, align: 'center' });

            doc
              .font('Helvetica-Bold')
              .fillColor('#ffffff')
              .text('Valoare unitara', 325, 294, {
                width: 115,
                align: 'center',
              });

            doc
              .font('Helvetica-Bold')
              .fillColor('#ffffff')
              .text('Valoare', 440, 294, { width: 110, align: 'center' });

            doc.lineJoin('square').rect(375, 450, 100, 25).stroke('#000000');
            doc.lineJoin('square').rect(375, 475, 100, 25).stroke('#000000');
            doc
              .lineJoin('square')
              .rect(375, 500, 175, 20)
              .fillOpacity(0.2)
              .fillAndStroke('#2D508F', '#000000');
            doc
              .lineCap('butt')
              .moveTo(475, 500)
              .lineTo(475, 520)
              .stroke('#000000');
            doc.fillOpacity(1);

            doc
              .fillColor('#000000')
              .text('Curs BNR:', 375, 458, { width: 100, align: 'center' });

            doc
              .fillColor('#000000')
              .text(`${euroExchange.toString()} RON/EUR`, 465, 458, {
                width: 100,
                align: 'center',
              });

            doc
              .fillColor('#000000')
              .text('COTA TVA 0%', 375, 483, { width: 100, align: 'center' });

            doc.fillColor('#000000').text('TOTAL DE PLATA', 375, 508, {
              width: 100,
              align: 'center',
            });

            doc
              .font('Helvetica-Bold')
              .fillColor('#2D508F')
              .text('RSA SOFT SRL', 45, 630, {
                width: 175,
                align: 'justify',
              });

            doc.fontSize(10);

            doc.lineWidth(5);

            doc
              .lineCap('butt')
              .moveTo(40, 645)
              .lineTo(555.28, 645)
              .stroke('#2D508F');
            doc
              .font('Helvetica-Bold')
              .fillColor('#000000')
              .text(project.projectName, 90, 335, {
                width: 160,
                align: 'center',
              });

            if (internalCompany) {
              doc
                .fillColor('#000000')
                .text(`CUI ${internalCompany.customerCUI}`, 45, 660, {
                  width: 225,
                  align: 'justify',
                });

              doc
                .fillColor('#000000')
                .text(`${internalCompany.customerReg}`, 45, 675, {
                  width: 225,
                  align: 'justify',
                });

              doc
                .fillColor('#000000')
                .text(`Sediu: ${internalCompany.customerAddress}`, 45, 690, {
                  width: 225,
                  align: 'justify',
                });

              doc
                .fillColor('#000000')
                .text(
                  `${internalCompany.customerCity} ${internalCompany.customerCountry}`,
                  45,
                  705,
                  {
                    width: 225,
                    align: 'justify',
                  },
                );

              doc
                .fillColor('#000000')
                .text(
                  `Reprezentant: ${internalCompany.customerDirectorName} , Administrator`,
                  45,
                  720,
                  {
                    width: 350,
                    align: 'justify',
                  },
                );

              doc.fillColor('#000000').text('Banca Transilvania', 400, 705, {
                width: 150,
                align: 'justify',
              });
              doc
                .fillColor('#000000')
                .text('RO43BTRLRONCRT0593347301', 400, 720, {
                  width: 165,
                  align: 'justify',
                });
            } else {
              doc.fillColor('#000000').text(`CUI COMPANY_CUI`, 45, 660, {
                width: 225,
                align: 'justify',
              });

              doc.fillColor('#000000').text(`COMPANY_REG`, 45, 675, {
                width: 225,
                align: 'justify',
              });

              doc.fillColor('#000000').text(`Sediu: COMPANY_ADDRESS`, 45, 690, {
                width: 225,
                align: 'justify',
              });

              doc
                .fillColor('#000000')
                .text(`COMPANY_CITY, COMPANY COUNTRY`, 45, 705, {
                  width: 225,
                  align: 'justify',
                });

              doc
                .fillColor('#000000')
                .text(
                  `Reprezentant: COMPANY_DIRECTOR_NAME , Administrator`,
                  45,
                  720,
                  {
                    width: 350,
                    align: 'justify',
                  },
                );

              doc.fillColor('#000000').text('COMPANY_BANK', 400, 705, {
                width: 150,
                align: 'justify',
              });
              doc.fillColor('#000000').text('COMPANY_IBAN', 400, 720, {
                width: 165,
                align: 'justify',
              });
            }
            doc.addPage();
            doc.fontSize(14);
            doc
              .fillColor('#000000')
              .text(
                `ANEXA nr. 001 ${todayString} la contractul ${project.contract} si factura ${invoiceNumber} din ${todayString}`,
              );
            doc.fontSize(10);
            doc
              .fillColor('#2D508F')
              .text(
                'NUMELE ACTIVITATII - TIPUL ACTIVITATII - TIMP ALOCAT PE ACTIVITATE',
              );

            let index = 1;
            let invoiceHoursTime = 0;
            let invoiceMinutesTime = 0;
            this.activitiesOfProjectPerMonthYear.forEach((activity) => {
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
              doc
                .fillColor('#000000')
                .text(
                  `${index}. ${activity.name} - ${activity.activityType} - HOURS: ${timeForCurrentActivity.hours} MINUTES: ${timeForCurrentActivity.minutes}`,
                );

              index = index + 1;
            });
            const minutesToHours = invoiceMinutesTime / 60;
            invoiceHoursTime = invoiceHoursTime + minutesToHours;
            doc.switchToPage(0);
            if (rateForProject.rateType === RateType.HOURLY) {
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(invoiceHoursTime.toString(), 210, 335, {
                  width: 160,
                  align: 'center',
                });
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(
                  (rateForProject.rate * euroExchange).toFixed(2).toString() +
                    ' RON',
                  300,
                  335,
                  {
                    width: 160,
                    align: 'center',
                  },
                );
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(
                  (invoiceHoursTime * rateForProject.rate * euroExchange)
                    .toFixed(2)
                    .toString() + ' RON',
                  420,
                  335,
                  {
                    width: 160,
                    align: 'center',
                  },
                );
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(
                  (invoiceHoursTime * rateForProject.rate * euroExchange)
                    .toFixed(2)
                    .toString() + ' RON',
                  435,
                  508,
                  {
                    width: 160,
                    align: 'center',
                  },
                );
            }
            if (rateForProject.rateType === RateType.MONTHLY) {
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text('1', 210, 335, {
                  width: 160,
                  align: 'center',
                });
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(
                  (rateForProject.rate * euroExchange).toFixed(2).toString() +
                    ' RON',
                  300,
                  335,
                  {
                    width: 160,
                    align: 'center',
                  },
                );
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(
                  (rateForProject.rate * euroExchange).toFixed(2).toString(),
                  420,
                  335,
                  {
                    width: 160,
                    align: 'center',
                  },
                );
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(
                  (rateForProject.rate * euroExchange).toFixed(2).toString(),
                  435,
                  508,
                  {
                    width: 160,
                    align: 'center',
                  },
                );
            }
            doc
              .lineCap('butt')
              .moveTo(40, 800)
              .lineTo(555.28, 800)
              .stroke('#2D508F');

            doc.end();

            const buffer = [];
            doc.on('data', buffer.push.bind(buffer));
            doc.on('end', () => {
              const data = Buffer.concat(buffer);
              resolve(data);
            });
          });
          return pdfBuffer;
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
