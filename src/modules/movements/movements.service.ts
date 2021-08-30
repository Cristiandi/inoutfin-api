import * as fs from 'fs';
import * as path from 'path';

import { BadRequestException, Inject, Injectable, InternalServerErrorException, NotFoundException, PreconditionFailedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigType } from '@nestjs/config';

import appConfig from '../../config/app.config';

import { Movement } from './movement.entity';

import { Balance } from './models/balance.model';
import { IncomeOutcome } from './models/income-outcome.model';
import { OutcomePerCategory } from './models/outcome-per-category.model';

import { UsersService } from '../users/users.service';

import { MovementTypesService } from '../movement-types/movement-types.service';
import { MovementCategoriesService } from '../movement-categories/movement-categories.service';

import { createFileFromReadStream } from '../../utils';

import { CreateOutcomeMovementInput } from './dto/create-outcome-movement-input.dto';
import { CreateIncomeMovementInput } from './dto/create-income-movement-input.dto';
import { GetBalanceResumeInput } from './dto/get-balance-resume-input.dto';
import { GetAllMovementsInput } from './dto/get-all-movements-input.dto';
import { GetOneMovementInput } from './dto/get-one-movement-input.dto';
import { UpdateIncomeMovementInput } from './dto/update-income-movement-input.dto';
import { UpdateOutcomeMovementInput } from './dto/update-outcome-movement-input.dto';
import { GetIncomeOutcomeByMonthInput } from './dto/get-income-outcome-by-month-input.dto';
import { GetOutcomePerCategoriesInput } from './dto/get-outcome-per-categories-input.dto';
@Injectable()
export class MovementsService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Movement)
    private readonly repository: Repository<Movement>,
    private readonly usersService: UsersService,
    private readonly movementTypesService: MovementTypesService,
    private readonly movementCategoriesService: MovementCategoriesService,
  ) {
    cloudinary.config({
      cloud_name: this.appConfiguration.cloudinary.cloudName,
      api_key: this.appConfiguration.cloudinary.apiKey,
      api_secret: this.appConfiguration.cloudinary.apiSecret
    });
  }

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
      amount: amount,
      signedAmount: amount * movementType.sign,
      description,
    });

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
      amount: amount,
      signedAmount: amount * movementType.sign,
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
      .where('m.deleted_at is null')
      .andWhere('m.user_id = :userId', { userId: user.id })
      .limit(limit || undefined)
      .skip(skip || 0)
      .orderBy('m.created_at', 'DESC')
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

    const existing = await this.repository.createQueryBuilder('m')
      .loadAllRelationIds()
      .where('m.deleted_at is null')
      .andWhere('m.user_id = :userId', { userId: user.id })
      .andWhere('m.id = :id', { id })
      .getOne();

    if (!existing) {
      throw new NotFoundException(`can't get the movement ${id} for the user ${userAuthUid}.`);
    }

    return existing;
  }

  public async updateIncome(
    getOneMovementInput: GetOneMovementInput,
    updateIncomeMovementInput: UpdateIncomeMovementInput
  ): Promise<Movement> {
    const existing = await this.getOne(getOneMovementInput);

    const { closed = false } = updateIncomeMovementInput;

    if (existing.closed) {
      throw new PreconditionFailedException(`the movement ${getOneMovementInput.id} is already closed.`);
    }

    const { movementCategoryId } = updateIncomeMovementInput;

    let movementCategory;

    if (movementCategoryId) {
      movementCategory = await this.movementCategoriesService.findOne({
        id: movementCategoryId
      });
    }

    // TODO use a parameter instead
    const movementType = await this.movementTypesService.getByOneField({
      field: 'code',
      value: '01I',
      checkExisting: true,
    });

    const amount = updateIncomeMovementInput.amount || existing.amount;
    const signedAmount = amount * movementType.sign;

    const preloaded = await this.repository.preload({
      id: existing.id,
      ...updateIncomeMovementInput,
      closed,
      amount,
      signedAmount,
      movementCategory
    });

    const saved = await this.repository.save(preloaded);

    return {
      ...existing,
      ...saved
    };
  }

  public async updateOutcome(
    getOneMovementInput: GetOneMovementInput,
    updateOutcomeMovementInput: UpdateOutcomeMovementInput
  ): Promise<Movement> {
    const existing = await this.getOne(getOneMovementInput);

    const { closed = false } = updateOutcomeMovementInput;

    if (existing.closed) {
      throw new PreconditionFailedException(`the movement ${getOneMovementInput.id} is already closed.`);
    }

    const { movementCategoryId } = updateOutcomeMovementInput;

    let movementCategory;

    if (movementCategoryId) {
      movementCategory = await this.movementCategoriesService.findOne({
        id: movementCategoryId
      });
    }

    // TODO: use a parameter instead
    const movementType = await this.movementTypesService.getByOneField({
      field: 'code',
      value: '02O',
      checkExisting: true,
    });

    const amount = updateOutcomeMovementInput.amount || existing.amount;
    const signedAmount = amount * movementType.sign;

    const preloaded = await this.repository.preload({
      id: existing.id,
      ...updateOutcomeMovementInput,
      closed,
      amount,
      signedAmount,
      movementCategory
    });

    const saved = await this.repository.save(preloaded);

    return {
      ...existing,
      ...saved
    };
  }

  public async remove(
    getOneMovementInput: GetOneMovementInput
  ): Promise<Movement> {
    const existing = await this.getOne(getOneMovementInput);

    const clone = {
      ...existing
    };

    await this.repository.softRemove(existing);

    return clone;
  }

  public async uploadImage(
    getOneMovementInput: GetOneMovementInput,
    fileUpload: any
  ): Promise<Movement> {
    const existing = await this.getOne(getOneMovementInput);

    let filePath = '';

    try {
      const { filename, mimetype } = fileUpload;

      if (!mimetype.startsWith('image')) {
        throw new BadRequestException('mimetype not allowed.');
      }

      const basePath = path.resolve(__dirname);

      const fileExt = filename.split('.').pop();

      filePath = `${basePath}/${existing.id}.${fileExt}`;

      const { createReadStream } = fileUpload;

      const stream = createReadStream();

      await createFileFromReadStream(stream, filePath);

      let cloudinaryResponse;

      try {
        const folderName = this.appConfiguration.environment === 'production'
          ? 'movements'
          : `${this.appConfiguration.environment}_movements`;

        cloudinaryResponse = await cloudinary.uploader.upload(filePath, {
          folder: folderName,
          public_id: '' + existing.id,
          use_filename: true,
          quality: 'auto:best'
          
        });

        const { public_id: publicId, secure_url: secureUrl } = cloudinaryResponse;

        const preloaded = await this.repository.preload({
          id: existing.id,
          cloudId: publicId,
          imageUrl: secureUrl
        });
  
        const saved = await this.repository.save(preloaded);
  
        return saved;
      } catch (error) {
        throw new InternalServerErrorException(error.message);
      }
    } finally {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
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
      .select(['sum(m.signed_amount) as total'])
      .where('m.deleted_at is null')
      .andWhere('m.user_id = :userId', { userId: user.id })
      .execute();

    const { total = 0 } = result[0];

    return {
      amount: parseFloat(total || 0),
    };
  }

  public async getIncomeOutcomeByMonth (
    getIncomeOutcomeByMonthInput: GetIncomeOutcomeByMonthInput
  ): Promise<IncomeOutcome[]> {
    const { userAuthUid } = getIncomeOutcomeByMonthInput;

    const user = await this.usersService.getByAuthuid({
      authUid: userAuthUid
    });

    const query = 'select Y.month || \' \' || Y.year as "month", ' +
    '(select coalesce(sum(amount), 0) ' +
    'from movements ' +
    'inner join movement_types on movement_types.id = movements.movement_type_id ' +
    'where deleted_at is null ' +
    'and to_char(created_at, \'YYYY\') = Y.year ' +
    'and to_char(created_at, \'Mon\') = Y.month ' +
    'and movement_types.sign = 1 ' +
    'and movements.user_id = $1 ) as "income", ' +
    '(select coalesce(sum(amount), 0) ' +
    'from movements ' +
    'inner join movement_types on movement_types.id = movements.movement_type_id ' +
    'where deleted_at is null ' +
    'and to_char(created_at, \'YYYY\') = Y.year ' +
    'and to_char(created_at, \'Mon\') = Y.month ' +
    'and movement_types.sign = -1 ' +
    'and movements.user_id = $2 ) as "outcome" ' +
    'from (  select to_char(current_date - interval \'1 month\' * X.mont_number, \'Mon\') as "month", ' +
    'to_char(current_date - interval \'1 month\' * X.mont_number, \'YYYY\') as "year" ' +
    'from (  select 0 as "mont_number" union ' +
    'select 1 union ' +
    'select 2 union ' +
    'select 3 union ' +
    'select 4 union ' +
    'select 5 union ' +
    'select 6 ' +
    'order by 1 asc  ) as X  ) as Y';

    const data = await this.repository.query(query, [user.id, user.id]);

    return data;
  }

  public async getOutcomePerCategories (
    getOutcomePerCategoriesInput: GetOutcomePerCategoriesInput
  ): Promise<OutcomePerCategory[]> {
    const { userAuthUid, starDate, endDate } = getOutcomePerCategoriesInput;

    const user = await this.usersService.getByAuthuid({
      authUid: userAuthUid
    });

    const totalOutcomeResult = await this.repository.createQueryBuilder('m')
    .select([' coalesce(sum(m.amount), 0) as "totalOutcome"'])
    .innerJoin('m.movementType', 'mt')
    .where('mt.sign = -1')
    .andWhere('m.user_id = :userId', { userId: user.id })
    .andWhere('m.created_at between :starDate and :endDate', { starDate, endDate })
    .execute();

    let { totalOutcome } = totalOutcomeResult[0];

    if (!totalOutcome) {
      return [{
        movementCategoryId: 1,
        movementCategoryName: 'test',
        percentage: 100
      }];
    }

    totalOutcome = parseFloat(totalOutcome);

    const outcomePerCategoriesResult = await this.repository.createQueryBuilder('m')
    .select([
      'mc.id as "movementCategoryId"',
      'mc.name as "movementCategoryName"',
      `sum(m.amount) / ${totalOutcome} * 100 as percentage`
    ])
    .innerJoin('m.movementType', 'mt')
    .innerJoin('m.movementCategory', 'mc')
    .where('mt.sign = -1')
    .andWhere('m.user_id = :userId', { userId: user.id })
    .andWhere('m.created_at between :starDate and :endDate', { starDate, endDate })
    .groupBy('mc.id')
    .execute();

    const outcomePerCategories = outcomePerCategoriesResult.map(item => ({ ...item, percentage: Math.ceil(parseFloat(item.percentage) * 100) / 100 }));

    return outcomePerCategories;
  }
}
