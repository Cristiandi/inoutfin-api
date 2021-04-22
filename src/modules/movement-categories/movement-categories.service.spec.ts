import { Test, TestingModule } from '@nestjs/testing';
import { MovementCategoriesService } from './movement-categories.service';

describe('MovementCategoriesService', () => {
  let service: MovementCategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovementCategoriesService],
    }).compile();

    service = module.get<MovementCategoriesService>(MovementCategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
