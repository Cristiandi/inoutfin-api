import { Field, ObjectType } from '@nestjs/graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
@ObjectType()
@Entity('users')
export class User {
  @Field()
  @PrimaryGeneratedColumn()
  id: number;

  @Field()
  @Column({ name: 'auth_uid', type: 'varchar', length: 50 })
  authUid: string;

  @Field()
  @Column({ name: 'full_name', type: 'varchar', length: 160 })
  fullName: string;

  @Field()
  @Column({ type: 'varchar', length: 160 })
  email: string;

  @Field()
  @Column({ type: 'varchar', length: 10 })
  phone: string;

  @Field()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Field()
  @CreateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // relations
}
