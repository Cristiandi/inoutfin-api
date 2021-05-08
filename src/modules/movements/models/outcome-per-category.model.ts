import { Field, Float, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class OutcomePerCategory {
  @Field(() => Int, { nullable: true })
  readonly movementCategoryId?: number;

  @Field(() => String, { nullable: true })
  readonly movementCategoryName?: string;

  @Field(() => Float, { nullable: true })
  readonly percentage?: number;
}