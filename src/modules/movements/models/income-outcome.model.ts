import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class IncomeOutcome {
  @Field(() => String, { nullable: true })
  month?: string;

  @Field(() => Float, { nullable: true })
  income?: number;

  @Field(() => Float, { nullable: true })
  outcome?: number;
}
