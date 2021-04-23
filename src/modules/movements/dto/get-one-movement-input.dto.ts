import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsString } from 'class-validator';

@InputType()
export class GetOneMovementInput {
  @IsString()
  @Field(() => String)
  readonly userAuthUid: string;

  @IsInt()
  @Field(() => Int)
  readonly id: number;
}