import { Test, TestingModule } from '@nestjs/testing';
import { ConferenceServiceService } from './conference-service.service';

describe('ConferenceServiceService', () => {
  let service: ConferenceServiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConferenceServiceService],
    }).compile();

    service = module.get<ConferenceServiceService>(ConferenceServiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
