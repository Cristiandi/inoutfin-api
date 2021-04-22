import { Field } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

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
}
