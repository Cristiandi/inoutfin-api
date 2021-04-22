import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { Movement } from './movement.entity';
import { User } from '../users/user.entity';
import { MovementType } from '../movement-types/movement-type.entity';
import { MovementCategory } from '../movement-categories/movement-category.entity';

import { MovementsService } from './movements.service';
import { MovementsLoaders } from './movements.loaders';

import { CreateOutcomeMovementInput } from './dto/create-outcome-movement-input.dto';
import { CreateIncomeMovementInput } from './dto/create-income-movement-input.dto';

@Resolver(() => Movement)
export class MovementsResolver {
  constructor(
    private readonly service: MovementsService,
    private readonly loaders: MovementsLoaders,
  ) {}

  @Mutation(() => Movement, { name: 'createOutcomeMovement' })
  createOutcomeMovement(
    @Args('createOutcomeMovementInput')
    createOutcomeMovementInput: CreateOutcomeMovementInput,
  ): Promise<Movement> {
    return this.service.createOutcome(createOutcomeMovementInput);
  }

  @Mutation(() => Movement, { name: 'createIncomeMovement' })
  createIncomeMovement(
    @Args('createIncomeMovementInput')
    createIncomeMovementInput: CreateIncomeMovementInput,
  ): Promise<Movement> {
    return this.service.createIncome(createIncomeMovementInput);
  }

  @ResolveField(() => User, { name: 'user' })
  user(@Parent() movement: Movement): Promise<User> {
    const value: any = movement.user;

    let id = value;

    if (typeof id !== 'number') id = value.id;

    return this.loaders.batchUsers.load(id);
  }

  @ResolveField(() => MovementType, { name: 'movementType' })
  movementType(@Parent() movement: Movement): Promise<MovementType> {
    const value: any = movement.movementType;

    let id = value;

    if (typeof id !== 'number') id = value.id;

    return this.loaders.batchMovementTypes.load(id);
  }

  @ResolveField(() => MovementCategory, { name: 'movementCategory' })
  movementCategory(@Parent() movement: Movement): Promise<MovementCategory> {
    const value: any = movement.movementCategory;

    let id = value;

    if (typeof id !== 'number') id = value.id;

    return this.loaders.batchMovementCategories.load(id);
  }
}
