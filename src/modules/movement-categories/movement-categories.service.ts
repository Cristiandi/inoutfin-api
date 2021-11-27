import {
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MovementCategory } from './movement-category.entity';

import { CreateMovementCategoryInput } from './dto/create-movement-category-input.dto';
import { GetMovementCategoryByOneFieldInput } from './dto/get-movement-category-by-one-field-input.dto';
import { FindOneMovementCategoryInput } from './dto/find-one-movement-category-input.dto';
import { UpdateMovementCategoryInput } from './dto/update-movement-category-input.dto';
import { GetAllMovementCategoriesInput } from './dto/get-all-movement-categories-input.dto';

@Injectable()
export class MovementCategoriesService {
  constructor(
    @InjectRepository(MovementCategory)
    private readonly repository: Repository<MovementCategory>,
  ) {}

  public async create(
    createMovementTypeInput: CreateMovementCategoryInput,
  ): Promise<MovementCategory> {
    const { code } = createMovementTypeInput;

    const existing = await this.getByOneField({
      field: 'code',
      value: code,
      checkExisting: false,
    });

    if (existing) {
      throw new PreconditionFailedException(`already exists a movement category with code ${code}.`);
    }

    const { name, description, sign } = createMovementTypeInput;

    const created = this.repository.create({
      code,
      name,
      description,
      sign,
    });

    const saved = await this.repository.save(created);

    return saved;
  }

  public async getByOneField(
    getMovementCategoryByOneFieldInput: GetMovementCategoryByOneFieldInput,
  ): Promise<MovementCategory | null> {
    const {
      field,
      value,
      checkExisting = false,
    } = getMovementCategoryByOneFieldInput;

    const existing = await this.repository.findOne({ [field]: value });

    if (!existing && checkExisting) {
      throw new NotFoundException(`can't get the movement category with the ${field} ${value}.`);
    }

    return existing || null;
  }

  public async findOne(
    findOneMovementCategoryInput: FindOneMovementCategoryInput,
  ) {
    const { id } = findOneMovementCategoryInput;

    const existing = await this.getByOneField({
      field: 'id',
      value: '' + id,
      checkExisting: true,
    });

    return existing;
  }

  public async update(
    findOneMovementCategoryInput: FindOneMovementCategoryInput,
    updateMovementCategoryInput: UpdateMovementCategoryInput,
  ): Promise<MovementCategory> {
    const { id } = findOneMovementCategoryInput;

    const existing = await this.findOne({
      id,
    });

    const preload = await this.repository.preload({
      id: existing.id,
      ...updateMovementCategoryInput,
    });

    const saved = await this.repository.save(preload);

    return saved;
  }

  public async getAll(
    getAllMovementCategoriesInput: GetAllMovementCategoriesInput,
  ): Promise<MovementCategory[]> {
    const { sign } = getAllMovementCategoriesInput;

    const query = this.repository.createQueryBuilder('mc').loadAllRelationIds();

    if (sign) {
      query.where('mc.sign = :sign', { sign });
    }

    const items = query.getMany();

    return items;
  }

  public async getByIds(ids: number[]): Promise<MovementCategory[]> {
    return this.repository.findByIds(ids, {
      loadRelationIds: true,
    });
  }
}
