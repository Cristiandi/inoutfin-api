import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class GetIncomeOutcomeByMonthInput {
  @IsString()
  @Field(() => String)
  readonly userAuthUid: string;
}