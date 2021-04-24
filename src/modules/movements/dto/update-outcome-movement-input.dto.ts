import { Field, Int, Float, InputType } from '@nestjs/graphql';
import { IsBoolean, IsInt, IsNumber, IsOptional, IsString, Length } from 'class-validator';

@InputType()
export class UpdateOutcomeMovementInput {
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  readonly movementCategoryId: number;

  @IsOptional()
  @IsNumber()
  @Field(() => Float, { nullable: true })
  readonly amount: number;

  @IsOptional()
  @Length(5, 160)
  @IsString()
  @Field(() => String, { nullable: true })
  readonly description: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true })
  readonly closed: boolean;
}