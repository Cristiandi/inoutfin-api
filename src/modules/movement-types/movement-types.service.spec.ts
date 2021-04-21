import { Test, TestingModule } from '@nestjs/testing';
import { MovementTypesService } from './movement-types.service';

describe('MovementTypesService', () => {
  let service: MovementTypesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovementTypesService],
    }).compile();

    service = module.get<MovementTypesService>(MovementTypesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
