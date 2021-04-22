import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsOptional } from 'class-validator';

@InputType()
export class GetAllMovementCategoriesInput {
  @IsOptional()
  @IsInt()
  @Field(() => Int)
  readonly sign?: number;
}
