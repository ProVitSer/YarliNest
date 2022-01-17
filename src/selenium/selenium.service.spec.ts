import { Test, TestingModule } from '@nestjs/testing';
import { SeleniumService } from './selenium.service';

describe('SeleniumService', () => {
  let service: SeleniumService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SeleniumService],
    }).compile();

    service = module.get<SeleniumService>(SeleniumService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
