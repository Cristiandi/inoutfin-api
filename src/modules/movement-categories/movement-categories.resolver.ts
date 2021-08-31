import { Resolver, Query, Args } from '@nestjs/graphql';

import { MovementCategoriesService } from './movement-categories.service';

import { MovementCategory } from './movement-category.entity';

import { AclSlug } from '../../common/decorators/acl-slug.decorator';

import { GetAllMovementCategoriesInput } from './dto/get-all-movement-categories-input.dto';

@Resolver()
export class MovementCategoriesResolver {
  constructor(private readonly service: MovementCategoriesService) {}

  @AclSlug('movementCategories:read')
  @Query(() => [MovementCategory, { name: 'movementCategories' }])
  getAllMovementCategories(
    @Args('getAllMovementCategoriesInput')
    getAllMovementCategoriesInput: GetAllMovementCategoriesInput,
  ): Promise<MovementCategory[]> {
    return this.service.getAll(getAllMovementCategoriesInput);
  }
}
