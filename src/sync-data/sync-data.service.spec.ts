import { Test, TestingModule } from '@nestjs/testing';
import { SyncDataService } from './sync-data.service';

describe('SyncDataService', () => {
  let service: SyncDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SyncDataService],
    }).compile();

    service = module.get<SyncDataService>(SyncDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
