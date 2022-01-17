import { Test, TestingModule } from '@nestjs/testing';
import { KerioService } from './kerio.service';

describe('KerioService', () => {
  let service: KerioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KerioService],
    }).compile();

    service = module.get<KerioService>(KerioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
