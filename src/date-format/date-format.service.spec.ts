import { Test, TestingModule } from '@nestjs/testing';
import { DateFormatService } from './date-format.service';

describe('DateFormatService', () => {
  let service: DateFormatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DateFormatService],
    }).compile();

    service = module.get<DateFormatService>(DateFormatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
