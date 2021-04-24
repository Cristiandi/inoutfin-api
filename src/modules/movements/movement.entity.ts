import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MovementCategory } from '../movement-categories/movement-category.entity';
import { MovementType } from '../movement-types/movement-type.entity';
import { User } from '../users/user.entity';

@ObjectType()
@Entity('movements')
export class Movement {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 160 })
  description: string;

  @Field()
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Field()
  @Column({ name: 'signed_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  signedAmount: number;

  @Field()
  @Column({ type: 'boolean', default: false })
  closed: boolean;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  // relations

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.movements)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Field(() => MovementType)
  @ManyToOne(() => MovementType, (movementType) => movementType.movements)
  @JoinColumn({ name: 'movement_type_id' })
  movementType: MovementType;

  @Field(() => MovementCategory)
  @ManyToOne(
    () => MovementCategory,
    (movementCategory) => movementCategory.movements,
  )
  @JoinColumn({ name: 'movement_category_id' })
  movementCategory: MovementCategory;
}
