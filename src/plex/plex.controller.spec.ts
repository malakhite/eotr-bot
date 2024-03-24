import { Test, TestingModule } from '@nestjs/testing';
import { PlexController } from './plex.controller';

describe('PlexController', () => {
  let controller: PlexController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlexController],
    }).compile();

    controller = module.get<PlexController>(PlexController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
