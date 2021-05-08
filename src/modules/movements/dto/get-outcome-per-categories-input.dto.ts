import { Field, InputType } from '@nestjs/graphql';
import { IsDateString, IsString } from 'class-validator';

@InputType()
export class GetOutcomePerCategoriesInput {
  @IsString()
  @Field(() => String)
  readonly userAuthUid: string;

  @IsDateString()
  @Field(() => String)
  readonly starDate: string;

  @IsDateString()
  @Field(() => String)
  readonly endDate: string;
}