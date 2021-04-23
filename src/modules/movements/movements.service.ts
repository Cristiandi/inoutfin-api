import { Injectable, NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Movement } from './movement.entity';

import { Balance } from './balance.model';

import { UsersService } from '../users/users.service';

import { MovementTypesService } from '../movement-types/movement-types.service';
import { MovementCategoriesService } from '../movement-categories/movement-categories.service';

import { CreateOutcomeMovementInput } from './dto/create-outcome-movement-input.dto';
import { CreateIncomeMovementInput } from './dto/create-income-movement-input.dto';
import { GetBalanceResumeInput } from './dto/get-balance-resume-input.dto';
import { GetAllMovementsInput } from './dto/get-all-movements-input.dto';
import { GetOneMovementInput } from './dto/get-one-movement-input.dto';

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

  public async getAll(
    getAllMovementsInput: GetAllMovementsInput,
  ): Promise<Movement[]> {
    const { userAuthUid, limit = 0, skip } = getAllMovementsInput;

    const user = await this.usersService.getByAuthuid({
      authUid: userAuthUid,
    });

    const movements = await this.repository
      .createQueryBuilder('m')
      .loadAllRelationIds()
      .where('m.user_id = :userId', { userId: user.id })
      .limit(limit || undefined)
      .skip(skip || 0)
      .orderBy('m.id', 'DESC')
      .getMany();

    return movements;
  }

  public async getOne(
    getOneMovementInput: GetOneMovementInput
  ): Promise<Movement> {
    const { userAuthUid } = getOneMovementInput;

    const user = await this.usersService.getByAuthuid({
      authUid: userAuthUid
    });

    const { id } = getOneMovementInput;

    const movement = await this.repository.createQueryBuilder('m')
      .loadAllRelationIds()
      .where('m.user_id = :userId', { userId: user.id })
      .andWhere('m.id = :id', { id })
      .getOne();

    if (!movement) {
      throw new NotFoundException(`can't get the movement ${id} for the user ${userAuthUid}.`);
    }

    return movement;
  }

  public async getBalanceResume(
    getBalanceResumeInput: GetBalanceResumeInput,
  ): Promise<Balance> {
    const { userAuthUid } = getBalanceResumeInput;

    const user = await this.usersService.getByAuthuid({
      authUid: userAuthUid,
    });

    const result = await this.repository
      .createQueryBuilder('m')
      .select(['sum(m.amount) as total'])
      .where('m.user_id = :userId', { userId: user.id })
      .execute();

    const { total = 0 } = result[0];

    return {
      amount: parseFloat(total || 0),
    };
  }
}
