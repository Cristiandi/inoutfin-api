import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNumber, IsString, Length } from 'class-validator';

@InputType()
export class CreateOutcomeMovementInput {
  @IsString()
  @Field(() => String)
  readonly userAuthUid: string;

  @IsInt()
  @Field(() => Int)
  readonly movementCategoryId: number;

  @IsNumber()
  @Field(() => Float)
  readonly amount: number;

  @Length(5, 160)
  @IsString()
  @Field(() => String)
  readonly description: string;
}
