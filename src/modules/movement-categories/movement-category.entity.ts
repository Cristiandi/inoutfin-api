import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Movement } from '../movements/movement.entity';
@ObjectType()
@Entity('movement_categories')
export class MovementCategory {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ type: 'varchar', length: 45 })
  name: string;

  @Field()
  @Column({ type: 'varchar', length: 5 })
  code: string;

  @Field()
  @Column({ type: 'varchar', length: 160 })
  description: string;

  @Field()
  @Column({ type: 'int' })
  sign: number;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;

  // relations

  @Field(() => [Movement])
  @OneToMany(() => Movement, (movement) => movement.movementCategory)
  movements: Movement[];
}
