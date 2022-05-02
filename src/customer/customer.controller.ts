import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import * as exceljs from 'exceljs';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { Customer } from 'src/entity/customer.entity';
import { CustomerService } from './customer.service';

@Controller()
export class CustomerController {
  constructor(private customerService: CustomerService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @Roles(Role.Admin)
  getAllCustomers() {
    return this.customerService.getCustomers();
  }

  @Get('/xlsx')
  getCustomerXlsx(@Res() res: Response) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const excel = require('exceljs');
    // const tableHeaderBorders = {
    //   top: 'thick',
    //   left: 'thick',
    //   right: 'thick',
    //   bottom: 'thick',
    // };

    console.log('Test');
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Tutorials');
    const sheet = workbook.getWorksheet('Tutorials');
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

    //

    worksheet.getCell('A14').value = 'Seria:';
    worksheet.getCell('A14').font = { size: 11 };
    worksheet.getCell('A14').alignment = { horizontal: 'right' };

    worksheet.getCell('A15').value = 'Număr:';
    worksheet.getCell('A15').font = { size: 11 };
    worksheet.getCell('A15').alignment = { horizontal: 'right' };

    worksheet.getCell('A16').value = 'Data eliberării:';
    worksheet.getCell('A16').font = { size: 11 };
    worksheet.getCell('A16').alignment = { horizontal: 'right' };

    worksheet.getCell('A17').value = 'Data scadenței:';
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

    worksheet.mergeCells('A46:E46');
    worksheet.mergeCells('A47:E47');
    worksheet.mergeCells('A48:E48');
    worksheet.mergeCells('A49:E49');
    worksheet.mergeCells('A50:E50');

    worksheet.mergeCells('H49:J49');
    worksheet.mergeCells('H50:J50');

    worksheet.getCell('A46').value = 'CUI 43911790';
    worksheet.getCell('A46').alignment = { horizontal: 'left' };

    worksheet.getCell('A47').value = 'J31/149/2021';
    worksheet.getCell('A47').alignment = { horizontal: 'left' };

    worksheet.getCell('A48').value = 'Sediu: Strada Gheorghe Doja, nr. 89';
    worksheet.getCell('A48').alignment = { horizontal: 'left' };

    worksheet.getCell('A49').value = 'Municipiul Zalău, Județ Sălaj';
    worksheet.getCell('A49').alignment = { horizontal: 'left' };

    worksheet.getCell('A50').value =
      'Reprezentant: ALEX-GEORGE RUSU, Administrator';
    worksheet.getCell('A50').alignment = { horizontal: 'left' };

    worksheet.getCell('H49').value = 'Banca Transilvania';
    worksheet.getCell('H49').alignment = { horizontal: 'right' };

    worksheet.getCell('H50').value = 'RO43BTRLRONCRT0593347301 ';
    worksheet.getCell('H50').alignment = { horizontal: 'right' };

    worksheet.addImage(addedImage, {
      tl: { col: 0, row: 0 },
      ext: { width: 345, height: 226 },
    });

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
  }
  @UseGuards(JwtAuthGuard)
  @Post()
  @Roles(Role.Admin)
  addCustomer(@Body() customer: Customer) {
    return this.customerService.addCustomer(customer);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @Roles(Role.Admin)
  deleteCustomer(@Param('id') customerId: string) {
    return this.customerService.deleteCustomer(customerId);
  }

  @UseGuards(JwtAuthGuard)
  @Roles(Role.Admin)
  @Get(':id')
  getCustomer(@Param('id') id: string) {
    return this.customerService.getCustomer(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @Roles(Role.Admin)
  updateCustomer(
    @Param('id') customerToUpdateId: string,
    @Body() customer: Customer,
  ) {
    return this.customerService.updateCustomerById(
      customerToUpdateId,
      customer,
    );
  }
}
