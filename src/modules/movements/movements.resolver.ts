import {
  Args,
  Mutation,
  Parent,
  ResolveField,
  Resolver,
  Query,
} from '@nestjs/graphql';
import { GraphQLUpload } from 'apollo-server-express';

import { Movement } from './movement.entity';
import { User } from '../users/user.entity';
import { MovementType } from '../movement-types/movement-type.entity';
import { MovementCategory } from '../movement-categories/movement-category.entity';

import { Balance } from './models/balance.model';
import { IncomeOutcome } from './models/income-outcome.model';
import { OutcomePerCategory } from './models/outcome-per-category.model';

import { MovementsService } from './movements.service';
import { MovementsLoaders } from './movements.loaders';

import { CreateOutcomeMovementInput } from './dto/create-outcome-movement-input.dto';
import { CreateIncomeMovementInput } from './dto/create-income-movement-input.dto';
import { GetBalanceResumeInput } from './dto/get-balance-resume-input.dto';
import { GetAllMovementsInput } from './dto/get-all-movements-input.dto';
import { GetOneMovementInput } from './dto/get-one-movement-input.dto';
import { UpdateIncomeMovementInput } from './dto/update-income-movement-input.dto';
import { UpdateOutcomeMovementInput } from './dto/update-outcome-movement-input.dto';
import { GetIncomeOutcomeByMonthInput } from './dto/get-income-outcome-by-month-input.dto';
import { GetOutcomePerCategoriesInput } from './dto/get-outcome-per-categories-input.dto';
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

  @Query(() => [Movement])
  getAllMovements(
    @Args('getAllMovementsInput') getAllMovementsInput: GetAllMovementsInput,
  ): Promise<Movement[]> {
    return this.service.getAll(getAllMovementsInput);
  }

  @Query(() => Movement)
  getOneMovement(
    @Args('getOneMovementInput') getOneMovementInput: GetOneMovementInput, 
  ): Promise<Movement> {
    return this.service.getOne(getOneMovementInput);
  }

  @Mutation(() => Movement)
  updateIncomeMovement(
    @Args('getOneMovementInput') getOneMovementInput: GetOneMovementInput,
    @Args('updateIncomeMovementInput') updateIncomeMovementInput: UpdateIncomeMovementInput,
  ): Promise<Movement> {
    return this.service.updateIncome(getOneMovementInput, updateIncomeMovementInput);
  }

  @Mutation(() => Movement)
  updateOutcomeMovement(
    @Args('getOneMovementInput') getOneMovementInput: GetOneMovementInput,
    @Args('updateOutcomeMovementInput') updateOutcomeMovementInput: UpdateOutcomeMovementInput,
  ): Promise<Movement> {
    return this.service.updateOutcome(getOneMovementInput, updateOutcomeMovementInput);
  }

  @Mutation(() => Movement)
  removeMovement(
    @Args('getOneMovementInput') getOneMovementInput: GetOneMovementInput,
  ): Promise<Movement> {
    return this.service.remove(getOneMovementInput);
  }

  @Mutation(() => Movement)
  uploadMovementImage(
    @Args('getOneMovementInput') getOneMovementInput: GetOneMovementInput,
    @Args({ name: 'file', type: () => GraphQLUpload }) fileUpload: any
  ): Promise<Movement> {
    return this.service.uploadImage(getOneMovementInput, fileUpload);
  }

  @Query(() => Balance, { name: 'getBalanceResume' })
  getBalanceResume(
    @Args('getBalanceResumeInput') getBalanceResumeInput: GetBalanceResumeInput,
  ): Promise<Balance> {
    return this.service.getBalanceResume(getBalanceResumeInput);
  }

  @Query(() => [IncomeOutcome], { name: 'getIncomeOutcomeByMonth' })
  getIncomeOutcomeByMonth(
    @Args('getIncomeOutcomeByMonthInput') getIncomeOutcomeByMonthInput: GetIncomeOutcomeByMonthInput,
  ): Promise<IncomeOutcome[]> {
    return this.service.getIncomeOutcomeByMonth(getIncomeOutcomeByMonthInput);
  }

  @Query(() => [OutcomePerCategory], { name: 'getOutcomePerCategories' })
  getOutcomePerCategories(
    @Args('getOutcomePerCategoriesInput') getOutcomePerCategoriesInput: GetOutcomePerCategoriesInput,
  ): Promise<OutcomePerCategory[]> {
    return this.service.getOutcomePerCategories(getOutcomePerCategoriesInput);
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
