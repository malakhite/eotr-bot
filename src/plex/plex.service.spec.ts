import { Test, TestingModule } from '@nestjs/testing';
import { PlexService } from './plex.service';

describe('PlexService', () => {
  let service: PlexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlexService],
    }).compile();

    service = module.get<PlexService>(PlexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
