import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Activity } from 'src/entity/activity.entity';
import { Customer } from 'src/entity/customer.entity';
import { Project } from 'src/entity/project.entity';
import { getRepository, Repository } from 'typeorm';
import * as PDFDocument from 'pdfkit';
import { DateFormatService } from 'src/date-format/date-format.service';
import { Rate } from 'src/entity/rate.entity';
import { RateType } from 'src/custom/rate-type.enum';
import { fillAndStroke } from 'pdfkit';
import e from 'express';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class PdfInvoiceService {
  activitiesOfProjectPerMonthYear: Activity[];
  numberOfDaysWorkedOnProjectDuringMonth: number;

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
    private i18n: I18nService,
  ) {}
  async generatePDF(
    id: string,
    invoiceNumber: string,
    month: string,
    year: string,
    euroExchange: number,
    dateMillis: string,
  ): Promise<Buffer> {
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
        let lang = 'en';
        const romanianCustomer = customerOfProject.romanianCompany;
        const customerSWIFT = customerOfProject.SWIFT;
        if (romanianCustomer) lang = 'ro';
        const appliedVAT = customerOfProject.VAT;
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
          const pdfBuffer: Buffer = await new Promise(async (resolve) => {
            const doc = new PDFDocument({
              size: 'A4',
              bufferPages: false,
              compress: false,
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
              .text(
                this.i18n.t('strings.invoiceTitle', { lang: lang }),
                310,
                90,
                {
                  width: 225,
                  align: 'center',
                },
              );
            doc.fontSize(10);

            doc
              .fillColor('#000000')
              .text(
                this.i18n.t('strings.invoiceSeriesTitle', { lang: lang }),
                325,
                115,
                { width: 175, align: 'justify' },
              );

            doc
              .fillColor('#000000')
              .text('RSA', 450, 115, { width: 175, align: 'justify' });

            doc
              .fillColor('#000000')
              .text(
                this.i18n.t('strings.invoiceNumberTitle', { lang: lang }),
                325,
                130,
                { width: 175, align: 'justify' },
              );

            doc.fillColor('#000000').text(invoiceNumber, 450, 130, {
              width: 175,
              align: 'justify',
            });

            doc
              .fillColor('#000000')
              .text(
                this.i18n.t('strings.dateOfIssue', { lang: lang }),
                325,
                145,
                {
                  width: 175,
                  align: 'justify',
                },
              );
            const today = new Date();
            const dd = parseInt(String(today.getDate()).padStart(2, '0'));
            const mm = parseInt(String(today.getMonth() + 1).padStart(2, '0'));
            const yyyy = today.getFullYear();
            const todayString = dd + '/' + mm + '/' + yyyy;
            if (actualEmisionDate) {
              doc
                .fillColor('#000000')
                .text(actualEmisionDate.replaceAll('/', '.'), 450, 145, {
                  width: 175,
                  align: 'justify',
                });
            } else {
              doc
                .fillColor('#000000')
                .text(todayString, 450, 145, { width: 175, align: 'justify' });
            }
            doc
              .fillColor('#000000')
              .text(this.i18n.t('strings.dueDate', { lang: lang }), 325, 160, {
                width: 175,
                align: 'justify',
              });
            doc
              .fillColor('#000000')
              .text(invoiceDueDateToDisplay.replaceAll('/', '.'), 450, 160, {
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
              .text(
                this.i18n.t('strings.customerTitle', { lang: lang }),
                110,
                205,
                { width: 100, align: 'left' },
              );
            doc.fontSize(10);
            doc
              .fillColor('#000000')
              .text(
                this.i18n.t('strings.customerName', { lang: lang }),
                45,
                225,
                { width: 50, align: 'justify' },
              );
            doc
              .fillColor('#000000')
              .text(customerOfProject.customerName, 145, 225, {
                width: 400,
                align: 'left',
              });

            doc
              .fillColor('#000000')
              .text(
                this.i18n.t('strings.customerCIF', { lang: lang }),
                45,
                240,
                { width: 50, align: 'justify' },
              );
            doc
              .fillColor('#000000')
              .text(customerOfProject.customerCUI, 145, 240, {
                width: 400,
                align: 'left',
              });

            doc
              .fillColor('#000000')
              .text(
                this.i18n.t('strings.customerReg', { lang: lang }),
                45,
                255,
                { width: 50, align: 'justify' },
              );
            doc
              .fillColor('#000000')
              .text(customerOfProject.customerReg, 145, 255, {
                width: 400,
                align: 'justify',
              });

            doc
              .fillColor('#000000')
              .text(
                this.i18n.t('strings.customerHQ', { lang: lang }),
                45,
                270,
                { width: 80, align: 'justify' },
              );
            doc
              .fillColor('#000000')
              .text(customerOfProject.customerAddress, 145, 270, {
                width: 400,
                align: 'justify',
              });
            doc.fontSize(14);

            doc.lineWidth(1);

            doc
              .lineCap('butt')
              .moveTo(45, 290)
              .lineTo(550, 290)
              .stroke('#000000');
            doc
              .lineCap('butt')
              .moveTo(45, 400)
              .lineTo(550, 400)
              .stroke('#000000');
            doc
              .lineCap('butt')
              .moveTo(45, 305)
              .lineTo(550, 305)
              .stroke('#000000');

            doc.lineWidth(15);

            doc
              .lineCap('butt')
              .moveTo(45, 298)
              .lineTo(550, 298)
              .stroke('#2D508F');

            doc.lineWidth(1);
            doc
              .lineCap('butt')
              .moveTo(45, 290)
              .lineTo(45, 400)
              .stroke('#000000');
            doc
              .lineCap('butt')
              .moveTo(90, 290)
              .lineTo(90, 400)
              .stroke('#000000');

            doc
              .lineCap('butt')
              .moveTo(250, 290)
              .lineTo(250, 400)
              .stroke('#000000');

            doc
              .lineCap('butt')
              .moveTo(325, 290)
              .lineTo(325, 400)
              .stroke('#000000');

            doc
              .lineCap('butt')
              .moveTo(440, 290)
              .lineTo(440, 400)
              .stroke('#000000');
            doc
              .lineCap('butt')
              .moveTo(550, 290)
              .lineTo(550, 400)
              .stroke('#000000');
            doc.fontSize(10);
            doc
              .font('Helvetica-Bold')
              .fillColor('#ffffff')
              .text(
                this.i18n.t('strings.currentIndex', { lang: lang }),
                20,
                294,
                { width: 90, align: 'center' },
              );
            doc.fontSize(10);
            doc.font('Helvetica-Bold').fillColor('#000000').text('1', 38, 350, {
              width: 60,
              align: 'center',
            });
            doc
              .font('Helvetica-Bold')
              .fillColor('#ffffff')
              .text(
                this.i18n.t('strings.servicesDescription', { lang: lang }),
                90,
                294,
                {
                  width: 160,
                  align: 'center',
                },
              );

            if (rateForProject.rateType === RateType.HOURLY)
              doc
                .font('Helvetica-Bold')
                .fillColor('#ffffff')
                .text(
                  this.i18n.t('strings.serviceMeasurementUnitsHours', {
                    lang: lang,
                  }),
                  250,
                  294,
                  { width: 75, align: 'center' },
                );
            if (rateForProject.rateType === RateType.MONTHLY)
              doc
                .font('Helvetica-Bold')
                .fillColor('#ffffff')
                .text(
                  this.i18n.t('strings.serviceMeasurementUnitsMonths', {
                    lang: lang,
                  }),
                  250,
                  294,
                  { width: 75, align: 'center' },
                );
            if (rateForProject.rateType === RateType.DAILY)
              doc
                .font('Helvetica-Bold')
                .fillColor('#ffffff')
                .text(
                  this.i18n.t('strings.serviceMeasurementUnitsDays', {
                    lang: lang,
                  }),
                  250,
                  294,
                  { width: 75, align: 'center' },
                );

            doc
              .font('Helvetica-Bold')
              .fillColor('#ffffff')
              .text(
                this.i18n.t('strings.unitPrice', {
                  lang: lang,
                }),
                325,
                294,
                {
                  width: 115,
                  align: 'center',
                },
              );

            doc
              .font('Helvetica-Bold')
              .fillColor('#ffffff')
              .text(
                this.i18n.t('strings.value', {
                  lang: lang,
                }),
                440,
                294,
                { width: 110, align: 'center' },
              );
            if (!romanianCustomer) {
              doc
                .lineCap('butt')
                .moveTo(475, 470)
                .lineTo(475, 525)
                .stroke('#000000');
              doc
                .lineCap('butt')
                .moveTo(375, 470)
                .lineTo(375, 525)
                .stroke('#000000');
              doc
                .lineCap('butt')
                .moveTo(555.28, 470)
                .lineTo(555.28, 525)
                .stroke('#000000');
              doc
                .lineCap('butt')
                .moveTo(375, 470)
                .lineTo(555.28, 470)
                .stroke('#000000');
              doc
                .lineCap('butt')
                .moveTo(375, 500)
                .lineTo(555.28, 500)
                .stroke('#000000');
              doc
                .lineCap('butt')
                .moveTo(375, 525)
                .lineTo(555.28, 525)
                .stroke('#000000');
            } else {
              doc
                .lineCap('butt')
                .moveTo(475, 450)
                .lineTo(475, 525)
                .stroke('#000000');
              doc
                .lineCap('butt')
                .moveTo(375, 450)
                .lineTo(375, 525)
                .stroke('#000000');

              doc
                .lineCap('butt')
                .moveTo(555.28, 450)
                .lineTo(555.28, 525)
                .stroke('#000000');

              doc
                .lineCap('butt')
                .moveTo(375, 450)
                .lineTo(555.28, 450)
                .stroke('#000000');

              doc
                .lineCap('butt')
                .moveTo(375, 470)
                .lineTo(555.28, 470)
                .stroke('#000000');

              doc
                .lineCap('butt')
                .moveTo(375, 500)
                .lineTo(555.28, 500)
                .stroke('#000000');
              doc
                .lineCap('butt')
                .moveTo(375, 525)
                .lineTo(555.28, 525)
                .stroke('#000000');
            }
            doc.fillOpacity(1);

            if (romanianCustomer) {
              doc.fillColor('#000000').text(
                this.i18n.t('strings.currencyExchange', {
                  lang: lang,
                }),
                375,
                458,
                { width: 100, align: 'center' },
              );

              doc
                .fillColor('#000000')
                .text(`${euroExchange.toString()}`, 465, 458, {
                  width: 100,
                  align: 'center',
                });
            }

            if (customerOfProject.VAT) {
              doc.fillColor('#000000').text(
                this.i18n.t('strings.VAT19', {
                  lang: lang,
                }),
                375,
                483,
                {
                  width: 100,
                  align: 'center',
                },
              );
            } else {
              doc.fillColor('#000000').text(
                this.i18n.t('strings.VAT0', {
                  lang: lang,
                }),
                375,
                483,
                {
                  width: 100,
                  align: 'center',
                },
              );
            }

            doc.fillColor('#000000').text(
              this.i18n.t('strings.total', {
                lang: lang,
              }),
              375,
              508,
              {
                width: 100,
                align: 'center',
              },
            );

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

            const dateToDisplayOnServicesColumn = new Date();
            dateToDisplayOnServicesColumn.setDate(1);
            dateToDisplayOnServicesColumn.setMonth(parseInt(month) - 1);
            dateToDisplayOnServicesColumn.setFullYear(parseInt(year));
            const isoDateToDisplayOnServicesColumn =
              dateToDisplayOnServicesColumn.toISOString().split('T')[0];
            const arrayDateMonthYear =
              isoDateToDisplayOnServicesColumn.split('-');
            const finalDateToDisplay = `${arrayDateMonthYear[2]}.${arrayDateMonthYear[1]}.${arrayDateMonthYear[0]}`;

            const monthEndDate = parseInt(arrayDateMonthYear[1]);
            const lastDayOfMonth = new Date(2008, monthEndDate, 0);

            const finalEndDateToDisplay = `${
              lastDayOfMonth.toString().split(' ')[2]
            }.${arrayDateMonthYear[1]}.${arrayDateMonthYear[0]}`;
            const serviceToDisplay = `${this.i18n.t(
              'strings.serviceToDisplay1',
              {
                lang: lang,
              },
            )} \n ${finalDateToDisplay} - ${finalEndDateToDisplay} \n ${this.i18n.t(
              'strings.serviceToDisplay2',
              {
                lang: lang,
              },
            )} \n ${this.i18n.t('strings.serviceToDisplay3', {
              lang: lang,
            })} \n ${this.i18n.t('strings.serviceToDisplay4', {
              lang: lang,
            })} ${project.contract} `;

            doc.fontSize(8);
            doc
              .font('Helvetica-Bold')
              .fillColor('#000000')
              .text(serviceToDisplay, 90, 320, {
                width: 160,
                align: 'center',
              });

            doc.fontSize(10);
            if (internalCompany) {
              doc.fillColor('#000000').text(
                `${this.i18n.t('strings.CUI', {
                  lang: lang,
                })} ${internalCompany.customerCUI}`,
                45,
                660,
                {
                  width: 225,
                  align: 'justify',
                },
              );

              doc
                .fillColor('#000000')
                .text(`${internalCompany.customerReg}`, 45, 675, {
                  width: 225,
                  align: 'justify',
                });

              doc.fillColor('#000000').text(
                `${this.i18n.t('strings.headquarters', {
                  lang: lang,
                })} ${internalCompany.customerAddress}`,
                45,
                690,
                {
                  width: 225,
                  align: 'justify',
                },
              );

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

              doc.fillColor('#000000').text(
                `${this.i18n.t('strings.representative', {
                  lang: lang,
                })} ${internalCompany.customerDirectorName} , Administrator`,
                45,
                720,
                {
                  width: 350,
                  align: 'justify',
                },
              );

              doc.fillColor('#000000').text('Banca Transilvania', 400, 690, {
                width: 150,
                align: 'justify',
              });
              if (romanianCustomer)
                doc
                  .fillColor('#000000')
                  .text(internalCompany.IBANRO, 400, 705, {
                    width: 165,
                    align: 'justify',
                  });
              else
                doc
                  .fillColor('#000000')
                  .text(internalCompany.IBANEUR, 400, 705, {
                    width: 165,
                    align: 'justify',
                  });
              if (internalCompany.SWIFT) {
                doc.fillColor('#000000').text(internalCompany.SWIFT, 400, 720, {
                  width: 165,
                  align: 'justify',
                });
              }
            } else {
              doc.fillColor('#000000').text(
                this.i18n.t('strings.CUIPlaceholder', {
                  lang: lang,
                }),
                45,
                660,
                {
                  width: 225,
                  align: 'justify',
                },
              );

              doc.fillColor('#000000').text(
                this.i18n.t('strings.companyRegPlaceholder', {
                  lang: lang,
                }),
                45,
                675,
                {
                  width: 225,
                  align: 'justify',
                },
              );

              doc.fillColor('#000000').text(
                this.i18n.t('strings.companyHeadquartersPlaceholder', {
                  lang: lang,
                }),
                45,
                690,
                {
                  width: 225,
                  align: 'justify',
                },
              );

              doc.fillColor('#000000').text(
                this.i18n.t('strings.companyCityCountryPlaceholder', {
                  lang: lang,
                }),
                45,
                705,
                {
                  width: 225,
                  align: 'justify',
                },
              );

              doc.fillColor('#000000').text(
                this.i18n.t('strings.companyRepresentativePlaceholder', {
                  lang: lang,
                }),
                45,
                720,
                {
                  width: 350,
                  align: 'justify',
                },
              );

              doc.fillColor('#000000').text(
                this.i18n.t('strings.companyBankPlaceholder', {
                  lang: lang,
                }),
                400,
                705,
                {
                  width: 150,
                  align: 'justify',
                },
              );
              doc
                .fillColor('#000000')
                .text('strings.companyIBANPlaceholder', 400, 720, {
                  width: 165,
                  align: 'justify',
                });
              doc
                .fillColor('#000000')
                .text('strings.companyIBANEURPlaceholder', 400, 735, {
                  width: 165,
                  align: 'justify',
                });
            }
            let invoiceHoursTime2 = 0;
            let invoiceMinutesTime2 = 0;

            const activitiesOfProjectMonthYearSortedASC2 =
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
            activitiesOfProjectMonthYearSortedASC2.forEach((activity) => {
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
              invoiceHoursTime2 =
                invoiceHoursTime2 + timeForCurrentActivity.hours;
              invoiceMinutesTime2 =
                invoiceMinutesTime2 + timeForCurrentActivity.minutes;
            });
            const minutesToHours2 = invoiceMinutesTime2 / 60;
            invoiceHoursTime2 = invoiceHoursTime2 + minutesToHours2;
            if (rateForProject.rateType === RateType.HOURLY) {
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(invoiceHoursTime2.toFixed(2).toString(), 210, 350, {
                  width: 160,
                  align: 'center',
                });
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(
                  (rateForProject.rate * euroExchange).toFixed(2).toString() +
                    this.i18n.t('strings.currency', {
                      lang: lang,
                    }),
                  300,
                  350,
                  {
                    width: 160,
                    align: 'center',
                  },
                );
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(
                  (invoiceHoursTime2 * rateForProject.rate * euroExchange)
                    .toFixed(2)
                    .toString() +
                    this.i18n.t('strings.currency', {
                      lang: lang,
                    }),
                  420,
                  350,
                  {
                    width: 160,
                    align: 'center',
                  },
                );
              if (customerOfProject.VAT) {
                doc
                  .font('Helvetica-Bold')
                  .fillColor('#000000')
                  .text(
                    (
                      invoiceHoursTime2 *
                      rateForProject.rate *
                      euroExchange *
                      VATvalue
                    )
                      .toFixed(2)
                      .toString() +
                      this.i18n.t('strings.currency', {
                        lang: lang,
                      }),
                    435,
                    483,
                    {
                      width: 160,
                      align: 'center',
                    },
                  );
                doc
                  .font('Helvetica-Bold')
                  .fillColor('#000000')
                  .text(
                    (
                      invoiceHoursTime2 *
                        rateForProject.rate *
                        euroExchange *
                        VATvalue +
                      invoiceHoursTime2 * rateForProject.rate * euroExchange
                    )
                      .toFixed(2)
                      .toString() +
                      this.i18n.t('strings.currency', {
                        lang: lang,
                      }),
                    435,
                    508,
                    {
                      width: 160,
                      align: 'center',
                    },
                  );
              } else {
                doc
                  .font('Helvetica-Bold')
                  .fillColor('#000000')
                  .text(
                    (invoiceHoursTime2 * rateForProject.rate * euroExchange)
                      .toFixed(2)
                      .toString() +
                      this.i18n.t('strings.currency', {
                        lang: lang,
                      }),
                    435,
                    508,
                    {
                      width: 160,
                      align: 'center',
                    },
                  );
              }
            }
            if (rateForProject.rateType === RateType.MONTHLY) {
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text('1', 205, 350, {
                  width: 160,
                  align: 'center',
                });
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(
                  (rateForProject.rate * euroExchange).toFixed(2).toString() +
                    this.i18n.t('strings.currency', {
                      lang: lang,
                    }),
                  300,
                  350,
                  {
                    width: 160,
                    align: 'center',
                  },
                );
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(
                  (rateForProject.rate * euroExchange).toFixed(2).toString() +
                    this.i18n.t('strings.currency', {
                      lang: lang,
                    }),
                  420,
                  350,
                  {
                    width: 160,
                    align: 'center',
                  },
                );
              if (customerOfProject.VAT) {
                doc
                  .font('Helvetica-Bold')
                  .fillColor('#000000')
                  .text(
                    (rateForProject.rate * euroExchange * VATvalue)
                      .toFixed(2)
                      .toString() +
                      this.i18n.t('strings.currency', {
                        lang: lang,
                      }),
                    435,
                    483,
                    {
                      width: 160,
                      align: 'center',
                    },
                  );
                doc
                  .font('Helvetica-Bold')
                  .fillColor('#000000')
                  .text(
                    (
                      rateForProject.rate * euroExchange * VATvalue +
                      rateForProject.rate * euroExchange
                    )
                      .toFixed(2)
                      .toString() +
                      this.i18n.t('strings.currency', {
                        lang: lang,
                      }),
                    435,
                    508,
                    {
                      width: 160,
                      align: 'center',
                    },
                  );
              } else {
                doc
                  .font('Helvetica-Bold')
                  .fillColor('#000000')
                  .text(
                    (rateForProject.rate * euroExchange).toFixed(2).toString() +
                      this.i18n.t('strings.currency', {
                        lang: lang,
                      }),
                    435,
                    508,
                    {
                      width: 160,
                      align: 'center',
                    },
                  );
              }
            }

            if (rateForProject.rateType === RateType.DAILY) {
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(
                  this.numberOfDaysWorkedOnProjectDuringMonth.toString(),
                  205,
                  350,
                  {
                    width: 160,
                    align: 'center',
                  },
                );
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(
                  (rateForProject.rate * euroExchange).toFixed(2).toString() +
                    this.i18n.t('strings.currency', {
                      lang: lang,
                    }),
                  300,
                  350,
                  {
                    width: 160,
                    align: 'center',
                  },
                );
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(
                  (
                    rateForProject.rate *
                    euroExchange *
                    this.numberOfDaysWorkedOnProjectDuringMonth
                  )
                    .toFixed(2)
                    .toString() +
                    this.i18n.t('strings.currency', {
                      lang: lang,
                    }),
                  420,
                  350,
                  {
                    width: 160,
                    align: 'center',
                  },
                );
              if (customerOfProject.VAT) {
                doc
                  .font('Helvetica-Bold')
                  .fillColor('#000000')
                  .text(
                    (
                      rateForProject.rate *
                      euroExchange *
                      this.numberOfDaysWorkedOnProjectDuringMonth *
                      VATvalue
                    )
                      .toFixed(2)
                      .toString() +
                      this.i18n.t('strings.currency', {
                        lang: lang,
                      }),
                    435,
                    483,
                    {
                      width: 160,
                      align: 'center',
                    },
                  );
                doc
                  .font('Helvetica-Bold')
                  .fillColor('#000000')
                  .text(
                    (
                      rateForProject.rate *
                        euroExchange *
                        this.numberOfDaysWorkedOnProjectDuringMonth *
                        VATvalue +
                      rateForProject.rate *
                        euroExchange *
                        this.numberOfDaysWorkedOnProjectDuringMonth
                    )
                      .toFixed(2)
                      .toString() +
                      this.i18n.t('strings.currency', {
                        lang: lang,
                      }),
                    435,
                    508,
                    {
                      width: 160,
                      align: 'center',
                    },
                  );
              } else {
                doc
                  .font('Helvetica-Bold')
                  .fillColor('#000000')
                  .text(
                    (
                      rateForProject.rate *
                      euroExchange *
                      this.numberOfDaysWorkedOnProjectDuringMonth
                    )
                      .toFixed(2)
                      .toString() +
                      this.i18n.t('strings.currency', {
                        lang: lang,
                      }),
                    435,
                    508,
                    {
                      width: 160,
                      align: 'center',
                    },
                  );
              }
            }
            if (rateForProject.rateType === RateType.PROJECT) {
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text('1', 205, 350, {
                  width: 160,
                  align: 'center',
                });
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(
                  (rateForProject.rate * euroExchange).toFixed(2).toString() +
                    this.i18n.t('strings.currency', {
                      lang: lang,
                    }),
                  300,
                  350,
                  {
                    width: 160,
                    align: 'center',
                  },
                );
              doc
                .font('Helvetica-Bold')
                .fillColor('#000000')
                .text(
                  (rateForProject.rate * euroExchange).toFixed(2).toString() +
                    this.i18n.t('strings.currency', {
                      lang: lang,
                    }),
                  420,
                  350,
                  {
                    width: 160,
                    align: 'center',
                  },
                );
              if (customerOfProject.VAT) {
                doc
                  .font('Helvetica-Bold')
                  .fillColor('#000000')
                  .text(
                    (rateForProject.rate * euroExchange * VATvalue)
                      .toFixed(2)
                      .toString() +
                      this.i18n.t('strings.currency', {
                        lang: lang,
                      }),
                    435,
                    483,
                    {
                      width: 160,
                      align: 'center',
                    },
                  );
                doc
                  .font('Helvetica-Bold')
                  .fillColor('#000000')
                  .text(
                    (
                      rateForProject.rate * euroExchange * VATvalue +
                      rateForProject.rate * euroExchange
                    )
                      .toFixed(2)
                      .toString() +
                      this.i18n.t('strings.currency', {
                        lang: lang,
                      }),
                    435,
                    508,
                    {
                      width: 160,
                      align: 'center',
                    },
                  );
              } else {
                doc
                  .font('Helvetica-Bold')
                  .fillColor('#000000')
                  .text(
                    (rateForProject.rate * euroExchange).toFixed(2).toString() +
                      this.i18n.t('strings.currency', {
                        lang: lang,
                      }),
                    435,
                    508,
                    {
                      width: 160,
                      align: 'center',
                    },
                  );
              }
            }
            doc
              .lineCap('butt')
              .moveTo(40, 800)
              .lineTo(555.28, 800)
              .stroke('#2D508F');
            doc.addPage();
            doc.fontSize(14);
            if (actualEmisionDate) {
              doc.fillColor('#000000').text(
                `${this.i18n.t('strings.annex1', {
                  lang: lang,
                })} ${actualEmisionDate.replaceAll('/', '.')} ${this.i18n.t(
                  'strings.annex2',
                  {
                    lang: lang,
                  },
                )} ${project.contract} ${this.i18n.t('strings.annex3', {
                  lang: lang,
                })} ${invoiceNumber} ${this.i18n.t('strings.annex4', {
                  lang: lang,
                })} ${actualEmisionDate.replaceAll('/', '.')}`,
              );
            } else {
              doc.fillColor('#000000').text(
                `${this.i18n.t('strings.annex1', {
                  lang: lang,
                })} ${todayString} ${this.i18n.t('strings.annex2', {
                  lang: lang,
                })} ${project.contract} ${this.i18n.t('strings.annex3', {
                  lang: lang,
                })} ${invoiceNumber} ${this.i18n.t('strings.annex4', {
                  lang: lang,
                })} ${todayString}`,
              );
            }

            doc.fontSize(10);
            doc.fillColor('#2D508F').text(
              this.i18n.t('strings.annexTableHeader', {
                lang: lang,
              }),
            );

            let index = 1;
            let invoiceHoursTime = 0;
            let invoiceMinutesTime = 0;
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
            activitiesOfProjectMonthYearSortedASC.forEach((activity) => {
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
              doc.fillColor('#000000').text(
                `${activity.date}. ${activity.name} - ${
                  activity.activityType
                } - ${this.i18n.t('strings.annexActivityTimeHours', {
                  lang: lang,
                })} ${timeForCurrentActivity.hours} ${this.i18n.t(
                  'strings.annexActivityTimeMinutes',
                  {
                    lang: lang,
                  },
                )} ${timeForCurrentActivity.minutes}`,
              );

              index = index + 1;
            });

            doc.save();
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
