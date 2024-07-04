import { Test, TestingModule } from '@nestjs/testing';

import { SonglinkService } from './songlink.service';

describe('SonglinkService', () => {
  let service: SonglinkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SonglinkService],
    }).compile();

    service = module.get<SonglinkService>(SonglinkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
