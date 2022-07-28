import {
  Injectable,
  NotFoundException,
  PreconditionFailedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';

import { MovementType } from './movement-type.entity';

import { CreateMovementTypeInput } from './dto/create-movement-type-input.dto';
import { GetMovementTypeByOneFieldInput } from './dto/get-movement-type-by-one-field-input.dto';
import { FindOneMovementTypeInput } from './dto/find-one-movement-type-input.dto';
import { UpdateMovementTypeInput } from './dto/update-movement-type-input.dto';

@Injectable()
export class MovementTypesService {
  constructor(
    @InjectRepository(MovementType)
    readonly repository: Repository<MovementType>,
  ) {}

  public async create(
    createMovementTypeInput: CreateMovementTypeInput,
  ): Promise<MovementType> {
    const { code } = createMovementTypeInput;

    const existing = await this.getByOneField({
      field: 'code',
      value: code,
      checkExisting: false,
    });

    if (existing) {
      throw new PreconditionFailedException(`already exists a movement type with code ${code}.`);
    }

    const { name, sign } = createMovementTypeInput;

    const created = this.repository.create({
      code,
      name,
      sign,
    });

    const saved = await this.repository.save(created);

    return saved;
  }

  public async getByOneField(
    getMovementTypeByOneFieldInput: GetMovementTypeByOneFieldInput,
  ): Promise<MovementType | null> {
    const {
      field,
      value,
      checkExisting = false,
    } = getMovementTypeByOneFieldInput;

    const existing = await this.repository.findOne({ [field]: value });

    if (!existing && checkExisting) {
      throw new NotFoundException(`can't get the movement type with the ${field} ${value}.`);
    }

    return existing || null;
  }

  public async findOne(findOneMovementTypeInput: FindOneMovementTypeInput) {
    const { id } = findOneMovementTypeInput;

    const existing = await this.getByOneField({
      field: 'id',
      value: '' + id,
      checkExisting: true,
    });

    return existing;
  }

  public async update(
    findOneMovementTypeInput: FindOneMovementTypeInput,
    updateMovementTypeInput: UpdateMovementTypeInput,
  ): Promise<MovementType> {
    const { id } = findOneMovementTypeInput;

    const existing = await this.findOne({
      id,
    });

    const preload = await this.repository.preload({
      id: existing.id,
      ...updateMovementTypeInput,
    });

    const saved = await this.repository.save(preload);

    return saved;
  }

  public getByIds(ids: number[]): Promise<MovementType[]> {
    return this.repository.find({
      where: {
        id: In(ids),
      },
      loadRelationIds: true,
    });
  }
}
