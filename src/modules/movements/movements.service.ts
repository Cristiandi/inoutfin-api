import { Injectable, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Movement } from './movement.entity';

import { UsersService } from '../users/users.service';

import { MovementTypesService } from '../movement-types/movement-types.service';
import { MovementCategoriesService } from '../movement-categories/movement-categories.service';

import { CreateOutcomeMovementInput } from './dto/create-outcome-movement-input.dto';
import { CreateIncomeMovementInput } from './dto/create-income-movement-input.dto';

@Injectable()
export class MovementsService {
  constructor(
    @InjectRepository(Movement)
    private readonly repository: Repository<Movement>,
    private readonly usersService: UsersService,
    private readonly movementTypesService: MovementTypesService,
    private readonly movementCategoriesService: MovementCategoriesService,
  ) {}

  public async createOutcome(
    createOutcomeMovementInput: CreateOutcomeMovementInput,
  ): Promise<Movement> {
    const { userAuthUid } = createOutcomeMovementInput;

    const user = await this.usersService.getByAuthuid({
      authUid: userAuthUid,
    });

    // TODO: use a parameter instead
    const movementType = await this.movementTypesService.getByOneField({
      field: 'code',
      value: '02O',
      checkExisting: true,
    });

    const { movementCategoryId } = createOutcomeMovementInput;
    const movementCategory = await this.movementCategoriesService.getByOneField(
      {
        field: 'id',
        value: '' + movementCategoryId,
        checkExisting: true,
      },
    );

    if (movementCategory.sign > 0) {
      // eslint-disable-next-line prettier/prettier
      throw new PreconditionFailedException(`can't use category ${movementCategory.name} for outcome.`);
    }

    const { amount, description } = createOutcomeMovementInput;

    const created = this.repository.create({
      user,
      movementType,
      movementCategory,
      amount: amount * movementType.sign,
      description,
    });

    console.log('amount', amount * movementType.sign);

    const saved = await this.repository.save(created);

    return saved;
  }

  public async createIncome(
    createIncomeMovementInput: CreateIncomeMovementInput,
  ): Promise<Movement> {
    const { userAuthUid } = createIncomeMovementInput;

    const user = await this.usersService.getByAuthuid({
      authUid: userAuthUid,
    });

    // TODO use a parameter instead
    const movementType = await this.movementTypesService.getByOneField({
      field: 'code',
      value: '01I',
      checkExisting: true,
    });

    const { movementCategoryId } = createIncomeMovementInput;
    const movementCategory = await this.movementCategoriesService.getByOneField(
      {
        field: 'id',
        value: '' + movementCategoryId,
        checkExisting: true,
      },
    );

    if (movementCategory.sign < 0) {
      // eslint-disable-next-line prettier/prettier
      throw new PreconditionFailedException(`can't use category ${movementCategory.name} for outcome.`);
    }

    const { amount, description } = createIncomeMovementInput;

    const created = this.repository.create({
      user,
      movementType,
      movementCategory,
      amount: amount * movementType.sign,
      description,
    });

    const saved = await this.repository.save(created);

    return saved;
  }
}
