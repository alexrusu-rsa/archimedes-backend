import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Role } from 'src/auth/role.enum';
import { Roles } from 'src/auth/roles.decorator';
import { RateType } from 'src/custom/rate-type.enum';
import { Rate } from 'src/entity/rate.entity';
import { RateService } from './rate.service';
import { ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
@ApiTags('Rate')
@Controller()
export class RateController {
  constructor(private rateService: RateService) {}

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Get available rate types',
    description: 'Fetch a list of possible rate types.',
  })
  @Get('/types')
  getAvailableActivityTypes() {
    return RateType;
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOperation({
    summary: 'Get all rates',
    description: 'Fetch a list of all existing rates',
  })
  getAllRates() {
    return this.rateService.getAllRates();
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific rate',
    description:
      'Fetch a specific rate identified by the unique ID given as request parameter',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique ID of the rate we want to fetch.',
  })
  getRate(@Param('id') id: string) {
    return this.rateService.getRate(id);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({
    summary: 'Add a new rate',
    description: 'Add the rate given in the request body.',
  })
  @ApiBody({
    type: Rate,
    description: 'The rate object we want to add.',
  })
  addRate(@Body() rate: Rate) {
    return this.rateService.addRate(rate);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a rate.',
    description:
      'Delete a rate identified by the unique ID given as request parameter.',
  })
  deleteRate(@Param('id') id: string) {
    return this.rateService.deleteRate(id);
  }

  @ApiOperation({
    summary: 'Get rate of a certain employee',
    description:
      'Get the rate of the employee identified with the unique ID given as request parameter.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique ID of the employee we want to fetch the rate for.',
  })
  @Get('rateemployee/:id')
  getRateForEmployee(@Param('id') id: string) {
    return this.rateService.getRateForEmployeeId(id);
  }

  @Roles(Role.Admin)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOperation({
    summary: 'Update rate',
    description:
      'Update rate identified by the id given as request parameter with the rate object given in the request body.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique ID of the rate we want to update.',
  })
  @ApiBody({
    type: Rate,
    description:
      'The updated rate object we want to replace the older one with.',
  })
  updateRate(@Param('id') id: string, @Body() rate: Rate) {
    return this.rateService.updateRate(id, rate);
  }
}
