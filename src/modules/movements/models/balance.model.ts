import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Balance {
  @Field(() => Float, { nullable: true })
  amount?: number;
}
